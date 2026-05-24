---
title: Technologies
---

<ngmd-hero title="Technologies" gradient>
  The libraries and tools NgMd bundles by default. Every layer is replaceable.
</ngmd-hero>

# Technologies

The libraries and tools NgMd bundles by default.

## Runtime <ngmd-badge variant="stable">Stable</ngmd-badge>

<ngmd-card-grid columns="3">
  <ngmd-card image="https://cdn.simpleicons.org/angular" title="Angular" link="https://angular.dev">
    The framework. v21+.
  </ngmd-card>
  <ngmd-card image="https://analogjs.org/img/logos/analog-logo.svg" title="AnalogJS" link="https://analogjs.org">
    Meta-framework providing file-based routing, SSR/SSG, and markdown content collections. v2.5+.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/vite" title="Vite" link="https://vitejs.dev">
    Dev server and build tool. v8.
  </ngmd-card>
</ngmd-card-grid>

## Styling

<ngmd-card-grid columns="2">
  <ngmd-card image="https://cdn.simpleicons.org/tailwindcss" title="Tailwind v4" link="https://tailwindcss.com">
    Utility CSS with <code>&#64;variant dark</code> for class-based dark mode.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/tailwindcss" title="@tailwindcss/typography">
    <code>prose</code> styles for rendered markdown.
  </ngmd-card>
</ngmd-card-grid>

## Components

<ngmd-card-grid columns="2">
  <ngmd-card image="https://cdn.simpleicons.org/angular" title="@angular/elements">
    Bridges NgmdUi components to native Custom Elements so they upgrade inside <code>&lt;analog-markdown [innerHTML]&gt;</code>. Dynamic-imported on the client to keep SSR happy.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/lucide" title="lucide-angular" link="https://lucide.dev">
    Icon set used throughout the site frame.
  </ngmd-card>
</ngmd-card-grid>

## Content pipeline

<ngmd-card-grid columns="2">
  <ngmd-card image="https://cdn.simpleicons.org/markdown" title="marked" link="https://marked.js.org">
    Markdown parser.
  </ngmd-card>
  <ngmd-card image="https://shiki.style/logo.svg" title="marked-shiki">
    Bridge that runs Shiki over fenced code blocks at build time.
  </ngmd-card>
  <ngmd-card image="https://shiki.style/logo.svg" title="shiki" link="https://shiki.style">
    VS Code-grade syntax highlighting. Pinned at <code>1.29.2</code> because newer 4.x conflicts with <code>&#64;analogjs/platform</code> 2.5's peer dep.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/yaml" title="front-matter">
    Frontmatter parser used by AnalogJS content collections.
  </ngmd-card>
</ngmd-card-grid>

## Marked extensions

Custom extensions wired into the marked pipeline:

<ngmd-accordion>
  <ngmd-accordion-item title="Runtime extensions" open>
    <code>&lt;ngmd-video&gt;</code>, <code>&lt;ngmd-image&gt;</code> inline media tags, plus <code>*Keyword</code> auto-linking declared in <code>ngmd.config.ts</code>.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Build-time extensions (Shiki pre-rendered)">
    Code-fence <code>file="..."</code> imports, <code>group="..."</code> tabs, <code>{1,3-5}</code> line highlighting.
  </ngmd-accordion-item>
</ngmd-accordion>

## Build pipeline

Vite plugins committed alongside `vite.config.ts`:

<ngmd-card-grid columns="2">
  <ngmd-card image="https://cdn.simpleicons.org/vite" title="externalLinkGuard">
    Errors on raw external anchors missing <code>target="_blank"</code>.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/vite" title="internalLinkGuard">
    Errors on broken in-page and cross-page anchor fragments.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/vite" title="pageMetaPlugin">
    Emits <code>virtual:ngmd/page-meta</code> with <code>editUrl</code> + <code>lastUpdated</code> per route, derived from <code>git log</code>.
  </ngmd-card>
  <ngmd-card image="https://cdn.simpleicons.org/vite" title="sitemapPlugin">
    Writes <code>sitemap.xml</code> and <code>robots.txt</code> into the client bundle.
  </ngmd-card>
</ngmd-card-grid>

## Distribution

<ngmd-card image="https://cdn.simpleicons.org/npm" title="create-ngmd" link="https://www.npmjs.com/package/create-ngmd" cta="View on npm">
  The scaffolder. <code>pnpm create ngmd&#64;latest my-docs</code>. Built on Node 20 builtins, zero npm deps. Published as <code>create-ngmd&#64;0.0.3</code>.
</ngmd-card>

## Package management

<ngmd-pill-row>
  <ngmd-pill href="https://pnpm.io" title="pnpm" />
  <ngmd-pill href="https://www.npmjs.com" title="npm" />
  <ngmd-pill href="https://yarnpkg.com" title="yarn" />
  <ngmd-pill href="https://bun.sh" title="bun" />
</ngmd-pill-row>

All four package managers work. The scaffolder auto-detects which one you ran it with.

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/stack/installation" title="Installation" />
  <ngmd-pill href="/stack/overview" title="Overview" />
  <ngmd-pill href="/concepts/markdown-routes" title="Routing" />
</ngmd-pill-row>
