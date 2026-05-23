---
title: Changelog
---

# Changelog

Release notes and version history for NgMd.

## Unreleased

- Catch-all route (`src/app/pages/[...slug].page.ts`) serves every markdown page. Drop a `.md` under `src/content/`, get a route at the matching path. No per-file wrapper.
- Content reorganised into subfolders matching nav routes (`src/content/concepts/`, `src/content/stack/`, `src/content/getting-started/`).
- `link-guard`, `page-meta`, and `sitemap` plugins now walk the content tree directly; no more hardcoded route map to maintain.
- Two agent skills (`ngmd-new-site`, `ngmd-authoring`) under `skills/`, mirroring the format `angular/skills` uses.
- Inline code inside headings renders in the brand accent instead of the heavy gray box.

## 0.0.x (May 2026)

- **`create-ngmd@0.0.3` published** to npm. `pnpm create ngmd@latest my-docs` works (also `npm` / `yarn` / `bun`).
- **Authoring components** under `src/app/ui/`: callout, alert, card, tabs, pill row, workflow, hero, code-block, video, image. Eleven total, all standalone Angular.
- **Site frame**: sidebar accordion, breadcrumb, scroll-spy TOC, Cmd+K palette, page footer with prev/next + edit-on-github + last-updated (from `git log`).
- **Code-fence affordances**: ` ```ts file="..." ` imports, ` ```bash group="..." ` tabs, ` ```ts {1,3-5} ` line highlight, `*Keyword` auto-linking.
- **Build-time guards**: internal anchors must resolve to real headings, external HTML anchors must carry `target="_blank"`. Sitemap + robots.txt emitted automatically.
- **Theming**: CSS variable tokens, light / dark / auto cycle with no-flash boot script, fuchsia accent throughout.
- **Route transitions**: `withViewTransitions()` for native crossfades (Chrome ≥111, Safari ≥18, Firefox ≥130).
- **Live**: [ngmd.netlify.app](https://ngmd.netlify.app)

## Roadmap

**Next**
- Cmd+K palette ranking improvements (fuzzy + weighted)
- Custom domain (`ngmd.dev`)
- OG image auto-generation per page

**v1**
- Versioning support
- i18n / locale switcher
- Offline search index (Pagefind / Orama) + optional Algolia
- API reference auto-generation (the ng-doc-style differentiator)
- Published as `@ngmd/core`, `@ngmd/theme`, `@ngmd/cli`

## Stack

AnalogJS 2.5 · Vite 8 · Angular 21 · Tailwind v4 · Shiki 1.29.2 · Marked · Spartan UI (`@spartan-ng/brain` `0.0.1-alpha.694`)
