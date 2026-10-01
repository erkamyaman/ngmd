import {join, relative} from 'node:path';
import type {Plugin} from 'vite';

export function mdLinksPlugin(): Plugin {
  let contentDir = join(process.cwd(), 'src/content');
  return {
    name: 'ngmd-md-links',
    configResolved(cfg) {
      contentDir = join(cfg.root, 'src/content');
    },
    transform(code, id) {
      const [file, query = ''] = id.split('?');
      if (!query.includes('analog-content-file=true')) return null;
      const rel = relative(contentDir, file).replace(/\\/g, '/');
      if (rel.startsWith('..')) return null;
      const match = /^export default (".*");?\s*$/s.exec(code);
      if (!match) {
        return this.error(
          `[ngmd] Unexpected content module shape for ${rel}, can't resolve .md links.`,
        );
      }
      const html = resolveDocLinks(JSON.parse(match[1]) as string, `/src/content/${rel}`);
      return {code: `export default ${JSON.stringify(html)}`, map: null};
    },
  };
}

const CONTENT_ROOT = '/src/content/';

export function resolveMdHref(href: string, pageFile: string): string | null {
  if (/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(href)) return null;
  const hashAt = href.indexOf('#');
  const path = hashAt === -1 ? href : href.slice(0, hashAt);
  if (!path.endsWith('.md')) return null;
  const {pathname} = new URL(path, `http://docs${pageFile}`);
  if (!pathname.startsWith(CONTENT_ROOT)) return null;
  const route = pathname
    .slice(CONTENT_ROOT.length - 1, -'.md'.length)
    .replace(/(^|\/)index$/, '$1')
    .replace(/(.)\/$/, '$1');
  return route + (hashAt === -1 ? '' : href.slice(hashAt));
}

export function resolveDocLinks(html: string, pageFile: string): string {
  return html.replace(
    /(<a\s(?:[^>]*?\s)?href=)(["'])([^"']*)\2/gi,
    (match, attr: string, quote: string, href: string) => {
      const route = resolveMdHref(href, pageFile);
      return route === null ? match : `${attr}${quote}${route}${quote}`;
    },
  );
}
