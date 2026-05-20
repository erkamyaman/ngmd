import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Build-time map of page URL → { editUrl, lastUpdated }.
 *
 * Walks `src/app/pages` (for `.page.ts` routes) and `src/content` (for `.md`
 * referenced by `injectContent({ customFilename })`), pulls the latest commit
 * date via `git log`, and emits a typed module under the virtual id
 * `virtual:ngmd/page-meta` which the runtime imports.
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

const CONTENT_TO_ROUTE: Record<string, string> = {
  // Maps customFilename (without .md) → page route for content-driven pages.
  welcome: '/welcome',
  about: '/getting-started/about',
  changelog: '/getting-started/changelog',
  installation: '/getting-started/installation',
  'quick-start': '/getting-started/quick-start',
  theming: '/concepts/theming',
  components: '/concepts/components',
  'markdown-routes': '/concepts/markdown-routes',
  'stack-overview': '/stack/overview',
  'stack-technologies': '/stack/technologies',
  'stack-installation': '/stack/installation',
  support: '/support',
};

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

      // src/content/<name>.md → route via CONTENT_TO_ROUTE
      for (const [name, route] of Object.entries(CONTENT_TO_ROUTE)) {
        const rel = `src/content/${name}.md`;
        const date = gitDate(rel, root);
        if (!date) continue;
        // .md edit URL wins when present (more useful for prose pages)
        map[route] = {
          editUrl: `${opts.repoUrl}/edit/${branch}/${rel}`,
          lastUpdated: date,
        };
      }

      return `export const pageMeta = ${JSON.stringify(map, null, 2)};`;
    },
  };
}
