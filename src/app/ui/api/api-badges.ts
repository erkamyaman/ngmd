import {Component, input} from '@angular/core';

/**
 * Inline row of status chips next to an API symbol's heading. Reads the
 * JSDoc tag names that triggered the badge (`deprecated`, `experimental`,
 * `beta`, etc.) and renders one chip per tag with a tag-specific palette.
 */
@Component({
  selector: 'app-api-badges',
  template: `
    @if (tags().length) {
      <span class="inline-flex flex-wrap gap-1.5 align-middle">
        @for (tag of tags(); track tag) {
          <span
            class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider"
            [class]="classFor(tag)"
          >
            {{ tag }}
          </span>
        }
      </span>
    }
  `,
})
export class ApiBadges {
  readonly tags = input.required<readonly string[]>();

  classFor(tag: string): string {
    if (tag === 'deprecated') {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    }
    if (tag === 'experimental' || tag === 'alpha') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    }
    if (tag === 'beta') {
      return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';
    }
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
  }
}
