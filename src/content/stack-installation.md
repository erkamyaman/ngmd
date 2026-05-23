---
title: Stack Installation
---

# Stack Installation

Two paths. Use the scaffolder unless you're integrating into an existing AnalogJS project.

## Path A. Scaffold a fresh project

The fastest and recommended route. The published `create-ngmd` package handles everything: scaffolds AnalogJS, installs deps, copies the NgMd chrome and authoring components, sets up the build pipeline.

```bash
pnpm create ngmd@latest my-docs
# or: npm create ngmd@latest my-docs / yarn create ngmd my-docs / bun create ngmd my-docs

cd my-docs
pnpm install
pnpm run dev
```

Open `http://localhost:5173`. Done.

## Path B. Manual integration into an existing AnalogJS project

For when you already have an AnalogJS app and want to pull NgMd in piece by piece.

### Prerequisites

- Node.js 20.19.1 or newer
- A package manager: pnpm, npm, yarn, or bun
- An existing AnalogJS project (`pnpm create analog@latest`)

### 1. Install content dependencies

```bash
pnpm add @analogjs/content marked-shiki shiki@^1.29.2 @spartan-ng/brain
pnpm add -D @tailwindcss/typography
```

### 2. Enable content in `vite.config.ts`

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

### 3. Provide content renderer in `src/app/app.config.ts`

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

- `src/app/components/` (sidebar, palette, breadcrumb, TOC, code-copy, external-links, heading-anchors, page-footer, media-enhancer, code-group)
- `src/app/ui/` (callout, alert, card, tabs, pill row, workflow, hero, code-block, video, image)
- `src/marked-extensions/` (video, image, keywords, plus the build-time code-import, code-group, code-highlight extensions)
- `src/styles.css` (Tailwind tokens, fuchsia accent, shiki dual-theme CSS)
- `src/ngmd.config.ts` (nav, brand, keywords)
- `*.plugin.ts` at the repo root (page-meta, link guards, sitemap)

### 5. Wire the plugins in `vite.config.ts`

Import and register the four NgMd plugins next to the analog plugin: `externalLinkGuard`, `internalLinkGuard`, `pageMetaPlugin`, `sitemapPlugin`.

### 6. Deploy

Drop a `netlify.toml` at the repo root with `publish = "dist/analog/public"` and a SPA fallback redirect. Connect the repo to Netlify or Vercel. Done.

## Why use the scaffolder

Path A is one command. Path B is six. The scaffolder is what gets tested on every NgMd release; the manual path is documented for completeness and customisation but goes stale faster.
