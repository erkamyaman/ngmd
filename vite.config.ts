/// <reference types="vitest" />

import {defineConfig, type Plugin} from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import {readFileSync} from 'node:fs';
import {getBuildExtensions} from './src/marked-extensions/index.ts';
import {pageMetaPlugin} from './page-meta.plugin.ts';
import {internalLinkGuard} from './link-guard.plugin.ts';
import {mdLinksPlugin} from './md-links.plugin.ts';
import {siteHtmlPlugin} from './site-html.plugin.ts';
import {sitemapPlugin} from './sitemap.plugin.ts';
import {searchIndexPlugin} from './search-index.plugin.ts';
import {rawMdPlugin} from './raw-md.plugin.ts';
import {varsPlugin} from './vars.plugin.ts';
import {apiGenPlugin} from './api-gen.plugin.ts';
import {withoutCode} from './plugin-utils.ts';
import config from './src/ngmd.config.ts';

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
      const file = id.split('?')[0];
      if (!file.endsWith('.md')) return null;
      const content = withoutCode(readFileSync(file, 'utf8'));
      const anchorRe = /<a\b[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/g;
      const matches = content.match(anchorRe) ?? [];
      for (const m of matches) {
        if (!/target=["']_blank["']/.test(m)) {
          this.error(
            `[ngmd] External anchor in ${file} is missing target="_blank":\n  ${m}\n` +
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
    siteHtmlPlugin(config.site),
    varsPlugin(),
    externalLinkGuard(),
    internalLinkGuard(),
    mdLinksPlugin(),
    pageMetaPlugin({
      repoUrl: config.site.githubUrl,
      branch: config.site.githubBranch ?? 'main',
      dir: config.site.githubDir,
    }),
    sitemapPlugin({siteUrl: config.site.url}),
    rawMdPlugin(),
    searchIndexPlugin(),
    apiGenPlugin(),
    analog({
      apiPrefix: '_server',
      content: {
        highlighter: 'shiki',
        markedOptions: {
          extensions: await getBuildExtensions(),
        },
        shikiOptions: {
          highlight: {
            themes: {light: 'github-light-default', dark: 'github-dark-default'},
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
