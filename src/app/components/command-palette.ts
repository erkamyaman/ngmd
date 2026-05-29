import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {Router} from '@angular/router';
import {
  LucideAngularModule,
  Search,
  ArrowRight,
  Hash,
  FileText,
  Clock,
  Trash2,
} from 'lucide-angular';
import type {SearchHit} from '../../types/search';
import {SearchService} from '../services/search/search.service';

/**
 * Cmd+K palette. The heavy lifting lives in `SearchService`; this component
 * is the open / close / navigation shell on top of it.
 *
 * Empty state shows recent visits from localStorage. Typing kicks the
 * service (debounced) and renders highlighted hits. Hover highlights a
 * row, click navigates and records the visit. Esc closes. Keyboard
 * navigation (arrow + Enter) is intentionally not wired yet — planned
 * for a future polish pass.
 */
@Component({
  selector: 'app-command-palette',
  imports: [LucideAngularModule],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] bg-black/50 backdrop-blur-sm"
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
              placeholder="Search documentation..."
              aria-label="Search documentation"
              class="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400"
              [value]="search.query()"
              (input)="onInput($event)"
            />
            @if (search.loading()) {
              <span class="text-xs text-zinc-400">…</span>
            }
          </div>

          <div class="ngmd-scroll-track-mini border-t border-zinc-200 dark:border-zinc-800 max-h-[60vh] overflow-y-auto p-3">
            @if (showingHistory()) {
              <div class="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-zinc-500">
                <span>Recent</span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300"
                  (click)="search.clearHistory()"
                >
                  <i-lucide [img]="trashIcon" class="size-3"></i-lucide>
                  Clear
                </button>
              </div>
              @for (item of search.history(); track item.url; let i = $index) {
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-left"
                  [class]="i === active() ? 'bg-[color:var(--accent-soft)]' : ''"
                  (mouseenter)="active.set(i)"
                  (click)="selectHistory(item)"
                >
                  <i-lucide [img]="clockIcon" class="size-5 text-zinc-400"></i-lucide>
                  <div class="flex-1 min-w-0">
                    <div class="text-base font-semibold truncate" [innerHTML]="item.labelHtml"></div>
                    @if (item.subLabelHtml) {
                      <div class="text-sm text-zinc-500 truncate" [innerHTML]="item.subLabelHtml"></div>
                    }
                  </div>
                </button>
              }
            } @else if (search.hasNoResults()) {
              <div class="py-12 text-center text-base text-zinc-500">No results.</div>
            } @else if (search.results().length) {
              @for (item of search.results(); track item.id; let i = $index) {
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-start gap-4 rounded-lg px-4 py-3 text-left"
                  [class]="i === active() ? 'bg-[color:var(--accent-soft)]' : ''"
                  (mouseenter)="active.set(i)"
                  (click)="select(item)"
                >
                  <i-lucide [img]="iconFor(item)" class="mt-0.5 size-5 text-zinc-400"></i-lucide>
                  <div class="flex-1 min-w-0">
                    <div class="text-base font-semibold truncate" [innerHTML]="item.labelHtml"></div>
                    @if (item.subLabelHtml) {
                      <div class="text-sm text-zinc-500 truncate" [innerHTML]="item.subLabelHtml"></div>
                    }
                    @if (item.contentHtml) {
                      <div class="mt-1 text-sm text-zinc-500 line-clamp-2" [innerHTML]="item.contentHtml"></div>
                    }
                  </div>
                </button>
              }
            } @else if (!search.query().trim() && !search.history().length) {
              <div class="py-12 text-center text-base text-zinc-500">Start typing to search.</div>
            }
          </div>

          <div
            class="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs text-zinc-500"
          >
            <kbd class="rounded border border-zinc-200 dark:border-zinc-700 px-1.5">esc</kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPalette {
  private readonly router = inject(Router);
  protected readonly search = inject(SearchService);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly searchIcon = Search;
  readonly arrowIcon = ArrowRight;
  readonly hashIcon = Hash;
  readonly fileIcon = FileText;
  readonly clockIcon = Clock;
  readonly trashIcon = Trash2;

  readonly open = signal(false);
  /** Mouse-hover highlight only. Arrow-key keyboard nav is intentionally
   * not wired yet — the focus/scroll polish wasn't worth shipping rough. */
  readonly active = signal(-1);

  readonly showingHistory = computed(
    () => !this.search.query().trim() && this.search.history().length > 0,
  );

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      document.body.style.overflow = this.open() ? 'hidden' : '';
    });
    // Clear hover highlight whenever the visible list changes.
    effect(() => {
      this.search.results();
      this.search.history();
      this.active.set(-1);
    });
  }

  iconFor(item: SearchHit) {
    if (item.kind === 'section') return this.hashIcon;
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
    if (this.open() && event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open()) {
      this.search.query.set('');
      this.active.set(-1);
      queueMicrotask(() => this.input()?.nativeElement.focus());
    }
  }

  close() {
    this.open.set(false);
  }

  onInput(event: Event) {
    this.search.query.set((event.target as HTMLInputElement).value);
  }

  select(hit: SearchHit) {
    this.search.recordVisit(hit);
    this.navigateTo(hit.url);
  }

  selectHistory(item: {id: string; url: string; labelHtml: string; subLabelHtml: string}) {
    // Re-record so a re-visited recent moves to the top of the list.
    this.search.recordVisit({
      id: item.id,
      kind: 'page',
      url: item.url,
      labelHtml: item.labelHtml,
      subLabelHtml: item.subLabelHtml,
    });
    this.navigateTo(item.url);
  }

  private navigateTo(url: string): void {
    this.close();
    const [path, hash] = url.split('#');
    const samePath = this.router.url.split('#')[0].split('?')[0] === path;
    if (samePath) {
      // Already on the target route. Skip the router round-trip and just
      // scroll, otherwise Angular short-circuits and nothing happens.
      if (hash) this.scrollToWhenReady(hash);
      else window.scrollTo({top: 0, behavior: 'smooth'});
      return;
    }
    this.router.navigateByUrl(path).then(() => {
      if (hash) this.scrollToWhenReady(hash);
    });
  }

  private scrollToWhenReady(slug: string, attempt = 0): void {
    if (typeof document === 'undefined' || attempt > 30) return;
    const el = document.getElementById(slug);
    if (!el) {
      setTimeout(() => this.scrollToWhenReady(slug, attempt + 1), 50);
      return;
    }
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    history.replaceState(null, '', `${location.pathname}#${slug}`);
  }
}
