---
name: ngmd-authoring
description: Writes and edits pages in an NgMd Angular docs site. Use this skill whenever a user is adding, editing, or refactoring documentation content in an NgMd project. Covers the prose-vs-component page model, the seventeen authoring components (sixteen inline-in-markdown via Custom Elements, plus code-block which uses fenced ``` blocks), markdown affordances (`*Keyword` autolinks, file-imported code blocks, group tabs, line highlighting), the build-time link guards, and the prose voice the project favours.
license: MIT
compatibility: Requires an existing NgMd site. To scaffold one first, use the `ngmd-new-site` skill.
metadata:
  author: Kam (@erkamyaman)
  version: '1.0'
---

# NgMd Authoring

You are an expert in TypeScript, Angular, AnalogJS, and the NgMd docs starter. You write documentation pages using NgMd's two-pattern authoring model: prose pages in markdown, component pages in TypeScript composing NgMd's authoring components. Your prose is direct, terse, and free of marketing fluff.

When asked to write or edit an NgMd page, follow this skill.

## 1. Pick the page pattern

NgMd supports two patterns. Pick one per page.

### Prose page (`.md`)

- Lives in `src/content/<path>/<name>.md`. The path under `src/content/` becomes the URL: `src/content/concepts/theming.md` resolves at `/concepts/theming`.
- **No `.page.ts` wrapper required.** A single catch-all (`src/app/pages/[...slug].page.ts`, ships with NgMd) handles every prose route. This mirrors adev (angular.dev) where `docs.component.ts` serves every documentation page.
- Best for: tutorials, conceptual explainers, reference text, anything that is mostly paragraphs and headings.

### Component page (`.page.ts`)

- Lives in `src/app/pages/<path>/<name>.page.ts`.
- Has no markdown file; the Angular template composes `NgmdUi` authoring components directly.
- Best for: landing pages, overviews with hero + card grids, multi-tab walkthroughs, anywhere you need component layout that prose markdown cannot express.
- Angular's router prefers the more specific match, so a named `.page.ts` wins over the catch-all for that route.

**Decision rule**: if the page is 80%+ paragraphs, drop a `.md` in `src/content/` and stop. If the page is 80%+ components, write a `.page.ts`. Mixed pages are `.page.ts` with `<analog-markdown [content]>` embedded for the prose chunks.

## 2. Authoring components (the `NgmdUi` set)

All seventeen components are barrelled from `src/app/ui/index.ts`. The catch-all (`src/app/pages/[...slug].page.ts`) already spreads `...NgmdUi` into its imports, so every component works inline in any `.md` file rendered by the catch-all (which is every prose route). For a named component page, import the bundle yourself:

```ts
import { Component } from '@angular/core';
import { NgmdUi } from '../ui';

@Component({
  selector: 'app-my-page',
  imports: [...NgmdUi],
  template: `...`,
})
export default class MyPage {}
```

For lighter pages, import only what you use (`import { NgmdCallout } from '../ui';`).

In a **prose page** (`.md`), drop any of the sixteen Custom-Element-registered components inline as raw HTML. (Code-block isn't one of them — use fenced ``` instead for code in prose.) The catch-all spreads `NgmdUi` into its imports, so analog-markdown compiles every NgmdUi selector during runtime markdown rendering. `<ngmd-video>` and `<ngmd-image>` are additionally wired as marked extensions (build-time HTML rewrites), so they work even outside the catch-all (e.g. in any custom `.page.ts` route).

### `<ngmd-callout>` — bordered notice with coloured side stripe

```html
<ngmd-callout type="info" title="Note">
  Body. Inline code and links work.
</ngmd-callout>
```

- `type`: `info` (default, blue), `tip` (teal), `success` (emerald), `warning` (amber), `danger` (red).
- `title`: optional bold heading line.
- Use for: standalone advisory blocks inside prose.

### `<ngmd-alert>` — single-line banner, lighter weight than a callout

```html
<ngmd-alert severity="warning">
  Watch out, but the page still works.
</ngmd-alert>
```

- `severity`: `info` (default), `warning`, `critical`, `helpful`, `important`.
- No title slot. One-liner content.
- Use for: inline asides that do not warrant a full callout.

### `<ngmd-card>` — bordered card, optionally a router link

```html
<ngmd-card title="Routing" link="/concepts/markdown-routes" cta="Read">
  How file-based routing works.
</ngmd-card>
```

- `title`, `link`, `cta` are all optional. With `link`, the whole card becomes a router link.
- Use for: card grids, feature overviews, "next steps" sections.

### `<ngmd-tabs>` and `<ngmd-tab>`

```html
<ngmd-tabs>
  <ngmd-tab title="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220">
    <pre><code>pnpm add foo</code></pre>
  </ngmd-tab>
  <ngmd-tab title="npm" image="https://cdn.simpleicons.org/npm/CB3837">
    <pre><code>npm install foo</code></pre>
  </ngmd-tab>
  <ngmd-tab title="CLI" icon="terminal">
    <pre><code>ng add foo</code></pre>
  </ngmd-tab>
</ngmd-tabs>
```

- Each tab is an `<ngmd-tab title="Label">`. Order in the template is order in the UI.
- `image="<url>"` — brand SVG / logo (full color, e.g. simpleicons CDN). Takes priority if both `image` and `icon` are set.
- `icon="<name>"` — Lucide glyph in the brand accent. Same set as `<ngmd-card>`: `book`, `box`, `code`, `compass`, `file`, `layers`, `lightbulb`, `palette`, `rocket`, `search`, `settings`, `shield`, `sparkles`, `terminal`, `wrench`, `zap`.
- Works inline in `.md` files (children are real Custom Elements, not directives).
- Hand-rolled signals plus `[attr.aria-selected]` / `[tabindex]` for keyboard navigation and ARIA wiring. Arrow keys, Home, End all jump between triggers with focus.
- For installation-command tabsets specifically, the markdown `group="..."` code-fence affordance is still the lightest option since it pre-renders through Shiki at build time — and it accepts `image="<url>"` too (see section 3).

### `<ngmd-workflow>` and `<ngmd-step>`

```html
<ngmd-workflow>
  <ngmd-step title="Install">
    Run <code>pnpm install</code>.
  </ngmd-step>
  <ngmd-step title="Configure">
    Edit <code>src/ngmd.config.ts</code>.
  </ngmd-step>
  <ngmd-step title="Run">
    Start the dev server.
  </ngmd-step>
</ngmd-workflow>
```

- Numbered steps with a connecting line. Numbers are auto-assigned.
- Use for: ordered, must-follow-in-sequence instructions. For unordered tips, use a list.

### `<ngmd-pill>` and `<ngmd-pill-row>`

```html
<ngmd-pill-row>
  <ngmd-pill href="/welcome" title="Get started"></ngmd-pill>
  <ngmd-pill href="https://github.com/you/repo" title="GitHub"></ngmd-pill>
</ngmd-pill-row>
```

- Pills auto-detect external vs internal (anything starting with `http(s)://` is external).
- Use for: link chips above the fold, related-reading rows.
- **In markdown, always use explicit closing tags** (`</ngmd-pill>`). HTML parsers do NOT honour self-closing syntax (`<ngmd-pill ... />`) on custom-element tags; the next sibling silently nests inside the previous one and the layout breaks. Self-closing only works inside Angular `.page.ts` templates.

### `<ngmd-hero>` — large intro block with optional gradient title

```html
<ngmd-hero title="Build docs in minutes" gradient>
  The Angular docs starter you've been missing.
</ngmd-hero>
```

- `title` required. `gradient` (boolean) switches the title to the brand gradient and tints the background.
- Use for: at most one per page, at the top.

### `<ngmd-code-block>` — runtime-highlighted code with header

```html
<ngmd-code-block
  header="src/main.ts"
  language="ts"
  code="bootstrapApplication(App);"
/>
```

- For author-supplied snippets in TypeScript pages where you need a header bar.
- Shiki lazy-loads on first render so it does not bloat the initial bundle.
- For markdown pages, **prefer fenced code blocks** with `file="..."` or `group="..."` (see section 3); the build-time pipeline highlights them faster and supports line ranges.

### `<ngmd-video>` — YouTube / Vimeo embed

```html
<ngmd-video src="https://www.youtube.com/watch?v=..." title="Demo"></ngmd-video>
```

- Works in markdown and component pages.
- Accepts `youtube.com/watch?v=...`, `youtu.be/...`, `vimeo.com/...`, or a pre-baked embed URL.
- In markdown, use explicit closing tag as shown (HTML parsers don't honour self-closing on custom elements). Self-closing is fine inside `.page.ts` Angular templates.

### `<ngmd-image>` — figure with optional caption

```html
<ngmd-image
  src="/screenshot.png"
  alt="Sidebar accordion"
  caption="The sidebar reads from ngmd.config.ts"
  width="600px"
></ngmd-image>
```

- Works in markdown and component pages.
- `alt` required for a11y. `caption` and `width` optional.
- In markdown, use explicit closing tag (self-closing breaks HTML parsing on custom elements).

### `<ngmd-accordion>` + `<ngmd-accordion-item>` — disclosure list

```html
<ngmd-accordion>
  <ngmd-accordion-item title="What is NgMd?" open>
    A docs starter built on AnalogJS.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Why this stack?">
    AnalogJS plus Vite plus Tailwind plus Shiki.
  </ngmd-accordion-item>
</ngmd-accordion>
```

- Backed by native `<details>` element. Keyboard nav and a11y for free.
- `title` required on each item. `open` (boolean) starts that item expanded.
- Use for: FAQ pages, "show details" sections, anything disclosable.

### `<ngmd-card-grid>` — n-up card layout

```html
<ngmd-card-grid columns="2">
  <ngmd-card title="Routing" link="/concepts/markdown-routes">...</ngmd-card>
  <ngmd-card title="Theming" link="/concepts/theming">...</ngmd-card>
</ngmd-card-grid>
```

- `columns`: `2` (default) or `3`. Stacks to single column on mobile.
- Wraps any block children; mostly used to pair with `<ngmd-card>`.

### `<ngmd-badge>` — inline status pill

```html
<ngmd-badge variant="beta">Beta</ngmd-badge>
```

- `variant`: `alpha` (red), `beta` (amber), `stable` (emerald), `deprecated` (zinc, strikethrough), `new` (fuchsia, default).
- Sits inline next to headings, in cards, or in prose. Doesn't break the text line.

## 3. Markdown affordances

These work inside `.md` files only. Each is a marked extension shipped in `src/marked-extensions/`.

### `*Keyword` auto-link

Define keywords in `src/ngmd.config.ts > keywords`:

```ts
keywords: {
  AnalogJS: 'https://analogjs.org',
  Angular: 'https://angular.dev',
}
```

Then in prose, prefix the name with `*` to turn it into a link without writing the URL each time:

```md
NgMd builds on *AnalogJS and *Angular.
```

- Unknown keywords log a warning at build time and fall back to literal `*Name` text (build does not fail).
- The leading `*` must be the first char of the keyword token. Wrap punctuation around it, not inside it.

### `file="..."` code imports

Import code from a real file so doc examples stay in sync with source:

````md
```ts file="src/app/pages/welcome.page.ts"
```
````

- GitHub-style line ranges work: `file="src/app/foo.ts#L1-L5"`.
- Lines tagged `// ngmd-ignore-line` in the source file are stripped from the imported snippet, so you can hide setup boilerplate while keeping the source runnable.
- The fence body stays empty; the extension fills it from disk.

### `group="..."` code tabs

Tag adjacent fences with the same `group` to merge them into a tabbed UI:

````md
```bash group="install" name="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220" active
pnpm create ngmd@latest my-docs
```

```bash group="install" name="npm" image="https://cdn.simpleicons.org/npm/CB3837"
npm create ngmd@latest my-docs
```
````

- `name` is the tab label. `active` picks the initial tab.
- `image="<url>"` is optional — a brand icon shown before the tab label (e.g. simpleicons CDN works well).
- All fences with the same `group` value collapse into one tabset, in document order.

### Line highlighting with `{1,3-5}`

Append a brace list after the language to highlight matching lines:

````md
```ts {3-5}
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  template: '<h1>Hello, NgMd</h1>',
})
export class Hello {}
```
````

- Comma-separated single lines or ranges, e.g. `{1,3-5,8}`.

### Inline `<ngmd-video>` and `<ngmd-image>`

These two components are wired through marked extensions, so they parse correctly inside prose markdown. See section 2 for the syntax.

## 4. Frontmatter

Every prose page needs frontmatter at the top:

```md
---
title: Page Title
description: One-line summary used in meta tags and the command palette.
---
```

- `title` is consumed by `NgmdTitleStrategy` to set `<title>`. Without it, the route falls back to a generic title.
- `description` is consumed by the page-meta plugin for `<meta name="description">` and social previews.
- Add custom keys (`order: 1`, `tags: ['intro']`) and read them as a typed shape: `injectContent<{ title: string; order: number }>(...)`.

## 5. Prose voice

Match the surrounding house voice. Concrete rules:

- **No em-dashes.** Use periods, commas, or parentheses instead.
- **No marketing fluff.** Strike `first-class`, `powerful`, `seamless`, `blazingly fast`, `cutting-edge`, `out-of-the-box`. State the capability and stop.
- **No trailing `providing...` clauses.** End the sentence at the verb, not at a participle dangling its motivation.
- **Active voice, present tense.** "NgMd builds on AnalogJS." Not "Built on AnalogJS, NgMd provides..."
- **One claim per sentence.** Split compound sentences when the user has to re-read them.
- **Concrete over abstract.** "Edit `src/ngmd.config.ts > nav`" beats "Configure your navigation in the appropriate config location."
- **Names are nouns.** Refer to components and files by their actual identifier (`<ngmd-callout>`, `ngmd.config.ts`), in code voice, not paraphrased.

When in doubt, read the surrounding paragraphs and mirror their cadence. Do not introduce a new register.

## 6. Internal vs external links

- **Internal**: write as standard markdown `[label](/route)` or `[label](/route#fragment)`. The internal link guard verifies the target resolves and the fragment matches a real heading. A bad link **fails the build** rather than shipping a 404.
- **External**: write as standard markdown `[label](https://example.com)`. The external link guard auto-adds `target="_blank" rel="noopener noreferrer"` at build time. If you write external links as raw HTML, you must include `target="_blank"` yourself or the build fails.

Heading IDs are slugified from the heading text by the TOC component. So `## Quick start` produces `id="quick-start"`. Match that slug in any link fragment.

## 7. Add a new page (checklist)

1. **Decide the pattern** (section 1).
2. **Create the file:**
   - Prose: `src/content/<path>/<name>.md` with frontmatter + body. The path under `src/content/` becomes the URL. No wrapper needed; the catch-all serves it.
   - Component: `src/app/pages/<path>/<name>.page.ts` with `default export` and `@Component`. Only when the page needs a bespoke layout or composes `NgmdUi` directly.
3. **Add the route to the nav** in `src/ngmd.config.ts > nav`. Pick the section that fits or add a new one.
4. **Run the dev server.** The new route should appear in the sidebar and TOC.
5. **Run `pnpm run build`.** Link guards run only at build time, so verify before pushing.

## 8. Edit an existing page

When asked to edit a page:

1. **Read the file first.** Match the existing voice. Do not rewrite tone unless explicitly asked.
2. **Edit the smallest surface that solves the problem.** Refactoring is a separate ask.
3. **If the edit changes a heading**, check whether anything links to that heading by its slug. The internal link guard catches direct links, but if you rename without updating callers the build fails.
4. **If the edit removes a route** (deletes a `.md` file or named `.page.ts`), also remove its entry from `src/ngmd.config.ts > nav`. The sidebar will silently render a dead link otherwise.

## 9. Common mistakes to avoid

- **Inventing components.** The eleven components listed in section 2 are the complete set. Do not write `<ngmd-button>`, `<ngmd-accordion>`, etc. If you need a new affordance, the user should add it as a real component first.
- **Hardcoding URLs.** Use the `keywords` map in `ngmd.config.ts` for repeated external links so the URL changes in one place.
- **Skipping frontmatter.** A `.md` file without `title:` will render but the page `<title>` and command palette entry will be wrong.
- **Mixing prose and component patterns thoughtlessly.** Embedding a single `<ngmd-callout>` inside an otherwise prose-only page works (because most component pages import `NgmdUi` somewhere), but if you need three or more components, switch the whole page to the component pattern.
- **Using raw `<a href>` for external links.** The link guard catches missing `target="_blank"` and fails the build. Prefer markdown `[label](url)`.

## 10. Build before declaring done

```bash
pnpm run build
```

Type checking, link guards, page-meta extraction, and sitemap generation all run at build time. The user wants to know early when a link breaks, not at deploy time. Always offer to run the build as the last step of a non-trivial edit.

_IMPORTANT_: Do **not** commit, push, or open a pull request unless the user explicitly asks. Authoring stops at "the edit is saved and the build passes." The git verbs are theirs.
