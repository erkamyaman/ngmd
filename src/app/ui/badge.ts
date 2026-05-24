import { Component, computed, input } from '@angular/core';

type BadgeVariant = 'alpha' | 'beta' | 'stable' | 'deprecated' | 'new';

/**
 * Small inline status pill, designed to sit next to a heading or in a
 * card to flag release stage or change status. Five variants, each tied to
 * an accent colour so meaning is consistent across the docs.
 */
@Component({
  selector: 'ngmd-badge',
  template: `
    <span
      class="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider align-middle"
      [class]="variantClass()"
    >
      <ng-content></ng-content>
    </span>
  `,
})
export class NgmdBadge {
  readonly variant = input<BadgeVariant>('new');

  protected readonly variantClass = computed(() => {
    switch (this.variant()) {
      case 'alpha':
        return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
      case 'beta':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
      case 'stable':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
      case 'deprecated':
        return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 line-through';
      default:
        return 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300';
    }
  });
}
