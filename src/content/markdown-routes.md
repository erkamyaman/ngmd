---
title: Markdown Routes
---

# Markdown Routes

NgMd turns markdown files into routes automatically via AnalogJS content collections.

## File-based routing

Any `.md` file in `src/content/` becomes available through `injectContent()`. A matching `.page.ts` in `src/app/pages/` decides how it renders.

```
src/
├── content/
│   └── welcome.md
└── app/pages/
    └── welcome.page.ts
```

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

All fenced code blocks pass through Shiki at build time. Set the theme in `vite.config.ts`:

```ts
analog({
  content: {
    highlighter: 'shiki',
    shikiOptions: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
```

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
