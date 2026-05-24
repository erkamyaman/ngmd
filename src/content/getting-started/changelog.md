---
title: Changelog
---

# Changelog

Release notes and version history for NgMd.

## Unreleased <ngmd-badge variant="new">In progress</ngmd-badge>

A new `src/app/pages/[...slug].page.ts` catch-all serves every markdown page. The path under `src/content/` becomes the URL: drop `concepts/theming.md` and `/concepts/theming` resolves to it, no per-file wrapper required. Content reorganised into route-matching subfolders (`concepts/`, `stack/`, `getting-started/`).

The build pipeline followed suit. `link-guard`, `page-meta`, and `sitemap` plugins now walk the content tree directly instead of consulting a hardcoded route map, so adding a new page is one filesystem change.

Three new authoring components shipped: `ngmd-accordion`, `ngmd-card-grid`, and `ngmd-badge`. All NgmdUi components now also render inline in `.md` files via Angular Elements registration, so the catch-all proves it.

<ngmd-callout type="tip" title="Migrating from an earlier scaffold">
  If you scaffolded with <code>create-ngmd@0.0.1</code> or <code>0.0.2</code> you'll have a thin <code>.page.ts</code> wrapper per markdown route. Delete them and let the catch-all handle every prose page. The named <code>index.page.ts</code> and any TypeScript-driven pages keep their files.
</ngmd-callout>

Two agent skills shipped under `skills/` (`ngmd-new-site` and `ngmd-authoring`), mirroring the format `angular/skills` uses. Inline code inside headings now renders in the brand accent instead of the gray inline-code box.

## 0.0.x · May 2026 <ngmd-badge variant="beta">Beta</ngmd-badge>

<ngmd-card-grid columns="2">
  <ngmd-card icon="rocket" title="Distribution">
    <code>create-ngmd@0.0.3</code> on npm. Scaffold with <code>pnpm create ngmd&#64;latest my-docs</code> (also <code>npm</code>, <code>yarn</code>, <code>bun</code>). Live at <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">ngmd.netlify.app</a>.
  </ngmd-card>
  <ngmd-card icon="box" title="Authoring">
    Fourteen Angular components under <code>src/app/ui/</code>. Code fences gained <code>file="..."</code> imports, <code>group="..."</code> tabs, <code>{1,3-5}</code> line highlighting, and <code>*Keyword</code> auto-linking.
  </ngmd-card>
  <ngmd-card icon="layers" title="Site frame">
    Sidebar accordion, breadcrumb, scroll-spy TOC, Cmd+K command palette, and a page footer per route with prev/next, edit-on-github, and last-updated (from <code>git log</code>).
  </ngmd-card>
  <ngmd-card icon="shield" title="Build guards">
    Internal anchors must resolve to real headings, external HTML anchors must carry <code>target="_blank"</code>. Sitemap and <code>robots.txt</code> emit automatically.
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming">
    CSS-variable tokens, light/dark/auto cycle with no-flash boot script, fuchsia accent. Native View Transitions API for route crossfades.
  </ngmd-card>
  <ngmd-card icon="sparkles" title="Skills" link="/ai/agent-skills" cta="Read">
    <code>ngmd-new-site</code> and <code>ngmd-authoring</code> for Claude Code, Gemini CLI, and Antigravity.
  </ngmd-card>
</ngmd-card-grid>

## Roadmap

<ngmd-accordion>
  <ngmd-accordion-item title="Next" open>
    Cmd+K palette ranking improvements (fuzzy plus weighted), custom domain (<code>ngmd.dev</code>), OG image auto-generation per page.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="v1">
    Versioning, i18n, offline search index (Pagefind or Orama) with optional Algolia adapter, API reference auto-generation, published as <code>&#64;ngmd/core</code>, <code>&#64;ngmd/theme</code>, <code>&#64;ngmd/cli</code>.
  </ngmd-accordion-item>
</ngmd-accordion>

## Stack <ngmd-badge variant="stable">Pinned</ngmd-badge>

AnalogJS 2.5, Vite 8, Angular 21, Tailwind v4, Shiki 1.29.2, Marked.
