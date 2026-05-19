import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-angular';

interface PaletteItem {
  label: string;
  subtitle: string;
  href: string;
}

const ITEMS: PaletteItem[] = [
  { label: 'Introduction', subtitle: 'Introduction', href: '/welcome' },
  { label: 'Installation', subtitle: 'Getting Started', href: '/getting-started/installation' },
  { label: 'Quick Start', subtitle: 'Getting Started', href: '/getting-started/quick-start' },
  { label: 'About & Credits', subtitle: 'Getting Started', href: '/getting-started/about' },
  { label: 'Markdown Routes', subtitle: 'Core Concepts', href: '/concepts/markdown-routes' },
  { label: 'Theming', subtitle: 'Core Concepts', href: '/concepts/theming' },
  { label: 'Components', subtitle: 'Core Concepts', href: '/concepts/components' },
  { label: 'Support', subtitle: 'Help', href: '/support' },
];

@Component({
  selector: 'app-command-palette',
  imports: [LucideAngularModule],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        (click)="close()"
      >
        <div
          class="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center gap-3 px-5 py-4">
            <i-lucide [img]="searchIcon" class="size-6 text-zinc-400"></i-lucide>
            <input
              #input
              type="text"
              placeholder="Type a command or search..."
              class="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400"
              [value]="query()"
              (input)="onInput($event)"
              (keydown.arrowDown)="move(1); $event.preventDefault()"
              (keydown.arrowUp)="move(-1); $event.preventDefault()"
              (keydown.enter)="select(); $event.preventDefault()"
              (keydown.escape)="close()"
            />
          </div>

          <div class="border-t border-zinc-200 dark:border-zinc-800 h-96 overflow-y-auto p-3">
            @if (filtered().length === 0) {
              <div class="py-12 text-center text-base text-zinc-500">No results.</div>
            } @else {
              @for (item of filtered(); track item.href; let i = $index) {
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left"
                  [class.bg-zinc-100]="i === active()"
                  [class.dark:bg-zinc-900]="i === active()"
                  (mouseenter)="active.set(i)"
                  (click)="select()"
                >
                  <i-lucide [img]="arrowIcon" class="size-5 text-zinc-400"></i-lucide>
                  <div class="flex-1 min-w-0">
                    <div class="text-base font-semibold">{{ item.label }}</div>
                    <div class="text-sm text-zinc-500">{{ item.subtitle }}</div>
                  </div>
                </button>
              }
            }
          </div>

          <div class="flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs text-zinc-500">
            <kbd class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1">
              <i-lucide [img]="enterIcon" class="size-3"></i-lucide>
            </kbd>
            Go to Page
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly searchIcon = Search;
  readonly arrowIcon = ArrowRight;
  readonly enterIcon = CornerDownLeft;

  readonly open = signal(false);
  readonly query = signal('');
  readonly active = signal(0);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return ITEMS;
    return ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
    );
  });

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const metaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (metaK) {
      event.preventDefault();
      this.toggle();
    }
  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open()) {
      this.query.set('');
      this.active.set(0);
      queueMicrotask(() => this.input()?.nativeElement.focus());
    }
  }

  close() {
    this.open.set(false);
  }

  onInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  move(delta: number) {
    const max = this.filtered().length - 1;
    if (max < 0) return;
    const next = (this.active() + delta + max + 1) % (max + 1);
    this.active.set(next);
  }

  select() {
    const item = this.filtered()[this.active()];
    if (!item) return;
    this.close();
    this.router.navigateByUrl(item.href);
  }
}
