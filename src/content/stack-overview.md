---
title: Stack Overview
---

# Stack Overview

NgMd is built on a focused stack of modern web tooling. Each layer is replaceable, but the defaults work together out of the box.

## What you get

Drop a markdown file, get a routed docs site. The stack handles:

- File-based routing and SSR via **AnalogJS**
- Markdown content collections + Shiki code highlighting
- Tailwind v4 styling with class-based dark mode
- Spartan UI primitives for accessible interactions
- Cmd+K command palette and code-copy buttons
- Light/dark/auto theme with system preference sync

## Why this stack

Each piece is chosen so the experience scales without forcing you to learn a proprietary system:

- **AnalogJS**: Angular's Nuxt/Next. Vite-based, SSR-capable.
- **Spartan UI**: shadcn-style copy/paste primitives. Own your code.
- **Tailwind**: utility CSS that doesn't fight your design system.
- **Shiki**: VS Code-quality syntax highlighting at build time.

See **Technologies** for the per-package breakdown, or jump to **Installation** if you want to wire NgMd into an existing project.
