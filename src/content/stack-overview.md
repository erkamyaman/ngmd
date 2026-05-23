---
title: Stack Overview
---

# Stack Overview

NgMd is built on AnalogJS, Vite 8, Angular 21, Tailwind v4, Shiki, and Spartan UI's brain primitives. Each layer is replaceable, but the defaults work together out of the box.

## What you get

Drop a markdown file, get a routed docs site. The stack handles:

- File-based routing for `.md` and `.page.ts` via AnalogJS
- Markdown content collections plus Shiki dual-theme code highlighting
- Tailwind v4 styling with class-based dark mode
- Spartan brain primitives for accessible interactions (tabs)
- 10-component authoring suite under `src/app/ui/`
- Site frame: sticky header, sidebar, breadcrumb, TOC, Cmd+K palette, page footer with prev/next + edit-on-github + last-updated
- Build-time pipeline: external + internal link guards, page-meta virtual module, sitemap + robots.txt

## Why this stack

- **AnalogJS** 2.5: Angular's Nuxt/Next equivalent. Vite-based, SSR-capable, file-router-first.
- **Spartan UI brain**: shadcn-style copy-paste primitives. You own the components.
- **Tailwind v4**: utility CSS that doesn't impose a design system.
- **Shiki** 1.29 (pinned for AnalogJS peer-dep compatibility): VS Code-quality syntax highlighting, dual-theme github-light + github-dark in one pass.
- **Vite 8**: dev server fast enough that the file router stays fun.

See [Technologies](/stack/technologies) for the per-package breakdown. See [Installation](/stack/installation) to wire NgMd into an existing project (or just scaffold with `pnpm create ngmd@latest`).
