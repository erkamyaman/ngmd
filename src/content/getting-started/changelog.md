---
title: Changelog
---

# Changelog

Release notes and version history for NgMd.

## 0.1.6 <ngmd-badge variant="new">Latest</ngmd-badge>

**Mobile sidebar polish.** The drawer is now always mounted so its slide-in / slide-out animation has something to transition against. Backdrop fades (200ms), drawer slides from `-translate-x-full` to `translate-x-0` (200ms ease-out), `inert` blocks touch and focus while closed. The sidebar also scrolls its active row into view on initial mount and after every navigation, so long Stack-style sections in either the mobile drawer or the desktop pane keep the current page in sight. Active rows now carry `aria-current="page"` via `routerLinkActive`'s built-in input — same accessibility win, used as the selector for the scroll lookup so it doesn't have to escape Tailwind's `var(--accent-soft)!` class.

**Related pages.** Bottom of every docs route now shows a "More in <section>" grid above the prev / next nav, derived from `navItems` siblings in the same section (excluding the current page and the prev / next pair to avoid showing the same link twice). Capped at four. Empty when the section is small enough that prev / next already covers it.

**`<ngmd-stackblitz>` playground embed.** New `NgmdUi` component for inline Angular playgrounds. Takes `id="<project-id>"` for a published StackBlitz project or `repo="org/name"` to open a public GitHub repo through StackBlitz's importer. Optional `file="..."`, `view="preview|editor"`, and `height` inputs. Lazy-loads the iframe, footer has an "Open in StackBlitz" link to the full editor. Registered as a Custom Element so it works inline in `.md` bodies via the existing `@angular/elements` bridge.

## 0.1.5

**Shared plugin helpers.** New `plugin-utils.ts` at the repo root collects the helpers that `page-meta`, `sitemap`, `link-guard`, and `search-index` were each shipping verbatim: `gitDate`, `walkPageFiles`, `walkContentFiles`, `routeFromPagePath`, and `slugify`. ~120 lines of duplicated code collapsed into one module, so the next slug-rule alignment (like the 0.1.3 fix) lives in one place instead of four.

**Shared clipboard helper.** `src/app/utils/clipboard.ts` wraps `navigator.clipboard.writeText` with an SSR-safety check and try/catch, returning `Promise<boolean>`. Six call sites (`code-copy`, `ui/code-block`, `heading-anchors`, `llm-actions` × 2, the home install picker) collapse to one-liners. Each call site keeps its own UX (in-place flash or toast) but the clipboard mechanics are shared.

**Better 404.** The catch-all's "Page not found" panel now has a "Search the docs" CTA that opens the Cmd+K palette pre-filled with an alpha-only term pulled from the failed URL's last segment, plus the standard "Go home". `SearchService` gains `requestOpen(query)` so any component can drive the palette externally. adev silently redirects 404s home; NgMd keeps the explicit page so readers know the URL was bad and have a way out.

**App layout stretches site-footer to viewport bottom.** Main becomes a flex column with the page content in a `flex-1` inner div and `<app-site-footer>` after. Short pages (404, narrow landing sections) pin the footer to the bottom instead of leaving an awkward gap; tall pages behave exactly the same since the inner div just grows to its natural height.

**Shared `RouteUrlService`.** Six files (`app.ts`, `page-footer`, `source-actions`, `llm-actions`, `breadcrumb`, the catch-all) were each repeating the same `toSignal(router.events.pipe(filter(NavigationEnd), map, startWith))` ladder plus a `cleanUrl = computed(() => url().split('?')[0].split('#')[0])`. One root-provided service now owns both signals; consumers just `inject(RouteUrlService).cleanUrl`. `NgmdTitleStrategy` reads the same `stripUrl` helper instead of inlining the split chain. ~50 lines net dropped.

**Shared `enhanceOnNavigation()` helper.** Five DOM-walker components (`code-copy`, `code-group`, `external-links`, `heading-anchors`, `media-enhancer`) had an identical skeleton: `ngAfterViewInit` runs a query, retries up to 20 times with a 50ms delay if the markdown hasn't flushed, then subscribes to `NavigationEnd` to re-run the same loop after every route change. The helper takes `(router, destroyRef, selector, enhanceEach)` and each component collapses to a single call. The TOC and the root `App` use a sibling `onNavigation(router, destroyRef, fn)` helper for their bespoke per-navigation work (state clear + scan, drawer close + scroll reset). ~80 lines net dropped.

**Shared `watchHostAttribute()` helper.** `NgmdStep` and `NgmdTab` both wrap a Custom-Element host and sync a single `data-*` attribute into a signal via `MutationObserver`. Each had ~10 lines of identical SSR check + ElementRef + sync fn + observer + DestroyRef wiring. One helper now owns the pattern; the components express their intent in a single call.

**SSR-check consistency.** `ThemeService`, `Toaster`, and `SearchService` swapped Angular's `isPlatformBrowser` injection for the lighter runtime check that the rest of the codebase already used. Same behaviour, one idiom across all 11 call sites.

**Dead code dropped.** `SearchService.isEmpty` and `clearHistory` were declared but never read or called anywhere; `clearRecents` is the one the palette actually uses. Three `console.warn` lines that sat next to `toast.error` in `llm-actions` (leftovers from before toasts) absorbed into the clipboard refactor. Removed `src/app/pages/analog-welcome.ts` (271 lines of scaffold residue from before NgMd's own home page replaced it), `PageFooter.editUrl` + `lastUpdated` + `meta` computeds (the template had stopped reading them; "Edit on GitHub" lives in `<app-source-actions>`), a stale `support: 'Support'` entry in the breadcrumb labels map (the `/support` route was split into `/help/...` back in 0.0.5), and the `src/server/routes/api/v1/hello.ts` AnalogJS demo endpoint plus the now-empty `src/server/` tree (no route consumes it). `tsconfig.app.json` lost its dangling `src/server/middleware/**/*.ts` glob in the same pass. Also dropped `public/analog.svg` + `public/vite.svg` (the live copies live at `analogjs.org/img/logos/analog-logo.svg` and `public/logos/vite.svg`; the root-level files were unreferenced scaffold duplicates), and renamed the `angular.json` project from the scaffold default `my-app` to `ngmd` so CLI output matches the actual repo.

## 0.1.4

**Toast notifications.** A new `ToastService` + `<app-toaster>` pair gives any component a non-blocking way to surface success / error / info messages. Stack renders fixed top-right, newest on top, slides in from the right (260ms ease-out) on appear and slides back out on dismiss. Auto-dismisses after 3s (or stays until clicked when `duration: 0`), and `prefers-reduced-motion` gets a plain fade instead. Service is a dumb queue; the `Toaster` component owns timing so the exit animation always plays before the entry is removed. Mounted once in `app.ts` so any service or component can `inject(ToastService)` and call `.success('Saved.')` / `.error('Network failed.')` / `.info('Heads up.')`.

**LLM actions wired into the new system.** "Copy Markdown Link" now confirms with a `Link copied to clipboard.` toast on success and surfaces clipboard failures (previously a silent `console.warn`). "Copy Markdown" still uses the in-place "Copied!" flash on success but now surfaces fetch / clipboard failures through a toast instead of vanishing.

**Code-copy + install picker upgraded.** The fenced-code copy buttons and the home install picker keep their in-place check-icon swap on success (lighter than a toast for actions you fire repeatedly) but now show a `Could not copy...` toast on clipboard failure instead of silently no-op'ing.

## 0.1.3

**LLM-friendly page actions.** Every prose route now has a "Copy Markdown" dropdown next to the existing edit / view-source icons. Five actions: copy the raw `.md` body to clipboard, copy a permalink to the raw `.md`, open in GitHub, or open the page in ChatGPT or Claude with a one-shot prompt. Pattern mirrors `react.dev` and the PrimeNG docs. Backed by a new `raw-md.plugin.ts` Vite plugin that serves the literal markdown at `<route>.md` in dev (middleware) and emits the same files as static assets in production. So `https://ngmd.netlify.app/concepts/theming.md` returns clean markdown for any LLM agent following the link.

**Search favorites.** Star any recent in the Cmd+K palette to pin it. Favorites render above recents in a dedicated section, persist across sessions in `localStorage`, and survive the `Clear` action on recents. The X on a favourite row removes it from history entirely (the simplest way to drop a pinned entry). Pattern mirrors adev's recent / favorites split. `SearchService` exposes `favorites` and `recents` as derived signals plus `toggleFavorite(url)`, `removeFromHistory(url)`, and `clearRecents()` methods so any future UI shell can consume the same data.

**`HistoryItem` gained `isFavorite?: boolean`.** Existing `localStorage` entries from 0.1.2 load without the flag (treated as not favorited) so the upgrade is transparent.

**`link-guard.plugin.ts` slug aligned with the runtime.** The build-time link guard was using its own slug rule (`[^\w\s-]` strip) that disagreed with the runtime TOC and search-index plugin on any heading containing `.` or `_`. So fragment links pointing at a version heading like `## 0.1.2` would either falsely fail validation or pass through to a 404 at runtime (guard computed `012`, the actual DOM id was `0-1-2`). Now uses the same `toLowerCase` / `[^a-z0-9]+` / trim-outer-hyphens algorithm as `toc.ts` and `search-index.plugin.ts`.

**Search service refactored to `resource()` + `linkedSignal()`.** Dropped the manual `runQuery` / `resultsState` / stale-result-guard plumbing in favour of Angular's resource API. Previous result batch stays visible while the next one is in flight so the palette no longer blinks between keystrokes. Clearing the query is still instant, debounce stays at 200ms.

**Per-row X on history items.** Hover a row in the Cmd+K palette (favourites or recents) and an X button slides in to drop that single entry, no matter its pin state. The general "Clear" button on the Recent section header stays — it wipes the whole recents batch.

**Backend attribution in palette footer.** When `site.algolia` is configured the palette renders the required "Search by Algolia" badge with the official logo. The default local backend gets a courtesy "Search by Orama" credit using Orama's official mark. `esc / close` hint stays on the left.

**Accordion chevron simplified.** Replaced the dual `ChevronDown` / `ChevronUp` opacity crossfade with a single down-arrow that rotates 180° on open via `transition-transform`. Matches the new split-button chevron in the LLM actions dropdown. Drops the related CSS rules and the reduced-motion overrides for them.

**Versions match.** Root `package.json` bumped to `0.1.3` so `pnpm dev` no longer prints `ngmd@0.0.0` and the script header lines up with the published `create-ngmd` version.

## 0.1.2

**Cmd+K search relevance pass.** Replaced the keyword-substring filter with [Orama](https://askorama.ai/) (BM25 ranking + length-scaled fuzzy tolerance + heading×3 / title×2 / body×1 boosts). A new `search-index.plugin.ts` Vite plugin walks `src/content/**/*.md` at build time, parses frontmatter, splits each page into page / section / snippet records, and emits the lot under the virtual module `virtual:ngmd/search-index`. HMR invalidates on any `.md` edit. Result rows now render `&lt;mark&gt;` highlights on matches.

**Search backend abstraction.** Introduced a `SearchProvider` interface so the same palette UI runs against either local Orama or hosted Algolia DocSearch. Implementation lives behind `SearchService` (adev-style: debounced query, drops stale results, selects backend at runtime). Default is Orama. Drop `site.algolia: {appId, apiKey, indexName}` into `ngmd.config.ts` and install `algoliasearch` to swap. `algoliasearch/lite` is loaded via dynamic import so the package is tree-shaken from sites that don't opt in.

**Search history in localStorage.** The palette's empty state now lists your last ten visited results, newest first, with a `Clear` action. Keyed `ngmd-search-history-v1` so a future schema bump won't collide.

**`noIndex: true` frontmatter.** Set it on any page to skip it from the search index. Useful for stub pages, scaffold-only content, or 404 fallbacks.

**Sidebar status badges moved to nav config.** The `status:` frontmatter pattern from 0.1.1 is gone. Status now lives on the `NavItem` in `ngmd.config.ts`: `{label: 'Search', href: '/concepts/search', status: 'new'}`. Matches adev's `NavigationItem.status` pattern. One file, all sidebar lifecycle markers visible at a glance. Pages that previously declared `status:` in frontmatter need that line removed (the field is silently ignored now).

**New `updated` badge variant.** Gold, for recently revised pages. Joins `new` (sky), `alpha` (red), `beta` (amber), `stable` (emerald), and `deprecated` (zinc). All six values work on `NavItem.status` and on `&lt;ngmd-badge variant="..."&gt;`.

**`<mark>` accent styling.** Search-result highlight tags now render with `var(--accent-soft)` background and `var(--accent-strong)` text, matching the rest of the brand. Replaces the browser default yellow flash.

**New Search docs page.** [/concepts/search](/concepts/search) walks through the index pipeline, the two backends, the Algolia opt-in path, and the `noIndex` flag. Linked from the sidebar.

## 0.1.1

**Sidebar status badges.** A new `status:` field in any `.md` page's frontmatter renders a coloured chip next to its sidebar entry. Five values: `new`, `alpha`, `beta`, `stable`, `deprecated`. The `page-meta.plugin.ts` Vite plugin parses the frontmatter at build time and exposes the map via the existing `virtual:ngmd/page-meta` virtual module; the sidebar imports it and renders the chip inline. HMR invalidates the virtual module on any `.md` edit so badge changes show without a server restart.

**Single source of truth for badge variants.** Every variant (Tailwind classes plus name) lives in one map: `BADGE_VARIANTS` in `src/types/badge.ts`. The inline `&lt;ngmd-badge&gt;` component, the sidebar status chip, and the `status:` frontmatter validator all derive from the same map. Adding a new variant is one row; the `BadgeVariant` type and `PAGE_STATUS_VALUES` array widen automatically.

**`&lt;ngmd-image&gt;` / `&lt;ngmd-video&gt;` paired-tag support.** Marked extensions' regexes only matched the self-closing `&lt;ngmd-image .../&gt;` form. 0.0.6 switched all source content to paired `&lt;ngmd-image&gt;&lt;/ngmd-image&gt;` tags ("HTML parsers don't honour self-closing custom elements"), which made the extensions silently fall through to literal-text rendering on multi-line invocations. Regexes now accept both forms, plus multi-line attributes.

**Inline-code chips reach direct Angular pages.** The fuchsia chip styling previously only applied inside `&lt;analog-markdown&gt;` / `&lt;analog-markdown-route&gt;`. Pages built as plain `.page.ts` Angular templates (Components reference, home) missed it, so identifiers in their prose rendered as plain monospace. Added a `.ngmd-prose code:not(pre code)` selector and tagged the relevant article wrappers. Same visual rhythm as markdown pages.

**Word-spacing on prose.** Inline-code chips were visually kissing the neighbouring words. Added `word-spacing: 0.05em` on `analog-markdown`, `analog-markdown-route`, and `.ngmd-prose` so the rhythm gets a touch of breathing room without changing chip-internal padding.

**Sidebar keyboard focus restored.** Nav links previously suppressed both pointer and keyboard focus indicators. The pointer suppression stays (no flash on click), but `focus-visible` now paints an accent outline so keyboard users can see the focused row.

**Email link styling.** Removed `&lt;code&gt;` wrapping around the security-report email in `get-help.md` so it renders as a plain accent link instead of an inline-code chip.

**Prettier formatter.** Config mirrors the Angular monorepo `.prettierrc` byte-for-byte: single quotes, width 100, trailing comma all, no bracket spacing, HTML parsed as Angular templates. New scripts `pnpm format` (write) and `pnpm format:check` (CI). `.vscode/settings.json` opts the workspace into format-on-save with the Prettier extension. `src/content/**` and `create-ngmd/template/**` are excluded so prose line breaks and the scaffold-byte-for-byte copy stay untouched.

**Docs.** Components reference page Badge section has a new accordion ("Whole-page status (sidebar chip)" + "Adding a new variant") with a concrete code example showing the `BADGE_VARIANTS` row pattern. `markdown-routes.md` has a "Sidebar status badge" subsection. `CONTRIBUTING.md` documents the formatter; `help/contribute.md` adds `pnpm format:check` to the pre-PR checklist.

## 0.1.0

**Per-instance spacing on NgmdUi tags.** Every block authoring component (`&lt;ngmd-accordion&gt;`, `&lt;ngmd-callout&gt;`, `&lt;ngmd-card-grid&gt;`, `&lt;ngmd-code-block&gt;`, `&lt;ngmd-image&gt;`, `&lt;ngmd-tabs&gt;`, `&lt;ngmd-video&gt;`, `&lt;ngmd-hero&gt;`, `&lt;ngmd-workflow&gt;`, `&lt;ngmd-alert&gt;`, `&lt;ngmd-pill-row&gt;`) now accepts a Tailwind margin class on the markdown tag: `&lt;ngmd-callout class="mt-10"&gt;`, `&lt;ngmd-accordion class="my-0"&gt;`. Default `margin: 1.5rem 0` lives on the host in `@layer base`; `mt-*`, `mb-*`, `my-*`, `mx-*` from `@layer utilities` win on cascade. Inner template divs no longer carry the `my-X` they used to (it was trapped inside the flex/grid formatting context and unreachable from markdown).

**Tailwind scans markdown.** Added `@source "./content/**/*.md"` to `styles.css`. Without this, any utility class written inside a `.md` body silently dropped from the bundle.

**`&lt;ngmd-image&gt;` / `&lt;ngmd-video&gt;` paired-tag support.** Marked extensions' regexes only matched the self-closing `&lt;ngmd-image .../&gt;` form. 0.0.6 switched all source content to paired `&lt;ngmd-image&gt;&lt;/ngmd-image&gt;` tags ("HTML parsers don't honour self-closing custom elements"), which made the extensions silently fall through to literal-text rendering. Regexes now accept both forms, plus multi-line attributes.

**Backtick angle-bracket leak fix.** Marked v15 + analog-markdown was rendering backtick-wrapped tags like `` `&lt;router-outlet&gt;` `` and `` `&lt;ngmd-callout&gt;` `` as real (empty) DOM elements inside the inline code chip, producing visible empty fuchsia chips. Manually escaped `&lt;` / `&gt;` across markdown-routes, changelog, theming.

**Inline-code chip wrap fix.** Long backtick-wrapped paths (e.g. `` `src/app/register-elements.ts` ``) tore the fuchsia border when wrapping across lines. Added `box-decoration-break: clone` so each wrapped fragment gets a full border.

**Scrollbar dimmer in dark mode.** Main page scrollbar thumb now uses `color-mix(in srgb, var(--muted) 45%, transparent)` so it reads as a quiet anchor instead of a too-bright zinc-400 against the near-black bg. Hover restores full `--muted`.

**Email link styling.** Removed `&lt;code&gt;` wrapping from the security-report email in `get-help.md` so it renders as a plain accent link instead of an inline-code chip.

**Fact-check sweep across all 13 markdown docs.** Plugin filename corrected (`link-guard.plugin.ts`, not `internal-link-guard.plugin.ts`), plugin count corrected ("three at repo root + one inline", not "four"), component breakdown math in `stack/overview.md` (13 named + 4 children = 17, not 14 + 4 = 18), and Shiki "pinned" wording softened (`^1.29.2` is held within 1.x, not strictly pinned). Em dashes swept across all docs in favour of periods, commas, or parens.

**Docs.** New "Per-instance spacing" reference section in `concepts/markdown-routes.md` with the cascade rules and the `@source` directive caveat. Visual demo with three callouts at the bottom of `concepts/showcase.md`. Short header note on `concepts/components` linking back to the canonical pattern.

## 0.0.10

**Accordion rewrite.** `&lt;ngmd-accordion-item&gt;` no longer uses native `&lt;details&gt;` / `&lt;summary&gt;`. The browser's control over content visibility kept fighting CSS transitions. New shape is a signal-driven `&lt;button&gt;` + region `&lt;div&gt;` wired by hand: `aria-expanded` on the trigger, `aria-controls` pointing to the panel, `role="region"` + `aria-labelledby` on the panel. Pure CSS animations, no animation library.

**Symmetric open / close.** Body reveal uses `grid-template-rows: minmax(0, 0fr) → minmax(0, 1fr)` paired with an opacity fade. Both directions move at the same rate because the row fr basis interpolates to the inner wrapper's actual height, not an arbitrary max-height ceiling. 300ms ease-out.

**Chevron cross-fade.** Two stacked Lucide icons (`ChevronDown` closed, `ChevronUp` open) cross-fade via 200ms opacity. Replaces an earlier rotation attempt that occasionally took the long way around between states.

**Focus rings suppressed** on the accordion trigger button so clicking doesn't paint a stray browser-default outline through the animation.

**Help section route layout.** `src/content/help.md` moved to `src/content/help/get-help.md`; root `/help` route is gone. All three help links now live under `/help/get-help`, `/help/contribute`, `/help/sponsor` as siblings, with no parent-child URL ambiguity that previously caused the sidebar's `/help` link to highlight when viewing any subpage.

**Sidebar exact-match active state.** `[routerLinkActiveOptions]="{ exact: true }"` on every sidebar link, so a link only highlights when the URL exactly matches its `href`, not when the URL merely starts with it.

**`prefers-reduced-motion`** zeroes the accordion transitions.

## 0.0.9

**Inline code chips redesigned.** Body inline code (`` `like this` ``) now wears a thin fuchsia gradient border (`#f0abfc → #d946ef → #a21caf`, three stops in the fuchsia hue family) over a clean `--bg` inner fill that matches the page surface exactly. Light mode uses a 1.5px border for clarity against white; dark mode stays at 1px.

**Home install picker.** The CTA section now has a tabbed install command box: npm (default) / pnpm / yarn / bun, each with its simpleicons brand logo. One command renders below at a time. Copy button on the right with a 1.5s "copied" check confirmation. Tab strip width is fixed so it doesn't reflow as you switch between commands.

**Tab active state uses the accent.** Both the new home install picker and the existing `&lt;ngmd-tabs&gt;` component now color the active tab's label and underline with `var(--accent)` (fuchsia in the default theme). Hover-zinc is scoped to inactive tabs only so the active state isn't washed out when the cursor passes over.

**Card icons go neutral.** Swapped Lucide icon color in `&lt;ngmd-card&gt;` and home features grid from `var(--accent)` to `var(--fg)`. Icons read as quiet anchors instead of competing with the brand accent that lives on text and active states.

**Alert visibility in light mode.** Added a thin `zinc-200` border on the top, right, and bottom of `&lt;ngmd-alert&gt;` plus bumped the surface from `bg-zinc-50` to `bg-zinc-100`. Alerts now read as distinct surfaces against a white page instead of nearly-blending into it.

## 0.0.8

**Tabs gained `icon=` and `image=` inputs.** `&lt;ngmd-tab&gt;` now accepts the same `image="&lt;url&gt;"` brand-logo pattern as `&lt;ngmd-card&gt;`, plus `icon="&lt;lucide-name&gt;"` for the Lucide set (`book`, `box`, `code`, `compass`, `file`, `layers`, `lightbulb`, `palette`, `rocket`, `search`, `settings`, `shield`, `sparkles`, `terminal`, `wrench`, `zap`). Icon renders left of the tab label; image takes priority if both are set.

**Build-time code-group tabs gained `image=` too.** Fenced code blocks tagged with `group="install" name="pnpm" image="..."` now render a brand icon next to the tab label, no `&lt;ngmd-tabs&gt;` component needed. Used across welcome, showcase, markdown-routes, installation. Powered by `simpleicons.org/&lt;slug&gt;/&lt;hex&gt;` CDN URLs.

**Demo page renamed to Showcase.** `src/content/concepts/demo.md` → `src/content/concepts/showcase.md`, URL `/concepts/demo` → `/concepts/showcase`. Nav label and every cross-link follow. URL path now matches the doc title.

**Inline code visual.** Inline `` `code` `` chips in markdown use `--bg-muted` background, `--fg` text, `--border-strong` outline, and `font-weight: 500` for clearer pop without the previous accent-tinted look. Sidebar / TOC active-row `--accent-soft` settled at `rgba(217, 70, 239, 0.15)` in both light and dark for visual parity with the prior `bg-fuchsia-500/10` baseline.

**Skills updated.** `ngmd-authoring` now documents tab `icon=` / `image=` inputs and the matching `image=` attribute on fenced `group=` code tabs.

## 0.0.7

**Token-driven theming everywhere.** Every accent-aware class in core components (sidebar, TOC, palette, page footer, pill, card, heading anchors, hero, home page) now reads `var(--accent)`, `var(--accent-strong)`, `var(--accent-soft)`, `var(--accent-gradient)`, or `var(--accent-gradient-soft)` instead of hardcoded `fuchsia-*` Tailwind utilities. Swap one token in `src/styles.css` and the whole site re-skins. Per-variant components (`callout`, `alert`, `badge`) keep their literal severity colours by design.

**Two new tokens.** `--accent-strong` (deeper shade for active text on light surfaces) and `--accent-gradient-soft` (low-opacity gradient for hero washes and the home spotlight). Both declared in `:root` and `.dark`.

**Help folder reorganised.** Section parent stays at root, children move under a same-named folder: `src/content/help.md` → `/help`, `src/content/help/contribute.md` → `/help/contribute`, `src/content/help/sponsor.md` → `/help/sponsor`. URL pattern now matches the nav grouping. README community links and cross-page links updated.

**Marked parsing fix.** Backtick-wrapped custom-element references like `` `&lt;ngmd-callout&gt;` `` in prose were leaking out as real DOM elements through marked's parser, breaking page layouts. Angle brackets inside backticks now escape to `&lt;` / `&gt;` across the changelog, demo, markdown-routes, and technologies pages.

**Code-copy scoped to markdown.** The `app-code-copy` DOM walker now targets `analog-markdown` / `analog-markdown-route` pres only, so it doesn't duplicate the copy button that `NgmdCodeBlock` ships internally on TS-page instances.

**Code-block visibility fix.** The `:not(:defined)` flash-prevention CSS rule that hides custom elements until they upgrade was still listing `ngmd-code-block` after it was removed from `@angular/elements` registration in 0.0.6, which left every code-block invisible forever. Rule entry removed.

**Theming doc rewritten.** [/concepts/theming](/concepts/theming) now lists all six accent tokens with what each is for, shows the `text-[color:var(--accent)]` / `bg-[color:var(--accent-soft)]` consumption pattern, calls out the inline-style fallback for gradient images, and explains the `!` important modifier needed when an active state has to beat a static base utility.

**Skills updated.** `ngmd-new-site` and `ngmd-authoring` skills now reflect the seventeen-component count, the section + folder routing pattern, the closing-tag requirement for custom elements in markdown, and the full accent token set.

## 0.0.6

**Site footer.** `&lt;app-site-footer&gt;` renders on every route: `© {year} Erkam Yaman. Released under the MIT License.` on the left, `erkamyaman/ngmd` GitHub link on the right.

**Code-block copy button.** `&lt;ngmd-code-block&gt;` ships its own copy button. Sits inline in the header bar when `header` is set, floats top-right otherwise. Independent of the markdown DOM walker, so it works for TS-page instances too.

**Self-closing custom-element tags fixed.** HTML parsers don't honor `&lt;ngmd-pill ... /&gt;` syntax, so adjacent siblings were nesting inside the previous one. All 34 self-closing instances across `&lt;ngmd-pill&gt;`, `&lt;ngmd-video&gt;`, `&lt;ngmd-image&gt;` now use explicit closing tags. Pill rows now actually space out.

**Code-block freed from Custom Element registration.** `ngmd-code-block` is imported directly in TS pages and removed from `@angular/elements` to let multi-line `[code]` signal-input bindings propagate reliably. Fenced ` ``` ` blocks remain the recommended path for markdown.

**Showcase rename.** `/concepts/showcase` renamed to "Showcase" in the sidebar, home CTA, and every cross-link. URL path unchanged.

**Doc fact-check.** Removed six hallucinated claims about component counts and Custom Element coverage. The honest number is 17 NgmdUi components, 16 of which render inline in markdown.

## 0.0.5

**Tabs work in markdown.** Rewrote `&lt;ngmd-tabs&gt;` / `&lt;ngmd-tab&gt;` so each tab is a real component (not a `&lt;ng-template ngmdTab&gt;` directive). Survives `@angular/elements` upgrade and renders inline in `.md` body.

**Cards gained icon and image inputs.** Pass `icon="&lt;lucide-name&gt;"` for a Lucide glyph tinted fuchsia, or `image="&lt;url&gt;"` for a full-colour brand SVG. Card backgrounds and grid heights aligned across siblings.

**Alerts redesigned to adev shape.** Severity icon + uppercase tag (`INFO`, `WARNING`, `CRITICAL`, `HELPFUL`, `IMPORTANT`) prefixed inline with the body prose. Same visual as `docs-callout`.

**Site frame additions.** `&lt;app-source-actions&gt;` floats pencil + `&lt;&gt;` icons at top-right of every docs route (edit on GitHub / view source on GitHub). The bottom "Edit this page" link is gone; `last-updated` parked.

**Doc pages reshuffled.** `/support` split into `/help` (get-help) and `/sponsor` (give-help). New `/contribute` page with `CONTRIBUTING.md` at repo root. `/stack/overview` rewritten around architecture. `/stack/installation` tucks Path B inside an accordion. `/stack/technologies` collapsed to 3 cards + tables. Brand SVGs added to all tech rows.

**Spartan UI removed.** `&lt;ngmd-tabs&gt;` rebuilt with hand-rolled ARIA + arrow / Home / End keyboard navigation. One less dep to pin.

<ngmd-callout type="tip" title="Migrating from an earlier scaffold">
  If you scaffolded with <code>create-ngmd@0.0.1</code> or <code>0.0.2</code> you'll have a thin <code>.page.ts</code> wrapper per markdown route. Delete them and let the catch-all handle every prose page. The named <code>index.page.ts</code> and any TypeScript-driven pages keep their files.
</ngmd-callout>

## 0.0.4

A new `src/app/pages/[...slug].page.ts` catch-all serves every markdown page. The path under `src/content/` becomes the URL: drop `concepts/theming.md` and `/concepts/theming` resolves to it, no per-file wrapper required. Content reorganised into route-matching subfolders (`concepts/`, `stack/`, `getting-started/`).

The build pipeline followed suit. `link-guard`, `page-meta`, and `sitemap` plugins now walk the content tree directly instead of consulting a hardcoded route map, so adding a new page is one filesystem change.

Three new authoring components shipped: `ngmd-accordion`, `ngmd-card-grid`, and `ngmd-badge`. All NgmdUi components also render inline in `.md` files via Angular Elements registration.

Two agent skills shipped under `skills/` (`ngmd-new-site` and `ngmd-authoring`), mirroring the format `angular/skills` uses. Inline code inside headings now renders in the brand accent instead of the gray inline-code box.

## 0.0.x · May 2026 <ngmd-badge variant="beta">Beta</ngmd-badge>

<ngmd-card-grid columns="2">
  <ngmd-card icon="rocket" title="Distribution">
    <code>create-ngmd@0.1.3</code> on npm. Scaffold with <code>pnpm create ngmd&#64;latest my-docs</code> (also <code>npm</code>, <code>yarn</code>, <code>bun</code>). Live at <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">ngmd.netlify.app</a>.
  </ngmd-card>
  <ngmd-card icon="box" title="Authoring">
    Seventeen Angular components under <code>src/app/ui/</code>. Code fences gained <code>file="..."</code> imports, <code>group="..."</code> tabs, <code>{1,3-5}</code> line highlighting, and <code>*Keyword</code> auto-linking.
  </ngmd-card>
  <ngmd-card icon="layers" title="Site frame">
    Sidebar accordion, breadcrumb, scroll-spy TOC, Cmd+K command palette, and a page footer per route with prev/next, edit-on-github, and last-updated (from <code>git log</code>).
  </ngmd-card>
  <ngmd-card icon="shield" title="Build guards">
    Internal anchors must resolve to real headings, external HTML anchors must carry <code>target="_blank"</code>. Sitemap and <code>robots.txt</code> emit automatically.
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming">
    CSS-variable tokens, light/dark/auto cycle with no-flash boot script, fuchsia accent. Native View Transitions API for route crossfades.
  </ngmd-card>
  <ngmd-card icon="sparkles" title="Skills" link="/ai/agent-skills" cta="Read">
    <code>ngmd-new-site</code> and <code>ngmd-authoring</code> for Claude Code, Gemini CLI, and Antigravity.
  </ngmd-card>
</ngmd-card-grid>

## Roadmap

<ngmd-accordion>
  <ngmd-accordion-item title="Next" open>
    Keyboard navigation polish for the Cmd+K palette (arrow / Enter), custom domain (<code>ngmd.dev</code>), OG image auto-generation per page.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="v1">
    Versioning, i18n, offline search index (Pagefind or Orama) with optional Algolia adapter, API reference auto-generation, published as <code>&#64;ngmd/core</code>, <code>&#64;ngmd/theme</code>, <code>&#64;ngmd/cli</code>.
  </ngmd-accordion-item>
</ngmd-accordion>

## Stack <ngmd-badge variant="stable">Pinned</ngmd-badge>

AnalogJS 2.5, Vite 8, Angular, Tailwind v4, Shiki 1.29.2, Marked.
