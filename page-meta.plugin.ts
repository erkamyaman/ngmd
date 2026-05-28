import {execSync} from 'node:child_process';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import type {Plugin} from 'vite';
import {PAGE_STATUS_VALUES, type PageStatus} from './src/types/badge';

export type {PageStatus};

/**
 * Build-time map of page URL → { editUrl, lastUpdated }.
 *
 * Walks `src/app/pages` (for `.page.ts` routes) and `src/content/**\/*.md`
 * (each markdown file's path under content/ becomes its route, matching the
 * `[...slug].page.ts` catch-all), pulls the latest commit date via `git log`,
 * and emits a typed module under the virtual id `virtual:ngmd/page-meta`
 * which the runtime imports.
 *
 * If the file is uncommitted, lastUpdated falls back to its mtime in ISO
 * date form so dev iteration still shows something.
 */

export interface PageMeta {
  editUrl: string;
  lastUpdated: string;
  /** Optional lifecycle status from frontmatter (`status: beta` etc.).
   * Rendered as a chip next to the sidebar entry. */
  status?: PageStatus;
}

/** Parses just the `status:` field out of a YAML frontmatter block.
 * Skips the heavy YAML dependency — we only need this one key, and the
 * frontmatter parser AnalogJS uses (`front-matter`) is not available in the
 * vite plugin context without pulling it into the build graph. */
function readStatus(path: string): PageStatus | undefined {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return undefined;
  }
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return undefined;
  const line = fm[1].match(/^\s*status\s*:\s*['"]?([a-z]+)['"]?\s*$/m);
  if (!line) return undefined;
  const value = line[1].toLowerCase() as PageStatus;
  return PAGE_STATUS_VALUES.includes(value) ? value : undefined;
}

const VIRTUAL_ID = 'virtual:ngmd/page-meta';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

function gitDate(file: string, cwd: string): string {
  try {
    const stamp = execSync(`git log -1 --format=%cs -- "${file}"`, {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (stamp) return stamp;
  } catch {
    // fall through to mtime
  }
  try {
    return statSync(join(cwd, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function walkPageFiles(dir: string, root: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPageFiles(full, root, out);
    } else if (entry.isFile() && entry.name.endsWith('.page.ts')) {
      out.push(relative(root, full));
    }
  }
  return out;
}

function routeFromPagePath(rel: string): string {
  // src/app/pages/foo/bar.page.ts → /foo/bar; index.page.ts → /
  const trimmed = rel.replace(/^src\/app\/pages\//, '').replace(/\.page\.ts$/, '');
  if (trimmed === 'index') return '/';
  if (trimmed.startsWith('[')) return ''; // dynamic / catch-all: skip
  return '/' + trimmed;
}

/**
 * Walk `src/content/**\/*.md` and return `[relativePath, route]` pairs.
 * Route mirrors the path under `src/content/` with the .md stripped.
 * Example: `src/content/concepts/theming.md` → `/concepts/theming`.
 */
function walkContentFiles(
  dir: string,
  root: string,
  baseDir: string = dir,
  out: Array<[string, string]> = [],
): Array<[string, string]> {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkContentFiles(full, root, baseDir, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = relative(root, full);
      const fromContent = relative(baseDir, full).replace(/\\/g, '/').replace(/\.md$/, '');
      out.push([rel, '/' + fromContent]);
    }
  }
  return out;
}

export function pageMetaPlugin(opts: {repoUrl: string; branch?: string}): Plugin {
  const branch = opts.branch ?? 'main';
  let root = process.cwd();

  return {
    name: 'ngmd-page-meta',
    configResolved(cfg) {
      root = cfg.root;
    },
    /** Invalidate the virtual module when any markdown file changes so
     * a frontmatter edit (notably `status:`) reflows the sidebar badge
     * without a full restart. */
    handleHotUpdate(ctx) {
      if (!ctx.file.endsWith('.md')) return;
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) ctx.server.moduleGraph.invalidateModule(mod);
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const map: Record<string, PageMeta> = {};

      // .page.ts → route
      const pageFiles = walkPageFiles(join(root, 'src/app/pages'), root);
      for (const rel of pageFiles) {
        const route = routeFromPagePath(rel);
        if (!route) continue;
        map[route] = {
          editUrl: `${opts.repoUrl}/edit/${branch}/${rel}`,
          lastUpdated: gitDate(rel, root),
        };
      }

      // src/content/**/*.md → route (mirrors the [...slug] catch-all)
      const contentDir = join(root, 'src/content');
      try {
        statSync(contentDir);
        for (const [rel, route] of walkContentFiles(contentDir, root)) {
          const date = gitDate(rel, root);
          if (!date) continue;
          const status = readStatus(join(root, rel));
          // .md edit URL wins when present (more useful for prose pages)
          map[route] = {
            editUrl: `${opts.repoUrl}/edit/${branch}/${rel}`,
            lastUpdated: date,
            ...(status ? {status} : {}),
          };
        }
      } catch {
        // src/content missing — skip
      }

      return `export const pageMeta = ${JSON.stringify(map, null, 2)};`;
    },
  };
}
