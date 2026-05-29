import {
  Injectable,
  computed,
  effect,
  inject,
  PLATFORM_ID,
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
}

/**
 * Single entry point for the command palette. Picks the right backend
 * (Orama by default, Algolia if configured), debounces the query, keeps a
 * `previous-results-while-loading` UX (linkedSignal pattern from adev), and
 * persists recent navigations to `localStorage`.
 *
 * Swap to Algolia by populating `site.algolia` in `ngmd.config.ts`. Nothing
 * in this file changes when you do; the provider just picks itself up.
 */
@Injectable({providedIn: 'root'})
export class SearchService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly query = signal('');
  readonly loading = signal(false);

  private readonly provider: SearchProvider = this.pickProvider();
  private readonly resultsState = signal<SearchHit[]>([]);
  private readonly historyState = signal<HistoryItem[]>([]);
  private lastQuery = '';
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Result list — keeps the previous batch visible while the next is in
   * flight so the UI doesn't blink between keystrokes. */
  readonly results: Signal<SearchHit[]> = this.resultsState.asReadonly();

  /** Most-recently navigated hits, newest first. */
  readonly history: Signal<HistoryItem[]> = this.historyState.asReadonly();

  /** True when the query is empty and there's no history to show. */
  readonly isEmpty = computed(() => !this.query().trim() && this.historyState().length === 0);

  /** True when we have an active query but no hits came back. */
  readonly hasNoResults = computed(
    () => !!this.query().trim() && !this.loading() && this.resultsState().length === 0,
  );

  constructor() {
    this.loadHistory();
    // Run a debounced query whenever the input changes.
    effect(() => {
      const q = this.query().trim();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      if (!q) {
        // Reset lastQuery so any in-flight provider response (still
        // working on the previously-typed query) is rejected by the
        // stale-result guard in runQuery instead of repopulating the
        // empty state.
        this.lastQuery = '';
        this.resultsState.set([]);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.debounceTimer = setTimeout(() => this.runQuery(q), SEARCH_DEBOUNCE);
    });
  }

  private async runQuery(q: string): Promise<void> {
    this.lastQuery = q;
    try {
      const hits = await this.provider.search(q);
      // Drop stale results if the user kept typing.
      if (q !== this.lastQuery) return;
      this.resultsState.set(hits);
    } catch (err) {
      // Provider blew up (network, missing dep, etc.). Clear results
      // for this query so the UI shows the empty state instead of stale
      // hits, log for debugging, and let the finally branch clear the
      // loading flag.
      if (q === this.lastQuery) this.resultsState.set([]);
      console.warn('[ngmd] search provider failed:', err);
    } finally {
      if (q === this.lastQuery) this.loading.set(false);
    }
  }

  /** Record that the user navigated to a hit. Cap at HISTORY_MAX entries. */
  recordVisit(hit: SearchHit): void {
    if (!this.isBrowser) return;
    const item: HistoryItem = {
      id: hit.id,
      url: hit.url,
      labelHtml: stripMark(hit.labelHtml),
      subLabelHtml: stripMark(hit.subLabelHtml),
      createdAt: Date.now(),
    };
    this.historyState.update((items) => {
      const filtered = items.filter((existing) => existing.url !== item.url);
      return [item, ...filtered].slice(0, HISTORY_MAX);
    });
    this.persistHistory();
  }

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
      if (Array.isArray(parsed)) this.historyState.set(parsed.slice(0, HISTORY_MAX));
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
