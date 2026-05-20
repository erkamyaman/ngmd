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
    <div class="my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
      @if (header()) {
        <div
          class="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-500 dark:text-zinc-400"
        >
          {{ header() }}
        </div>
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
