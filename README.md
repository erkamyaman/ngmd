# NgMd

A modern Angular docs-site starter built on AnalogJS, Spartan UI, and Tailwind.

Drop a markdown file. Get a route. Beautifully branded out of the box.

## Quick start

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:5173`.

`npm`, `yarn`, and `bun` are also supported.

## Stack

- **[Angular](https://angular.dev)** — the framework (v21+).
- **[AnalogJS](https://analogjs.org)** — Vite-based meta-framework providing file-based routing, SSR/SSG, and markdown content collections.
- **[Spartan UI](https://www.spartan.ng)** — headless Angular primitives + copy/paste components.
- **[Tailwind v4](https://tailwindcss.com)** — utility CSS with class-based dark mode.
- **[Shiki](https://shiki.style)** — VS Code-grade syntax highlighting.
- **[Marked](https://marked.js.org)** — markdown parser.

## Features

- File-based markdown routes (`src/content/*.md`)
- Light / dark / auto theme cycle with no-flash inline boot script
- Sidebar accordion, breadcrumb, on-page TOC
- Cmd+K command palette
- Code-block copy buttons
- Smooth scroll between page changes
- External links auto-targeted to a new tab

## Project layout

```
src/
├── app/
│   ├── components/      Sidebar, TOC, breadcrumb, command palette, etc.
│   ├── pages/           File-based routes
│   ├── app.config.ts    Wires router + content + theme
│   ├── app.ts           Shell (header, sidebar, main, TOC)
│   └── theme.ts         Light/dark/auto theme service
├── content/             Markdown content collection
├── styles.css           Tailwind + theme variables
└── main.ts
```

## Scripts

```bash
pnpm run dev       # Vite dev server
pnpm run build     # Production build (SSR + static)
pnpm run preview   # Serve the production build
pnpm run test      # Vitest
```

## Status

Early development. The core (markdown rendering, theming, navigation, chrome) is in place. Versioning, i18n, and search adapters are on the roadmap. See [`PLAN.md`](./PLAN.md) for the full plan.

## License

MIT © 2026, Kam ([@erkamyaman](https://github.com/erkamyaman))
