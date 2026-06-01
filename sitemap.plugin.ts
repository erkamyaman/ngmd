import {statSync} from 'node:fs';
import {join} from 'node:path';
import type {Plugin} from 'vite';
import {gitDate, routeFromPagePath, walkContentFiles, walkPageFiles} from './plugin-utils';

/**
 * Emits `sitemap.xml` and `robots.txt` into the client build output.
 *
 * Discovery mirrors the page-meta plugin: walks `src/app/pages/*.page.ts`
 * and `src/content/**\/*.md`, pulls each file's last commit date via
 * `git log -1 --format=%cs` to populate `<lastmod>`, falls back to mtime
 * for uncommitted files.
 *
 * Versioned content authored under `src/content/v/<slug>/...` keeps its
 * authored path verbatim; the plugin doesn't synthesise version variants
 * because each variant is a real file on disk and the walker already
 * picks them up.
 *
 * `robots.txt` is a one-liner pointing at the sitemap.
 */

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function sitemapPlugin(opts: {siteUrl: string}): Plugin {
  let root = process.cwd();
  const siteUrl = opts.siteUrl.replace(/\/+$/, '');
  const today = () => new Date().toISOString().slice(0, 10);

  return {
    name: 'ngmd-sitemap',
    apply: 'build',
    configResolved(cfg) {
      root = cfg.root;
    },
    generateBundle() {
      const entries = new Map<string, string>();

      try {
        const pageFiles = walkPageFiles(join(root, 'src/app/pages'), root);
        for (const rel of pageFiles) {
          const route = routeFromPagePath(rel);
          if (!route) continue;
          entries.set(route, gitDate(rel, root, today));
        }
      } catch {
        // src/app/pages missing — fine
      }

      const contentDir = join(root, 'src/content');
      try {
        statSync(contentDir);
        for (const [rel, route] of walkContentFiles(contentDir, root)) {
          entries.set(route, gitDate(rel, root, today));
        }
      } catch {
        // src/content missing — skip
      }

      const urls = [...entries.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([route, lastmod]) => {
          const loc = escapeXml(`${siteUrl}${route}`);
          return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
        })
        .join('\n');

      const sitemap =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls +
        '\n</urlset>\n';

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap,
      });

      const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robots,
      });
    },
  };
}
