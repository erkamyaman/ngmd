# NgMd — Angular docs starter

A modern, AnalogJS-native, branding-flexible docs site starter and component toolkit for any team that wants to ship a Docusaurus / VitePress / Starlight style documentation site on the Angular stack.

## Name

**NgMd**.

Availability:
- npm: `ngmd`, `ng-md`, `@ngmd/*` scope — all free
- GitHub: no Angular-related collisions
- Domain: `ngmd.dev` unregistered

## Current status (v0 built)

Scaffolded at `~/Desktop/ngmd`. v0 proof-of-concept ships:

- AnalogJS app on Vite 8 + Angular 21 + pnpm
- Tailwind v4 with class-based dark mode (`@variant dark`)
- `@tailwindcss/typography` for `prose` markdown styling
- Markdown route at `/welcome` via AnalogJS content collection
- Shiki code highlighting (pinned to `^1.29.2`, requires `marked-shiki`)
- `@spartan-ng/brain` installed; hand-rolled Tailwind `hlm-card` stand-in
- Light/dark theme service with localStorage + system preference fallback
- Hardcoded sidebar nav
- Cmd+K command palette (custom, no Spartan cascade) with arrow-key nav

Build is green end-to-end.

## Problem

The Angular ecosystem has no canonical docs-site starter comparable to:

| Tool | Stars | Stack |
|------|-------|-------|
| Docusaurus | 64.9k | React / Meta-backed |
| VitePress | 17.7k | Vue / Vite |
| Nextra | 13.8k | Next.js / React |
| Starlight | 8.5k | Astro |

The Angular space:

- **ng-doc** (319 stars) — closest match. Full docs framework but single-maintainer (919 commits by one person, recent bugs sitting weeks with no response), heavy DX (`*.page.ts` descriptor + `.md` file per page), Nunjucks templating (foreign to Angular devs), Angular CLI locked, no versioning / i18n / MDX, branding moderately flexible.
- **AnalogJS** (3.1k stars) — has the foundation (Vite + markdown routes) but ships no docs template. Public discussion (#779) explicitly asked "should we ship a Starlight-style template?" — answer still no.
- **Scully** (2.5k stars) — dormant since Aug 2023.
- **Compodoc** (4.1k stars) — API reference generator only, not narrative docs.
- **adev** — bespoke, not packaged for reuse.

The lane is genuinely empty for a lightweight, modern-stack, brandable Angular docs starter.

## Target users

1. **Library authors** shipping API + narrative docs for an Angular library
2. **Product teams** shipping marketing + product docs on the Angular stack
3. **Internal eng teams** writing handbooks / runbooks they want self-hosted

Not aimed at API-reference-only use cases (Compodoc owns that).

## Principles

- **Zero config to ship a page** — drop a `.md` file, get a route.
- **Branding-first** — Tailwind tokens make a rebrand a one-file change.
- **No proprietary syntax** — Angular components inline in markdown, not Nunjucks.
- **Composable, not framework-locked** — built on AnalogJS, no replacement build system.
- **Own your UI** — copy/paste theme components (shadcn / Spartan model), not opaque npm dependencies.
- **Community-owned** from day one — no bus factor of one.

## Architecture (Spartan-inspired, Analog-powered)

| Spartan | NgMd equivalent | Role |
|---------|-----------------|------|
| `@spartan-ng/brain` | `@ngmd/core` | Headless primitives — renderer, content loader, nav builder, search index, anchor guard |
| `helm/*` (copy/paste) | `@ngmd/theme` source files | Styled docs UI — card, callout, sidebar, command palette, code block. Users copy them in and own them. |
| `@spartan-ng/cli` | `@ngmd/cli` | Scaffolding — `npx create-ngmd`, plus `ngmd add command` style component installers |

Runtime stays **AnalogJS** for file routing, markdown routes, SSR/SSG.

## Stack

- **AnalogJS** — Angular meta-framework on Vite. File-based routing, markdown route loading, SSR/SSG.
- **Spartan UI** — Tailwind-driven, shadcn-style copy/paste Angular components. CSS-variable theming. Combo is proven (spartan.ng's own docs are AnalogJS-based).
- **Tailwind v4** — styling layer Spartan rides on.
- **Tailwind Typography** — `prose` for markdown styling.
- **Shiki** — code highlighting (same as adev, VitePress, ng-doc).
- **Marked** — markdown engine (same as adev). Custom renderer adds `target="_blank"` to external links, anchor handling.
- **pnpm** — recommended package manager. **npm**, **yarn**, and **bun** are also supported; install snippets and the future CLI will ship examples for each.

## Scope

### In scope

- Markdown → HTML rendering pipeline (plain `.md` files under `src/app/pages/` route directly via AnalogJS, no `.page.ts` boilerplate for prose)
- Sidebar navigation (config-driven by v1)
- Cmd+K command palette with content-aware search
- Code highlighting (Shiki)
- Theming (light/dark, CSS-variable rebrand)
- Landing-page primitives (hero, feature grid) — addresses a gap ng-doc leaves open
- Versioning + i18n (built-in by v2, not bolted on)

### Explicitly punted on (rev'd Spartan-only migration, May 2026)

- adev-style custom HTML tags inside markdown (`<docs-callout>`, `<docs-card>`, etc.). Dual-pipeline (build-time vs runtime marked) and HTML-escape friction made them more cost than they were worth. If chrome components are needed, they live as Angular components in `.page.ts` files, not as marked preprocess hooks.
- Build-time anchor / external-link validation (was lifted from adev). Removed alongside the marked extensions.

### Out of scope (at least for v1)

- WebContainers / interactive playgrounds
- Tutorial infrastructure
- DocViewer-style pre-rendered HTML hydration

## Differentiation vs ng-doc

| Dimension | ng-doc | NgMd |
|-----------|--------|------|
| Build system | Angular CLI lock-in | AnalogJS / Vite, composable |
| Page authoring | `*.page.ts` descriptor + `.md` | Pure file-based `.md` |
| In-markdown dynamism | Nunjucks templating | Angular components inline |
| Branding | CSS vars, moderate | Tailwind tokens, very flexible |
| Component ownership | Library API | Copy/paste, own the source |
| Versioning | None | Built-in |
| i18n | None | Built-in |
| Landing primitives | Missing | Hero / feature grid / etc. |
| Bus factor | 1 maintainer | Community-owned from day one |

## v0 scope (built)

1. AnalogJS app with one `.md` route rendering — done
2. Spartan brain installed, hand-rolled `hlm-card` placeholder — done
3. Shiki highlighting on code blocks — done
4. Light/dark theme via CSS vars + toggle — done
5. Basic sidebar nav (hardcoded) — done
6. Cmd+K command palette — done

## v1 scope

- Config-driven navigation (single file users edit)
- Branding tokens (full theme system via CSS variables)
- Landing-page primitives (hero, feature grid, CTA blocks)
- More component vocabulary (callouts, code-block tabs, pill rows)
- Real Spartan helm command palette (when their CLI supports non-Nx)
- Right-side in-page TOC auto-generated from headings
- Breadcrumb auto-derived from route
- Content-aware Cmd+K search (scan markdown content, not hardcoded list)
- npm publish: `@ngmd/core`, `@ngmd/theme`, `@ngmd/cli` as scoped packages
- Documentation site about the starter itself

## v2+ scope (later)

- Versioning support
- i18n
- Search adapter (Orama offline + Algolia DocSearch optional)
- More themes
- `npx create-ngmd` scaffolder
- `ngmd add <component>` installer (shadcn-style)

## Deploy

Once v1 is feature-complete, ship the starter's own documentation site to Vercel or Netlify. The deployed site doubles as the starter's marketing page and its first real-world consumer.

## Things to lift directly from adev

Nothing, currently. The Spartan-only migration on May 2026 (branch `feat/spartan-ui-migration`) explored porting adev's `<docs-callout>` / `<docs-tabs>` / `<docs-code>` etc. as marked extensions, then ripped them after the dual-pipeline (build-time vs runtime marked instance) and HTML-escape friction proved heavier than the authoring win. If we revisit, the path is Angular components composed in `.page.ts`, not marked preprocess hooks.

## Lessons learned during v0

- AnalogJS needs `analog({ content: { highlighter: 'shiki' } })` in `vite.config.ts` to enable markdown handling. Without it, content collections throw `analog-content-list=true file format` errors.
- `marked-shiki` is a missing peer dep when using `shiki` highlighter — must be installed alongside.
- `shiki` must be pinned to `^1.29.2`. Version 4.x conflicts with `@analogjs/platform` 2.5's peer dep.
- Tailwind v4 needs `@plugin '@tailwindcss/typography';` directive in styles.css and `prose dark:prose-invert` on the wrapper to style rendered markdown.
- Spartan CLI is Nx-locked. For vanilla Angular/Analog projects, hand-rolling components or copying helm files manually is the practical path until Spartan ships a non-Nx schematic.
- Spartan helm components cascade dependencies: helm command requires helm dialog, helm input-group, helm utils, `@ng-icons/core`, `@ng-icons/lucide`, `clsx`. Copying one file means copying ~30+ files. Roll-your-own is faster for v0.

## File structure (v0)

```
src/
├── app/
│   ├── components/
│   │   ├── command-palette.ts    # Cmd+K palette
│   │   └── hlm-card.ts           # Spartan-style card (placeholder)
│   ├── pages/
│   │   ├── index.page.ts         # Home — feature cards
│   │   └── welcome.page.ts       # Loads markdown via injectContent
│   ├── app.config.ts             # Wires provideContent + Shiki + router
│   ├── app.ts                    # Shell — sidebar, header, search button
│   └── theme.ts                  # Light/dark service
├── content/
│   └── welcome.md                # Markdown content
├── styles.css                    # Tailwind + theme vars + typography plugin
└── main.ts
```

## Honest risks

- **Spartan is pre-v1** (`0.0.1-alpha.694` as of 2026-05). Breaking changes possible. Mitigation: pin to a specific alpha, copy helm components into our repo rather than depending on the package directly.
- **AnalogJS team could ship their own starter.** They've discussed it publicly (#779). If they do, NgMd's wedge narrows. Mitigation: ship faster, focus on what they explicitly said no to (opinionated theme, branding-first).
- **ng-doc could fix its DX issues** and grow community. Mitigation: lean into the differentiation (AnalogJS-native, file-based markdown, Tailwind tokens, copy/paste UI).
- **Bus factor.** Mitigation: open the org early, accept contributions, document everything from day one.

## Open questions

- Domain to register (`ngmd.dev` available)
- License (likely MIT)
- Repo location (personal or new org)
- Branding direction (logo, color palette)
- Whether `@ngmd/core` should depend on `@analogjs/content` directly or stay framework-agnostic with adapters
