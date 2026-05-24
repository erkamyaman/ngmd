import { Component, input } from '@angular/core';

/**
 * Disclosure / accordion item, backed by the native `<details>` element so
 * a11y, keyboard, and SSR-friendly default-open all come for free. Style is
 * applied through Tailwind classes; no JS state machine, no extra deps.
 */
@Component({
  selector: 'ngmd-accordion-item',
  template: `
    <details
      class="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
      [attr.open]="open() ? '' : null"
    >
      <summary
        class="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 select-none transition-colors group-open:bg-zinc-50 dark:group-open:bg-zinc-900/50 group-open:border-b group-open:border-zinc-200 dark:group-open:border-zinc-800"
      >
        <span class="flex items-center gap-2">
          @if (image()) {
            <img
              [src]="image()"
              [alt]="title()"
              width="16"
              height="16"
              style="display:inline-block;object-fit:contain;flex-shrink:0"
              aria-hidden="true"
            />
          }
          <span>{{ title() }}</span>
        </span>
        <span
          class="text-zinc-400 transition-transform group-open:rotate-180 text-base leading-none"
          aria-hidden="true"
        >▾</span>
      </summary>
      <div
        class="px-5 pt-4 pb-4 text-sm text-zinc-700 dark:text-zinc-300 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      >
        <ng-content></ng-content>
      </div>
    </details>
  `,
})
export class NgmdAccordionItem {
  readonly title = input.required<string>();
  /** Optional brand logo / icon URL rendered as a 16×16 prefix to the title. */
  readonly image = input<string>('');
  readonly open = input(false, {
    transform: (v: boolean | string) => v === '' || v === true || v === 'true',
  });
}

@Component({
  selector: 'ngmd-accordion',
  template: `
    <div class="my-6 flex flex-col gap-2">
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdAccordion {}
