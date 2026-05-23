---
title: Introduction
---

# Introduction

Angular docs starter. Drop a markdown file. Get a route.

## How it works

NgMd uses a two-layer authoring model that separates prose from UI.

### Content as markdown

Your docs live as `.md` files in `src/content/`. Frontmatter handles metadata, marked handles rendering, Shiki handles code highlighting (dual-theme: github-light and github-dark in one pass).

You own the files. Plain markdown, version-controlled, portable to any other tool.

### UI as Angular components

The site frame (sidebar, breadcrumb, TOC, Cmd+K palette, page footer with prev/next + edit-on-github + last-updated) lives as components in `src/app/components/`. Authoring components (callout, alert, card, tabs, pill row, workflow, hero, video, image, code-block) live in `src/app/ui/`. Both are built on Tailwind v4, with Spartan UI's brain primitives for accessibility-sensitive pieces like tabs.

You own the components. They live in your codebase. Customise without fighting a theming API.

## Get started

```bash
pnpm create ngmd@latest my-docs
# or: npm create ngmd@latest, yarn create ngmd, bun create ngmd

cd my-docs
pnpm install
pnpm run dev
```

Open `http://localhost:5173` and you are running.

## What's in the box

- File-based routing for `.md` and `.page.ts` via AnalogJS
- Light, dark, and auto theme cycle with no-flash boot script
- Sticky translucent header, sidebar accordion from config, breadcrumb, scroll-spy TOC, Cmd+K palette over pages plus headings plus body snippets
- Page footer with prev/next sibling cards, edit-on-github link, last-updated date from `git log`
- Heading hover anchor that copies the deep link
- `*Keyword` inline auto-linking driven by `ngmd.config.ts`
- Code-fence affordances: `file="src/foo.ts#L5-L20"` imports, `group="install"` tabs, `{1,3-5}` line highlighting
- Build-time guards: external anchors must have `target="_blank"`, internal anchors must resolve to real headings
- Sitemap.xml and robots.txt auto-emitted
- Custom title strategy formats every page as `NgMd | <title>`
- Route crossfades via the browser's View Transitions API

## FAQ

### What is NgMd?

An Angular docs starter on top of AnalogJS. Drop markdown files in `src/content/`, get a routed, branded documentation site with the site frame and features listed above.

### Do I need AnalogJS to use this?

Yes. NgMd is AnalogJS-native. The runtime, file-based routing, SSR, and markdown content collections all come from AnalogJS.

### What's the difference between Markdown content and Components?

Markdown is your prose: installation guides, API references, conceptual explainers. Lives in `src/content/`, edited as plain text.

Authoring components wrap your prose with structure, used inside `.page.ts` files: callout, alert, card, tabs, pill row, workflow, hero, video, image, code-block. Live in `src/app/ui/`, edited as TypeScript.

### Why copy components instead of installing them?

Same philosophy as Spartan UI and shadcn/ui. Owning the source means no theming API to learn, no version conflicts, no waiting for maintainers to add a feature you need. Edit Tailwind classes directly and ship.

### Is NgMd inspired by VitePress or Starlight?

Yes. The "drop markdown, get a docs site" pattern comes from VitePress, Starlight, Nextra, and Docusaurus. NgMd adapts the pattern for Angular, where no canonical equivalent exists.

### Is this production-ready?

NgMd is in active early development. The core (markdown rendering, theming, navigation, build pipeline) is stable. Versioning, i18n, library-style API reference, and search adapters are on the roadmap.
