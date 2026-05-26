---
title: Changelog
---

# Changelog

Release notes and version history for NgMd.

## 0.0.9 <ngmd-badge variant="new">Latest</ngmd-badge>

**Inline code chips redesigned.** Body inline code (`` `like this` ``) now wears a thin fuchsia gradient border (`#f0abfc → #d946ef → #a21caf`, three stops in the fuchsia hue family) over a clean `--bg` inner fill that matches the page surface exactly. Light mode uses a 1.5px border for clarity against white; dark mode stays at 1px.

**Home install picker.** The CTA section now has a tabbed install command box: npm (default) / pnpm / yarn / bun, each with its simpleicons brand logo. One command renders below at a time. Copy button on the right with a 1.5s "copied" check confirmation. Tab strip width is fixed so it doesn't reflow as you switch between commands.

**Tab active state uses the accent.** Both the new home install picker and the existing `<ngmd-tabs>` component now color the active tab's label and underline with `var(--accent)` (fuchsia in the default theme). Hover-zinc is scoped to inactive tabs only so the active state isn't washed out when the cursor passes over.

**Card icons go neutral.** Swapped Lucide icon color in `<ngmd-card>` and home features grid from `var(--accent)` to `var(--fg)`. Icons read as quiet anchors instead of competing with the brand accent that lives on text and active states.

**Alert visibility in light mode.** Added a thin `zinc-200` border on the top, right, and bottom of `<ngmd-alert>` plus bumped the surface from `bg-zinc-50` to `bg-zinc-100`. Alerts now read as distinct surfaces against a white page instead of nearly-blending into it.

## 0.0.8

**Tabs gained `icon=` and `image=` inputs.** `<ngmd-tab>` now accepts the same `image="<url>"` brand-logo pattern as `<ngmd-card>`, plus `icon="<lucide-name>"` for the Lucide set (`book`, `box`, `code`, `compass`, `file`, `layers`, `lightbulb`, `palette`, `rocket`, `search`, `settings`, `shield`, `sparkles`, `terminal`, `wrench`, `zap`). Icon renders left of the tab label; image takes priority if both are set.

**Build-time code-group tabs gained `image=` too.** Fenced code blocks tagged with `group="install" name="pnpm" image="..."` now render a brand icon next to the tab label, no `<ngmd-tabs>` component needed. Used across welcome, showcase, markdown-routes, installation. Powered by `simpleicons.org/<slug>/<hex>` CDN URLs.

**Demo page renamed to Showcase.** `src/content/concepts/demo.md` → `src/content/concepts/showcase.md`, URL `/concepts/demo` → `/concepts/showcase`. Nav label and every cross-link follow. URL path now matches the doc title.

**Inline code visual.** Inline `` `code` `` chips in markdown use `--bg-muted` background, `--fg` text, `--border-strong` outline, and `font-weight: 500` for clearer pop without the previous accent-tinted look. Sidebar / TOC active-row `--accent-soft` settled at `rgba(217, 70, 239, 0.15)` in both light and dark for visual parity with the prior `bg-fuchsia-500/10` baseline.

**Skills updated.** `ngmd-authoring` now documents tab `icon=` / `image=` inputs and the matching `image=` attribute on fenced `group=` code tabs.

## 0.0.7

**Token-driven theming everywhere.** Every accent-aware class in core components (sidebar, TOC, palette, page footer, pill, card, heading anchors, hero, home page) now reads `var(--accent)`, `var(--accent-strong)`, `var(--accent-soft)`, `var(--accent-gradient)`, or `var(--accent-gradient-soft)` instead of hardcoded `fuchsia-*` Tailwind utilities. Swap one token in `src/styles.css` and the whole site re-skins. Per-variant components (`callout`, `alert`, `badge`) keep their literal severity colours by design.

**Two new tokens.** `--accent-strong` (deeper shade for active text on light surfaces) and `--accent-gradient-soft` (low-opacity gradient for hero washes and the home spotlight). Both declared in `:root` and `.dark`.

**Help folder reorganised.** Section parent stays at root, children move under a same-named folder: `src/content/help.md` → `/help`, `src/content/help/contribute.md` → `/help/contribute`, `src/content/help/sponsor.md` → `/help/sponsor`. URL pattern now matches the nav grouping. README community links and cross-page links updated.

**Marked parsing fix.** Backtick-wrapped custom-element references like `` `<ngmd-callout>` `` in prose were leaking out as real DOM elements through marked's parser, breaking page layouts. Angle brackets inside backticks now escape to `&lt;` / `&gt;` across the changelog, demo, markdown-routes, and technologies pages.

**Code-copy scoped to markdown.** The `app-code-copy` DOM walker now targets `analog-markdown` / `analog-markdown-route` pres only, so it doesn't duplicate the copy button that `NgmdCodeBlock` ships internally on TS-page instances.

**Code-block visibility fix.** The `:not(:defined)` flash-prevention CSS rule that hides custom elements until they upgrade was still listing `ngmd-code-block` after it was removed from `@angular/elements` registration in 0.0.6 — which left every code-block invisible forever. Rule entry removed.

**Theming doc rewritten.** [/concepts/theming](/concepts/theming) now lists all six accent tokens with what each is for, shows the `text-[color:var(--accent)]` / `bg-[color:var(--accent-soft)]` consumption pattern, calls out the inline-style fallback for gradient images, and explains the `!` important modifier needed when an active state has to beat a static base utility.

**Skills updated.** `ngmd-new-site` and `ngmd-authoring` skills now reflect the seventeen-component count, the section + folder routing pattern, the closing-tag requirement for custom elements in markdown, and the full accent token set.

## 0.0.6

**Site footer.** `&lt;app-site-footer&gt;` renders on every route: `© {year} Erkam Yaman. Released under the MIT License.` on the left, `erkamyaman/ngmd` GitHub link on the right.

**Code-block copy button.** `&lt;ngmd-code-block&gt;` ships its own copy button. Sits inline in the header bar when `header` is set, floats top-right otherwise. Independent of the markdown DOM walker, so it works for TS-page instances too.

**Self-closing custom-element tags fixed.** HTML parsers don't honor `&lt;ngmd-pill ... /&gt;` syntax, so adjacent siblings were nesting inside the previous one. All 34 self-closing instances across `&lt;ngmd-pill&gt;`, `&lt;ngmd-video&gt;`, `&lt;ngmd-image&gt;` now use explicit closing tags. Pill rows now actually space out.

**Code-block freed from Custom Element registration.** `ngmd-code-block` is imported directly in TS pages and removed from `@angular/elements` to let multi-line `[code]` signal-input bindings propagate reliably. Fenced ` ``` ` blocks remain the recommended path for markdown.

**Showcase rename.** `/concepts/showcase` renamed to "Showcase" in the sidebar, home CTA, and every cross-link. URL path unchanged.

**Doc fact-check.** Removed six hallucinated claims about component counts and Custom Element coverage. The honest number is 17 NgmdUi components, 16 of which render inline in markdown.

## 0.0.5

**Tabs work in markdown.** Rewrote `&lt;ngmd-tabs&gt;` / `&lt;ngmd-tab&gt;` so each tab is a real component (not a `&lt;ng-template ngmdTab&gt;` directive). Survives `@angular/elements` upgrade and renders inline in `.md` body.

**Cards gained icon and image inputs.** Pass `icon="<lucide-name>"` for a Lucide glyph tinted fuchsia, or `image="<url>"` for a full-colour brand SVG. Card backgrounds and grid heights aligned across siblings.

**Alerts redesigned to adev shape.** Severity icon + uppercase tag (`INFO`, `WARNING`, `CRITICAL`, `HELPFUL`, `IMPORTANT`) prefixed inline with the body prose. Same visual as `docs-callout`.

**Site frame additions.** `&lt;app-source-actions&gt;` floats pencil + `&lt;&gt;` icons at top-right of every docs route (edit on GitHub / view source on GitHub). The bottom "Edit this page" link is gone; `last-updated` parked.

**Doc pages reshuffled.** `/support` split into `/help` (get-help) and `/sponsor` (give-help). New `/contribute` page with `CONTRIBUTING.md` at repo root. `/stack/overview` rewritten around architecture. `/stack/installation` tucks Path B inside an accordion. `/stack/technologies` collapsed to 3 cards + tables. Brand SVGs added to all tech rows.

**Spartan UI removed.** `&lt;ngmd-tabs&gt;` rebuilt with hand-rolled ARIA + arrow / Home / End keyboard navigation. One less dep to pin.

<ngmd-callout type="tip" title="Migrating from an earlier scaffold">
  If you scaffolded with <code>create-ngmd@0.0.1</code> or <code>0.0.2</code> you'll have a thin <code>.page.ts</code> wrapper per markdown route. Delete them and let the catch-all handle every prose page. The named <code>index.page.ts</code> and any TypeScript-driven pages keep their files.
</ngmd-callout>

## 0.0.4

A new `src/app/pages/[...slug].page.ts` catch-all serves every markdown page. The path under `src/content/` becomes the URL: drop `concepts/theming.md` and `/concepts/theming` resolves to it, no per-file wrapper required. Content reorganised into route-matching subfolders (`concepts/`, `stack/`, `getting-started/`).

The build pipeline followed suit. `link-guard`, `page-meta`, and `sitemap` plugins now walk the content tree directly instead of consulting a hardcoded route map, so adding a new page is one filesystem change.

Three new authoring components shipped: `ngmd-accordion`, `ngmd-card-grid`, and `ngmd-badge`. All NgmdUi components also render inline in `.md` files via Angular Elements registration.

Two agent skills shipped under `skills/` (`ngmd-new-site` and `ngmd-authoring`), mirroring the format `angular/skills` uses. Inline code inside headings now renders in the brand accent instead of the gray inline-code box.

## 0.0.x · May 2026 <ngmd-badge variant="beta">Beta</ngmd-badge>

<ngmd-card-grid columns="2">
  <ngmd-card icon="rocket" title="Distribution">
    <code>create-ngmd@0.0.9</code> on npm. Scaffold with <code>pnpm create ngmd&#64;latest my-docs</code> (also <code>npm</code>, <code>yarn</code>, <code>bun</code>). Live at <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">ngmd.netlify.app</a>.
  </ngmd-card>
  <ngmd-card icon="box" title="Authoring">
    Seventeen Angular components under <code>src/app/ui/</code>. Code fences gained <code>file="..."</code> imports, <code>group="..."</code> tabs, <code>{1,3-5}</code> line highlighting, and <code>*Keyword</code> auto-linking.
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

AnalogJS 2.5, Vite 8, Angular, Tailwind v4, Shiki 1.29.2, Marked.
