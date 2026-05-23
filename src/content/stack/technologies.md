---
title: Technologies
---

# Technologies

The libraries and tools NgMd bundles by default.

## Runtime

- **Angular** v21+: the framework.
- **AnalogJS** 2.5+: meta-framework providing file-based routing, SSR/SSG, and markdown content collections.
- **Vite** 8: dev server and build tool.

## Styling

- **Tailwind v4**: utility CSS with `@variant dark` for class-based dark mode.
- **@tailwindcss/typography**: `prose` styles for rendered markdown.

## Components

- **@spartan-ng/brain** `0.0.1-alpha.694`: headless, accessible primitives. NgMd uses the tabs primitive for the authoring components' tab UI.
- **lucide-angular**: icon set used throughout the site frame.

## Content pipeline

- **marked**: markdown parser.
- **marked-shiki**: bridge that runs Shiki over fenced code blocks at build time.
- **shiki** `1.29.2`: VS Code-grade syntax highlighting. Pinned because newer 4.x conflicts with `@analogjs/platform` 2.5's peer dep.
- **front-matter**: frontmatter parser used by AnalogJS content collections.

## Marked extensions

Custom extensions wired into the marked pipeline:

- `<ngmd-video>`, `<ngmd-image>` (runtime): inline media tags
- `*Keyword` auto-linking (runtime): declared in `ngmd.config.ts`
- Code-fence `file="..."` imports, `group="..."` tabs, `{1,3-5}` line highlighting (build-time, shiki pre-rendered)

## Build pipeline

Vite plugins committed alongside `vite.config.ts`:

- **externalLinkGuard**: errors on raw external anchors missing `target="_blank"`
- **internalLinkGuard**: errors on broken in-page and cross-page anchor fragments
- **pageMetaPlugin**: emits `virtual:ngmd/page-meta` with `editUrl` + `lastUpdated` per route, derived from `git log`
- **sitemapPlugin**: writes `sitemap.xml` and `robots.txt` into the client bundle

## Distribution

- **create-ngmd**: the scaffolder. `pnpm create ngmd@latest my-docs`. Built on Node 20 builtins, zero npm deps.

## Package management

- **pnpm**: fast, disk-efficient package manager. `npm`, `yarn`, and `bun` also work.
