import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type CalloutType = 'info' | 'tip' | 'success' | 'warning' | 'danger';

// Per-side borders below: avoids Tailwind's `border-color` shorthand
// (set by `border + border-zinc-200`) competing with `border-l-*` and
// wiping the stripe colour under the `dark:` cascade.
const BOX = 'my-6 px-5 py-4 rounded-lg border-y border-r border-t-zinc-200 border-r-zinc-200 border-b-zinc-200 dark:border-t-zinc-800 dark:border-r-zinc-800 dark:border-b-zinc-800 bg-zinc-50 dark:bg-zinc-900 border-l-[3px]';

@Component({
  selector: 'ngmd-callout',
  imports: [NgTemplateOutlet],
  template: `
    @switch (type()) {
      @case ('tip') {
        <div [class]="box + ' border-l-fuchsia-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @case ('success') {
        <div [class]="box + ' border-l-emerald-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @case ('warning') {
        <div [class]="box + ' border-l-amber-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @case ('danger') {
        <div [class]="box + ' border-l-red-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @default {
        <div [class]="box + ' border-l-blue-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
    }

    <ng-template #body>
      @if (title()) {
        <p class="font-semibold text-sm mt-0 mb-2 text-zinc-900 dark:text-zinc-100">{{ title() }}</p>
      }
      <div class="text-sm text-zinc-700 dark:text-zinc-300 [&>*:last-child]:mb-0 [&>*:first-child]:mt-0">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
})
export class NgmdCallout {
  readonly type = input<CalloutType>('info');
  readonly title = input<string>('');
  protected readonly box = BOX;
}
