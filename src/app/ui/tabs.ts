import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  LucideAngularModule,
  type LucideIconData,
  Book,
  Box,
  Code2,
  Compass,
  FileText,
  Layers,
  Lightbulb,
  Palette,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  Wrench,
  Zap,
} from 'lucide-angular';

const ICON_MAP: Record<string, LucideIconData> = {
  book: Book,
  box: Box,
  code: Code2,
  compass: Compass,
  file: FileText,
  layers: Layers,
  lightbulb: Lightbulb,
  palette: Palette,
  rocket: Rocket,
  search: Search,
  settings: Settings,
  shield: Shield,
  sparkles: Sparkles,
  terminal: Terminal,
  wrench: Wrench,
  zap: Zap,
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
    if (typeof MutationObserver === 'undefined') {
      // Server-side: leave inactive; the parent will hydrate state once
      // the bundle runs on the client.
      return;
    }
    const elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    const host = elementRef.nativeElement;
    const sync = () =>
      this.active.set(host.getAttribute('data-active') === 'true');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(host, {
      attributes: true,
      attributeFilter: ['data-active'],
    });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}

@Component({
  selector: 'ngmd-tabs',
  imports: [LucideAngularModule],
  template: `
    <div
      class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
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
              <i-lucide [img]="img" class="size-4" aria-hidden="true"></i-lucide>
            }
            {{ tab.label }}
          </button>
        }
      </div>
      <div
        role="tabpanel"
        [attr.aria-labelledby]="'ngmd-tab-' + active()"
        [id]="'ngmd-tabpanel-' + active()"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class NgmdTabs implements AfterViewInit {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  readonly tabs = signal<
    {
      key: string;
      label: string;
      image: string;
      iconImg: LucideIconData | null;
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
      key: `tab-${i}`,
      label: el.getAttribute('title') ?? '',
      image: el.getAttribute('image') ?? '',
      iconImg: ICON_MAP[el.getAttribute('icon') ?? ''] ?? null,
      el,
    }));
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
