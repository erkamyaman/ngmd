# Road to 1.0

What needs to land between 0.1.7 (current) and a 1.0 release. Companion to [BACKLOG.md](BACKLOG.md) (menu of every candidate feature) and [PLAN.md](PLAN.md) (concrete work plan for the next sprint).

The framing: 1.0 is the release where NgMd stops being "the docs starter for Angular apps" and becomes "the docs starter for any Angular project, including the libraries". That means we ship three load-bearing features, declare the public surface stable, hit a real quality bar, and bundle the polish that every modern docs site is judged against.

Estimated runway: 4-5 months of focused work.

---

## 1. Load-bearing features

The two things missing from 0.1.7 that block 1.0.

### 1.1 API reference auto-generation

The single biggest missing capability for library authors. NgMd can render their guides today; it can't render their type surface.

**Config shape.** New file at repo root:

```ts
// ngmd.api.ts
import {defineApi} from 'ngmd/api';

export default defineApi({
  scope: ['packages/*/src/lib/**/*.ts'],
  exclude: ['**/*.spec.ts', '**/internal/**'],
  basePath: '/api',
  groupBy: 'package',
  badgesFromJsDoc: ['deprecated', 'experimental', 'beta'],
});
```

**Pipeline.** New Vite plugin `api-gen.plugin.ts` runs in `buildStart`:

1. Load `ngmd.api.ts` via Vite's module loader (errors if the file is missing → API gen is silently off, no scope errors).
2. Glob `scope` minus `exclude`, run each file through ts-morph (`Project.addSourceFileAtPath`).
3. For each exported symbol, build a `SymbolRecord`: kind (`class | interface | function | const | type | enum | signal-input | standalone-component`), name, JSDoc, signature, source file, source line, status badges parsed from JSDoc tags.
4. Emit one virtual route per symbol via Vite's virtual-module mechanism (`virtual:ngmd/api/<group>/<name>.page`), wired into AnalogJS's catch-all so the routes appear without touching `src/app/pages/`.
5. Emit an aggregated symbol index for the Cmd+K palette (`virtual:ngmd/api-index`).

**Rendering.** New components under `src/app/ui/api/`:

- `<api-signature>` – type signature with syntax highlighting + clickable type links.
- `<api-prop-table>` – method/property tables with name + type + description + status.
- `<api-jsdoc>` – formatted JSDoc body (markdown rendered).
- `<api-related>` – cross-references to related symbols by kind.

Each emitted page composes those four primitives.

**Decisions to lock before coding.**

- Parser: ts-morph or Angular's compiler API? Lean ts-morph (lighter, simpler) for v1; revisit if signal-input / standalone-component shapes need the Angular compiler.
- Re-exports: follow them to the original definition or surface as alias? Follow to original, mark as `@reexport from <path>`.
- Generic parameters: render inline (`Foo<T extends Bar>`) or expanded (one row per type param)? Inline.
- Tag for hidden-from-API symbols: `@internal` in JSDoc → omit entirely.

**Edge cases.**

- Files outside `scope` that get re-exported through a barrel inside scope: include them, marked as out-of-scope source.
- Multiple symbols with the same name (overloads): merge into one page with grouped signatures.
- Markdown in JSDoc: render through the same marked pipeline as `.md` pages, including code fence Shiki highlighting.

**Pairs with.** Symbol search in the palette (1.4 in BACKLOG section 4). The API index emitted here is the palette's input; do both in the same sprint to avoid re-emitting twice.

Estimate: 3 weeks. Risk: ts-morph performance on large monorepos (mitigation: incremental parse cache keyed on file mtime).

### 1.2 Versioned docs

Without this you can't host any post-1.0 project's docs that ever introduces a breaking change. Listed as "v2 territory" in BACKLOG; realistically that's denial.

**URL shape.** `/v/<version>/<route>` with `/v/latest` as a permanent alias to the current default version. Unversioned paths (`/concepts/components`) 301 to `/v/latest/concepts/components` so existing bookmarks survive a version cut.

**Content layout.** Versioned content lives under `src/content/<version>/`:

```
src/content/
  v1.0/
    welcome.md
    concepts/...
  v2.0/
    welcome.md
    concepts/...
  shared/                  // version-agnostic pages (legal, about)
    privacy.md
```

Frontmatter-driven versioning was the alternative; folders won because they make "diff between v1 and v2" a real `git diff src/content/v1.0 src/content/v2.0` instead of a frontmatter-scan exercise, and because the catch-all route already maps URL to folder cleanly.

**Config shape.** `ngmd.config.ts` gains a `versions` block:

```ts
versions: {
  current: 'v2.0',
  list: [
    {label: 'v2.0', slug: 'v2.0', status: 'current'},
    {label: 'v1.0', slug: 'v1.0', status: 'maintenance'},
    {label: 'v0.x', slug: 'v0.x', status: 'archived'},
  ],
  navByVersion: {
    'v2.0': [...],
    'v1.0': [...],
  },
}
```

Sidebar, breadcrumb, prev/next, palette all key off the active version.

**Catch-all rewrite.** `[...slug].page.ts` parses the leading segment as a version slug; if it matches a registered version, that's the active version + the rest is the content path. If not, fall through to existing behaviour (with the 301 to `/v/latest` for content that exists under the current version).

**Switcher UI.** Header dropdown next to the theme toggle. Active version label as trigger; menu lists every entry from `versions.list` with the `status` rendered as a chip. Picking a version navigates to the same content path under the new version, or falls back to `/v/<picked>/welcome` if that page doesn't exist in the picked version.

**Sitemap.** One `<url>` entry per (version × page) combination. The current version's pages also get `<xhtml:link rel="alternate">` entries pointing at the same content in other versions for SEO.

**Search index.** Build the Orama index per-version; the palette filters by active version unless the user toggles "search all versions".

**Decisions to lock.**

- Version slug format: `v1.0` vs `1.0` vs semver `1.0.0`? Pick `v1.0` (matches Docusaurus convention, reads cleanly in URLs).
- "Latest" alias: redirect to current version, or serve current version content directly under `/v/latest`? Redirect — keeps canonical URLs unambiguous for search engines.
- Archived versions: stay rendered or fully removed at build time? Stay rendered with a banner: "This is v0.x, archived. Latest is v2.0."

Estimate: 1-2 weeks.

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

- **Frontmatter overrides** for `title`, `description`, `layout`. Authors expect this. (~1 day.)
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

### Sprint 1: versioned docs (1-2 weeks)

Rework the catch-all to parse `/v/<version>/` prefixes. Add the version switcher, version-aware sidebar (`navByVersion`), archived banner, redirect from unversioned URLs, and per-version sitemap entries.

### Sprint 2: API reference auto-generation (3 weeks)

The headline 1.0 feature. Build the scope file format, the parser, the virtual route emitter, the page templates, the symbol index for palette search.

### Sprint 3: polish bundle (~2 weeks)

Frontmatter overrides first (everything else leans on the override format). Then sweep the rest of the polish items.

### Sprint 4: stability sweep (2 weeks)

NgmdUi audit + CSS token audit + plugin signature audit. Rename what needs renaming with aliases, freeze the rest. Write `/concepts/components` stability table.

### Sprint 5: quality bar (2-3 weeks)

Test coverage, Lighthouse pass, axe-core sweep. Land them in that order because tests give you the confidence to refactor for Lighthouse, and Lighthouse polish often improves a11y for free.

### Sprint 6: release prep (1 week)

Migration guide, release blog post, BACKLOG.md cleanup, version bump, npm publish, push to main, announcement.

Total: ~11-13 weeks.

---

## 7. Definition of done for 1.0

A release qualifies as 1.0 when all of the following are true.

- [ ] API reference auto-generation shipped, with at least one real Angular library using it end-to-end as a smoke test
- [ ] Versioned docs shipped (multi-version routing, switcher, sidebar configs)
- [ ] NgmdUi inputs, CSS tokens, plugin signatures all frozen and documented as stable
- [ ] Migration guide from 0.1.7 published
- [ ] Test coverage on every NgmdUi component + integration on routing + Playwright golden path + API auto-gen fixtures
- [ ] Lighthouse ≥95 on the deployed site
- [ ] axe-core clean on every component + site-chrome surface
- [ ] Polish bundle shipped (frontmatter overrides, Mermaid, math, diff, print, reading time, restored keyboard nav)
- [ ] BACKLOG.md updated: every 1.0-target item marked ✅ or moved to "Punted past 1.0"
- [ ] Release blog post drafted

When this list is green, version stamps as 1.0.0.

