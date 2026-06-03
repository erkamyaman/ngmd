import {Component, DestroyRef, inject} from '@angular/core';
import {Router} from '@angular/router';
import {ToastService} from '../services/toast/toast.service';
import {writeToClipboard} from '../utils/clipboard';
import {enhanceOnNavigation} from '../utils/enhance-on-navigation';

/**
 * Scans rendered markdown for <pre> code blocks and injects a copy button
 * into each one. Runs on initial mount and after every route change.
 */
@Component({
  selector: 'app-code-copy',
  template: '',
  styles: `
    :host {
      display: none;
    }
  `,
})
export class CodeCopy {
  private readonly toast = inject(ToastService);

  constructor() {
    enhanceOnNavigation(
      inject(Router),
      inject(DestroyRef),
      'analog-markdown-route pre:not([data-copy-enhanced]), analog-markdown pre:not([data-copy-enhanced])',
      (pre) => this.enhance(pre),
    );
  }

  private enhance(pre: HTMLElement): void {
    pre.setAttribute('data-copy-enhanced', 'true');
    pre.style.position = 'relative';

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code');
    button.className =
      'absolute top-2 right-2 inline-flex items-center justify-center size-7 rounded-md bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white opacity-0 transition-opacity focus:opacity-100';
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
      const ok = await writeToClipboard(code);
      if (!ok) {
        this.toast.error('Could not copy code.');
        return;
      }
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
    });

    pre.appendChild(button);
  }
}
