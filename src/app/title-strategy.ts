import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TitleStrategy, type RouterStateSnapshot} from '@angular/router';
import siteConfig, {navLabels} from '../ngmd.config';

/**
 * Custom title strategy. Every page renders as `NgMd | <Title>`, where
 * `<Title>` resolves in this order:
 *
 *   1. The route's own `title` (set by Analog from markdown frontmatter or
 *      by a `.page.ts` component via `routeMeta`).
 *   2. The matching entry in `ngmd.config.ts > navLabels`.
 *   3. A prettified last URL segment ("markdown-routes" → "Markdown Routes").
 *   4. `siteConfig.site.tagline` for the homepage (no `|` separator there).
 *
 * Replaces Angular's `DefaultTitleStrategy`, which would otherwise overwrite
 * our format with just the raw frontmatter title.
 */
@Injectable({providedIn: 'root'})
export class NgmdTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const name = siteConfig.site.name;
    const url = snapshot.url.split('?')[0].split('#')[0];

    // Homepage uses the tagline, no pipe separator.
    if (url === '/' || url === '') {
      const tagline = siteConfig.site.tagline;
      this.title.setTitle(tagline ? `${name} | ${tagline}` : name);
      return;
    }

    let pageTitle = this.buildTitle(snapshot);
    if (!pageTitle) {
      const last = url.split('/').filter(Boolean).pop() ?? '';
      pageTitle =
        navLabels[last] ??
        last
          .split('-')
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(' ');
    }
    this.title.setTitle(pageTitle ? `${name} | ${pageTitle}` : name);
  }
}
