import {existsSync} from 'node:fs';
import {join, posix} from 'node:path';
import type {ModuleNode, Plugin, ViteDevServer} from 'vite';
import {Node, Project, ts} from 'ts-morph';
import type {ApiConfig, SymbolRecord, SymbolKind} from './src/types/api.ts';

/**
 * API-reference auto-generation plugin.
 *
 * Pipeline (per build):
 *   1. Load `ngmd.api.ts` via Vite's module loader. Missing file → silently
 *      no-op (API gen is off; no scope, no error).
 *   2. Use ts-morph to load every source file matched by `scope` minus
 *      `exclude`. Cache the `Project` between rebuilds.
 *   3. For each exported declaration, build a `SymbolRecord` (kind, name,
 *      JSDoc, signature, source location, badges from JSDoc tags).
 *   4. Aggregate the records into a virtual module
 *      `virtual:ngmd/api-index` so the Cmd+K palette and a future API
 *      landing page can list every symbol without re-parsing.
 *   5. (Not yet wired) emit a virtual `.page.ts` route per symbol so
 *      AnalogJS picks them up at `<basePath>/<group>/<name>`. Punted to a
 *      follow-up commit; the index alone is enough to wire the palette
 *      and validate parse coverage.
 *
 * The plugin is intentionally idempotent and safe to leave registered:
 * without `ngmd.api.ts` it short-circuits and the build runs unchanged.
 */

const VIRTUAL_INDEX_ID = 'virtual:ngmd/api-index';
const RESOLVED_INDEX_ID = '\0' + VIRTUAL_INDEX_ID;

export function apiGenPlugin(): Plugin {
  let root = process.cwd();
  const configPath = () => posix.join(root, 'ngmd.api.ts');
  let project: Project | null = null;
  let recordsMemo: SymbolRecord[] | null = null;
  let configMemo: ApiConfig | null | undefined;

  function loadConfig(): ApiConfig | null {
    if (configMemo === undefined) configMemo = readApiConfig(root);
    return configMemo;
  }

  function extractRecords(config: ApiConfig): SymbolRecord[] {
    project ??= createApiProject(root, config);
    recordsMemo ??= extractApiRecords(root, config, project);
    return recordsMemo;
  }

  return {
    name: 'ngmd-api-gen',
    configResolved(cfg) {
      root = cfg.root;
      project = null;
      recordsMemo = null;
      configMemo = undefined;
    },
    resolveId(id) {
      if (id === VIRTUAL_INDEX_ID) return RESOLVED_INDEX_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_INDEX_ID) return null;
      const config = loadConfig();
      if (!config) return 'export const apiIndex = [];\n';
      const records = extractRecords(config);
      return `export const apiIndex = ${JSON.stringify(records, null, 2)};\n`;
    },
    configureServer(server) {
      server.watcher.on('all', (event, file) => {
        if (event !== 'add' && event !== 'unlink') return;
        const mod = invalidate(file, server);
        if (mod) void server.reloadModule(mod);
      });
    },
    handleHotUpdate({file, server, modules}) {
      const mod = invalidate(file, server);
      return mod ? [...modules, mod] : undefined;
    },
  };

  function invalidate(file: string, server: ViteDevServer): ModuleNode | undefined {
    const isConfig = file === configPath();
    if (!isConfig && !project?.getSourceFile(file) && !inScope(file)) return;
    if (isConfig) configMemo = undefined;
    project = null;
    recordsMemo = null;
    const mod = server.moduleGraph.getModuleById(RESOLVED_INDEX_ID);
    if (mod) server.moduleGraph.invalidateModule(mod);
    return mod;
  }

  function inScope(file: string): boolean {
    if (!file.endsWith('.ts')) return false;
    const config = loadConfig();
    if (!config) return false;
    const rel = posix.relative(root, file);
    return (
      config.scope.some((pattern) => posix.matchesGlob(rel, pattern)) &&
      !(config.exclude ?? []).some((pattern) => posix.matchesGlob(rel, pattern))
    );
  }
}

function readApiConfig(root: string): ApiConfig | null {
  const path = posix.join(root, 'ngmd.api.ts');
  if (!existsSync(path)) return null;
  try {
    const proj = new Project({
      compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext},
    });
    const sourceFile = proj.addSourceFileAtPath(path);
    // We can't trivially evaluate the TS without a runtime; instead lift
    // the literal passed to `defineApi(...)` via AST traversal. For the
    // skeleton, every supported field is read as a literal so static
    // extraction is enough. Read the `export default` expression directly
    // rather than the first `CallExpression` in the file — otherwise any
    // helper call before the default export (even a harmless one) would
    // be parsed as the config.
    const exportAssignment = sourceFile.getExportAssignment((ea) => !ea.isExportEquals());
    if (!exportAssignment) return null;
    const callExpr = exportAssignment.getExpression().asKind(ts.SyntaxKind.CallExpression);
    if (!callExpr) return null;
    const literal = callExpr.getArguments()[0];
    if (!literal || !literal.asKind(ts.SyntaxKind.ObjectLiteralExpression)) return null;
    return parseLiteralAsConfig(literal as never);
  } catch (err) {
    console.warn('[ngmd-api-gen] failed to load ngmd.api.ts:', err);
    return null;
  }
}

function createApiProject(root: string, config: ApiConfig): Project {
  const project = new Project({
    tsConfigFilePath: existsSync(join(root, 'tsconfig.json'))
      ? join(root, 'tsconfig.json')
      : undefined,
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths([
    ...config.scope.map((pattern) => posix.join(root, pattern)),
    ...(config.exclude ?? []).map((pattern) => '!' + posix.join(root, pattern)),
  ]);
  return project;
}

export function apiRoutes(root: string): Array<{route: string; file: string}> {
  const config = readApiConfig(root);
  if (!config) return [];
  return extractApiRecords(root, config, createApiProject(root, config)).map((record) => ({
    route: `/api/${record.group}/${record.name}`,
    file: record.filePath,
  }));
}

function extractApiRecords(root: string, config: ApiConfig, proj: Project): SymbolRecord[] {
  const records: SymbolRecord[] = [];
  const seen = new Set<string>();
  const badgeTags = new Set(config.badgesFromJsDoc ?? []);

  for (const sourceFile of proj.getSourceFiles()) {
    for (const [exportName, declarations] of sourceFile.getExportedDeclarations()) {
      const decls = declarations.filter((d) => symbolKindOf(d));
      const first = decls[0];
      if (!first) continue;
      const declFile = first.getSourceFile();
      if (declFile.isInNodeModules() || declFile.isDeclarationFile()) continue;
      const kind = symbolKindOf(first)!;
      const name =
        exportName === 'default'
          ? ((first as {getName?: () => string | undefined}).getName?.() ?? exportName)
          : exportName;
      const filePath = posix.relative(root, declFile.getFilePath());
      const key = `${filePath}:${first.getStart()}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const jsDocsPerDecl = decls.map((d) => {
        const host = jsDocHostFor(d);
        return Node.isJSDocable(host) ? host.getJsDocs() : [];
      });
      const jsDocs = jsDocsPerDecl.flat();
      const description =
        jsDocsPerDecl
          .find((docs) => docs.length)
          ?.at(-1)
          ?.getDescription()
          .trim() ?? '';
      const tags = jsDocs.flatMap((d) => d.getTags().map((t) => t.getTagName()));
      const badges = [...new Set(tags.filter((t) => badgeTags.has(t)))];

      records.push({
        kind,
        name,
        filePath,
        line: first.getStartLineNumber(),
        signature: signatureOf(decls),
        description,
        badges,
        group: groupNameFor(filePath, config.groupBy ?? 'directory', kind),
      });
    }
  }

  return records;
}

function symbolKindOf(decl: Node): SymbolKind | null {
  if (Node.isClassDeclaration(decl)) return 'class';
  if (Node.isInterfaceDeclaration(decl)) return 'interface';
  if (Node.isFunctionDeclaration(decl)) return 'function';
  if (Node.isVariableDeclaration(decl)) return 'const';
  if (Node.isTypeAliasDeclaration(decl)) return 'type';
  if (Node.isEnumDeclaration(decl)) return 'enum';
  return null;
}

/**
 * Resolve the node that actually carries JSDoc for an exported declaration.
 * Most declarations are themselves JSDocable, but a `VariableDeclaration`
 * (`export const`) keeps its JSDoc on the enclosing `VariableStatement`.
 */
function jsDocHostFor(decl: Node): Node {
  if (Node.isVariableDeclaration(decl)) {
    return decl.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement) ?? decl;
  }
  return decl;
}

/**
 * Declaration text without decorators, `export`/`default` modifiers or
 * implementation bodies. Overloaded functions list every overload
 * signature; classes stop at the opening brace; interfaces, type aliases
 * and enums keep their full shape.
 */
function signatureOf(decls: Node[]): string {
  const [first] = decls;
  if (Node.isFunctionDeclaration(first)) {
    const overloads = decls.filter(Node.isFunctionDeclaration).filter((d) => d.isOverload());
    return (overloads.length ? overloads : [first])
      .map((d) => stripExport(textBefore(d, d.getBody())))
      .join('\n');
  }
  if (Node.isClassDeclaration(first)) {
    const decorators = first.getDecorators();
    const start = decorators.length ? decorators.at(-1)!.getEnd() : first.getStart();
    const brace = first.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken);
    const end = brace?.getStart() ?? first.getEnd();
    return stripExport(first.getSourceFile().getFullText().slice(start, end));
  }
  if (Node.isVariableDeclaration(first)) {
    const statement = first.getVariableStatement();
    const keyword = statement?.getDeclarationKind() ?? 'const';
    const type = first.getTypeNode()?.getText() ?? first.getType().getText(first);
    return `${keyword} ${first.getName()}: ${type}`;
  }
  return stripExport(first.getText());
}

function textBefore(node: Node, body: Node | undefined): string {
  const text = node.getText();
  return body ? text.slice(0, body.getStart() - node.getStart()) : text;
}

function stripExport(text: string): string {
  return text
    .trim()
    .replace(/^export\s+(default\s+)?/, '')
    .replace(/;$/, '');
}

function groupNameFor(
  filePath: string,
  strategy: NonNullable<ApiConfig['groupBy']>,
  kind: SymbolKind,
): string {
  if (strategy === 'kind') return kind;
  if (strategy === 'package') {
    const match = filePath.match(/^packages\/([^/]+)\//);
    return match?.[1] ?? 'root';
  }
  // Sluggify the directory into a single URL- and label-friendly segment so
  // groups stay short (`src/app/ui/api` → `src-app-ui-api`) instead of
  // leaking multi-segment paths into URLs and headings.
  const dir = filePath.split('/').slice(0, -1).join('/');
  return slugifyGroup(dir) || 'root';
}

function slugifyGroup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Read a literal object passed to `defineApi(...)` and coerce it into the
 * `ApiConfig` shape. Only literal fields are supported; computed values
 * are ignored. Enough for the v1 of the plugin; richer config can move to
 * a runtime evaluation pass later.
 */
function parseLiteralAsConfig(literal: {
  getProperties: () => Array<{
    getName?: () => string;
    getInitializer?: () => unknown;
  }>;
}): ApiConfig {
  const out: Partial<ApiConfig> = {scope: [], exclude: []};
  for (const prop of literal.getProperties()) {
    const name = prop.getName?.();
    const init = prop.getInitializer?.();
    if (!name || !init) continue;
    const text = (init as {getText: () => string}).getText().trim();
    if (name === 'scope' || name === 'exclude' || name === 'badgesFromJsDoc') {
      const matches = text.match(/'([^']+)'|"([^"]+)"/g) ?? [];
      const values = matches.map((m) => m.slice(1, -1));
      (out as Record<string, unknown>)[name] = values;
    } else if (name === 'basePath' || name === 'groupBy') {
      const value = text.match(/'([^']+)'|"([^"]+)"/)?.[0]?.slice(1, -1) ?? '';
      (out as Record<string, unknown>)[name] = value;
    }
  }
  if (!out.scope?.length) out.scope = [];
  return out as ApiConfig;
}
