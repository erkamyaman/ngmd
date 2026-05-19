import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

type Mode = 'light' | 'dark' | 'auto';
const STORAGE_KEY = 'ngmd-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mode = signal<Mode>(this.read());

  cycle() {
    const next: Mode =
      this.mode() === 'light' ? 'dark' : this.mode() === 'dark' ? 'auto' : 'light';
    this.mode.set(next);
    this.apply(next);
  }

  /** Legacy alias kept so existing callers compile. */
  toggle() {
    this.cycle();
  }

  initFromStorage() {
    this.apply(this.mode());
    if (this.isBrowser) {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode() === 'auto') this.apply('auto');
      });
    }
  }

  private read(): Mode {
    if (!this.isBrowser) return 'auto';
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
    return 'auto';
  }

  private apply(mode: Mode) {
    if (!this.isBrowser) return;
    const root = this.document.documentElement;
    const resolved =
      mode === 'auto'
        ? matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : mode;
    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem(STORAGE_KEY, mode);
  }
}
