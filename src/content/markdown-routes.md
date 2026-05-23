---
title: Markdown Routes
---

# Markdown Routes

NgMd turns markdown files into routes automatically via AnalogJS content collections.

## File-based routing

Any `.md` file in `src/content/` becomes available through `injectContent()`. A `.page.ts` in `src/app/pages/` defines the route and pulls the markdown in.

```
src/
├── content/
│   └── welcome.md
└── app/pages/
    └── welcome.page.ts
```

The page reads the content via `injectContent({ customFilename: 'welcome' })` and renders it with `<analog-markdown [content]>`. For routes that need authoring components (callouts, tabs, cards) compose them in the `.page.ts` template around the markdown body.

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
const welcome$ = injectContent<{ title: string; order: number }>('welcome');
```

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

The build pipeline fails on broken anchors. External links inside raw HTML must carry `target="_blank"`. Internal `#fragment` and `/route#fragment` markdown links must resolve to real headings in the target file. Broken links error at build time rather than reaching production.

## Importing code from real files

To keep doc examples in sync with the source, import the file directly with `file="..."` in the fence. GitHub-style line ranges (`#L5-L10`) work too:

```ts file="src/app/pages/welcome.page.ts#L1-L5"
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

For example, *NgMd is built on *AnalogJS with *Tailwind v4, *Shiki for code highlighting, and *Spartan brain primitives. Compare against *VitePress, *Starlight, *Nextra, and *Docusaurus to see where the bar sits.

Unknown keywords (`*WrongName`) log a warning at build time and fall back to literal text so the build never fails on a typo.
