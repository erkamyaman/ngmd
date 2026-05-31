import {DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

/**
 * Run a DOM-enhancing function on initial mount and after every router
 * navigation, retrying for a short window if the target nodes haven't
 * upgraded yet.
 *
 * Five components shared this exact skeleton (`code-copy`, `code-group`,
 * `external-links`, `heading-anchors`, `media-enhancer`): each waited for
 * Angular + `analog-markdown` to flush, then walked `document.querySelectorAll`
 * for an unprocessed selector and decorated each match.
 *
 * @param router       Inject `Router`.
 * @param destroyRef   Inject `DestroyRef`. Unsubscribes the router watcher
 *                     when the host component is destroyed.
 * @param selector     CSS selector for "unprocessed" elements. Marked nodes
 *                     should set their own data attribute so they don't
 *                     match the selector on subsequent runs.
 * @param enhanceEach  Decorator fn called once per match.
 * @param opts.maxAttempts  Retry budget; default 20.
 * @param opts.delayMs      Inter-attempt delay; default 50ms.
 */
export function enhanceOnNavigation(
  router: Router,
  destroyRef: DestroyRef,
  selector: string,
  enhanceEach: (el: HTMLElement) => void,
  opts: {maxAttempts?: number; delayMs?: number} = {},
): void {
  const maxAttempts = opts.maxAttempts ?? 20;
  const delayMs = opts.delayMs ?? 50;

  const run = (attempt = 0): void => {
    if (typeof document === 'undefined' || attempt > maxAttempts) return;
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    if (nodes.length === 0) {
      setTimeout(() => run(attempt + 1), delayMs);
      return;
    }
    nodes.forEach(enhanceEach);
  };

  run();
  onNavigation(router, destroyRef, () => run());
}

/**
 * Subscribe `fn` to every `NavigationEnd`. Tied to `destroyRef` so the
 * subscription is dropped when the host is destroyed. Two-line wrap to
 * keep the `filter`-and-typeguard idiom in one place; the TOC and the
 * root `App` use it directly (their per-navigation work doesn't fit the
 * DOM-walker shape `enhanceOnNavigation` is built around).
 */
export function onNavigation(router: Router, destroyRef: DestroyRef, fn: () => void): void {
  router.events
    .pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe(fn);
}
