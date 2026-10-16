import type {Plugin} from 'vite';
import {gitDate, siteRoutes} from './plugin-utils.ts';
import {publicUrl} from './src/base.ts';

/**
 * Emits `sitemap.xml` and `robots.txt` into the client build output.
 *
 * Routes come from `siteRoutes` in plugin-utils, the same list the build
 * prerenders: `src/app/pages/*.page.ts`, `src/content/**\/*.md` and the API
 * symbol pages, minus `noIndex` pages. Each file's last commit date via
 * `git log -1 --format=%cs` populates `<lastmod>`, falling back to mtime
 * for uncommitted files. The `/api` landing page is left out while the API
 * reference has no symbols.
 *
 * Versioning is per-deployment (each docs version is its own site under the
 * adev / PrimeNG model), so there are no in-repo version variants to
 * special-case here — the sitemap simply covers this deployment's content.
 *
 * Every URL starts with `siteUrl` plus the `base` the site is served from.
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

export function sitemapPlugin(opts: {siteUrl: string; base?: string}): Plugin {
  let root = process.cwd();
  // Origin plus the sub-path the site is served from, without a trailing slash.
  const siteUrl = publicUrl(opts.siteUrl, opts.base ?? '/');
  const today = () => new Date().toISOString().slice(0, 10);

  return {
    name: 'ngmd-sitemap',
    apply: 'build',
    configResolved(cfg) {
      root = cfg.root;
    },
    generateBundle() {
      const entries = new Map<string, string>();
      for (const {route, file, noIndex} of siteRoutes(root)) {
        if (!noIndex) entries.set(route, gitDate(file, root, today));
      }

      const urls = [...entries.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([route, lastmod]) => {
          const loc = escapeXml(`${siteUrl}${encodeURI(route)}`);
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
