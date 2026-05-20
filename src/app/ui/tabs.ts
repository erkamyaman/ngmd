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
import { BrnTabsImports } from '@spartan-ng/brain/tabs';

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
  imports: [BrnTabsImports, NgTemplateOutlet],
  template: `
    <div
      [brnTabs]="active()"
      (brnTabsChange)="active.set($any($event))"
      class="my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div
        brnTabsList
        class="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
      >
        @for (tab of tabs(); track tab.key) {
          <button
            type="button"
            [brnTabsTrigger]="tab.key"
            class="px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=inactive]:border-transparent data-[state=inactive]:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      @for (tab of tabs(); track tab.key) {
        <div
          [brnTabsContent]="tab.key"
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
}
