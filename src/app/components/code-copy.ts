import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Scans rendered markdown for <pre> code blocks and injects a copy button
 * into each one. Runs on initial mount and after every route change.
 */
@Component({
  selector: 'app-code-copy',
  template: '',
  styles: `
    :host { display: none; }
  `,
})
export class CodeCopy implements AfterViewInit {
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
    const pres = container?.querySelectorAll('pre:not([data-copy-enhanced])');
    if (!pres || pres.length === 0) {
      setTimeout(() => this.enhanceWithRetry(attempt + 1), 50);
      return;
    }
    pres.forEach((pre) => this.enhance(pre as HTMLElement));
  }

  private enhance(pre: HTMLElement): void {
    pre.setAttribute('data-copy-enhanced', 'true');
    pre.style.position = 'relative';

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code');
    button.className =
      'absolute top-2 right-2 inline-flex items-center justify-center size-7 rounded-md bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white opacity-0 transition-opacity focus:opacity-100';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    `;

    pre.addEventListener('mouseenter', () => (button.style.opacity = '1'));
    pre.addEventListener('mouseleave', () => (button.style.opacity = '0'));

    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
      try {
        await navigator.clipboard.writeText(code);
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        setTimeout(() => {
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          `;
        }, 1500);
      } catch {
        // clipboard API not available, fall back silently
      }
    });

    pre.appendChild(button);
  }
}
