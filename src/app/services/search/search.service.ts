import {
  Injectable,
  computed,
  effect,
  inject,
  linkedSignal,
  PLATFORM_ID,
  resource,
  signal,
  type Signal,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import config from '../../../ngmd.config';
import type {SearchHit, SearchProvider} from '../../../types/search';
import {OramaSearchProvider} from './orama-provider';
import {AlgoliaSearchProvider} from './algolia-provider';

const SEARCH_DEBOUNCE = 200;
const HISTORY_KEY = 'ngmd-search-history-v1';
const HISTORY_MAX = 10;

export interface HistoryItem {
  id: string;
  url: string;
  labelHtml: string;
  subLabelHtml: string;
  createdAt: number;
  /** Pinned by the user via the star toggle in the palette. Favorites
   * render above recents and are not capped by `HISTORY_MAX`. */
  isFavorite?: boolean;
}

/**
 * Single entry point for the command palette. Picks the right backend
 * (Orama by default, Algolia if configured), debounces the query, keeps the
 * previous result batch visible while a new one is in flight, and persists
 * recent navigations to `localStorage`.
 *
 * The "no-blink between keystrokes" UX comes from the `resource()` +
 * `linkedSignal()` pair: the resource re-fetches whenever the debounced
 * query changes, the linkedSignal latches onto the source but falls back
 * to the previous value when the source is undefined and the user is
 * still typing. Mirrors adev's `searchResults` shape.
 *
 * Swap to Algolia by populating `site.algolia` in `ngmd.config.ts`. Nothing
 * in this file changes when you do; the provider just picks itself up.
 */
@Injectable({providedIn: 'root'})
export class SearchService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly query = signal('');

  /** Source for the resource. Updates 200ms after the user stops typing.
   * Clearing the input bypasses the debounce so the empty state restores
   * immediately. */
  private readonly debouncedQuery = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly provider: SearchProvider = this.pickProvider();
  private readonly historyState = signal<HistoryItem[]>([]);

  /** True when the hosted Algolia DocSearch backend is configured. Drives
   * the required "Search by Algolia" attribution in the palette footer. */
  readonly isAlgolia = !!(
    config.site.algolia?.appId &&
    config.site.algolia?.apiKey &&
    config.site.algolia?.indexName
  );

  /** Re-fetches every time the debounced query changes. Empty string is
   * treated as "no params" so the loader doesn't run on an empty input. */
  private readonly resultsResource = resource({
    params: () => this.debouncedQuery() || undefined,
    loader: async ({params}) => {
      if (!params) return [] as SearchHit[];
      try {
        return await this.provider.search(params);
      } catch (err) {
        console.warn('[ngmd] search provider failed:', err);
        return [] as SearchHit[];
      }
    },
  });

  /** Result list. Keeps the previous batch visible while the next is in
   * flight so the dialog doesn't blink between keystrokes. */
  readonly results = linkedSignal<SearchHit[] | undefined, SearchHit[]>({
    source: this.resultsResource.value,
    computation: (next, prev) =>
      (next === undefined && this.query().trim() ? prev?.value : next) ?? [],
  });

  /** True while the resource has a request in flight. */
  readonly loading: Signal<boolean> = this.resultsResource.isLoading;

  /** Most-recently navigated hits, newest first. */
  readonly history: Signal<HistoryItem[]> = this.historyState.asReadonly();

  /** Pinned items, newest favorite first. Render before `recents`. */
  readonly favorites = computed(() => this.historyState().filter((h) => h.isFavorite));

  /** Recently-visited items that aren't favorites. Capped at HISTORY_MAX. */
  readonly recents = computed(() => this.historyState().filter((h) => !h.isFavorite));

  /** True when the query is empty and there's no history to show. */
  readonly isEmpty = computed(() => !this.query().trim() && this.historyState().length === 0);

  /** True when we have an active query but no hits came back. */
  readonly hasNoResults = computed(
    () => !!this.query().trim() && !this.loading() && this.results().length === 0,
  );

  constructor() {
    this.loadHistory();
    // Debounce the query feeding the resource. Clear is immediate.
    effect(() => {
      const q = this.query().trim();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      if (!q) {
        this.debouncedQuery.set('');
        return;
      }
      this.debounceTimer = setTimeout(() => this.debouncedQuery.set(q), SEARCH_DEBOUNCE);
    });
  }

  /** Record that the user navigated to a hit. Preserves an existing
   * `isFavorite` flag if the URL was already pinned. Recents cap at
   * `HISTORY_MAX`; favorites are never trimmed. */
  recordVisit(hit: SearchHit): void {
    if (!this.isBrowser) return;
    this.historyState.update((items) => {
      const existing = items.find((h) => h.url === hit.url);
      const item: HistoryItem = {
        id: hit.id,
        url: hit.url,
        labelHtml: stripMark(hit.labelHtml),
        subLabelHtml: stripMark(hit.subLabelHtml),
        createdAt: Date.now(),
        isFavorite: existing?.isFavorite ?? false,
      };
      const others = items.filter((h) => h.url !== item.url);
      const favorites = others.filter((h) => h.isFavorite);
      const recents = others.filter((h) => !h.isFavorite);
      if (item.isFavorite) {
        return [item, ...favorites, ...recents];
      }
      return [...favorites, item, ...recents.slice(0, HISTORY_MAX - 1)];
    });
    this.persistHistory();
  }

  /** Toggle the pinned-favorite flag for an item already in history. No-op
   * if the URL isn't there yet. */
  toggleFavorite(url: string): void {
    if (!this.isBrowser) return;
    this.historyState.update((items) =>
      items.map((h) => (h.url === url ? {...h, isFavorite: !h.isFavorite} : h)),
    );
    this.persistHistory();
  }

  /** Drop a single entry from history regardless of pin state. Used by
   * the per-row X button on history items. */
  removeFromHistory(url: string): void {
    if (!this.isBrowser) return;
    this.historyState.update((items) => items.filter((h) => h.url !== url));
    this.persistHistory();
  }

  /** Clears recents only. Favorites are kept; users pin them explicitly. */
  clearRecents(): void {
    this.historyState.update((items) => items.filter((h) => h.isFavorite));
    this.persistHistory();
  }

  /** Wipe everything, including pinned favorites. */
  clearHistory(): void {
    this.historyState.set([]);
    this.persistHistory();
  }

  private pickProvider(): SearchProvider {
    const algolia = config.site.algolia;
    if (algolia?.appId && algolia?.apiKey && algolia?.indexName) {
      return new AlgoliaSearchProvider(algolia);
    }
    return new OramaSearchProvider();
  }

  private loadHistory(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (!Array.isArray(parsed)) return;
      // Preserve every favourite (never capped — users pinned them on
      // purpose), only trim non-favourites to HISTORY_MAX. Otherwise a
      // user with >10 pinned items would silently lose anything past
      // the first 10 on the next page load.
      const favourites = parsed.filter((h) => h.isFavorite);
      const recents = parsed.filter((h) => !h.isFavorite).slice(0, HISTORY_MAX);
      this.historyState.set([...favourites, ...recents]);
    } catch {
      // Corrupt entry — wipe and move on.
      localStorage.removeItem(HISTORY_KEY);
    }
  }

  private persistHistory(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.historyState()));
    } catch {
      // Quota or disabled storage; non-fatal.
    }
  }
}

function stripMark(html: string): string {
  return html.replace(/<\/?mark>/g, '');
}
