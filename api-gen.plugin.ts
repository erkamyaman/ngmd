import {existsSync} from 'node:fs';
import {join, relative} from 'node:path';
import type {Plugin} from 'vite';
import {Project, ts} from 'ts-morph';
import type {ApiConfig, SymbolRecord, SymbolKind} from './src/types/api';

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
  let project: Project | null = null;
  let recordsMemo: SymbolRecord[] | null = null;

  function loadConfig(): ApiConfig | null {
    const path = join(root, 'ngmd.api.ts');
    if (!existsSync(path)) return null;
    try {
      const proj = new Project({
        compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext},
      });
      const sourceFile = proj.addSourceFileAtPath(path);
      const def = sourceFile.getDefaultExportSymbol();
      if (!def) return null;
      // We can't trivially evaluate the TS without a runtime; instead lift
      // the literal passed to `defineApi(...)` via AST traversal. For the
      // skeleton, every supported field is read as a literal so static
      // extraction is enough.
      const callExpr = sourceFile.getDescendantsOfKind(ts.SyntaxKind.CallExpression)[0];
      if (!callExpr) return null;
      const literal = callExpr.getArguments()[0];
      if (!literal || !literal.asKind(ts.SyntaxKind.ObjectLiteralExpression)) return null;
      return parseLiteralAsConfig(literal as never);
    } catch (err) {
      console.warn('[ngmd-api-gen] failed to load ngmd.api.ts:', err);
      return null;
    }
  }

  function ensureProject(config: ApiConfig): Project {
    if (project) return project;
    project = new Project({
      tsConfigFilePath: existsSync(join(root, 'tsconfig.json'))
        ? join(root, 'tsconfig.json')
        : undefined,
      skipAddingFilesFromTsConfig: true,
    });
    for (const pattern of config.scope) {
      project.addSourceFilesAtPaths(join(root, pattern));
    }
    for (const pattern of config.exclude ?? []) {
      const matches = project.getSourceFiles(pattern);
      for (const f of matches) project.removeSourceFile(f);
    }
    return project;
  }

  function extractRecords(config: ApiConfig): SymbolRecord[] {
    if (recordsMemo) return recordsMemo;
    const proj = ensureProject(config);
    const records: SymbolRecord[] = [];
    const badgeTags = new Set(config.badgesFromJsDoc ?? []);

    for (const sourceFile of proj.getSourceFiles()) {
      const filePath = relative(root, sourceFile.getFilePath());
      const group = groupNameFor(filePath, config.groupBy ?? 'directory');

      for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
        const first = declarations[0];
        if (!first) continue;
        const kind = symbolKindOf(first);
        if (!kind) continue;
        const jsDoc = ('getJsDocs' in first ? (first as never as {getJsDocs: () => unknown[]}).getJsDocs() : []) as Array<{
          getDescription: () => string;
          getTags: () => Array<{getTagName: () => string}>;
        }>;
        const description = jsDoc[0]?.getDescription().trim() ?? '';
        const tags = jsDoc.flatMap((d) => d.getTags().map((t) => t.getTagName()));
        const badges = tags.filter((t) => badgeTags.has(t));
        const signature = first.getText().split('\n')[0]?.trim() ?? name;

        records.push({
          kind,
          name,
          filePath,
          line: first.getStartLineNumber(),
          signature,
          description,
          badges,
          group,
        });
      }
    }

    recordsMemo = records;
    return records;
  }

  return {
    name: 'ngmd-api-gen',
    configResolved(cfg) {
      root = cfg.root;
      project = null;
      recordsMemo = null;
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
    handleHotUpdate({file}) {
      // Invalidate the project cache when any source under scope changes.
      // Cheap because `Project` re-uses TypeScript's incremental machinery.
      if (file.endsWith('.ts') || file.endsWith('ngmd.api.ts')) {
        project = null;
        recordsMemo = null;
      }
    },
  };
}

function symbolKindOf(decl: unknown): SymbolKind | null {
  const kindGetter = (decl as {getKindName?: () => string}).getKindName;
  const kindName = typeof kindGetter === 'function' ? kindGetter.call(decl) : '';
  switch (kindName) {
    case 'ClassDeclaration':
      return 'class';
    case 'InterfaceDeclaration':
      return 'interface';
    case 'FunctionDeclaration':
      return 'function';
    case 'VariableDeclaration':
      return 'const';
    case 'TypeAliasDeclaration':
      return 'type';
    case 'EnumDeclaration':
      return 'enum';
    default:
      return null;
  }
}

function groupNameFor(filePath: string, strategy: NonNullable<ApiConfig['groupBy']>): string {
  if (strategy === 'kind') return 'symbols';
  if (strategy === 'package') {
    const match = filePath.match(/^packages\/([^/]+)\//);
    return match?.[1] ?? 'root';
  }
  const dir = filePath.split('/').slice(0, -1).join('/');
  return dir || 'root';
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
