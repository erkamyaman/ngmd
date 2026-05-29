import type {SearchHit, SearchHitKind, SearchProvider} from '../../../types/search';

/**
 * Optional Algolia DocSearch backend. Activated when the user populates
 * `ngmd.config.ts > site.algolia` with their `appId`, `apiKey`, and
 * `indexName`. Mirrors the shape adev uses against the same service.
 *
 * `algoliasearch` is loaded lazily on first query so the package is
 * tree-shaken from sites that don't opt in.
 *
 * To use: `pnpm add algoliasearch` in your project, then drop your three
 * keys in the config. NgMd does not bundle the dep by default.
 */

export interface AlgoliaConfig {
  appId: string;
  apiKey: string;
  indexName: string;
}

interface AlgoliaHit {
  objectID: string;
  url: string;
  hierarchy: {lvl0?: string; lvl1?: string; lvl2?: string; lvl3?: string; lvl4?: string};
  content?: string;
  _snippetResult?: {
    content?: {value: string};
    hierarchy?: {
      lvl0?: {value: string; matchLevel?: string};
      lvl1?: {value: string; matchLevel?: string};
      lvl2?: {value: string; matchLevel?: string};
      lvl3?: {value: string; matchLevel?: string};
      lvl4?: {value: string; matchLevel?: string};
    };
  };
}

export class AlgoliaSearchProvider implements SearchProvider {
  private clientPromise: Promise<{
    search: (params: Array<{indexName: string; params: Record<string, unknown>}>) => Promise<{
      results: Array<{hits: AlgoliaHit[]}>;
    }>;
  }> | null = null;

  constructor(private readonly config: AlgoliaConfig) {}

  private async getClient() {
    if (this.clientPromise) return this.clientPromise;
    this.clientPromise = (async () => {
      // Dynamic import via a string variable keeps `algoliasearch` out of
      // the bundle and prevents TypeScript from type-checking the missing
      // dep when the user hasn't installed it. Users opt in by adding the
      // dep + the config block.
      const pkg = 'algoliasearch/lite';
      const mod = (await import(/* @vite-ignore */ pkg)) as {
        liteClient: (
          id: string,
          key: string,
        ) => {
          search: (
            params: Array<{indexName: string; params: Record<string, unknown>}>,
          ) => Promise<{results: Array<{hits: AlgoliaHit[]}>}>;
        };
      };
      return mod.liteClient(this.config.appId, this.config.apiKey);
    })();
    return this.clientPromise;
  }

  async search(query: string): Promise<SearchHit[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    let client;
    try {
      client = await this.getClient();
    } catch (err) {
      console.warn(
        '[ngmd] Algolia configured but `algoliasearch` is not installed. ' +
          'Run `pnpm add algoliasearch` or remove `site.algolia` from ngmd.config.ts.',
        err,
      );
      return [];
    }
    const response = await client.search([
      {
        indexName: this.config.indexName,
        params: {
          query: trimmed,
          hitsPerPage: 20,
          attributesToRetrieve: ['hierarchy', 'content', 'url'],
          attributesToSnippet: ['hierarchy.lvl1:10', 'hierarchy.lvl2:10', 'content:10'],
          snippetEllipsisText: '…',
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        },
      },
    ]);
    const hits = response.results[0]?.hits ?? [];
    return hits.map((hit) => toSearchHit(hit));
  }
}

function toSearchHit(hit: AlgoliaHit): SearchHit {
  const snippet = hit._snippetResult?.content?.value;
  const lvl2 = hit._snippetResult?.hierarchy?.lvl2?.value ?? hit.hierarchy.lvl2;
  const lvl1 = hit._snippetResult?.hierarchy?.lvl1?.value ?? hit.hierarchy.lvl1;
  const pageTitle = hit.hierarchy.lvl1 ?? hit.hierarchy.lvl0 ?? '';
  const kind: SearchHitKind = lvl2 ? 'section' : snippet ? 'snippet' : 'page';
  return {
    id: hit.objectID,
    kind,
    url: toRelativeUrl(hit.url),
    labelHtml: lvl2 ?? lvl1 ?? hit.hierarchy.lvl0 ?? '',
    subLabelHtml: lvl2 ? (lvl1 ?? '') : '',
    contentHtml: snippet ?? undefined,
    score: undefined,
  };
}

/**
 * Algolia's DocSearch crawler stores absolute URLs (`https://yoursite.com/path#frag`).
 * The router only accepts in-app paths, so strip the origin and keep
 * `pathname + search + hash` before handing the hit to the palette.
 */
function toRelativeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Already relative (or malformed). Pass through unchanged; the
    // palette's `navigateTo` will report any genuine breakage.
    return url;
  }
}
