# NgMd — Feature Backlog

A comprehensive list of features we could add. Pulled from adev, ng-doc, VitePress, Starlight, Nextra, Docusaurus. Not all of these will ship. Use this as a menu to pick from.

Status legend: ✅ done · 🟡 partial · ❌ not done

---

## 1. Markdown-native components (adev / ng-doc style)

Authors write a custom tag in `.md` and a marked extension renders it inline. We currently only have Angular-component versions used at page level — these would extend the same components to be authorable from inside markdown.

- ❌ `<docs-video src="..." title="..."/>` — YouTube / Vimeo / MP4 embed
- ❌ `<docs-image src="..." alt="..." caption="..."/>` — figure with caption + lazy load
- ❌ `<docs-decorative-header title="..." imgSrc="..."/>` — page hero with background image
- ❌ `<docs-code-multifile>` — tabbed multi-FILE code blocks (different from our template-tab pattern)
- ❌ `<docs-workflow>` — numbered step guide with progress indicator
- ❌ `<docs-alert type="...">` — adev's alert variant (similar to but distinct from our callout)
- ❌ `<docs-card-container>` with `<docs-card>` children inside markdown
- 🟡 `<docs-callout>` — Angular component done; marked-extension version pending
- 🟡 `<docs-tabs>` — Angular component done; marked-extension version pending
- 🟡 `<docs-pill-row>` — Angular component done; marked-extension version pending

## 2. Page chrome (every docs starter has these)

- ❌ Previous / Next page navigation at the bottom of each doc page (auto-derived from `ngmd.config.ts` nav)
- ❌ "Edit on GitHub" link per page (link to source `.md` file in repo)
- ❌ "Last updated" timestamp pulled from git history
- ❌ Reading time estimate (word count / 200 wpm)
- ❌ Heading anchor copy-link — hover an h2/h3 to reveal a `#` icon that copies the URL with fragment
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

- ❌ API reference auto-generation from JSDoc / ts-morph (the BIG ng-doc feature)
- ❌ Keyword auto-linking — mentions of `SomeService` become links to its API page
- ❌ Symbol search in palette
- ❌ Component playgrounds with editable code + Stackblitz launcher
- ❌ Interactive props/args/controls (Storybook-style)
- ❌ Status badges per component (alpha / beta / stable / deprecated)

## 6. Build / infrastructure

- ✅ Build-time external-link guard (ours is `vite.config.ts`)
- ❌ Build-time anchor validation — check every `#fragment` link points to a real heading
- ❌ Build-time broken-link check across all markdown
- ❌ Sitemap.xml auto-generation
- ❌ robots.txt
- ❌ RSS feed for changelog / blog
- ❌ Service worker / PWA support
- ❌ OG image auto-generation per page
- ❌ Twitter card meta auto-fill
- ❌ Analytics integration hooks

## 7. Theming / branding

- ✅ CSS-variable theme tokens (`--bg`, `--fg`, `--muted`, `--border`, `--primary`, `--accent`, `--radius-*`, `--font-*`)
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

- ❌ `npx create-ngmd` scaffolder for new projects
- ❌ `ngmd add <component>` CLI for shadcn-style component installation
- ❌ `ngmd new page <slug>` CLI to generate a new markdown page + sidebar entry
- ❌ VS Code snippets for common docs patterns (callout, tabs, pill row)

## 10. Polish / nice-to-have

- ❌ Animated transitions between routes (fade-in, etc.)
- ❌ Loading skeleton while markdown content loads
- ❌ Back-to-top button
- ❌ Keyboard shortcut help dialog (press `?`)
- ❌ Inline code-block copy success toast
- ❌ Code-block line numbers
- ❌ Code-block line highlighting (` ```ts {3-5}`)
- ❌ Code-block diff view (` ```diff` blocks already supported by Shiki)
- ❌ Inline `Show source` toggle on component demos
- ❌ Lighthouse audit + a11y compliance pass

## 11. Already shipped (for reference)

- ✅ AnalogJS + Vite + Angular 21 + pnpm/npm/yarn/bun support
- ✅ Markdown content collections via `src/content/`
- ✅ Shiki syntax highlighting (bash, md, json, ts, html, css)
- ✅ Custom marked renderer wiring
- ✅ Tailwind v4 + class-based dark mode + `@variant dark`
- ✅ Light / dark / auto theme cycle with no-flash inline boot script
- ✅ Translucent sticky header with backdrop-blur
- ✅ Sidebar accordion driven by `ngmd.config.ts`
- ✅ Breadcrumb derived from current route
- ✅ Right-side on-page TOC with scroll-spy
- ✅ Mobile drawer for sidebar
- ✅ Mobile "On this page" collapsible
- ✅ Cmd+K command palette with content-aware search (pages + headings + body snippets)
- ✅ Code-block copy buttons on every `<pre>`
- ✅ External links auto-targeted to a new tab (runtime enhancer)
- ✅ Build-time external-link guard (Vite plugin)
- ✅ Smooth scroll on page navigation
- ✅ Body scroll lock when palette open
- ✅ 404 page with chrome-hidden layout
- ✅ Hexagon logo with Angular-gradient stroke
- ✅ Geist Mono wordmark
- ✅ SVG favicon
- ✅ License, README, package.json metadata
- ✅ Component vocabulary: callout (5 variants), tabbed code blocks, pill row
- ✅ Components showcase page with Shiki-highlighted source snippets
- ✅ Open Graph + meta tags
