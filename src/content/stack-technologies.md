---
title: Technologies
---

# Technologies

The libraries and tools NgMd bundles by default.

## Runtime

- **Angular**: the framework. v21+ required.
- **AnalogJS**: meta-framework providing file-based routing, SSR/SSG, and markdown content collections.
- **Vite**: dev server and build tool.

## Styling

- **Tailwind v4**: utility CSS with `@variant dark` for class-based dark mode.
- **@tailwindcss/typography**: `prose` styles for rendered markdown.

## Components

- **@spartan-ng/brain**: headless, accessible primitives.
- **lucide-angular**: icon set used throughout the chrome.

## Content pipeline

- **marked**: markdown parser.
- **marked-shiki**: bridge that runs Shiki over fenced code blocks.
- **shiki** v1.29+: VS Code-grade syntax highlighting.
- **front-matter**: frontmatter parser used by AnalogJS content collections.

## Package management

- **pnpm**: fast, disk-efficient package manager. `npm` and `yarn` also work.
