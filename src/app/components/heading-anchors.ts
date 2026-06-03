import {Component, DestroyRef, inject} from '@angular/core';
import {Router} from '@angular/router';
import {writeToClipboard} from '../utils/clipboard';
import {enhanceOnNavigation} from '../utils/enhance-on-navigation';

/**
 * Scans rendered docs pages for h2/h3 with an id and appends a copy-link
 * button that writes the absolute URL with `#fragment` to the clipboard.
 * Runs on mount and after every route change, same pattern as CodeCopy.
 */
@Component({
  selector: 'app-heading-anchors',
  template: '',
  styles: `
    :host {
      display: none;
    }
  `,
})
export class HeadingAnchors {
  constructor() {
    enhanceOnNavigation(
      inject(Router),
      inject(DestroyRef),
      'main h1[id]:not([data-anchor-enhanced]), main h2[id]:not([data-anchor-enhanced]), main h3[id]:not([data-anchor-enhanced])',
      (h) => this.enhance(h),
    );
  }

  private enhance(heading: HTMLElement): void {
    heading.setAttribute('data-anchor-enhanced', 'true');
    heading.style.scrollMarginTop = heading.style.scrollMarginTop || '6rem';

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Copy link to ${heading.id}`);
    button.className =
      'ml-2 inline-flex items-center justify-center size-5 align-middle relative -top-[2px] rounded text-zinc-400 hover:text-[color:var(--accent)] opacity-0 transition-opacity focus:opacity-100';
    button.innerHTML = this.linkIcon();

    heading.addEventListener('mouseenter', () => (button.style.opacity = '1'));
    heading.addEventListener('mouseleave', () => (button.style.opacity = '0'));

    // h1 is the page itself; copying #h1-slug duplicates the path in the URL.
    // For h1, copy + show the bare page URL with no fragment.
    const isH1 = heading.tagName === 'H1';

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const base = `${location.origin}${location.pathname}`;
      const url = isH1 ? base : `${base}#${heading.id}`;
      if (!(await writeToClipboard(url))) return;
      button.innerHTML = this.checkIcon();
      setTimeout(() => (button.innerHTML = this.linkIcon()), 1500);
    });

    heading.appendChild(button);
  }

  private linkIcon(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    `;
  }

  private checkIcon(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
  }
}
