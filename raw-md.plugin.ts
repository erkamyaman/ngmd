import {readFileSync, statSync} from 'node:fs';
import {extname, join} from 'node:path';
import type {Plugin} from 'vite';
import {walkContentFiles} from './plugin-utils.ts';
import {substituteMdVars} from './vars.plugin.ts';

/**
 * Serves the raw markdown body at the same URL plus a `.md` suffix.
 *
 *   /concepts/theming     -> rendered prose page
 *   /concepts/theming.md  -> the literal `.md` source as `text/markdown`
 *
 * Powers the "Copy Markdown" / "Open in ChatGPT" / "Open in Claude"
 * dropdown so LLMs can fetch a page by URL and get clean markdown back
 * instead of compiled HTML. Pattern is the same one react.dev and the
 * PrimeNG docs site ship for their LLM-friendly pages.
 *
 * Dev mode: middleware reads from `src/content` on each request.
 * Build mode: emits each `.md` body as a static asset at the matching
 *   route + `.md` so the same paths work after `vite build`.
 */
export function rawMdPlugin(): Plugin {
  let root = process.cwd();

  function resolveMd(rawPath: string): string | null {
    if (!rawPath.endsWith('.md')) return null;
    const route = rawPath.slice(0, -3).replace(/^\//, '');
    if (!route) return null;
    if (route.includes('..')) return null;
    for (const file of [`${route}.md`, `${route}/index.md`]) {
      const abs = join(root, 'src/content', file);
      try {
        if (!statSync(abs).isFile()) continue;
        return substituteMdVars(readFileSync(abs, 'utf8'), root);
      } catch {
        continue;
      }
    }
    return null;
  }

  return {
    name: 'ngmd-raw-md',
    configResolved(cfg) {
      root = cfg.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? '';
        if (extname(raw) !== '.md') return next();
        // URL paths arrive percent-encoded (`/concepts/some%20page.md`),
        // but the on-disk filename is `some page.md`. Decode before
        // resolving so the lookup matches. Malformed sequences fall
        // through to the next middleware.
        let url: string;
        try {
          url = decodeURIComponent(raw);
        } catch {
          return next();
        }
        const body = resolveMd(url);
        if (body == null) return next();
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.end(body);
      });
    },
    generateBundle() {
      // Emit one `<route>.md` asset per markdown source so the same URL
      // works in production. Mirrors the dev middleware.
      const contentDir = join(root, 'src/content');
      try {
        statSync(contentDir);
      } catch {
        return;
      }
      const files = walkContentFiles(contentDir, contentDir).map(([rel, route]) => [
        rel.replace(/\\/g, '/'),
        route,
      ]);
      const sources = new Set(files.map(([rel]) => rel));
      for (const [rel, route] of files) {
        const source = substituteMdVars(readFileSync(join(contentDir, rel), 'utf8'), root);
        this.emitFile({type: 'asset', fileName: rel, source});
        const alias = `${route.slice(1)}.md`;
        if (route !== '/' && !sources.has(alias)) {
          this.emitFile({type: 'asset', fileName: alias, source});
        }
      }
    },
  };
}
