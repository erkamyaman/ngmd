---
title: Quick Start
---

# Quick Start

Build your first NgMd page in five minutes.

## Create a page

Drop a markdown file in `src/content/`:

```md
---
title: My First Page
---

# Hello, NgMd

This is my first page.
```

That's all you need. The page is now available at `/my-first-page`.

## Configure navigation

Open `src/app/components/sidebar.ts` and add your page to a section:

```ts
{
  label: 'Introduction',
  items: [
    { label: 'My First Page', href: '/my-first-page' },
  ],
}
```

It will show up in the left rail with active-link highlighting.

## Run the dev server

```bash
pnpm run dev
```

Vite spins up instantly. Edits to your markdown hot-reload without a refresh.

## Build for production

```bash
pnpm run build
pnpm run preview
```

This produces a static SSR build under `dist/`. Deploy to any host that serves Node: Vercel, Netlify, Cloudflare, or your own server.

## What's next

Explore the **Core Concepts** section to learn about theming, components, and the markdown rendering pipeline.
