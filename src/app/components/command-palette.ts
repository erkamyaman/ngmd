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
import {NgTemplateOutlet} from '@angular/common';
import {Router} from '@angular/router';
import {
  LucideAngularModule,
  Search,
  ArrowRight,
  Hash,
  FileText,
  Clock,
  Trash2,
  Star,
  X,
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
  imports: [LucideAngularModule, NgTemplateOutlet],
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
              placeholder="Search docs"
              aria-label="Search docs"
              class="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400"
              [value]="search.query()"
              (input)="onInput($event)"
            />
            @if (search.loading()) {
              <span class="text-xs text-zinc-400">…</span>
            }
          </div>

          <div
            class="ngmd-scroll-track-mini border-t border-zinc-200 dark:border-zinc-800 max-h-[60vh] overflow-y-auto p-3"
          >
            @if (showingHistory()) {
              @if (search.favorites().length) {
                <div class="px-4 py-2 text-xs uppercase tracking-wider text-zinc-500">
                  Favourites
                </div>
                @for (item of search.favorites(); track item.url) {
                  <ng-container
                    *ngTemplateOutlet="historyRow; context: {$implicit: item, favorite: true}"
                  />
                }
              }
              @if (search.recents().length) {
                <div
                  class="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-zinc-500"
                >
                  <span>Recent</span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300"
                    (click)="search.clearRecents()"
                  >
                    <i-lucide [img]="trashIcon" class="size-3"></i-lucide>
                    Clear
                  </button>
                </div>
                @for (item of search.recents(); track item.url) {
                  <ng-container
                    *ngTemplateOutlet="historyRow; context: {$implicit: item, favorite: false}"
                  />
                }
              }

              <ng-template #historyRow let-item let-favorite="favorite">
                <div
                  class="group flex w-full cursor-pointer items-center gap-2 rounded-lg pr-2 text-left"
                  [class]="hoverUrl() === item.url ? 'bg-[color:var(--accent-soft)]' : ''"
                  (mouseenter)="hoverUrl.set(item.url)"
                  (mouseleave)="hoverUrl.set(null)"
                >
                  <button
                    type="button"
                    class="flex flex-1 min-w-0 items-center gap-4 px-4 py-3 text-left"
                    (click)="selectHistory(item)"
                  >
                    <i-lucide
                      [img]="favorite ? starIcon : clockIcon"
                      class="size-5"
                      [class]="favorite ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'"
                    ></i-lucide>
                    <div class="flex-1 min-w-0">
                      <div
                        class="text-base font-semibold truncate"
                        [innerHTML]="item.labelHtml"
                      ></div>
                      @if (item.subLabelHtml) {
                        <div
                          class="text-sm text-zinc-500 truncate"
                          [innerHTML]="item.subLabelHtml"
                        ></div>
                      }
                    </div>
                  </button>
                  @if (!favorite) {
                    <button
                      type="button"
                      class="rounded p-1.5 text-zinc-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Pin to favourites"
                      (click)="search.toggleFavorite(item.url)"
                    >
                      <i-lucide [img]="starIcon" class="size-4"></i-lucide>
                    </button>
                  }
                  <button
                    type="button"
                    class="rounded p-1.5 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from history"
                    (click)="search.removeFromHistory(item.url)"
                  >
                    <i-lucide [img]="closeIcon" class="size-4"></i-lucide>
                  </button>
                </div>
              </ng-template>
            } @else if (search.loading() && !search.results().length) {
              <div class="p-3 text-zinc-500">
                <span>Searching docs…</span>
              </div>
            } @else if (search.hasNoResults()) {
              <div class="p-3 text-zinc-500">
                <span>No results found</span>
              </div>
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
                    <div
                      class="text-base font-semibold truncate"
                      [innerHTML]="item.labelHtml"
                    ></div>
                    @if (item.subLabelHtml) {
                      <div
                        class="text-sm text-zinc-500 truncate"
                        [innerHTML]="item.subLabelHtml"
                      ></div>
                    }
                    @if (item.contentHtml) {
                      <div
                        class="mt-1 text-sm text-zinc-500 line-clamp-2"
                        [innerHTML]="item.contentHtml"
                      ></div>
                    }
                  </div>
                </button>
              }
            } @else if (!search.query().trim() && !search.history().length) {
              <div class="p-3 text-zinc-500">
                <span>Start typing to see results</span>
              </div>
            }
          </div>

          <div
            class="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs text-zinc-500"
          >
            <span class="flex items-center gap-3">
              <kbd class="rounded border border-zinc-200 dark:border-zinc-700 px-1.5">esc</kbd>
              <span>close</span>
            </span>
            @if (search.isAlgolia) {
              <!-- Required attribution for the free DocSearch tier. -->
              <a
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1"
                href="https://www.algolia.com/developers/?utm_source=ngmd&utm_medium=referral&utm_content=powered_by&utm_campaign=docsearch"
              >
                <span>Search by</span>
                <svg
                  viewBox="0 0 2196.2 500"
                  aria-label="Algolia"
                  role="img"
                  class="block w-16 h-auto mt-[5px]"
                  fill="#003dff"
                >
                  <path
                    fill-rule="evenodd"
                    d="M1070.38,275.3V5.91c0-3.63-3.24-6.39-6.82-5.83l-50.46,7.94c-2.87,.45-4.99,2.93-4.99,5.84l.17,273.22c0,12.92,0,92.7,95.97,95.49,3.33,.1,6.09-2.58,6.09-5.91v-40.78c0-2.96-2.19-5.51-5.12-5.84-34.85-4.01-34.85-47.57-34.85-54.72Z"
                  />
                  <rect x="1845.88" y="104.73" width="62.58" height="277.9" rx="5.9" ry="5.9" />
                  <path
                    fill-rule="evenodd"
                    d="M1851.78,71.38h50.77c3.26,0,5.9-2.64,5.9-5.9V5.9c0-3.62-3.24-6.39-6.82-5.83l-50.77,7.95c-2.87,.45-4.99,2.92-4.99,5.83v51.62c0,3.26,2.64,5.9,5.9,5.9Z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M1764.03,275.3V5.91c0-3.63-3.24-6.39-6.82-5.83l-50.46,7.94c-2.87,.45-4.99,2.93-4.99,5.84l.17,273.22c0,12.92,0,92.7,95.97,95.49,3.33,.1,6.09-2.58,6.09-5.91v-40.78c0-2.96-2.19-5.51-5.12-5.84-34.85-4.01-34.85-47.57-34.85-54.72Z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M1631.95,142.72c-11.14-12.25-24.83-21.65-40.78-28.31-15.92-6.53-33.26-9.85-52.07-9.85-18.78,0-36.15,3.17-51.92,9.85-15.59,6.66-29.29,16.05-40.76,28.31-11.47,12.23-20.38,26.87-26.76,44.03-6.38,17.17-9.24,37.37-9.24,58.36,0,20.99,3.19,36.87,9.55,54.21,6.38,17.32,15.14,32.11,26.45,44.36,11.29,12.23,24.83,21.62,40.6,28.46,15.77,6.83,40.12,10.33,52.4,10.48,12.25,0,36.78-3.82,52.7-10.48,15.92-6.68,29.46-16.23,40.78-28.46,11.29-12.25,20.05-27.04,26.25-44.36,6.22-17.34,9.24-33.22,9.24-54.21,0-20.99-3.34-41.19-10.03-58.36-6.38-17.17-15.14-31.8-26.43-44.03Zm-44.43,163.75c-11.47,15.75-27.56,23.7-48.09,23.7-20.55,0-36.63-7.8-48.1-23.7-11.47-15.75-17.21-34.01-17.21-61.2,0-26.89,5.59-49.14,17.06-64.87,11.45-15.75,27.54-23.52,48.07-23.52,20.55,0,36.63,7.78,48.09,23.52,11.47,15.57,17.36,37.98,17.36,64.87,0,27.19-5.72,45.3-17.19,61.2Z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M894.42,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-14.52,22.58-22.99,49.63-22.99,78.73,0,44.89,20.13,84.92,51.59,111.1,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47,1.23,0,2.46-.03,3.68-.09,.36-.02,.71-.05,1.07-.07,.87-.05,1.75-.11,2.62-.2,.34-.03,.68-.08,1.02-.12,.91-.1,1.82-.21,2.73-.34,.21-.03,.42-.07,.63-.1,32.89-5.07,61.56-30.82,70.9-62.81v57.83c0,3.26,2.64,5.9,5.9,5.9h50.42c3.26,0,5.9-2.64,5.9-5.9V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,206.92c-12.2,10.16-27.97,13.98-44.84,15.12-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-42.24,0-77.12-35.89-77.12-79.37,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33v142.83Z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M2133.97,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-14.52,22.58-22.99,49.63-22.99,78.73,0,44.89,20.13,84.92,51.59,111.1,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47,1.23,0,2.46-.03,3.68-.09,.36-.02,.71-.05,1.07-.07,.87-.05,1.75-.11,2.62-.2,.34-.03,.68-.08,1.02-.12,.91-.1,1.82-.21,2.73-.34,.21-.03,.42-.07,.63-.1,32.89-5.07,61.56-30.82,70.9-62.81v57.83c0,3.26,2.64,5.9,5.9,5.9h50.42c3.26,0,5.9-2.64,5.9-5.9V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,206.92c-12.2,10.16-27.97,13.98-44.84,15.12-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-42.24,0-77.12-35.89-77.12-79.37,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33v142.83Z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M1314.05,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-11.79,18.34-19.6,39.64-22.11,62.59-.58,5.3-.88,10.68-.88,16.14s.31,11.15,.93,16.59c4.28,38.09,23.14,71.61,50.66,94.52,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47h0c17.99,0,34.61-5.93,48.16-15.97,16.29-11.58,28.88-28.54,34.48-47.75v50.26h-.11v11.08c0,21.84-5.71,38.27-17.34,49.36-11.61,11.08-31.04,16.63-58.25,16.63-11.12,0-28.79-.59-46.6-2.41-2.83-.29-5.46,1.5-6.27,4.22l-12.78,43.11c-1.02,3.46,1.27,7.02,4.83,7.53,21.52,3.08,42.52,4.68,54.65,4.68,48.91,0,85.16-10.75,108.89-32.21,21.48-19.41,33.15-48.89,35.2-88.52V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,64.1s.65,139.13,0,143.36c-12.08,9.77-27.11,13.59-43.49,14.7-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-1.32,0-2.63-.03-3.94-.1-40.41-2.11-74.52-37.26-74.52-79.38,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33Z"
                  />
                  <path
                    d="M249.83,0C113.3,0,2,110.09,.03,246.16c-2,138.19,110.12,252.7,248.33,253.5,42.68,.25,83.79-10.19,120.3-30.03,3.56-1.93,4.11-6.83,1.08-9.51l-23.38-20.72c-4.75-4.21-11.51-5.4-17.36-2.92-25.48,10.84-53.17,16.38-81.71,16.03-111.68-1.37-201.91-94.29-200.13-205.96,1.76-110.26,92-199.41,202.67-199.41h202.69V407.41l-115-102.18c-3.72-3.31-9.42-2.66-12.42,1.31-18.46,24.44-48.53,39.64-81.93,37.34-46.33-3.2-83.87-40.5-87.34-86.81-4.15-55.24,39.63-101.52,94-101.52,49.18,0,89.68,37.85,93.91,85.95,.38,4.28,2.31,8.27,5.52,11.12l29.95,26.55c3.4,3.01,8.79,1.17,9.63-3.3,2.16-11.55,2.92-23.58,2.07-35.92-4.82-70.34-61.8-126.93-132.17-131.26-80.68-4.97-148.13,58.14-150.27,137.25-2.09,77.1,61.08,143.56,138.19,145.26,32.19,.71,62.03-9.41,86.14-26.95l150.26,133.2c6.44,5.71,16.61,1.14,16.61-7.47V9.48C499.66,4.25,495.42,0,490.18,0H249.83Z"
                  />
                </svg>
              </a>
            } @else {
              <!-- Optional credit for the local Orama backend. MIT, no
                   attribution required; included as a courtesy. -->
              <a
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5"
                href="https://docs.orama.com"
              >
                <span>Search by</span>
                <img
                  src="https://docs.orama.com/logo/orama-logo.svg"
                  alt=""
                  aria-hidden="true"
                  class="h-4 w-4"
                />
                <span class="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">orama</span>
              </a>
            }
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
  readonly starIcon = Star;
  readonly closeIcon = X;

  readonly open = signal(false);
  /** Mouse-hover highlight only. Arrow-key keyboard nav is intentionally
   * not wired yet; the focus/scroll polish wasn't worth shipping rough. */
  readonly active = signal(-1);

  /** Tracks which history row the pointer is over so the row, the star
   * toggle, and (when present) the result-side hover state share one
   * source of truth. URL not index, because favorites + recents render
   * as two lists with independent indices. */
  readonly hoverUrl = signal<string | null>(null);

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
