import {Component, computed, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LucideDynamicIcon, LucideArrowRight, LucideArrowUpRight} from '@lucide/angular';

/**
 * Pill-shaped link. Internal hrefs route via `RouterLink`; external (http(s))
 * open in a new tab with `target="_blank"`. Hover lifts toward the
 * accent and reveals a trailing arrow (internal = right, external = up-right)
 * so the click affordance reads clearly. Without those cues the pill looks
 * like an inert badge.
 */
@Component({
  selector: 'ngmd-pill',
  imports: [RouterLink, LucideDynamicIcon],
  template: `
    @if (isExternal()) {
      <a
        [href]="href()"
        target="_blank"
        rel="noopener noreferrer"
        class="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 no-underline transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        <span>{{ title() }}</span>
        <svg
          [lucideIcon]="externalIcon"
          class="size-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        ></svg>
      </a>
    } @else {
      <a
        [routerLink]="href()"
        class="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 no-underline transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        <span>{{ title() }}</span>
        <svg
          [lucideIcon]="internalIcon"
          class="size-3.5 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
          aria-hidden="true"
        ></svg>
      </a>
    }
  `,
})
export class NgmdPill {
  readonly href = input.required<string>();
  readonly title = input.required<string>();

  readonly isExternal = computed(() => /^https?:\/\//.test(this.href()));

  protected readonly internalIcon = LucideArrowRight;
  protected readonly externalIcon = LucideArrowUpRight;
}

@Component({
  selector: 'ngmd-pill-row',
  template: `
    <div class="flex flex-wrap gap-2">
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdPillRow {}
