---
title: Introduction
---

# Introduction

Modern documentation sites for Angular. Drop a markdown file. Get a route.

NgMd gives you a beautifully branded docs site without the boilerplate. Built with signals, SSR-compatible, and zoneless-ready, on top of AnalogJS and Spartan UI.

## How it works

NgMd uses a two-layer authoring model that separates content from presentation:

### 📝 Content as markdown

Your docs live as `.md` files in `src/content/`. Frontmatter handles metadata, marked handles rendering, Shiki handles code highlighting.

**You own it:** Plain markdown, version-controlled, portable to any other tool.

### 🎨 UI as Angular components

The chrome (sidebar, breadcrumb, TOC, command palette) is composed of Angular components in `src/app/components/`. Built on Tailwind v4 with Spartan UI primitives.

**You copy it:** Components live in your codebase. Customize without fighting a theming API.

This hybrid approach means you can write your docs in plain markdown while still owning every pixel of the surrounding interface.

## Get started

The fastest path to your first page. Pick your package manager:

```bash
# pnpm (recommended)
pnpm create ngmd@latest my-docs

# npm
npm create ngmd@latest my-docs

# yarn
yarn create ngmd my-docs

# bun
bun create ngmd my-docs
```

Then:

```bash
cd my-docs
pnpm install   # or npm install / yarn / bun install
pnpm run dev
```

Open `http://localhost:5173` and you're running. Head to **Installation** for the manual setup or **Quick Start** to build your first page.

## FAQ

### What is NgMd?

A modern Angular docs-site starter built on AnalogJS. Drop markdown files in `src/content/`, get a routed, beautifully styled documentation site with sidebar nav, breadcrumb, on-page TOC, and Cmd+K search.

### Do I need AnalogJS to use this?

Yes. NgMd is AnalogJS-native. The runtime, file-based routing, SSR, and markdown content collections all come from AnalogJS. If you want a non-Analog setup, plain Angular CLI plus Angular Universal would require rebuilding the routing and rendering pipeline.

### What's the difference between Markdown content and Components?

**Markdown** is your prose: installation guides, API references, conceptual explainers. Lives in `src/content/`, edited as plain text.

**Components** are the chrome around your prose: sidebar, header, code-copy buttons, command palette. Lives in `src/app/components/`, edited as TypeScript.

### Why copy components instead of installing them?

Same philosophy as Spartan UI and shadcn/ui. Owning the source code means no theming API to learn, no version conflicts, no waiting for maintainers to add a feature you need. Edit Tailwind classes directly and ship.

### Is NgMd inspired by VitePress or Starlight?

Yes. The "drop markdown, get a docs site" pattern comes from VitePress, Starlight, Nextra, and Docusaurus. NgMd adapts that pattern for the Angular ecosystem where no canonical equivalent exists.

### Is this production-ready?

NgMd is in active early development. The core (markdown rendering, theming, navigation) is stable. Versioning, i18n, and search adapters are on the roadmap.




