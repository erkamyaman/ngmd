import {AfterViewInit, Component, DestroyRef, inject} from '@angular/core';
import {Router} from '@angular/router';
import {enhanceOnNavigation} from '../utils/enhance-on-navigation';

/**
 * Adds `target="_blank" rel="noopener noreferrer"` to external anchors in
 * rendered markdown after each route change.
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
export class ExternalLinks implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    enhanceOnNavigation(
      this.router,
      this.destroyRef,
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
