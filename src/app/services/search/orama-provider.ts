import {create, insertMultiple, search as oramaSearch, type AnyOrama} from '@orama/orama';
import {searchIndex} from 'virtual:ngmd/search-index';
import {apiIndex} from 'virtual:ngmd/api-index';
import type {IndexDoc, SearchHit, SearchHitKind, SearchProvider} from '../../../types/search';
import type {SymbolRecord} from '../../../types/api';

/**
 * Default search backend. Builds an in-memory Orama index once on init,
 * queries it on every search. Index source is the build-time JSON emitted
 * by `search-index.plugin.ts` under `virtual:ngmd/search-index`.
 *
 * Result shape mirrors Algolia's hierarchical (page → section → snippet)
 * model so the same UI works against either backend.
 */
export class OramaSearchProvider implements SearchProvider {
  private dbPromise: Promise<AnyOrama> | null = null;

  private async getDb(): Promise<AnyOrama> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = (async () => {
      const db = create({
        schema: {
          id: 'string',
          url: 'string',
          anchor: 'string',
          kind: 'string',
          pageTitle: 'string',
          heading: 'string',
          body: 'string',
        },
      });
      // Dedupe by id so a collision between an API symbol and a content
      // page (or between two symbols re-exported under the same name)
      // doesn't blow up Orama's insert.
      const allDocs: IndexDoc[] = [];
      const seenIds = new Set<string>();
      for (const doc of [...searchIndex, ...apiIndex.map(symbolToIndexDoc)]) {
        if (seenIds.has(doc.id)) continue;
        seenIds.add(doc.id);
        allDocs.push(doc);
      }
      if (allDocs.length) {
        await insertMultiple(db, allDocs as unknown as Array<Record<string, string>>, 50);
      }
      return db;
    })();
    return this.dbPromise;
  }

  async search(query: string): Promise<SearchHit[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const db = await this.getDb();
    const result = await oramaSearch(db, {
      term: trimmed,
      properties: ['pageTitle', 'heading', 'body'],
      // Heading > title > body so a query that matches a heading ranks above
      // the same query merely appearing in body prose.
      boost: {heading: 3, pageTitle: 2, body: 1},
      limit: 20,
      // Scale fuzzy tolerance with query length. Short queries (≤4 chars)
      // with 1-edit fuzzy match too many neighbouring words and drag in
      // unrelated pages; longer queries benefit from typo tolerance.
      tolerance: trimmed.length >= 6 ? 1 : 0,
    });
    const seen = new Set<string>();
    const hits: SearchHit[] = [];
    for (const h of result.hits) {
      const doc = h.document as unknown as IndexDoc;
      const key = `${doc.kind}:${doc.url}#${doc.anchor}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(toSearchHit(doc, trimmed, h.score));
    }
    return hits;
  }
}

function toSearchHit(doc: IndexDoc, query: string, score: number): SearchHit {
  const url = doc.anchor ? `${doc.url}#${doc.anchor}` : doc.url;
  const label = pickLabel(doc);
  const sub =
    doc.kind === 'page'
      ? ''
      : doc.kind === 'symbol'
        ? doc.heading // "class FooService" — disambiguates from prose pages
        : doc.pageTitle;
  return {
    id: doc.id,
    kind: doc.kind as SearchHitKind,
    url,
    labelHtml: highlight(label, query),
    subLabelHtml: sub ? highlight(sub, query) : '',
    contentHtml: doc.kind === 'snippet' ? highlight(doc.body, query) : undefined,
    score,
  };
}

function pickLabel(doc: IndexDoc): string {
  if (doc.kind === 'page' || doc.kind === 'symbol') return doc.pageTitle;
  if (doc.kind === 'section') return doc.heading;
  // snippet: prefer the enclosing heading so the row reads
  //   "<heading>"
  //   <page title>
  //   <matched prose>
  // rather than echoing the snippet body twice.
  return doc.heading || doc.pageTitle;
}

/**
 * Wrap every case-insensitive occurrence of `query` (split on whitespace) in
 * `<mark>` tags. Matches Algolia's `highlightPreTag` / `highlightPostTag`
 * shape so the palette UI can render either backend identically.
 */
function highlight(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  const tokens = query.split(/\s+/).filter(Boolean).map(escapeRegex);
  if (!tokens.length) return escapeHtml(text);
  const safe = escapeHtml(text);
  const re = new RegExp(`(${tokens.join('|')})`, 'gi');
  return safe.replace(re, '<mark>$1</mark>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Project a SymbolRecord into the IndexDoc shape so API symbols and content
 * pages share one Orama index and one ranking pass. The `kind` value is
 * `'symbol'`, which the palette renderer treats like a page row with an
 * API icon (rendering polish lives in the palette UI). `body` is the
 * JSDoc description so prose queries can pull symbols in too.
 */
function symbolToIndexDoc(sym: SymbolRecord): IndexDoc {
  return {
    id: `symbol:${sym.group}/${sym.name}`,
    url: `/api/${encodeURIComponent(sym.group)}/${sym.name}`,
    anchor: '',
    kind: 'symbol',
    pageTitle: sym.name,
    heading: `${sym.kind} ${sym.name}`,
    body: sym.description || sym.signature,
  };
}
