import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LucideAngularModule, ArrowLeft, ArrowRight, Pencil } from 'lucide-angular';
import { pageMeta } from 'virtual:ngmd/page-meta';
import { navItems } from '../../ngmd.config';

/**
 * Bottom-of-page chrome shown under every docs route: previous/next sibling
 * pages derived from `ngmd.config.ts`, an "Edit on GitHub" link, and the
 * page's last-updated date (commit cs from `git log`, baked at build time
 * via the page-meta vite plugin).
 */
@Component({
  selector: 'app-page-footer',
  imports: [RouterLink, LucideAngularModule],
  template: `
    <footer class="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-6 pb-10 text-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 text-zinc-500 dark:text-zinc-400">
        @if (editUrl(); as url) {
          <a
            [href]="url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <i-lucide [img]="editIcon" class="size-3.5"></i-lucide>
            Edit this page on GitHub
          </a>
        }
        @if (lastUpdated(); as date) {
          <span>Last updated: {{ date }}</span>
        }
      </div>

      @if (prev() || next()) {
        <nav class="mt-6 grid gap-3 sm:grid-cols-2">
          @if (prev(); as p) {
            <a
              [routerLink]="p.href"
              class="group rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-fuchsia-500 dark:hover:border-fuchsia-400 transition-colors sm:col-start-1"
            >
              <span class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <i-lucide [img]="prevIcon" class="size-3.5"></i-lucide>
                Previous
              </span>
              <span class="mt-1 block text-base font-medium text-zinc-900 dark:text-zinc-100">{{ p.label }}</span>
            </a>
          }
          @if (next(); as n) {
            <a
              [routerLink]="n.href"
              class="group rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-fuchsia-500 dark:hover:border-fuchsia-400 transition-colors text-right sm:col-start-2"
            >
              <span class="flex items-center justify-end gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Next
                <i-lucide [img]="nextIcon" class="size-3.5"></i-lucide>
              </span>
              <span class="mt-1 block text-base font-medium text-zinc-900 dark:text-zinc-100">{{ n.label }}</span>
            </a>
          }
        </nav>
      }
    </footer>
  `,
})
export class PageFooter {
  private readonly router = inject(Router);

  readonly editIcon = Pencil;
  readonly prevIcon = ArrowLeft;
  readonly nextIcon = ArrowRight;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: '/' },
  );
  private readonly cleanUrl = computed(
    () => this.url().split('?')[0].split('#')[0],
  );

  private readonly meta = computed(() => pageMeta[this.cleanUrl()]);
  readonly editUrl = computed(() => this.meta()?.editUrl ?? '');
  readonly lastUpdated = computed(() => {
    const iso = this.meta()?.lastUpdated;
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${d}/${m}/${y}` : iso;
  });

  private readonly index = computed(() =>
    navItems.findIndex((n) => n.href === this.cleanUrl()),
  );
  readonly prev = computed(() => {
    const i = this.index();
    return i > 0 ? navItems[i - 1] : null;
  });
  readonly next = computed(() => {
    const i = this.index();
    return i >= 0 && i < navItems.length - 1 ? navItems[i + 1] : null;
  });
}
