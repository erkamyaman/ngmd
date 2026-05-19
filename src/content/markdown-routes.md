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
