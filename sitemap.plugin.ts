import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Emits `sitemap.xml` and `robots.txt` into the client build output.
 *
 * Discovery mirrors the page-meta plugin: walks `src/app/pages/*.page.ts` and
 * `src/content/*.md` (mapped via CONTENT_TO_ROUTE), pulls each file's last
 * commit date via `git log -1 --format=%cs` to populate `<lastmod>`, falls
 * back to mtime for uncommitted files, and writes both files via Rollup's
 * `emitFile` so they land at the client root.
 *
 * `robots.txt` is a one-liner pointing at the sitemap.
 */

const CONTENT_TO_ROUTE: Record<string, string> = {
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
    return new Date().toISOString().slice(0, 10);
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
  const trimmed = rel
    .replace(/^src\/app\/pages\//, '')
    .replace(/\.page\.ts$/, '');
  if (trimmed === 'index') return '/';
  if (trimmed.startsWith('[')) return ''; // catch-all / dynamic — skip
  return '/' + trimmed;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function sitemapPlugin(opts: { siteUrl: string }): Plugin {
  let root = process.cwd();
  const siteUrl = opts.siteUrl.replace(/\/+$/, '');

  return {
    name: 'ngmd-sitemap',
    apply: 'build',
    configResolved(cfg) {
      root = cfg.root;
    },
    generateBundle(_outputOptions, _bundle) {
      // Collect route → lastmod, .md takes precedence (more useful for prose)
      const entries = new Map<string, string>();

      try {
        const pageFiles = walkPageFiles(
          join(root, 'src/app/pages'),
          root,
        );
        for (const rel of pageFiles) {
          const route = routeFromPagePath(rel);
          if (!route) continue;
          entries.set(route, gitDate(rel, root));
        }
      } catch {
        // src/app/pages missing — fine
      }

      for (const [name, route] of Object.entries(CONTENT_TO_ROUTE)) {
        const rel = `src/content/${name}.md`;
        try {
          statSync(join(root, rel));
        } catch {
          continue;
        }
        entries.set(route, gitDate(rel, root));
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
