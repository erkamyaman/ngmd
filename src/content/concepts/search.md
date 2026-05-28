---
title: Search
description: How NgMd's command palette is wired and how to swap the backend for Algolia DocSearch.
---

<ngmd-hero title="Search" gradient>
  Cmd+K palette over every page, every heading, every paragraph. Local Orama index by default, with Algolia DocSearch as a drop-in swap.
</ngmd-hero>

# Search

Cmd+K (or Ctrl+K on Windows / Linux) opens the command palette. The same shortcut toggles it closed. Esc also closes. Hover a row to highlight it, click to open. Empty state shows your most recent visits, restored from `localStorage`. Keyboard navigation (arrow + Enter) is intentionally not wired yet; planned for a future polish pass.

## How the index is built

A vite plugin walks `src/content/**/*.md` at build time and emits a list of records under the virtual module `virtual:ngmd/search-index`. Each markdown page produces three flavours of record:

- **page** record. One per file. Title-only — matches the page when the query lands in its title. Body matches surface through snippet records below so short queries don't fuzzy-match unrelated pages.
- **section** record. One per heading (`##` or deeper). Anchored at the heading's slug so clicking jumps straight to it.
- **snippet** record. Paragraph-sized chunks of the body (~280 chars, sentence-aware). Each snippet carries its enclosing heading's anchor so a click lands you in the right section, not at the page top.

The plugin runs on every dev-server `.md` change via Vite's `handleHotUpdate`, so authoring a page reflects in the palette immediately.

## Opting a page out

Add `noIndex: true` to the frontmatter and the plugin skips the file entirely. Useful for stub pages, scaffold-only content, or 404 fallbacks.

```md
---
title: Internal stub
noIndex: true
---
```

## Two backends, one interface

The palette UI consumes a small `SearchProvider` interface (`src/types/search.ts`). Two implementations satisfy it:

<ngmd-card-grid columns="2">
  <ngmd-card icon="box" title="Orama (default)">
    Bundled. Builds an in-memory index from the JSON shipped above and queries it client-side with BM25 ranking + 1-edit fuzzy tolerance. Headings boost <code>3×</code>, page titles <code>2×</code>, body <code>1×</code>.
  </ngmd-card>
  <ngmd-card icon="rocket" title="Algolia DocSearch (opt-in)">
    Hosted. Same hierarchical (page → section → snippet) result shape as the Orama provider, so the UI is identical. Set <code>site.algolia</code> in <code>ngmd.config.ts</code> to switch.
  </ngmd-card>
</ngmd-card-grid>

The `SearchService` (`src/app/services/search/search.service.ts`) picks at runtime based on whether all three Algolia keys are present. No flag, no rebuild required.

## Switching to Algolia

<ngmd-alert severity="helpful">
  Algolia DocSearch is free for open-source documentation. Apply at <a href="https://docsearch.algolia.com" target="_blank" rel="noopener noreferrer">docsearch.algolia.com</a>. Approval takes 1-2 weeks; once live, Algolia's crawler keeps the index fresh against your sitemap.
</ngmd-alert>

When the application is approved, Algolia sends you three values: `appId`, `apiKey`, and `indexName`. The `apiKey` is the search-only key, safe to commit.

```bash
pnpm add algoliasearch
```

```ts file="src/ngmd.config.ts"
site: {
  // ...existing site fields
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_KEY',
    indexName: 'YOUR_INDEX',
  },
},
```

The palette swaps backends on the next page load. Match highlighting works the same way (Algolia returns `<mark>...</mark>` directly; Orama wraps matches with the same tag client-side), so the visual output is identical.

## Search history

Every successful navigation from the palette is appended to a `localStorage`-backed history (`ngmd-search-history-v1`), capped at ten entries. The empty-query state renders the list newest-first with a `Clear` action. Same pattern adev uses.

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/concepts/markdown-routes" title="Markdown routes"></ngmd-pill>
  <ngmd-pill href="/concepts/theming" title="Theming"></ngmd-pill>
  <ngmd-pill href="/concepts/components" title="Components"></ngmd-pill>
</ngmd-pill-row>
