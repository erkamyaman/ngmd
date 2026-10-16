import type {MarkedExtension} from 'marked';

/**
 * Sub-path hosting: prefix root-absolute links and media in rendered markdown
 * with the site base, so `[Theming](/concepts/theming)` and `![](/images/a.png)`
 * point at `/repo/concepts/theming` and `/repo/images/a.png` when the site is
 * served from `/repo/`. Only plain `<a>`, `<img>`, `<source>`, `<video>`,
 * `<audio>`, `<track>` and `<iframe>` tags are touched: `<ngmd-*>` elements
 * hand their `href` to the router, which already knows the base. Protocol-
 * relative (`//cdn...`) and external URLs are left alone, and nothing changes
 * when the base is `/`.
 */
const TAG_RE =
  /(<(?:a|img|source|video|audio|track|iframe)\b[^>]*?\s(?:href|src)=)(["'])\/(?!\/)/gi;

export function prefixRootLinks(html: string, base: string): string {
  if (base === '/') return html;
  return html.replace(TAG_RE, (_m, head: string, quote: string) => `${head}${quote}${base}`);
}

export function ngmdBaseExtension(base: string): MarkedExtension {
  return {hooks: {postprocess: (html: string) => prefixRootLinks(html, base)}};
}
