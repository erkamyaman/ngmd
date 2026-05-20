import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ngmd-pill',
  imports: [RouterLink],
  template: `
    @if (isExternal()) {
      <a
        [href]="href()"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 no-underline transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        {{ title() }}
      </a>
    } @else {
      <a
        [routerLink]="href()"
        class="inline-flex items-center px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 no-underline transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        {{ title() }}
      </a>
    }
  `,
})
export class NgmdPill {
  readonly href = input.required<string>();
  readonly title = input.required<string>();

  readonly isExternal = computed(() => /^https?:\/\//.test(this.href()));
}

@Component({
  selector: 'ngmd-pill-row',
  template: `
    <div class="flex flex-wrap gap-2 my-4">
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdPillRow {}
