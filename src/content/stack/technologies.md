---
title: Technologies
---

<ngmd-hero title="Technologies" gradient>
  The libraries and tools NgMd bundles by default. Every layer is replaceable.
</ngmd-hero>

# Technologies

NgMd is built on three headline pieces (*Angular, *AnalogJS, *Vite) and a curated set of supporting libraries. Each layer is replaceable.

## Runtime <ngmd-badge variant="stable">Stable</ngmd-badge>

<ngmd-card-grid columns="3">
  <ngmd-card image="/logos/angular.svg" title="Angular" link="https://angular.dev">
    The framework. v21+.
  </ngmd-card>
  <ngmd-card image="https://analogjs.org/img/logos/analog-logo.svg" title="AnalogJS" link="https://analogjs.org">
    Meta-framework: file-based routing, SSR/SSG, markdown content collections. v2.5+.
  </ngmd-card>
  <ngmd-card image="/logos/vite.svg" title="Vite" link="https://vite.dev">
    Dev server and build tool. v8.
  </ngmd-card>
</ngmd-card-grid>

## Styling

| Package | Role |
|---|---|
| <img class="pkg-icon" src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="" /> [tailwindcss](https://tailwindcss.com) | Utility CSS, `@variant dark` for class-based dark mode. v4. |
| <img class="pkg-icon" src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="" /> [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) | `prose` styles for rendered markdown. |

## Components

| Package | Role |
|---|---|
| <img class="pkg-icon" src="/logos/angular.svg" alt="" /> [@angular/elements](https://angular.dev/guide/elements) | Bridges NgmdUi components to Custom Elements so they upgrade inside `&lt;analog-markdown [innerHTML]&gt;`. Dynamic-imported on the client for SSR safety. |
| <img class="pkg-icon" src="https://cdn.simpleicons.org/lucide/F56565" alt="" /> [lucide-angular](https://lucide.dev) | Icon set used throughout the site frame and card icons. |

## Content pipeline

| Package | Role |
|---|---|
| <img class="pkg-icon" src="https://analogjs.org/img/logos/analog-logo.svg" alt="" /> [@analogjs/content](https://analogjs.org/docs/features/routing/content) | Markdown content collections that the catch-all reads via `injectContent()`. |
| <img class="pkg-icon" src="https://cdn.simpleicons.org/markdown/FAFAFA" alt="" /> [marked](https://marked.js.org) | Markdown parser. |
| <img class="pkg-icon" src="https://shiki.style/logo.svg" alt="" /> [marked-shiki](https://github.com/agusterodin/marked-shiki) | Bridge running Shiki over fenced code blocks at build time. |
| <img class="pkg-icon" src="https://shiki.style/logo.svg" alt="" /> [shiki](https://shiki.style) | VS Code-grade syntax highlighting. Pinned at `1.29.2` because newer 4.x conflicts with `@analogjs/platform` 2.5's peer dep. |
| <img class="pkg-icon" src="https://cdn.simpleicons.org/yaml/CB171E" alt="" /> [front-matter](https://github.com/jxson/front-matter) | Frontmatter parser used by AnalogJS content collections. |

## Marked extensions

Custom extensions wired into the marked pipeline:

<ngmd-accordion>
  <ngmd-accordion-item title="Runtime" open>
    <code>ngmd-video</code> and <code>ngmd-image</code> inline media tags, plus <code>*Keyword</code> auto-linking declared in <code>ngmd.config.ts</code>.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Build-time (Shiki pre-rendered)">
    Code-fence <code>file="..."</code> imports, <code>group="..."</code> tabs, <code>{1,3-5}</code> line highlighting.
  </ngmd-accordion-item>
</ngmd-accordion>

## Build pipeline

Vite plugins committed alongside `vite.config.ts`:

| Plugin | Role |
|---|---|
| <img class="pkg-icon" src="/logos/vite.svg" alt="" /> `externalLinkGuard` | Errors on raw external anchors missing `target="_blank"`. |
| <img class="pkg-icon" src="/logos/vite.svg" alt="" /> `internalLinkGuard` | Errors on broken in-page and cross-page anchor fragments. |
| <img class="pkg-icon" src="/logos/vite.svg" alt="" /> `pageMetaPlugin` | Emits `virtual:ngmd/page-meta` with `editUrl` + `lastUpdated` per route, derived from `git log`. |
| <img class="pkg-icon" src="/logos/vite.svg" alt="" /> `sitemapPlugin` | Writes `sitemap.xml` and `robots.txt` into the client bundle. |

## Distribution

| Package | Role |
|---|---|
| <img class="pkg-icon" src="https://cdn.simpleicons.org/npm/CB3837" alt="" /> [create-ngmd](https://www.npmjs.com/package/create-ngmd) | The scaffolder. `pnpm create ngmd@latest my-docs`. Node 20 builtins, zero deps. Published as `0.0.7`. |

## Package management

<ngmd-pill-row>
  <ngmd-pill href="https://pnpm.io" title="pnpm"></ngmd-pill>
  <ngmd-pill href="https://www.npmjs.com" title="npm"></ngmd-pill>
  <ngmd-pill href="https://yarnpkg.com" title="yarn"></ngmd-pill>
  <ngmd-pill href="https://bun.sh" title="bun"></ngmd-pill>
</ngmd-pill-row>

All four package managers work. The scaffolder auto-detects which one you ran it with.

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/stack/installation" title="Installation"></ngmd-pill>
  <ngmd-pill href="/stack/overview" title="Overview"></ngmd-pill>
  <ngmd-pill href="/concepts/markdown-routes" title="Routing"></ngmd-pill>
</ngmd-pill-row>
