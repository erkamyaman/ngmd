/// <reference types="vitest" />

import {defineConfig} from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import {readFileSync} from 'node:fs';
import {getBuildExtensions} from './src/marked-extensions';
import {pageMetaPlugin} from './page-meta.plugin';
import {internalLinkGuard} from './link-guard.plugin';
import {sitemapPlugin} from './sitemap.plugin';
import {searchIndexPlugin} from './search-index.plugin';
import {rawMdPlugin} from './raw-md.plugin';
import {varsPlugin} from './vars.plugin';
import config from './src/ngmd.config';

/**
 * Build-time guard: errors when a markdown file in `src/content/` contains
 * a raw HTML `<a href="http(s)://...">` without `target="_blank"`. Raw HTML
 * anchors bypass the marked link renderer (which would add target=_blank
 * automatically), so this catches external links that would silently open
 * in the same tab.
 *
 * Lifted from the adev docs pipeline pattern.
 */
function externalLinkGuard(): Plugin {
  return {
    name: 'ngmd-external-link-guard',
    enforce: 'pre',
    transform(_code, id) {
      if (!id.endsWith('.md')) return null;
      const content = readFileSync(id.split('?')[0], 'utf8');
      const anchorRe = /<a\b[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/g;
      const matches = content.match(anchorRe) ?? [];
      for (const m of matches) {
        if (!/target=["']_blank["']/.test(m)) {
          this.error(
            `[ngmd] External anchor in ${id} is missing target="_blank":\n  ${m}\n` +
              `Add target="_blank" rel="noopener noreferrer" so external links open in a new tab.`,
          );
        }
      }
      return null;
    },
  };
}

export default defineConfig(async () => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    varsPlugin(),
    externalLinkGuard(),
    internalLinkGuard(),
    pageMetaPlugin({repoUrl: config.site.githubUrl, branch: 'main'}),
    sitemapPlugin({siteUrl: config.site.url}),
    rawMdPlugin(),
    searchIndexPlugin(),
    analog({
      content: {
        highlighter: 'shiki',
        markedOptions: {
          extensions: await getBuildExtensions(),
        },
        shikiOptions: {
          highlight: {
            themes: {light: 'github-light', dark: 'github-dark'},
            defaultColor: false,
          },
          highlighter: {
            additionalLangs: ['bash', 'md', 'json'],
          },
        },
      },
    }),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
}));
