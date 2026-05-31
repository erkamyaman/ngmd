import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LucideAngularModule, ArrowLeft, ArrowRight} from 'lucide-angular';
import {navItems} from '../../ngmd.config';
import {RouteUrlService} from '../services/route-url/route-url.service';

const RELATED_MAX = 4;

/**
 * Bottom-of-page frame shown under every docs route: a "More in <section>"
 * grid of section siblings (capped at four, excluding the current page
 * and the prev/next pair below it), then the previous / next nav. The
 * "Edit on GitHub" link lives in `<app-source-actions>` at the top of
 * the article; the last-updated stamp is retired.
 */
@Component({
  selector: 'app-page-footer',
  imports: [RouterLink, LucideAngularModule],
  template: `
    @if (related().length || prev() || next()) {
      <footer class="mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-5 pb-10 text-sm">
        @if (related().length && currentSection(); as section) {
          <p
            class="text-xs font-medium tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-3"
          >
            More in {{ section }}
          </p>
          <ul class="grid gap-2 sm:grid-cols-2 mb-8">
            @for (item of related(); track item.href) {
              <li>
                <a
                  [routerLink]="item.href"
                  class="block rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-strong)] transition-colors"
                >
                  <span class="block text-sm font-medium truncate">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        }

        @if (prev() || next()) {
          <nav class="grid gap-3 sm:grid-cols-2">
            @if (prev(); as p) {
              <a
                [routerLink]="p.href"
                class="group rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-[color:var(--accent)] transition-colors sm:col-start-1"
              >
                <span class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <i-lucide [img]="prevIcon" class="size-3.5"></i-lucide>
                  Previous
                </span>
                <span class="mt-1 block text-base font-medium text-zinc-900 dark:text-zinc-100">{{
                  p.label
                }}</span>
              </a>
            }
            @if (next(); as n) {
              <a
                [routerLink]="n.href"
                class="group rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-[color:var(--accent)] transition-colors text-right sm:col-start-2"
              >
                <span
                  class="flex items-center justify-end gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
                >
                  Next
                  <i-lucide [img]="nextIcon" class="size-3.5"></i-lucide>
                </span>
                <span class="mt-1 block text-base font-medium text-zinc-900 dark:text-zinc-100">{{
                  n.label
                }}</span>
              </a>
            }
          </nav>
        }
      </footer>
    }
  `,
})
export class PageFooter {
  private readonly cleanUrl = inject(RouteUrlService).cleanUrl;

  readonly prevIcon = ArrowLeft;
  readonly nextIcon = ArrowRight;

  private readonly index = computed(() => navItems.findIndex((n) => n.href === this.cleanUrl()));
  readonly prev = computed(() => {
    const i = this.index();
    return i > 0 ? navItems[i - 1] : null;
  });
  readonly next = computed(() => {
    const i = this.index();
    return i >= 0 && i < navItems.length - 1 ? navItems[i + 1] : null;
  });

  /** Name of the nav section the current page sits inside, or `null` if
   * the page isn't in `ngmd.config.ts > nav`. */
  readonly currentSection = computed(() => {
    const i = this.index();
    return i >= 0 ? navItems[i].section : null;
  });

  /** Up to `RELATED_MAX` other pages in the same section, excluding the
   * current page and the prev / next pair (those already render below).
   * If the section has only the current + prev + next, the panel is
   * empty — better that than showing the same links twice. */
  readonly related = computed(() => {
    const section = this.currentSection();
    if (!section) return [];
    const current = this.cleanUrl();
    const prevHref = this.prev()?.href;
    const nextHref = this.next()?.href;
    return navItems
      .filter(
        (item) =>
          item.section === section &&
          item.href !== current &&
          item.href !== prevHref &&
          item.href !== nextHref,
      )
      .slice(0, RELATED_MAX);
  });
}
