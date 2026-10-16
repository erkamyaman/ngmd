import type {Plugin} from 'vite';
import {normalizeBase, publicUrl} from './src/base.ts';

/**
 * Fills the `%SITE_NAME%`, `%SITE_DESCRIPTION%` and `%SITE_URL%` tokens in
 * `index.html` from `site` in `ngmd.config.ts`, so the title, description,
 * Open Graph and Twitter tags follow the config instead of being hardcoded.
 * Values are HTML-escaped; the URL loses its trailing slash.
 *
 * `%SITE_BASE%` is the sub-path the site is served from (`/` or `/repo/`),
 * and `%SITE_URL%` includes it, so `og:url` and `og:image` point at the
 * right place on a project page. An `index.html` from an older starter with
 * a hardcoded `<base href="/">` gets the base too.
 */

export interface SiteHtmlOptions {
  name: string;
  description: string;
  url: string;
  /** Sub-path the site is served from, like `/repo/`. Defaults to `/`. */
  base?: string;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function siteHtmlPlugin(site: SiteHtmlOptions): Plugin {
  const base = normalizeBase(site.base);
  const values: Record<string, string> = {
    '%SITE_BASE%': base,
    '%SITE_NAME%': site.name,
    '%SITE_DESCRIPTION%': site.description,
    '%SITE_URL%': publicUrl(site.url, base),
  };
  return {
    name: 'ngmd-site-html',
    transformIndexHtml(html) {
      const withTokens = Object.entries(values).reduce(
        (out, [token, value]) => out.replaceAll(token, escapeAttr(value)),
        html,
      );
      return base === '/'
        ? withTokens
        : withTokens.replace(/<base href="\/"/, `<base href="${escapeAttr(base)}"`);
    },
  };
}
