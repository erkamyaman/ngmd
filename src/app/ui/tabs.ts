import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {watchHostAttribute} from '../utils/watch-host-attribute';
import {
  LucideDynamicIcon,
  type LucideIcon,
  LucideBook,
  LucideBox,
  LucideCodeXml,
  LucideCompass,
  LucideFileText,
  LucideLayers,
  LucideLightbulb,
  LucidePalette,
  LucideRocket,
  LucideSearch,
  LucideSettings,
  LucideShield,
  LucideSparkles,
  LucideTerminal,
  LucideWrench,
  LucideZap,
} from '@lucide/angular';

let idCounter = 0;

const ICON_MAP: Record<string, LucideIcon> = {
  book: LucideBook,
  box: LucideBox,
  code: LucideCodeXml,
  compass: LucideCompass,
  file: LucideFileText,
  layers: LucideLayers,
  lightbulb: LucideLightbulb,
  palette: LucidePalette,
  rocket: LucideRocket,
  search: LucideSearch,
  settings: LucideSettings,
  shield: LucideShield,
  sparkles: LucideSparkles,
  terminal: LucideTerminal,
  wrench: LucideWrench,
  zap: LucideZap,
};

/**
 * Tabs API designed to survive Custom Element rendering inside markdown.
 *
 * Authoring:
 *
 *   <ngmd-tabs>
 *     <ngmd-tab title="pnpm">
 *       <pre><code>pnpm install</code></pre>
 *     </ngmd-tab>
 *     <ngmd-tab title="npm">
 *       <pre><code>npm install</code></pre>
 *     </ngmd-tab>
 *   </ngmd-tabs>
 *
 * Why this shape (vs. the previous `<ng-template ngmdTab>` directive API):
 * inside `<analog-markdown [content]>` the body is rendered via `innerHTML`
 * and Angular's compiler never walks it, so `<ng-template>` children get
 * stripped by the browser and directives never apply. `<ngmd-tab>` as a
 * real component upgrades through `@angular/elements` so its content
 * survives. The parent walks the light DOM, reads each tab's `title`
 * attribute for the trigger row, and toggles visibility via a
 * `data-active` attribute the child observes — same pattern used by
 * `<ngmd-workflow>` for step indexing.
 *
 * Visual style mirrors adev's `docs-tab-group`: rounded outer border,
 * underline on the active trigger, content panel below. A11y: `role="tablist"`,
 * `role="tab"` + `aria-selected` + `aria-controls`, `role="tabpanel"` +
 * `aria-labelledby`, arrow / Home / End keyboard navigation with focus moved
 * to the new active trigger.
 */

@Component({
  selector: 'ngmd-tab',
  host: {role: 'tabpanel', '[hidden]': '!active()'},
  template: `
    <div class="p-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" [hidden]="!active()">
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdTab {
  readonly title = input<string>('');
  readonly icon = input<string>('');
  readonly image = input<string>('');
  readonly active = signal(false);

  constructor() {
    // Parent (`<ngmd-tabs>`) toggles `data-active` on each child host.
    // Server-side falls back to "inactive" — the parent will hydrate state
    // when the bundle runs on the client.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const stop = watchHostAttribute(host, 'data-active', (value) =>
      this.active.set(value === 'true'),
    );
    inject(DestroyRef).onDestroy(stop);
  }
}

@Component({
  selector: 'ngmd-tabs',
  imports: [LucideDynamicIcon],
  template: `
    <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div
        role="tablist"
        class="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
      >
        @for (tab of tabs(); track tab.key; let i = $index) {
          <button
            type="button"
            role="tab"
            [id]="tab.key + '-tab'"
            [attr.aria-selected]="active() === tab.key"
            [attr.aria-controls]="tab.key + '-panel'"
            [tabindex]="active() === tab.key ? 0 : -1"
            (click)="setActive(tab.key)"
            (keydown)="onKey($event, i)"
            class="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors aria-selected:border-[color:var(--accent)] aria-selected:text-[color:var(--accent)] [&[aria-selected=false]]:border-transparent [&[aria-selected=false]]:text-zinc-500 [&[aria-selected=false]]:hover:text-zinc-900 dark:[&[aria-selected=false]]:hover:text-zinc-100 bg-transparent"
          >
            @if (tab.image) {
              <img
                [src]="tab.image"
                alt=""
                aria-hidden="true"
                class="size-4 object-contain"
                loading="lazy"
              />
            } @else if (tab.iconImg; as img) {
              <svg [lucideIcon]="img" class="size-4" aria-hidden="true"></svg>
            }
            {{ tab.label }}
          </button>
        }
      </div>
      <div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class NgmdTabs implements AfterViewInit {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly uid = ++idCounter;
  readonly tabs = signal<
    {
      key: string;
      label: string;
      image: string;
      iconImg: LucideIcon | null;
      el: HTMLElement;
    }[]
  >([]);
  readonly active = signal('');

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    // `:scope ngmd-tab` because the `<ngmd-tab>` children land in the
    // light DOM of `<ngmd-tabs>` — they project through `<ng-content>` but
    // remain queryable via querySelectorAll on the host element.
    const els = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(':scope ngmd-tab'),
    );
    const list = els.map((el, i) => ({
      key: `ngmd-tabs-${this.uid}-${i}`,
      label: el.getAttribute('title') ?? '',
      image: el.getAttribute('image') ?? '',
      iconImg: ICON_MAP[el.getAttribute('icon') ?? ''] ?? null,
      el,
    }));
    for (const tab of list) {
      tab.el.id = `${tab.key}-panel`;
      tab.el.setAttribute('aria-labelledby', `${tab.key}-tab`);
    }
    this.tabs.set(list);
    if (list[0]) this.setActive(list[0].key);
  }

  protected setActive(key: string): void {
    this.active.set(key);
    for (const tab of this.tabs()) {
      tab.el.setAttribute('data-active', tab.key === key ? 'true' : 'false');
    }
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
    this.setActive(tabs[next].key);
    const triggers = (
      event.currentTarget as HTMLElement
    ).parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]');
    triggers?.[next]?.focus();
  }
}
