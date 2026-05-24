---
title: Installation
---

<ngmd-hero title="Installation" gradient>
  One command for a fresh project. A six-step path if you're integrating NgMd into an existing AnalogJS app.
</ngmd-hero>

# Installation

## Path A · Scaffold a fresh project <ngmd-badge variant="stable">Recommended</ngmd-badge>

The published `create-ngmd` package handles everything: scaffolds AnalogJS, installs deps, copies the NgMd site frame and authoring components, sets up the build pipeline.

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

## After install: first steps

<ngmd-card-grid columns="2">
  <ngmd-card icon="settings" title="Edit site config" link="/concepts/markdown-routes" cta="Routing">
    Open <code>src/ngmd.config.ts</code>. Change brand name, public URL, GitHub URL, sidebar nav, and the <code>keywords</code> auto-link map.
  </ngmd-card>
  <ngmd-card icon="file" title="Write your first page" link="/concepts/markdown-routes" cta="How routing works">
    Drop a <code>.md</code> file under <code>src/content/</code>. The path becomes the URL. No wrapper needed.
  </ngmd-card>
  <ngmd-card icon="palette" title="Rebrand the theme" link="/concepts/theming" cta="Tokens">
    All colours, radii, and fonts live as CSS variables in <code>src/styles.css</code>. Swap one token, the whole site follows.
  </ngmd-card>
  <ngmd-card icon="box" title="Try the components" link="/concepts/demo" cta="Live demo">
    See every authoring component rendered inline from markdown.
  </ngmd-card>
</ngmd-card-grid>

## Path B · Manual integration

For when you already have an AnalogJS app and want to pull NgMd in piece by piece. The scaffolder is what gets tested on every release; the manual path is documented for completeness but goes stale faster.

<ngmd-accordion>
  <ngmd-accordion-item title="Expand the six-step manual path">

### Prerequisites

<ngmd-card-grid columns="3">
  <ngmd-card icon="terminal" title="Node ≥ 20.19.1">
    Required floor for AnalogJS 2.5 and Vite 8.
  </ngmd-card>
  <ngmd-card icon="box" title="Package manager">
    pnpm, npm, yarn, or bun. Any of the four.
  </ngmd-card>
  <ngmd-card icon="zap" title="AnalogJS project">
    <code>pnpm create analog&#64;latest</code> if you don't have one yet.
  </ngmd-card>
</ngmd-card-grid>

### 1. Install content dependencies

The runtime libraries NgMd composes:

```bash
pnpm add @analogjs/content marked-shiki shiki@^1.29.2 @angular/elements
pnpm add -D @tailwindcss/typography
```

### 2. Enable content in vite.config.ts

Wire Shiki into the AnalogJS content pipeline:

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

### 3. Provide content renderer in src/app/app.config.ts

Standalone renderer plus Shiki highlighter:

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

### 4. Copy the NgMd source

From a scaffolded NgMd project, copy these directories into yours:

<ngmd-card-grid columns="2">
  <ngmd-card icon="layers" title="src/app/components/">
    Sidebar, palette, breadcrumb, TOC, code-copy, external-links, heading-anchors, page-footer, media-enhancer, code-group, source-actions.
  </ngmd-card>
  <ngmd-card icon="box" title="src/app/ui/">
    All 17 authoring components: callout, alert, card, card-grid, tabs, pill-row, workflow, hero, code-block, accordion, badge, video, image (plus pill, step, tab, accordion-item).
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

### 5. Wire the plugins in vite.config.ts

Import and register the NgMd plugins next to the analog plugin: `externalLinkGuard`, `internalLinkGuard`, `pageMetaPlugin`, `sitemapPlugin`.

### 6. Deploy

Drop a `netlify.toml` at the repo root with `publish = "dist/analog/public"` and a SPA fallback redirect. Connect the repo to Netlify, Vercel, or any Node-friendly host. Done.

<ngmd-alert severity="warning">
  Path B goes stale faster than Path A. If a step looks wrong, the scaffolded template at <a href="https://github.com/erkamyaman/ngmd" target="_blank" rel="noopener noreferrer"><code>github.com/erkamyaman/ngmd</code></a> is the source of truth.
</ngmd-alert>

  </ngmd-accordion-item>
</ngmd-accordion>

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/welcome" title="Introduction" />
  <ngmd-pill href="/concepts/markdown-routes" title="Routing" />
  <ngmd-pill href="/concepts/theming" title="Theming" />
  <ngmd-pill href="/concepts/demo" title="Live demo" />
</ngmd-pill-row>
