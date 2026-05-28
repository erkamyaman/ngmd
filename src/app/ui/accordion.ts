import {Component, effect, input, signal} from '@angular/core';
import {LucideAngularModule, ChevronDown, ChevronUp} from 'lucide-angular';

let idCounter = 0;

/**
 * Disclosure / accordion item. Signal-driven open/close state, full ARIA
 * (`aria-expanded`, `aria-controls`, region role + `aria-labelledby`).
 *
 * Chevron: two stacked icons cross-fade via opacity. ChevronUp shows when
 * closed, ChevronDown shows when open. 200ms each. No rotation, no
 * possibility of going the long way around.
 *
 * Body: outer wrapper is a CSS grid container animating `grid-template-rows`
 * from `0fr` (closed) to `1fr` (open) over 280ms. Inner wrapper has
 * `overflow: hidden` + `min-height: 0` so the row fr basis drives height.
 * Works in Chrome 117+, Safari 17.4+, Firefox 121+.
 *
 * `prefers-reduced-motion` zeroes all transitions.
 */
@Component({
  selector: 'ngmd-accordion-item',
  imports: [LucideAngularModule],
  template: `
    <div
      class="ngmd-accordion-item rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
      [class.is-open]="expanded()"
    >
      <button
        type="button"
        [id]="buttonId"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="regionId"
        (click)="toggle()"
        class="flex w-full items-center justify-between gap-3 cursor-pointer px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left [outline:none!important] [-webkit-tap-highlight-color:transparent] focus:[box-shadow:none] focus-visible:[box-shadow:none]"
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
        <span class="ngmd-accordion-chevron relative size-4 shrink-0 text-zinc-400">
          <i-lucide
            [img]="chevronDownIcon"
            class="ngmd-accordion-chevron-down absolute inset-0 size-4 transition-opacity duration-200"
            aria-hidden="true"
          ></i-lucide>
          <i-lucide
            [img]="chevronUpIcon"
            class="ngmd-accordion-chevron-up absolute inset-0 size-4 transition-opacity duration-200"
            aria-hidden="true"
          ></i-lucide>
        </span>
      </button>
      <div
        [id]="regionId"
        role="region"
        [attr.aria-labelledby]="buttonId"
        [attr.aria-hidden]="!expanded()"
        [attr.inert]="expanded() ? null : ''"
        class="ngmd-accordion-body"
      >
        <div
          class="ngmd-accordion-body-inner px-5 pt-4 pb-4 text-sm text-zinc-700 dark:text-zinc-300 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        >
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class NgmdAccordionItem {
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly chevronUpIcon = ChevronUp;

  readonly title = input.required<string>();
  /** Optional brand logo / icon URL rendered as a 16×16 prefix to the title. */
  readonly image = input<string>('');
  readonly open = input(false, {
    transform: (v: boolean | string) => v === '' || v === true || v === 'true',
  });

  private readonly id = ++idCounter;
  protected readonly buttonId = `ngmd-acc-btn-${this.id}`;
  protected readonly regionId = `ngmd-acc-region-${this.id}`;

  protected readonly expanded = signal(false);

  constructor() {
    effect(() => this.expanded.set(this.open()));
  }

  protected toggle(): void {
    this.expanded.update((v) => !v);
  }
}

@Component({
  selector: 'ngmd-accordion',
  template: `
    <div class="flex flex-col gap-2">
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdAccordion {}
