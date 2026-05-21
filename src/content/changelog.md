---
title: Changelog
---

# Changelog

Release notes and version history for NgMd.

## Unreleased

### Added

- **Authoring components** under `src/app/ui/`: callout (5 variants), alert (5 severities), card (linked + plain), tabs on Spartan brain primitive, pill row, workflow with numbered steps, hero with optional gradient, code-block with lazy shiki + dual-theme highlighting, video (YouTube / Vimeo URL normalisation), image (figure + caption + lazy load)
- **Marked extensions** for inline media: `<ngmd-video src="..."/>` and `<ngmd-image src="..." alt="..." caption="..."/>` — usable directly inside `.md` files
- **Page footer** (`app-page-footer`) on every docs route: prev/next sibling cards derived from `ngmd.config.ts` nav, "Edit on GitHub" link, last-updated date pulled from `git log -1 --format=%cs`
- **Heading anchor copy** on hover for h1/h2/h3 — click the `#` icon to copy the deep link to clipboard
- **Build-time internal link guard** — Vite plugin that errors on broken in-page (`#fragment`) and cross-page (`/route#fragment`) markdown links
- **Build-time page-meta** virtual module (`virtual:ngmd/page-meta`) — emits per-route `editUrl` and `lastUpdated` baked at build time
- **Sitemap and robots.txt** auto-generated into the client bundle from the same route enumeration as page-meta
- **Fuchsia accent** wired through sidebar active item, TOC active item, command palette row highlight, prev/next hover border, heading anchor hover, and markdown link focus ring
- **`create-ngmd` scaffolder** under `create-ngmd/` — Node 20 builtins only, copies a slimmed template, rewrites placeholders, prints next-steps tailored to the detected package manager

### Changed

- Anchor scroll uses `ViewportScroller.setOffset([0, 88])` so headings land below the sticky header. CSS `scroll-margin-top` is ignored by Angular's router-driven anchor scrolling.
- `history.replaceState` calls in TOC and command palette now pass absolute paths instead of bare `#fragment`. The `<base href="/">` in `index.html` would otherwise resolve relative hashes to `/#fragment` and strip the path.
- Shiki dual-theme: `github-light` and `github-dark` emitted in one pass; CSS swaps token colours via `.dark .shiki span` so the theme toggle works on already-rendered code without a re-render.

## Coming next

- `npx create-ngmd` published to npm
- Public deploy of ngmd.dev
- Code-block line highlighting (` ```ts {3-5}`)
- Search ranking improvements (fuzzy + weighted) in Cmd+K palette

## v1 (later)

- npm publish as `@ngmd/core`, `@ngmd/theme`, `@ngmd/cli`
- Versioning support
- i18n
- Search adapter (Orama offline + Algolia DocSearch optional)
- API reference auto-generation (the ng-doc-style differentiator)

## v0 (2026-05)

Initial scaffolding:

- AnalogJS markdown content collections on Vite 8 + Angular 21
- Spartan UI brain installed (`@spartan-ng/brain` `0.0.1-alpha.694`)
- Shiki code highlighting pinned to `1.29.2` (`bash`, `md`, `json`, `ts`, `html`, `css`)
- Tailwind v4 with class-based dark mode (`@variant dark`)
- Light / dark / auto theme cycle with no-flash inline boot script
- Cmd+K command palette with content-aware search (pages + headings + body snippets)
- Code-block copy buttons (runtime enhancer)
- External-link runtime enhancer plus build-time external-link guard
- Right-side on-page TOC with scroll-spy
- Mobile drawer for sidebar plus collapsible "On this page"
- Breadcrumb derived from current route
- Sidebar accordion driven by `ngmd.config.ts`
- Translucent sticky header with `backdrop-blur-sm`
- Hexagon logo with rose → fuchsia → purple gradient stroke, Geist Mono wordmark
- 404 page with chrome-hidden layout
- Open Graph + meta tags, SVG favicon
- License, README, package.json metadata
