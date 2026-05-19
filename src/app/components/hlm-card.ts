import { Component, input } from '@angular/core';

/**
 * Tailwind-styled card mirroring Spartan UI's `hlm-card` shape.
 * Replace with the official spartan helm card later when wiring the full CLI.
 */
@Component({
  selector: 'hlm-card',
  template: `
    <div
      class="rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm
             dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      @if (title()) {
        <div class="px-6 pt-6">
          <h3 class="text-lg font-semibold leading-none tracking-tight">{{ title() }}</h3>
          @if (description()) {
            <p class="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{{ description() }}</p>
          }
        </div>
      }
      <div class="p-6">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class HlmCard {
  readonly title = input<string>('');
  readonly description = input<string>('');
}
