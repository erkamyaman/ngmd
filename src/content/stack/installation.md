---
title: Stack Installation
---

<ngmd-hero title="Installation" gradient>
  Two paths. Use the scaffolder unless you're integrating into an existing AnalogJS project.
</ngmd-hero>

# Stack Installation

Two paths. Use the scaffolder unless you're integrating into an existing AnalogJS project.

<ngmd-card-grid columns="2">
  <ngmd-card icon="rocket" title="Path A — Scaffold fresh" cta="Recommended">
    One command, takes 30 seconds. The <code>create-ngmd</code> CLI handles AnalogJS scaffolding, dep install, NgMd source copy, and config setup.
  </ngmd-card>
  <ngmd-card icon="wrench" title="Path B — Manual integration">
    Six steps, for when you already have an AnalogJS app and want to pull NgMd in piece by piece.
  </ngmd-card>
</ngmd-card-grid>

## Path A · Scaffold a fresh project <ngmd-badge variant="stable">Recommended</ngmd-badge>

The fastest path. The published `create-ngmd` package handles everything: scaffolds AnalogJS, installs deps, copies the NgMd site frame and authoring components, sets up the build pipeline.

```bash group="install" name="pnpm" active
pnpm create ngmd@latest my-docs
```

```bash group="install" name="npm"
npm create ngmd@latest my-docs
```

```bash group="install" name="yarn"
yarn create ngmd my-docs
```

```bash group="install" name="bun"
bun create ngmd my-docs
```

```bash
cd my-docs
pnpm install
pnpm run dev
```

Open `http://localhost:5173`. Done.

<ngmd-callout type="tip" title="Pinned versions land in your repo">
  The scaffolder copies a slim template that owns its dependencies. You don't depend on <code>create-ngmd</code> after install — it never appears in your <code>package.json</code>.
</ngmd-callout>

## Path B · Manual integration

For when you already have an AnalogJS app and want to pull NgMd in piece by piece.

### Prerequisites

<ngmd-card-grid columns="3">
  <ngmd-card icon="terminal" title="Node ≥ 20.19.1">
    AnalogJS 2.5 and Vite 8 floor.
  </ngmd-card>
  <ngmd-card icon="box" title="Package manager">
    pnpm, npm, yarn, or bun. Any of the four.
  </ngmd-card>
  <ngmd-card icon="zap" title="AnalogJS project">
    <code>pnpm create analog&#64;latest</code> if you don't have one yet.
  </ngmd-card>
</ngmd-card-grid>

<ngmd-workflow>
  <ngmd-step title="Install content dependencies">
    The runtime libraries NgMd composes:
  </ngmd-step>
</ngmd-workflow>

```bash
pnpm add @analogjs/content marked-shiki shiki@^1.29.2 @angular/elements
pnpm add -D @tailwindcss/typography
```

<ngmd-workflow>
  <ngmd-step title="Enable content in vite.config.ts">
    Wire Shiki into the AnalogJS content pipeline:
  </ngmd-step>
</ngmd-workflow>

```ts
import analog from '@analogjs/platform';

export default defineConfig({
  plugins: [
    analog({
      content: {
        highlighter: 'shiki',
        shikiOptions: { themes: { light: 'github-light', dark: 'github-dark' } },
      },
    }),
  ],
});
```

<ngmd-workflow>
  <ngmd-step title="Provide content renderer in src/app/app.config.ts">
    Standalone renderer plus Shiki highlighter:
  </ngmd-step>
</ngmd-workflow>

```ts
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withShikiHighlighter } from '@analogjs/content/shiki-highlighter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideContent(withMarkdownRenderer(), withShikiHighlighter()),
  ],
};
```

<ngmd-workflow>
  <ngmd-step title="Copy the NgMd source">
    From a scaffolded NgMd project, copy these directories into yours:
  </ngmd-step>
</ngmd-workflow>

<ngmd-card-grid columns="2">
  <ngmd-card icon="layers" title="src/app/components/">
    Sidebar, palette, breadcrumb, TOC, code-copy, external-links, heading-anchors, page-footer, media-enhancer, code-group.
  </ngmd-card>
  <ngmd-card icon="box" title="src/app/ui/">
    All 14 authoring components: callout, alert, card, card-grid, tabs, pill-row, workflow, hero, code-block, accordion, badge, video, image (plus pill and step).
  </ngmd-card>
  <ngmd-card icon="code" title="src/marked-extensions/">
    Video, image, keywords (runtime). Code-import, code-group, code-highlight (build-time).
  </ngmd-card>
  <ngmd-card icon="palette" title="src/styles.css">
    Tailwind tokens, fuchsia accent, Shiki dual-theme CSS, Custom Element hide-before-defined rule.
  </ngmd-card>
  <ngmd-card icon="settings" title="src/ngmd.config.ts">
    Nav, brand, keyword auto-link map.
  </ngmd-card>
  <ngmd-card icon="wrench" title="*.plugin.ts at repo root">
    page-meta, internal-link-guard, sitemap. Plus the externalLinkGuard inline in <code>vite.config.ts</code>.
  </ngmd-card>
</ngmd-card-grid>

<ngmd-workflow>
  <ngmd-step title="Wire the plugins in vite.config.ts">
    Import and register the NgMd plugins next to the analog plugin: <code>externalLinkGuard</code>, <code>internalLinkGuard</code>, <code>pageMetaPlugin</code>, <code>sitemapPlugin</code>.
  </ngmd-step>
  <ngmd-step title="Deploy">
    Drop a <code>netlify.toml</code> at the repo root with <code>publish = "dist/analog/public"</code> and a SPA fallback redirect. Connect the repo to Netlify, Vercel, or any Node-friendly host. Done.
  </ngmd-step>
</ngmd-workflow>

<ngmd-alert severity="warning">
  Path B documentation goes stale faster than Path A because the scaffolder is what gets tested on every NgMd release. If a step looks wrong, the scaffolded template at <code>github.com/erkamyaman/ngmd</code> is the source of truth.
</ngmd-alert>

## Why use the scaffolder

Path A is one command. Path B is six. The scaffolder is what gets tested on every NgMd release; the manual path is documented for completeness and customisation but goes stale faster.

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/welcome" title="Introduction" />
  <ngmd-pill href="/concepts/markdown-routes" title="Routing" />
  <ngmd-pill href="/concepts/theming" title="Theming" />
  <ngmd-pill href="/concepts/demo" title="Live demo" />
</ngmd-pill-row>
