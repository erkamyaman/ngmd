import {Component, computed, input} from '@angular/core';

/**
 * Grid container around `<ngmd-card>` (or any block children). Two- or
 * three-column on desktop, single column on mobile.
 *
 * `columns` accepts `2` or `3`. Values outside that range fall back to 2 so
 * Tailwind's JIT compiler always sees a known class name (arbitrary `grid-
 * cols-N` values get tree-shaken if not statically present in the source).
 */
@Component({
  selector: 'ngmd-card-grid',
  template: `
    <div class="grid grid-cols-1 gap-4" [class]="colsClass()">
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdCardGrid {
  readonly columns = input(2, {
    transform: (v: number | string) => (typeof v === 'string' ? parseInt(v, 10) || 2 : v),
  });

  protected readonly colsClass = computed(() =>
    this.columns() === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
  );
}
