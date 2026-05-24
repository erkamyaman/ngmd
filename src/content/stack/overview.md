---
title: Stack Overview
---

<ngmd-hero title="Stack Overview" gradient>
  Modern Angular foundations. Every layer is replaceable, but the defaults work together out of the box.
</ngmd-hero>

# Stack Overview

NgMd is built on *AnalogJS, *Vite 8, *Angular 21, *Tailwind v4, and *Shiki. Each layer is replaceable, but the defaults work together out of the box.

## What you get

Drop a markdown file, get a routed docs site. The stack handles:

<ngmd-card-grid columns="2">
  <ngmd-card icon="compass" title="Routing">
    File-based routing for <code>.md</code> and <code>.page.ts</code> via AnalogJS. One catch-all serves every prose page.
  </ngmd-card>
  <ngmd-card icon="file" title="Markdown + highlighting">
    Markdown content collections plus Shiki dual-theme code highlighting (github-light and github-dark in one pass).
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming">
    Tailwind v4 styling with class-based dark mode. CSS variables for tokens, fuchsia accent throughout.
  </ngmd-card>
  <ngmd-card icon="shield" title="A11y by hand">
    ARIA wiring and keyboard navigation hand-rolled per component (tabs, accordion). Native HTML semantics where they fit.
  </ngmd-card>
  <ngmd-card icon="box" title="14 authoring components">
    Callout, alert, card, card-grid, tabs, pill-row, workflow, hero, code-block, accordion, badge, video, image. Plus pill and step.
  </ngmd-card>
  <ngmd-card icon="layers" title="Site frame">
    Sticky header, sidebar accordion, breadcrumb, scroll-spy TOC, Cmd+K palette, page footer with prev/next, edit-on-github, last-updated.
  </ngmd-card>
  <ngmd-card icon="wrench" title="Build pipeline">
    External + internal link guards, page-meta virtual module, sitemap and robots.txt auto-emitted.
  </ngmd-card>
  <ngmd-card icon="sparkles" title="Agent skills" link="/ai/agent-skills" cta="Read">
    <code>ngmd-new-site</code> and <code>ngmd-authoring</code> ship for Claude Code, Gemini CLI, Antigravity.
  </ngmd-card>
</ngmd-card-grid>

## Why this stack

<ngmd-accordion>
  <ngmd-accordion-item title="AnalogJS 2.5" open>
    Angular's Nuxt / Next equivalent. Vite-based, SSR-capable, file-router-first. Everything routing, markdown, and build-pipeline related comes from here.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Tailwind v4">
    Utility CSS that doesn't impose a design system. Theme tokens live as CSS variables; the rest is regular Tailwind.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Shiki 1.29.2">
    VS Code-quality syntax highlighting. Pinned because AnalogJS's content peer-dep range. Dual-theme HTML output means light + dark in one pass.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Vite 8">
    Dev server fast enough that the file router stays fun. Build is rollup-driven, SSR via Nitro under the hood.
  </ngmd-accordion-item>
</ngmd-accordion>

<ngmd-callout type="info" title="Pinned versions">
  Some packages are pinned, not just floor-versioned. <code>shiki&#64;1.29.2</code> matches AnalogJS's content peer dep.
</ngmd-callout>

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/stack/technologies" title="Technologies" />
  <ngmd-pill href="/stack/installation" title="Installation" />
  <ngmd-pill href="/concepts/markdown-routes" title="Routing model" />
</ngmd-pill-row>
