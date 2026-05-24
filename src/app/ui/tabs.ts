import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  inject,
  input,
  QueryList,
  signal,
  TemplateRef,
} from '@angular/core';

/**
 * Author tabs by dropping `<ng-template ngmdTab="Label">...</ng-template>`
 * children inside `<ngmd-tabs>`. The component picks them up via
 * ContentChildren, renders one trigger button per tab, and switches the
 * panel via a signal.
 *
 * A11y: `role="tablist"` on the trigger row, `role="tab"` on each trigger
 * with `aria-selected` / `aria-controls`, `role="tabpanel"` on each panel
 * with `aria-labelledby`. Arrow keys cycle through triggers, Home / End
 * jump to the ends; only the active trigger is in the tab order
 * (`tabindex` 0 vs -1).
 *
 * Zero external deps. The state machine is small enough that a hand-rolled
 * signal beats a headless library.
 */

@Directive({
  selector: 'ng-template[ngmdTab]',
  standalone: true,
})
export class NgmdTab {
  readonly title = input.required<string>({ alias: 'ngmdTab' });
  readonly templateRef = inject(TemplateRef);
}

@Component({
  selector: 'ngmd-tabs',
  imports: [NgTemplateOutlet],
  template: `
    <div
      class="my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div
        role="tablist"
        class="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
      >
        @for (tab of tabs(); track tab.key; let i = $index) {
          <button
            type="button"
            role="tab"
            [id]="'ngmd-tab-' + tab.key"
            [attr.aria-selected]="active() === tab.key"
            [attr.aria-controls]="'ngmd-tabpanel-' + tab.key"
            [tabindex]="active() === tab.key ? 0 : -1"
            (click)="active.set(tab.key)"
            (keydown)="onKey($event, i)"
            class="px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors aria-selected:border-zinc-900 dark:aria-selected:border-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:text-zinc-100 [&[aria-selected=false]]:border-transparent [&[aria-selected=false]]:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      @for (tab of tabs(); track tab.key) {
        <div
          role="tabpanel"
          [id]="'ngmd-tabpanel-' + tab.key"
          [attr.aria-labelledby]="'ngmd-tab-' + tab.key"
          [hidden]="active() !== tab.key"
          class="p-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        >
          <ng-container *ngTemplateOutlet="tab.template"></ng-container>
        </div>
      }
    </div>
  `,
})
export class NgmdTabs implements AfterContentInit {
  @ContentChildren(NgmdTab) private readonly children!: QueryList<NgmdTab>;

  readonly tabs = signal<
    { key: string; label: string; template: TemplateRef<unknown> }[]
  >([]);
  readonly active = signal('');

  ngAfterContentInit(): void {
    const list = this.children.toArray().map((c, i) => ({
      key: `tab-${i}`,
      label: c.title(),
      template: c.templateRef,
    }));
    this.tabs.set(list);
    if (list[0]) this.active.set(list[0].key);
  }

  protected onKey(event: KeyboardEvent, index: number): void {
    const tabs = this.tabs();
    if (tabs.length === 0) return;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.active.set(tabs[next].key);
    // Move focus to the newly active trigger so screen readers + sighted
    // keyboard users land in the right place.
    const triggers = (event.currentTarget as HTMLElement)
      .parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]');
    triggers?.[next]?.focus();
  }
}
