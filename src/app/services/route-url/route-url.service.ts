import {Injectable, computed, inject, type Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map, startWith} from 'rxjs';

/**
 * Single source of truth for the current route URL as a signal.
 *
 * Many components (sidebar, page-footer, source-actions, llm-actions,
 * breadcrumb, the catch-all) want a signal version of `router.url` plus a
 * `cleanUrl` (no query or fragment). Each was wiring its own `toSignal` +
 * `router.events.pipe(filter(NavigationEnd))` ladder verbatim. Inject this
 * instead and read the signal.
 */
@Injectable({providedIn: 'root'})
export class RouteUrlService {
  private readonly router = inject(Router);

  /** Current router URL, refreshed on every `NavigationEnd`. Includes any
   * query string and `#fragment`. */
  readonly url: Signal<string> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    {initialValue: this.router.url || '/'},
  );

  /** `url` with the query string and `#fragment` stripped. The shape
   * consumers want for routing comparisons and meta lookups. */
  readonly cleanUrl = computed(() => stripUrl(this.url()));
}

/** Strip query + fragment from a URL string. Exported for non-component
 * consumers (e.g. `NgmdTitleStrategy`) that work with the snapshot URL
 * directly and don't need the signal. */
export function stripUrl(url: string): string {
  return url.split('?')[0].split('#')[0];
}
