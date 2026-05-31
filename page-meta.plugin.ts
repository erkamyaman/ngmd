import {statSync} from 'node:fs';
import {join} from 'node:path';
import type {Plugin} from 'vite';
import {gitDate, routeFromPagePath, walkContentFiles, walkPageFiles} from './plugin-utils';

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

export function pageMetaPlugin(opts: {repoUrl: string; branch?: string}): Plugin {
  const branch = opts.branch ?? 'main';
  let root = process.cwd();

  return {
    name: 'ngmd-page-meta',
    configResolved(cfg) {
      root = cfg.root;
    },
    /** Invalidate the virtual module when any markdown file changes so
     * `lastUpdated` reflows without a full restart. */
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
