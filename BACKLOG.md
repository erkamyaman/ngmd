# NgMd — Feature Backlog

A comprehensive list of features we could add. Pulled from adev, ng-doc, VitePress, Starlight, Nextra, Docusaurus. Not all of these will ship. Use this as a menu to pick from.

Status legend: ✅ done · 🟡 partial · ❌ not done

---

## 1. Authoring components

NgMd's model: prose lives in `.md`, chrome lives as Angular components composed in `.page.ts`. The adev pattern of custom HTML tags inside markdown was explored and rejected in May 2026 (dual-pipeline marked instances plus HTML-escape friction made it more cost than win). Inline media (`<ngmd-video>`, `<ngmd-image>`) is the exception, kept as marked extensions because the tags are self-closing leaves with no markdown body.

Shipped as Angular components under `src/app/ui/`:

- ✅ `<ngmd-callout type="info|tip|success|warning|danger" title="...">` — bordered box with coloured stripe
- ✅ `<ngmd-alert severity="info|warning|critical|helpful|important">` — single-line banner
- ✅ `<ngmd-card title="..." link="..." cta="...">` — bordered card, optional router link
- ✅ `<ngmd-tabs>` + `<ng-template ngmdTab="...">` — hand-rolled tabs with ARIA roles, arrow-key navigation, and Home/End shortcuts
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
- ❌ Combined `file=` + `{1,3-5}` line highlight on the same fence
- ❌ Diff view via ` ```diff ` (shiki supports natively, just need CSS)

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

- 🟡 Cmd+K palette — works, but lacks fuzzy matching, weighted ranking, result snippet highlighting
- ❌ Algolia DocSearch integration (alternative search adapter)
- ❌ Pagefind / Orama offline search index built at build time
- ❌ Search result keyboard navigation (arrows + enter)
- ❌ Recent searches / favorites

## 5. Library-author features (where ng-doc beats us)

- ❌ API reference auto-generation from JSDoc / ts-morph (the BIG ng-doc feature — explicitly punted)
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
