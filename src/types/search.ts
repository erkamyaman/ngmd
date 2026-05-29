/**
 * Search abstraction. Two implementations live behind it:
 *
 *   - `OramaSearchProvider` — default. Queries a local Orama index built
 *     at vite-build time and shipped as JSON.
 *   - `AlgoliaSearchProvider` — opt-in. Wired when `ngmd.config.ts > site.algolia`
 *     provides `appId` + `apiKey` + `indexName`. Talks to Algolia DocSearch.
 *
 * Both implementations return the same `SearchHit` shape so the command
 * palette UI does not need to know which backend is active.
 */

/** Hierarchy level. Mirrors Algolia DocSearch's `lvl0`-`lvl6` so the same
 * UI works against either backend. `page` is the doc title, `section` is a
 * heading, `snippet` is a body excerpt. */
export type SearchHitKind = 'page' | 'section' | 'snippet';

export interface SearchHit {
  /** Stable identifier for keying / dedup. */
  id: string;
  /** Hit category for icon / grouping. */
  kind: SearchHitKind;
  /** Final navigation target (route + optional fragment). */
  url: string;
  /** Primary label, may contain `<mark>` highlight tags. */
  labelHtml: string;
  /** Secondary label (the page this hit lives in), may contain `<mark>`. */
  subLabelHtml: string;
  /** Body excerpt for snippet hits, may contain `<mark>`. */
  contentHtml?: string;
  /** Optional ranking score for backends that expose one. */
  score?: number;
}

/** Single record in the build-time index, before Orama digests it. */
export interface IndexDoc {
  id: string;
  /** Page route, e.g. `/concepts/theming`. */
  url: string;
  /** Anchor slug for `section` records, empty for `page` / `snippet`. */
  anchor: string;
  kind: SearchHitKind;
  /** Page title (frontmatter `title:` or nav label). */
  pageTitle: string;
  /** Heading text for `section`, page title for `page`, empty for `snippet`. */
  heading: string;
  /** Body slice (full page for `page`, paragraph chunk for `snippet`). */
  body: string;
}

export interface SearchProvider {
  /** Run a query. Returns up to 20 hits. */
  search(query: string): Promise<SearchHit[]>;
}
