import type {Plugin} from 'vite';

/**
 * Fills the `%SITE_NAME%`, `%SITE_DESCRIPTION%` and `%SITE_URL%` tokens in
 * `index.html` from `site` in `ngmd.config.ts`, so the title, description,
 * Open Graph and Twitter tags follow the config instead of being hardcoded.
 * Values are HTML-escaped; the URL loses its trailing slash.
 */

export interface SiteHtmlOptions {
  name: string;
  description: string;
  url: string;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function siteHtmlPlugin(site: SiteHtmlOptions): Plugin {
  const values: Record<string, string> = {
    '%SITE_NAME%': site.name,
    '%SITE_DESCRIPTION%': site.description,
    '%SITE_URL%': site.url.replace(/\/+$/, ''),
  };
  return {
    name: 'ngmd-site-html',
    transformIndexHtml(html) {
      return Object.entries(values).reduce(
        (out, [token, value]) => out.replaceAll(token, escapeAttr(value)),
        html,
      );
    },
  };
}
