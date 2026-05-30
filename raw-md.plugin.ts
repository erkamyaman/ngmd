import {readdirSync, readFileSync, statSync} from 'node:fs';
import {extname, join, relative} from 'node:path';
import type {Plugin} from 'vite';

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
    const abs = join(root, 'src/content', `${route}.md`);
    try {
      const s = statSync(abs);
      if (!s.isFile()) return null;
    } catch {
      return null;
    }
    try {
      return readFileSync(abs, 'utf8');
    } catch {
      return null;
    }
  }

  return {
    name: 'ngmd-raw-md',
    configResolved(cfg) {
      root = cfg.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (extname(url) !== '.md') return next();
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

      const walk = (dir: string): string[] => {
        const out: string[] = [];
        for (const entry of readdirSync(dir, {withFileTypes: true})) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) out.push(...walk(full));
          else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
        }
        return out;
      };

      try {
        statSync(contentDir);
      } catch {
        return;
      }
      for (const file of walk(contentDir)) {
        const route = relative(contentDir, file).replace(/\\/g, '/');
        const body = readFileSync(file, 'utf8');
        this.emitFile({
          type: 'asset',
          fileName: route,
          source: body,
        });
      }
    },
  };
}
