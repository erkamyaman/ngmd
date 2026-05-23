import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';

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
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
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
  const trimmed = rel
    .replace(/^src\/app\/pages\//, '')
    .replace(/\.page\.ts$/, '');
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
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkContentFiles(full, root, baseDir, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = relative(root, full);
      const fromContent = relative(baseDir, full)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');
      out.push([rel, '/' + fromContent]);
    }
  }
  return out;
}

export function pageMetaPlugin(opts: {
  repoUrl: string;
  branch?: string;
}): Plugin {
  const branch = opts.branch ?? 'main';
  let root = process.cwd();

  return {
    name: 'ngmd-page-meta',
    configResolved(cfg) {
      root = cfg.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const map: Record<string, PageMeta> = {};

      // .page.ts → route
      const pageFiles = walkPageFiles(
        join(root, 'src/app/pages'),
        root,
      );
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
          // .md edit URL wins when present (more useful for prose pages)
          map[route] = {
            editUrl: `${opts.repoUrl}/edit/${branch}/${rel}`,
            lastUpdated: date,
          };
        }
      } catch {
        // src/content missing — skip
      }

      return `export const pageMeta = ${JSON.stringify(map, null, 2)};`;
    },
  };
}
