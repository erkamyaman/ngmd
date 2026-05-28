import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

/**
 * Code block with a header bar and shiki syntax highlighting at runtime.
 * Author passes raw `code` + a `language`. Shiki is lazy-loaded on first
 * render so it does not weigh on the initial bundle.
 */
@Component({
  selector: 'ngmd-code-block',
  template: `
    <div class="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
      @if (header()) {
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-500 dark:text-zinc-400"
        >
          <span>{{ header() }}</span>
          <button
            type="button"
            (click)="copy()"
            [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
            class="inline-flex items-center justify-center size-6 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            @if (copied()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            }
          </button>
        </div>
      } @else {
        <button
          type="button"
          (click)="copy()"
          [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
          class="absolute top-2 right-2 inline-flex items-center justify-center size-7 rounded-md bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
        >
          @if (copied()) {
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          }
        </button>
      }
      @if (highlighted(); as html) {
        <div
          class="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:border-0 [&_pre]:rounded-none"
          [innerHTML]="html"
        ></div>
      } @else {
        <pre class="m-0 p-4 overflow-x-auto text-sm leading-relaxed bg-transparent border-0 rounded-none"><code [class]="codeClass()">{{ code() }}</code></pre>
      }
    </div>
  `,
})
export class NgmdCodeBlock {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly header = input<string>('');
  readonly language = input<string>('');
  readonly code = input<string>('');

  protected readonly highlighted = signal<SafeHtml | null>(null);
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // clipboard unavailable, silent fail
    }
  }

  protected readonly codeClass = () =>
    this.language() ? `language-${this.language()}` : '';

  constructor() {
    let cancelled = false;
    this.destroyRef.onDestroy(() => (cancelled = true));

    effect(async () => {
      const code = this.code();
      const lang = this.language();
      if (!code || typeof window === 'undefined') return;

      try {
        const { codeToHtml } = await import('shiki');
        if (cancelled) return;
        const html = await codeToHtml(code, {
          lang: lang || 'text',
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        });
        if (!cancelled) {
          this.highlighted.set(this.sanitizer.bypassSecurityTrustHtml(html));
        }
      } catch {
        // Lang not bundled or shiki failed: fall through to the unstyled <pre>.
      }
    });
  }
}
