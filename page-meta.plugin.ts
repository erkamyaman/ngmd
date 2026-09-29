import {statSync} from 'node:fs';
import {join} from 'node:path';
import type {Plugin, ViteDevServer} from 'vite';
import {gitDate, routeFromPagePath, walkContentFiles, walkPageFiles} from './plugin-utils.ts';

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

export function pageMetaPlugin(opts: {repoUrl: string; branch?: string; dir?: string}): Plugin {
  const branch = opts.branch ?? 'main';
  const dir = opts.dir ? `${opts.dir.replace(/^\/+|\/+$/g, '')}/` : '';
  let root = process.cwd();
  let server: ViteDevServer | undefined;

  return {
    name: 'ngmd-page-meta',
    configResolved(cfg) {
      root = cfg.root;
    },
    configureServer(s) {
      server = s;
    },
    watchChange(id) {
      if (!server || !(id.endsWith('.md') || id.endsWith('.page.ts'))) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const map: Record<string, PageMeta> = {};

      // .page.ts → route
      try {
        const pageFiles = walkPageFiles(join(root, 'src/app/pages'), root);
        for (const rel of pageFiles) {
          const route = routeFromPagePath(rel);
          if (!route) continue;
          map[route] = {
            editUrl: `${opts.repoUrl}/edit/${branch}/${dir}${rel}`,
            lastUpdated: gitDate(rel, root),
          };
        }
      } catch {
        // src/app/pages missing, skip
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
            editUrl: `${opts.repoUrl}/edit/${branch}/${dir}${rel}`,
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
