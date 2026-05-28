import {Component, computed, input} from '@angular/core';
import {BADGE_VARIANTS, type BadgeVariant} from '../../types/badge';

/**
 * Small inline status pill, designed to sit next to a heading or in a
 * card to flag release stage or change status. Variants and their colours
 * come from the single `BADGE_VARIANTS` map.
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

  protected readonly variantClass = computed(() => BADGE_VARIANTS[this.variant()]);
}
