import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import {
  LucideAngularModule,
  Search,
  ArrowRight,
  Hash,
  FileText,
} from 'lucide-angular';
import { navItems } from '../../ngmd.config';

type ItemKind = 'page' | 'heading' | 'snippet';

interface PaletteItem {
  kind: ItemKind;
  label: string;
  subtitle: string;
  href: string;
  hash?: string;
}

interface IndexedFile {
  slug: string;
  pageLabel: string;
  href: string;
  body: string;
  bodyLower: string;
  headings: { text: string; slug: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Strip markdown syntax for cleaner snippet previews. */
function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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
            />
          </div>

          <div class="border-t border-zinc-200 dark:border-zinc-800 h-96 overflow-y-auto p-3">
            @if (filtered().length === 0) {
              <div class="py-12 text-center text-base text-zinc-500">No results.</div>
            } @else {
              @for (item of filtered(); track $index; let i = $index) {
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left"
                  [class]="i === active() ? 'bg-[color:var(--accent-soft)]' : ''"
                  (mouseenter)="active.set(i)"
                  (click)="select()"
                >
                  <i-lucide [img]="iconFor(item)" class="size-5 text-zinc-400"></i-lucide>
                  <div class="flex-1 min-w-0">
                    <div class="text-base font-semibold truncate">{{ item.label }}</div>
                    <div class="text-sm text-zinc-500 truncate">{{ item.subtitle }}</div>
                  </div>
                </button>
              }
            }
          </div>

          <div class="flex items-center justify-end border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs text-zinc-500">
            esc to close
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly contentFiles = injectContentFiles<{ title?: string }>();

  readonly searchIcon = Search;
  readonly arrowIcon = ArrowRight;
  readonly hashIcon = Hash;
  readonly fileIcon = FileText;

  readonly open = signal(false);
  readonly query = signal('');
  readonly active = signal(0);

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      document.body.style.overflow = this.open() ? 'hidden' : '';
    });
  }

  private readonly pageItems: PaletteItem[] = navItems.map((item) => ({
    kind: 'page',
    label: item.label,
    subtitle: item.section,
    href: item.href,
  }));

  private readonly index: IndexedFile[] = this.buildIndex();

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.pageItems;

    const results: PaletteItem[] = [];
    const seen = new Set<string>();
    const push = (item: PaletteItem) => {
      const key = `${item.kind}:${item.href}#${item.hash ?? ''}:${item.label}`;
      if (seen.has(key)) return;
      seen.add(key);
      results.push(item);
    };

    // 1. Pages by label
    for (const p of this.pageItems) {
      if (p.label.toLowerCase().includes(q)) push(p);
    }

    // 2. Headings by text
    for (const file of this.index) {
      for (const h of file.headings) {
        if (h.text.toLowerCase().includes(q)) {
          push({
            kind: 'heading',
            label: h.text,
            subtitle: file.pageLabel,
            href: file.href,
            hash: h.slug,
          });
        }
      }
    }

    // 3. Body matches with snippet
    for (const file of this.index) {
      const idx = file.bodyLower.indexOf(q);
      if (idx === -1) continue;
      const start = Math.max(0, idx - 40);
      const end = Math.min(file.body.length, idx + q.length + 60);
      const snippet =
        (start > 0 ? '…' : '') +
        file.body.slice(start, end).trim() +
        (end < file.body.length ? '…' : '');
      push({
        kind: 'snippet',
        label: snippet,
        subtitle: file.pageLabel,
        href: file.href,
      });
    }

    return results.slice(0, 30);
  });

  iconFor(item: PaletteItem) {
    if (item.kind === 'heading') return this.hashIcon;
    if (item.kind === 'snippet') return this.fileIcon;
    return this.arrowIcon;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
      return;
    }
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close();
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
    if (!item.hash) {
      this.router.navigateByUrl(item.href);
      return;
    }
    // Navigate first, then poll for the heading to appear (markdown loads async).
    this.router.navigateByUrl(item.href).then(() => {
      this.scrollToWhenReady(item.hash!);
    });
  }

  private scrollToWhenReady(slug: string, attempt = 0): void {
    if (typeof document === 'undefined' || attempt > 30) return;
    const el = document.getElementById(slug);
    if (!el) {
      setTimeout(() => this.scrollToWhenReady(slug, attempt + 1), 50);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `${location.pathname}#${slug}`);
  }

  private buildIndex(): IndexedFile[] {
    const slugToNav = new Map(
      navItems.map((item) => [item.href.split('/').pop() ?? '', item]),
    );
    const out: IndexedFile[] = [];

    for (const file of this.contentFiles) {
      const navItem = slugToNav.get(file.slug);
      if (!navItem) continue;
      const raw = typeof file.content === 'string' ? file.content : '';
      if (!raw) continue;

      const headings: { text: string; slug: string }[] = [];
      for (const m of raw.matchAll(/^(##+)\s+(.+)$/gm)) {
        const text = m[2].trim();
        headings.push({ text, slug: slugify(text) });
      }

      const body = stripMarkdown(raw);
      out.push({
        slug: file.slug,
        pageLabel: navItem.label,
        href: navItem.href,
        body,
        bodyLower: body.toLowerCase(),
        headings,
      });
    }

    return out;
  }
}
