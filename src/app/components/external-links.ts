import {Component, DestroyRef, inject} from '@angular/core';
import {Router} from '@angular/router';
import {enhanceOnNavigation} from '../utils/enhance-on-navigation';

/**
 * Adds `target="_blank" rel="noopener noreferrer"` to external anchors in
 * rendered markdown after each route change.
 *
 * Wired in the constructor so the lifecycle hook isn't needed — the
 * `enhanceOnNavigation` helper internally guards against SSR and retries
 * until the markdown body has flushed, so running before the first view
 * commit is harmless.
 */
@Component({
  selector: 'app-external-links',
  template: '',
  styles: `
    :host {
      display: none;
    }
  `,
})
export class ExternalLinks {
  constructor() {
    enhanceOnNavigation(
      inject(Router),
      inject(DestroyRef),
      'main analog-markdown a[href^="http"]:not([data-external-enhanced]), main analog-markdown-route a[href^="http"]:not([data-external-enhanced])',
      (node) => {
        const a = node as HTMLAnchorElement;
        a.setAttribute('data-external-enhanced', 'true');
        if (a.href.startsWith(window.location.origin)) return;
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      },
    );
  }
}
