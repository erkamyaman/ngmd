# Road to 1.0

What needs to land between 0.1.7 (current) and a 1.0 release. Companion to [BACKLOG.md](BACKLOG.md) (menu of every candidate feature) and [PLAN.md](PLAN.md) (concrete work plan for the next sprint).

The framing: 1.0 is the release where NgMd stops being "the docs starter for Angular apps" and becomes "the docs starter for any Angular project, including the libraries". That means we ship four load-bearing features, declare the public surface stable, hit a real quality bar, and bundle the polish that every modern docs site is judged against.

Estimated runway: 4-5 months of focused work.

---

## 1. Load-bearing features

The four things missing from 0.1.7 that block 1.0.

### 1.1 API reference auto-generation

The single biggest missing capability for library authors. NgMd can render their guides today; it can't render their type surface.

- Opt-in `ngmd.api.ts` scope file globs TS sources.
- Parse via `ts-morph` or the Angular compiler API.
- Emit virtual `.page.ts` routes per class / interface / function / signal-input / standalone-component.
- Render `@deprecated` / `@experimental` / `@beta` JSDoc tags as inline status badges.
- Symbol search in the Cmd+K palette.
- Sidebar group per package / module with `status:` chips reflecting the inline badges.
- API-tier `*Keyword` auto-linking once the symbol index exists.

Estimate: 3 weeks.

### 1.2 Versioned docs

Without this you can't host any post-1.0 project's docs that ever introduces a breaking change. Listed as "v2 territory" in BACKLOG; realistically that's denial.

- `v1/` / `v2/` content folders, or frontmatter-driven version field.
- Version switcher in the header.
- Per-version sidebar config in `ngmd.config.ts`.
- Default version routing + 301 redirects from unversioned paths.

Estimate: 1-2 weeks.

### 1.3 i18n / locale routing

Roughly half the projects evaluating a docs starter want multilingual support on day one.

- Locale-prefixed routes (`/en/`, `/tr/`).
- Header locale dropdown.
- Translation memory file or source-of-truth tracking so translators see what's drifted.
- Locale-aware sitemap + canonical / hreflang tags.

Estimate: 1-2 weeks. Pairs naturally with versioning since both reshape the routing layer; do them in the same sprint.

### 1.4 OG image auto-generation

Per-page social cards from title + section + accent. Every modern docs site has this. The day after NgMd starts showing up in shared links, the missing OG images become the first thing people notice.

- Build-time generation via Satori + Resvg.
- Per-page template that reads frontmatter title / description.
- Frontmatter override for custom `og:image` per page.

Estimate: 1 week.

---

## 2. Stability declaration

The "1.0" part of 1.0. None of this builds features; it locks the public contract.

### 2.1 NgmdUi public API freeze

Audit every input across all seventeen components. For each:

- Confirm the name reads correctly out loud (will we still want this name in 2027?).
- Confirm the default reflects the most common case.
- Deprecate or rename anything still in flux. Aliases stay supported through 1.x; the canonical name is what we promise.

Document each component's stable surface on `/concepts/components` and tag the page with `status: stable`.

### 2.2 CSS token freeze

Lock the token surface that consumers theme against:

- `--bg`, `--bg-muted`, `--fg`, `--muted`, `--border`, `--border-strong`
- `--accent`, `--accent-strong`, `--accent-soft`, `--accent-gradient`, `--accent-gradient-soft`
- `--radius-*`, `--font-*`

Document every token with its semantic role on `/concepts/theming`. No renames within 1.x; new tokens get new names.

### 2.3 Build plugin freeze

Treat the six plugin signatures (`pageMetaPlugin`, `internalLinkGuard`, `externalLinkGuard`, `sitemapPlugin`, `searchIndexPlugin`, `rawMdPlugin`) as public API. Anyone scaffolding can rely on them. Document on `/stack/installation`.

### 2.4 Migration guide

Write `MIGRATING.md` covering every 0.x to 1.0 change. Include a checklist for users upgrading from 0.1.7.

---

## 3. Quality bar

Things that don't show up in release notes but a 1.0 has to be able to stand behind.

### 3.1 Test coverage

Currently negligible. Add:

- Unit tests on each NgmdUi component (input handling, ARIA, keyboard nav). One spec per component.
- Integration tests on the catch-all route, content loading, link guards, page-meta.
- Playwright golden-path e2e: home → sidebar nav → markdown route → palette search → TOC click → prev/next.
- API reference auto-gen fixtures: a tiny sample TS source + expected emitted routes, asserted on every build.

### 3.2 Lighthouse pass

Target ≥95 on perf, a11y, best-practices, SEO on the deployed `ngmd.netlify.app`. Tighten:

- Bundle size budget (currently ~258 kB gzipped on the index route).
- Lazy-load Shiki language chunks (largely already done).
- Defer non-critical CSS.

### 3.3 Accessibility audit

Run axe-core over every NgmdUi component in isolation plus every site-chrome surface (header, sidebar, palette, footer, TOC, breadcrumb). Fix every violation. Document the accessibility contract per component.

---

## 4. Polish bundle

Ships with 1.0. Each one is small individually; together they close the gap to "feels like a serious 1.0 docs site".

- **Frontmatter overrides** for `title`, `description`, `og:image`, `layout`. Authors expect this. (~1 day.)
- **Mermaid rendering.** ` ```mermaid` blocks via a marked extension. (~1 day.)
- **Math rendering.** KaTeX for ` ```math` blocks and `$...$` inline. (~1 day.)
- **Diff view** via ` ```diff `. Shiki emits the tokens; needs CSS. (~half day.)
- **Search keyboard navigation.** Restored from the 0.1.2 revert, with the focus + scroll polish that was missing the first time. (~1-2 days.)
- **Print stylesheet.** One CSS file scoped to `@media print`. (~half day.)
- **Reading time estimate.** Word count / 200 wpm, shown next to the page title. (~half day.)

Total polish bundle: ~2 weeks.

---

## 5. Punted past 1.0

Explicitly not in scope. Documented here so they stop being asked about for 1.0.

- `ngmd add <component>` / `ngmd new page <slug>` CLIs
- Service worker / PWA
- Footnotes, emoji shortcodes, definition lists, task list rendering
- Mermaid lightbox, image lightbox on click
- Theme presets / palettes
- RTL language support
- Brand kit page
- Tweet / CodePen / CodeSandbox embeds
- Storybook-style interactive controls
- "Was this page helpful?" widget
- VS Code snippets
- Component playgrounds with editable code

---

## 6. Sequencing

Suggested order. Items in the same sprint can be parallelised by a single maintainer over their respective weeks; the boundaries between sprints are barriers because each leans on the previous.

### Sprint 1: routing rework (3-4 weeks)

Versioned docs (1.2) + i18n locale routing (1.3) land together because both reshape the same routing layer. Doing them in series would mean ripping the same code apart twice.

### Sprint 2: API reference auto-generation (3 weeks)

The headline 1.0 feature. Build the scope file format, the parser, the virtual route emitter, the page templates, the symbol index for palette search.

### Sprint 3: OG image auto-generation + polish bundle (~3 weeks)

OG image generator first (depends on the frontmatter override format from the polish bundle landing in parallel). Then sweep the rest of the polish items.

### Sprint 4: stability sweep (2 weeks)

NgmdUi audit + CSS token audit + plugin signature audit. Rename what needs renaming with aliases, freeze the rest. Write `/concepts/components` stability table.

### Sprint 5: quality bar (2-3 weeks)

Test coverage, Lighthouse pass, axe-core sweep. Land them in that order because tests give you the confidence to refactor for Lighthouse, and Lighthouse polish often improves a11y for free.

### Sprint 6: release prep (1 week)

Migration guide, release blog post, BACKLOG.md cleanup, version bump, npm publish, push to main, announcement.

Total: ~14-16 weeks.

---

## 7. Definition of done for 1.0

A release qualifies as 1.0 when all of the following are true.

- [ ] API reference auto-generation shipped, with at least one real Angular library using it end-to-end as a smoke test
- [ ] Versioned docs shipped (multi-version routing, switcher, sidebar configs)
- [ ] i18n shipped (locale routing, switcher, sitemap)
- [ ] OG image auto-generation shipped
- [ ] NgmdUi inputs, CSS tokens, plugin signatures all frozen and documented as stable
- [ ] Migration guide from 0.1.7 published
- [ ] Test coverage on every NgmdUi component + integration on routing + Playwright golden path + API auto-gen fixtures
- [ ] Lighthouse ≥95 on the deployed site
- [ ] axe-core clean on every component + site-chrome surface
- [ ] Polish bundle shipped (frontmatter overrides, Mermaid, math, diff, print, reading time, restored keyboard nav)
- [ ] BACKLOG.md updated: every 1.0-target item marked ✅ or moved to "Punted past 1.0"
- [ ] Release blog post drafted

When this list is green, version stamps as 1.0.0.
