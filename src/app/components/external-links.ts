import {AfterViewInit, Component, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

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
    this.enhanceWithRetry();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.enhanceWithRetry());
  }

  private enhanceWithRetry(attempt = 0): void {
    if (typeof document === 'undefined' || attempt > 20) return;
    const container =
      document.querySelector('main analog-markdown') ??
      document.querySelector('main analog-markdown-route');
    const anchors = container?.querySelectorAll('a[href^="http"]:not([data-external-enhanced])');
    if (!anchors || anchors.length === 0) {
      setTimeout(() => this.enhanceWithRetry(attempt + 1), 50);
      return;
    }
    const origin = window.location.origin;
    anchors.forEach((node) => {
      const a = node as HTMLAnchorElement;
      a.setAttribute('data-external-enhanced', 'true');
      if (a.href.startsWith(origin)) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  }
}
