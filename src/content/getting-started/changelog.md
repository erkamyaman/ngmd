---
title: Changelog
---

# Changelog

Release notes and version history for NgMd.

## Unreleased

A new `src/app/pages/[...slug].page.ts` catch-all serves every markdown page. The path under `src/content/` becomes the URL: drop `concepts/theming.md` and `/concepts/theming` resolves to it, no per-file wrapper required. Content reorganised into route-matching subfolders (`concepts/`, `stack/`, `getting-started/`).

The build pipeline followed suit. `link-guard`, `page-meta`, and `sitemap` plugins now walk the content tree directly instead of consulting a hardcoded route map, so adding a new page is one filesystem change.

Two agent skills shipped under `skills/` (`ngmd-new-site` and `ngmd-authoring`), mirroring the format `angular/skills` uses. Inline code inside headings now renders in the brand accent instead of the gray inline-code box.

## 0.0.x · May 2026

**Distribution.** `create-ngmd@0.0.3` published to npm. Scaffold with `pnpm create ngmd@latest my-docs` (also `npm`, `yarn`, `bun`). Live at [ngmd.netlify.app](https://ngmd.netlify.app).

**Authoring.** Eleven Angular components under `src/app/ui/`: callout, alert, card, tabs, pill row, workflow, hero, code-block, video, image. Code fences gained `file="..."` imports, `group="..."` tabs, `{1,3-5}` line highlighting, and `*Keyword` auto-linking.

**Site frame.** Sidebar accordion, breadcrumb, scroll-spy TOC, Cmd+K command palette, and a page footer per route with prev/next, edit-on-github, and last-updated (from `git log`).

**Build guards.** Internal anchors must resolve to real headings, external HTML anchors must carry `target="_blank"`. Sitemap and `robots.txt` emit automatically.

**Theming.** CSS-variable tokens, light/dark/auto cycle with no-flash boot script, fuchsia accent. Native View Transitions API for route crossfades (Chrome ≥111, Safari ≥18, Firefox ≥130).

## Roadmap

**Next.** Cmd+K palette ranking improvements (fuzzy plus weighted), custom domain (`ngmd.dev`), OG image auto-generation per page.

**v1.** Versioning, i18n, offline search index (Pagefind or Orama) with optional Algolia adapter, API reference auto-generation, published as `@ngmd/core`, `@ngmd/theme`, `@ngmd/cli`.

## Stack

AnalogJS 2.5, Vite 8, Angular 21, Tailwind v4, Shiki 1.29.2, Marked, Spartan UI (`@spartan-ng/brain` `0.0.1-alpha.694`).
