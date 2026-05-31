import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LucideAngularModule, ArrowLeft, ArrowRight} from 'lucide-angular';
import {navItems} from '../../ngmd.config';
import {RouteUrlService} from '../services/route-url/route-url.service';

/**
 * Bottom-of-page frame shown under every docs route: previous / next
 * sibling pages derived from `ngmd.config.ts`. The "Edit on GitHub" link
 * lives in `<app-source-actions>` at the top of the article; the
 * last-updated stamp is retired.
 */
@Component({
  selector: 'app-page-footer',
  imports: [RouterLink, LucideAngularModule],
  template: `
    @if (prev() || next()) {
      <footer class="mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-5 pb-10 text-sm">
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
}
