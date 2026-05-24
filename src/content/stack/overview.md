---
title: Stack Overview
---

<ngmd-hero title="Stack Overview" gradient>
  Modern Angular foundations and an opinionated assembly. Every layer is replaceable, but the defaults work together out of the box.
</ngmd-hero>

# Stack Overview

NgMd is built on *Angular, *AnalogJS, *Vite, *Tailwind, and *Shiki. Three architectural decisions on top of those: a single catch-all route, Custom Elements that compile inside markdown, and build-time link guards.

## How it's structured

Three decisions worth surfacing because they're what make NgMd feel different from "yet another docs starter."

<ngmd-card-grid columns="3">
  <ngmd-card icon="compass" title="Catch-all routing" link="/concepts/markdown-routes" cta="Read">
    One <code>src/app/pages/[...slug].page.ts</code> serves every prose route. Drop a <code>.md</code> at any path under <code>src/content/</code> and it shows up at the matching URL. Same shape adev uses.
  </ngmd-card>
  <ngmd-card icon="box" title="Custom Elements bridge">
    All 17 NgmdUi components are registered via <code>@angular/elements</code>, so they upgrade inside <code>&lt;analog-markdown [innerHTML]&gt;</code>. Drop <code>&lt;ngmd-callout&gt;</code> straight into prose and it renders.
  </ngmd-card>
  <ngmd-card icon="shield" title="Build-time link guards">
    Broken internal anchors fail the build instead of reaching production. External raw-HTML anchors without <code>target="_blank"</code> also fail. Catches what runtime tests don't.
  </ngmd-card>
</ngmd-card-grid>

## What you get

<ngmd-card-grid columns="2">
  <ngmd-card icon="layers" title="Site frame">
    Sticky header, sidebar accordion, breadcrumb, scroll-spy TOC, Cmd+K palette over pages + headings + body, prev/next + edit/source actions per route.
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming">
    CSS-variable tokens, light / dark / auto with no-flash boot script, fuchsia accent throughout. Native View Transitions API for crossfades.
  </ngmd-card>
  <ngmd-card icon="box" title="17 authoring components">
    Callout, alert, card, card-grid, tabs, workflow, hero, code-block, accordion, badge, video, image, pill, pill-row, plus 4 children. All work inline in <code>.md</code>.
  </ngmd-card>
  <ngmd-card icon="sparkles" title="Agent skills" link="/ai/agent-skills" cta="Read">
    <code>ngmd-new-site</code> and <code>ngmd-authoring</code> ship for Claude Code, Gemini CLI, Antigravity. Format mirrors <code>angular/skills</code>.
  </ngmd-card>
</ngmd-card-grid>

## Why this stack

<ngmd-accordion>
  <ngmd-accordion-item title="Angular" image="/logos/angular.svg" open>
    The framework. Standalone components, signals, control flow, function-based DI. Every authoring component is a regular Angular standalone unit you can drop into any Angular app.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="AnalogJS 2.5" image="https://analogjs.org/img/logos/analog-logo.svg">
    Angular's Nuxt / Next equivalent. Vite-based, SSR-capable, file-router-first. Markdown content collections, the build pipeline, and the entire routing model all come from here.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Vite" image="/logos/vite.svg">
    Dev server fast enough that the file router stays fun. Build is rollup-driven, SSR via Nitro under the hood.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Tailwind" image="https://cdn.simpleicons.org/tailwindcss/06B6D4">
    Utility CSS that doesn't impose a design system. Theme tokens live as CSS variables; the rest is regular Tailwind. <code>&#64;variant dark</code> powers class-based dark mode.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Shiki 1.29.2" image="https://shiki.style/logo.svg">
    VS Code-quality syntax highlighting. Pinned because newer 4.x conflicts with <code>&#64;analogjs/platform</code> 2.5's peer dep. Dual-theme HTML output: github-light + github-dark in one pass.
  </ngmd-accordion-item>
</ngmd-accordion>

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/stack/technologies" title="Technologies" />
  <ngmd-pill href="/stack/installation" title="Installation" />
  <ngmd-pill href="/concepts/markdown-routes" title="Routing model" />
  <ngmd-pill href="/concepts/components" title="Component reference" />
</ngmd-pill-row>
