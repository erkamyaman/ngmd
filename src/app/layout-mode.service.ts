import {InjectionToken, signal, type WritableSignal} from '@angular/core';

/**
 * Single boolean flag — exposed as a writable signal — that pages can flip
 * to render without the docs site frame (sidebar, breadcrumb, TOC). The
 * 404 view sets it on entry and clears it on destroy; the landing page
 * sets it once in the constructor.
 *
 * Lifted out of a class wrapper into an `InjectionToken` because the only
 * state was the signal itself — no constructor, no helpers, no DI graph
 * worth the indirection. Consumers `inject(LAYOUT_CHROME_HIDDEN)` and read
 * / write the signal directly. The `providedIn: 'root'` factory keeps the
 * single-instance guarantee the old `@Injectable({providedIn: 'root'})`
 * gave for free.
 */
export const LAYOUT_CHROME_HIDDEN = new InjectionToken<WritableSignal<boolean>>(
  'LAYOUT_CHROME_HIDDEN',
  {
    providedIn: 'root',
    factory: () => signal(false),
  },
);
