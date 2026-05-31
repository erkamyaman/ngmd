# NgMd — Feature Backlog

A comprehensive list of features we could add. Pulled from adev, VitePress, Starlight, Nextra, Docusaurus. Not all of these will ship. Use this as a menu to pick from.

Status legend: ✅ done · 🟡 partial · ❌ not done

---

## 1. Authoring components

NgMd's model: prose lives in `.md`, chrome lives as Angular components composed in `.page.ts`. The adev pattern of custom HTML tags inside markdown was explored and rejected in May 2026 (dual-pipeline marked instances plus HTML-escape friction made it more cost than win). Inline media (`<ngmd-video>`, `<ngmd-image>`) is the exception, kept as marked extensions because the tags are self-closing leaves with no markdown body.

Shipped as Angular components under `src/app/ui/`:

- ✅ `<ngmd-callout type="info|tip|success|warning|danger" title="...">` — bordered box with coloured stripe
- ✅ `<ngmd-alert severity="info|warning|critical|helpful|important">` — single-line banner
- ✅ `<ngmd-card title="..." link="..." cta="...">` — bordered card, optional router link
- ✅ `<ngmd-tabs>` + `<ngmd-tab title="...">` — hand-rolled tabs with ARIA roles, arrow-key navigation, and Home/End shortcuts. Works inline in `.md` (children are components, not directive-on-template).
- ✅ `<ngmd-pill-row>` + `<ngmd-pill href="..." title="...">` — horizontal pill links
- ✅ `<ngmd-workflow>` + `<ngmd-step title="...">` — numbered step list
- ✅ `<ngmd-hero title="..." gradient>` — page hero
- ✅ `<ngmd-code-block header="..." language="..." [code]>` — code block with header bar, lazy-loaded shiki + dual theme

Shipped as marked extensions (usable inline in `.md`):

- ✅ `<ngmd-video src="..." title="..."/>` — YouTube / Vimeo URL normalisation
- ✅ `<ngmd-image src="..." alt="..." caption="..."/>` — figure with caption + lazy load
- ✅ `<ngmd-accordion>` + `<ngmd-accordion-item title="..." open>` — disclosure list backed by native `<details>` for keyboard + a11y for free
- ✅ `<ngmd-badge variant="alpha|beta|stable|deprecated|new">` — inline status pill
- ✅ `*Keyword` inline auto-linking — declare in `ngmd.config.ts > keywords`, `*AnalogJS` etc. become links

Code-fence affordances (build-time marked extensions):

- ✅ ` ```ts file="src/foo.ts#L5-L20" ` — import code from source, GitHub-style line ranges, `// ngmd-ignore-line` strip markers, header bar links to GitHub
- ✅ ` ```bash group="install" name="pnpm" active ` — adjacent fences with same `group=` merge into a tabbed UI
- ✅ ` ```ts {1,3-5} ` — highlight matching lines with a fuchsia stripe + tint

Open follow-ups:

- ✅ `<ngmd-card-grid columns="2|3">` — n-up card grid, mobile stacks to single column
- ❌ Combined `file=` + `{1,3-5}` line highlight on the same fence — adev parity, ~1h. Tweak the regex in `ngmd-code-import.ts` to also parse the brace list.
- ❌ Diff view via ` ```diff ` — adev parity, ~1h. Shiki already emits the tokens; just need CSS for green/red lines.
- ❌ `<ngmd-hero>` image slot via content projection — adev's `docs-decorative-header` has an image slot. ~1-2h to add a named `<ng-content select="[hero-image]">` and lay it out next to the title.
- ❌ Multi-file code group — extend `group="..."` so different fences inside one group can be `app.ts` + `app.html` + `app.css` style (adev's `docs-code-multifile`). 1-2 days; the marked extension already supports grouping, needs richer tab labels + better visual treatment.
- ❌ Stackblitz preview embed (`<ngmd-stackblitz project="...">`) — adev's `docs-code preview` does runnable demos. 1-2 days. Big tutorial unlock.
- ❌ API reference table component — specialised shape for class members (signature / default / description), even before auto-extraction. ~half day.

## 2. Page chrome (every docs starter has these)

- ✅ Previous / Next page navigation at the bottom of each doc page (auto-derived from `ngmd.config.ts` nav)
- ✅ "Edit on GitHub" link per page
- ✅ "Last updated" timestamp pulled from git history (`git log -1 --format=%cs`)
- ✅ Heading anchor copy-link — hover an h1/h2/h3 to reveal a `#` icon that copies the URL
- ❌ Reading time estimate (word count / 200 wpm)
- ❌ "Was this page helpful?" feedback widget at bottom
- ❌ Page-level frontmatter overrides for layout / title / description / OG image

## 3. Content tools

- ❌ Mermaid diagram rendering — ` ```mermaid` blocks
- ❌ Math rendering — KaTeX or MathJax for ` ```math` blocks or `$...$` inline
- ❌ Footnotes (`[^1]` markdown syntax)
- ❌ Task lists rendering `[ ]` / `[x]`
- ❌ Definition lists
- ❌ Emoji shortcodes (`:smile:` → 😄)
- ❌ Tweet / CodePen / CodeSandbox embeds
- ❌ Image lightbox on click
- 🟡 Image optimization — manual for now, no automatic responsive srcset

## 4. Search / discovery

- ✅ Cmd+K palette — Orama BM25 + fuzzy (length-scaled) + heading/title/body boosts + `<mark>` highlighting (0.1.2)
- ✅ Algolia DocSearch integration (opt-in via `site.algolia` keys + `pnpm add algoliasearch`, 0.1.2)
- ✅ Orama offline search index built at build time (`search-index.plugin.ts` → `virtual:ngmd/search-index`, 0.1.2)
- ❌ Search result keyboard navigation (arrows + enter). Reverted in 0.1.2 pending a proper focus / scroll polish pass.
- ✅ Recent searches + ✅ favorites (`localStorage`, 0.1.2 recents / 0.1.3 favorites). Star toggle per row, split into Favorites + Recent sections.

## 5. Library-author features

- ❌ API reference auto-generation from JSDoc / ts-morph (the headline library-author feature, explicitly punted to a future release)
- ✅ Keyword auto-linking — page-tier via `*Keyword` (API-tier deferred, depends on auto-gen above)
- ❌ Symbol search in palette
- ❌ Component playgrounds with editable code + Stackblitz launcher
- ❌ Interactive props/args/controls (Storybook-style)
- ❌ Status badges per component (alpha / beta / stable / deprecated)

## 6. Build / infrastructure

- ✅ Build-time external-link guard (Vite plugin, errors on raw external `<a>` without `target="_blank"`)
- ✅ Build-time internal-link guard (errors on broken `#fragment` and `/route#fragment` links)
- ✅ Build-time page-meta plugin (`virtual:ngmd/page-meta` exposes `editUrl` + `lastUpdated` per route)
- ✅ Sitemap.xml auto-generation
- ✅ robots.txt
- ❌ RSS feed for changelog / blog
- ❌ Service worker / PWA support
- ❌ OG image auto-generation per page
- ❌ Twitter card meta auto-fill
- ❌ Analytics integration hooks

## 7. Theming / branding

- ✅ CSS-variable theme tokens (`--bg`, `--bg-muted`, `--fg`, `--muted`, `--border`, `--border-strong`, `--primary`, `--accent`, `--accent-soft`, `--accent-gradient`, `--radius-*`, `--font-*`)
- ✅ Fuchsia accent wired through sidebar active, TOC active, palette row, prev/next hover, heading anchor hover, markdown link hover + focus ring
- 🟡 Theme is documented in `theming.md` but the live preview / swatch grid is missing
- ❌ Live theme preview component that swaps tokens
- ❌ Theme presets / palettes (e.g. "Stone", "Slate", "Rose", "Violet")
- ❌ Brand assets page (logo, colors, fonts displayed in a kit)
- ❌ Print stylesheet
- ❌ RTL language support

## 8. Multi-version + i18n (v2 territory)

- ❌ Versioned docs (Docusaurus-style — `v1/`, `v2/` folders, version switcher in header)
- ❌ i18n / locale switcher (header dropdown, locale-prefixed routes)
- ❌ Translation memory / source-of-truth tracking

## 9. Authoring DX

- ✅ `npx create-ngmd` scaffolder — published as `create-ngmd@0.0.3` on npm. Works via `pnpm create ngmd@latest`, `npm create ngmd@latest`, `yarn create ngmd`, `bun create ngmd`. Slim template ships with the `[...slug].page.ts` catch-all so users drop `.md` files and get routes with no wrapper.
- ❌ `ngmd add <component>` CLI for shadcn-style component installation
- ❌ `ngmd new page <slug>` CLI to generate a new markdown page + sidebar entry
- ❌ VS Code snippets for common docs patterns (callout, tabs, pill row)

## 10. Polish / nice-to-have

- ✅ View Transitions API crossfade between routes (`withViewTransitions()` in `app.config.ts`, 150ms duration tuned in `styles.css`; falls back to default behaviour on Chrome <111)
- ❌ Loading skeleton while markdown content loads
- ❌ Back-to-top button
- ❌ Keyboard shortcut help dialog (press `?`)
- ❌ Inline code-block copy success toast
- ❌ Code-block line numbers
- ✅ Code-block line highlighting (` ```ts {3-5}` syntax)
- ❌ Code-block diff view (` ```diff` blocks — shiki supports, needs CSS)
- ❌ Inline `Show source` toggle on component demos
- ❌ Lighthouse audit + a11y compliance pass

## 11. Already shipped (for reference)

Foundation:

- ✅ AnalogJS + Vite 8 + Angular 21 + pnpm/npm/yarn/bun support
- ✅ Markdown content collections via `src/content/`
- ✅ Shiki syntax highlighting pinned to `1.29.2` (`bash`, `md`, `json`, `ts`, `html`, `css`)
- ✅ Tailwind v4 + class-based dark mode (`@variant dark`)
- ✅ Light / dark / auto theme cycle with no-flash inline boot script

Chrome:

- ✅ Translucent sticky header with `backdrop-blur-sm`
- ✅ Sidebar accordion driven by `ngmd.config.ts`
- ✅ Breadcrumb derived from current route
- ✅ Right-side on-page TOC with scroll-spy
- ✅ Mobile drawer for sidebar + collapsible "On this page"
- ✅ Cmd+K command palette with content-aware search
- ✅ Page footer per docs route: prev/next + edit-on-github + last-updated
- ✅ Heading anchor copy buttons (h1/h2/h3, fuchsia hover)
- ✅ Code-block copy buttons on every `<pre>` (runtime enhancer)
- ✅ External links auto-targeted to a new tab (runtime enhancer)
- ✅ Smooth scroll on page navigation, sticky-header offset via `ViewportScroller.setOffset`
- ✅ Body scroll lock when palette open
- ✅ 404 page with chrome-hidden layout

Authoring:

- ✅ Authoring component suite under `src/app/ui/`: callout, alert, card, card-grid, tabs (hand-rolled ARIA + keyboard nav), pill row, workflow, hero, code-block (lazy-shiki + dual theme), accordion, badge, video, image
- ✅ `<ngmd-video>` + `<ngmd-image>` marked extensions for inline media in `.md`
- ✅ `*Keyword` inline auto-linking (12 default keywords in `ngmd.config.ts`)
- ✅ Code-fence file imports with GitHub-linked header bar
- ✅ Code-fence group tabs (`group="install" name="pnpm" active`)
- ✅ Code-fence line highlighting (` ```ts {1,3-5} `)

Build pipeline:

- ✅ External-link guard (Vite plugin, errors on raw external anchors missing `target="_blank"`)
- ✅ Internal-link guard (errors on broken in-page and cross-page anchor fragments)
- ✅ page-meta plugin → `virtual:ngmd/page-meta`
- ✅ sitemap plugin → `sitemap.xml` + `robots.txt` emitted into client build

Distribution:

- ✅ `create-ngmd/` scaffolder (Node builtins, slim template, package-manager detection)
- ✅ Showcase page at `/concepts/components` demoing every NgmdUi component
- ✅ Hexagon logo with rose → fuchsia → purple gradient stroke, Geist Mono wordmark
- ✅ Open Graph + meta tags, SVG favicon
- ✅ License, README, package.json metadata

---

## Up next

Three candidates picked from a wider feature review. Pick from the top.

- ❌ **JSDoc-driven API reference.** Opt-in `ngmd.api.ts`-style scope file globs TS sources, parses JSDoc (via `ts-morph` or the Angular compiler API), emits virtual `.page.ts` routes. Render `@deprecated` / `@experimental` / `@beta` as inline status badges. Heaviest lift on this list; the single biggest missing feature for library docs use cases.
- ✅ **Sidebar status badges.** Shipped in 0.1.1 (frontmatter), migrated to nav config in 0.1.2 matching adev's `NavigationItem.status` pattern. `{label, href, status: 'beta'}` on a `NavItem` renders a coloured chip next to the sidebar label. Six variants (`new`, `updated`, `alpha`, `beta`, `stable`, `deprecated`) sourced from the single `BADGE_VARIANTS` map in `src/types/badge.ts`. See [/concepts/markdown-routes#sidebar-status-badges](/concepts/markdown-routes#sidebar-status-badges).
- ✅ **Search relevance pass.** Replaced the keyword-substring filter with Orama (BM25 + fuzzy + heading/title/body boost). Build-time index plugin emits `virtual:ngmd/search-index`; `SearchService` picks Orama by default or Algolia DocSearch when `site.algolia` is set. Adds `noIndex: true` frontmatter, search history in `localStorage`, and `<mark>` match highlighting. See [/concepts/search](/concepts/search).
