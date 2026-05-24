---
title: Markdown Routes
---

<ngmd-hero title="Markdown Routes" gradient>
  Drop a markdown file at the right path and the catch-all handles routing, rendering, sidebar, TOC, prev/next, and edit-on-github. No per-page wrapper to write.
</ngmd-hero>

# Markdown Routes

NgMd turns markdown files into routes automatically via *AnalogJS content collections.

## File-based routing

Drop a `.md` file under `src/content/`, get a route at the matching path. No per-page wrapper to write. The mapping is direct: the path under `src/content/` becomes the URL.

- `src/content/welcome.md` → `/welcome`
- `src/content/getting-started/about.md` → `/getting-started/about`
- `src/content/concepts/theming.md` → `/concepts/theming`

One shared `src/app/pages/[...slug].page.ts` handles every prose route. It reads the slug from the URL, fetches the matching markdown body, and renders it with `<analog-markdown [content]>`. The pattern mirrors adev (angular.dev) where `docs.component.ts` serves every documentation page.

For pages that need bespoke layouts or want to compose authoring components directly (callouts, tabs, cards, workflows, hero), write a named `.page.ts` in `src/app/pages/` instead. Angular's router prefers the more specific match, so a named route wins over the catch-all.

## Page frontmatter

Frontmatter at the top of each markdown file is parsed and made available as typed attributes:

```md
---
title: Welcome
description: A friendly intro
order: 1
---
```

You can read these in your page component:

```ts
const welcome$ = injectContent<{ title: string; order: number }>('slug');
```

The `'slug'` argument names the route param that the catch-all populates with the URL path. For a named `.page.ts` that handles a specific file, pass `{ customFilename: 'welcome' }` instead.

## Dynamic routes

Use bracket syntax for parameterised paths:

```
src/app/pages/blog/[slug].page.ts
```

The `slug` segment becomes available via `injectActivatedRoute` or by parsing the URL inside `injectContent`.

## Layouts and nested routes

Layouts are just Angular components rendered around the `<router-outlet>`. NgMd ships a default docs layout (sidebar + breadcrumb + TOC) which you can replace or extend.

## Code highlighting

All fenced code blocks pass through Shiki at build time. NgMd emits dual-theme HTML (github-light and github-dark in one pass) and swaps the active palette under `.dark` via a small CSS rule in `styles.css`. To change themes, edit `shikiOptions` in `vite.config.ts`:

```ts
analog({
  content: {
    highlighter: 'shiki',
    shikiOptions: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
```

## Inline media

Two marked extensions ship runtime-side so you can drop media into prose without writing TypeScript.

```html
<ngmd-video src="https://www.youtube.com/watch?v=..." title="Demo" />

<ngmd-image src="/screenshot.png" alt="Sidebar accordion" caption="The sidebar reads from ngmd.config.ts" />
```

YouTube and Vimeo URLs are normalised to player iframes. Images get figure plus caption plus lazy-load by default.

## Link integrity

<ngmd-alert severity="critical">
  The build pipeline <strong>fails</strong> on broken anchors. Internal <code>#fragment</code> and <code>/route#fragment</code> markdown links must resolve to real headings. External links inside raw HTML must carry <code>target="_blank"</code>. Broken links error at build time rather than reaching production.
</ngmd-alert>

This is enforced by two Vite plugins: `internal-link-guard.plugin.ts` and the `externalLinkGuard` inside `vite.config.ts`. Both walk every `.md` body at build and abort if anything would 404.

## Importing code from real files

To keep doc examples in sync with the source, import the file directly with `file="..."` in the fence. GitHub-style line ranges (`#L5-L10`) work too:

```ts file="src/app/pages/[...slug].page.ts#L1-L7"
```

Lines tagged with `// ngmd-ignore-line` are stripped from the imported snippet, so you can hide setup boilerplate from doc readers while keeping the source file runnable.

## Grouped code tabs

Tag adjacent fences with `group="..."` (and an optional `name="..."` for the tab label) to merge them into a tabbed UI. The `active` flag picks the initial tab.

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

## Highlighting specific lines

Append `{1,3-5}` after the language to highlight matching lines. The selector accepts comma-separated single lines or ranges.

```ts {3-5}
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  template: '<h1>Hello, NgMd</h1>',
})
export class Hello {}
```

## Auto-linked keywords

Define keywords in `ngmd.config.ts > keywords`. Prefix any name with `*` in markdown prose to turn it into a link without writing the URL each time.

For example, *NgMd is built on *AnalogJS with *Tailwind v4 and *Shiki for code highlighting. Compare against *VitePress, *Starlight, *Nextra, and *Docusaurus to see where the bar sits.

Unknown keywords (`*WrongName`) log a warning at build time and fall back to literal text so the build never fails on a typo.

## Authoring components inside markdown

The catch-all (`src/app/pages/[...slug].page.ts`) imports `NgmdUi`, so every authoring component compiles inside `<analog-markdown>`. Drop them straight into prose:

<ngmd-callout type="tip" title="This callout lives inside markdown-routes.md">
  No <code>.page.ts</code> wrapper, no special pipeline. The catch-all imports <code>NgmdUi</code> and analog-markdown picks the selectors up.
</ngmd-callout>

<ngmd-alert severity="helpful">
  Mixed prose + components scale on the same page. Use components for the structured bits, markdown for the rest.
</ngmd-alert>

<ngmd-card-grid columns="2">
  <ngmd-card icon="box" title="Components" link="/concepts/components" cta="See all">
    Live demos of every NgmdUi component.
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming" link="/concepts/theming" cta="Tokens">
    CSS variables and the fuchsia accent wiring.
  </ngmd-card>
</ngmd-card-grid>

<ngmd-accordion>
  <ngmd-accordion-item title="What about per-page wrappers?">
    Drop a <code>.md</code> at the right path and the catch-all routes it. Write a named <code>.page.ts</code> only when the page needs a bespoke layout.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Does this hurt the bundle?">
    NgmdUi adds roughly 10KB gzipped to the markdown-route chunk. Every prose page pays that once, in exchange for the full component vocabulary.
  </ngmd-accordion-item>
</ngmd-accordion>

Status badges work inline: API stability tags like <ngmd-badge variant="beta">Beta</ngmd-badge> or <ngmd-badge variant="deprecated">Deprecated</ngmd-badge> sit next to text without breaking the line.

`ngmd-video` and `ngmd-image` are wired separately as marked extensions (build-time HTML rewrites), so they work in markdown regardless of what the catch-all imports.

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/concepts/demo" title="Live demo" />
  <ngmd-pill href="/concepts/components" title="All components" />
  <ngmd-pill href="/concepts/theming" title="Theming" />
</ngmd-pill-row>
