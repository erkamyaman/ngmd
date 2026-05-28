---
title: Markdown Routes
---

<ngmd-hero title="Markdown Routes" gradient>
  Drop a markdown file at the right path and the catch-all handles routing, rendering, sidebar, TOC, prev/next, and edit-on-github. No per-page wrapper to write.
</ngmd-hero>

# Markdown Routes

NgMd turns markdown files into routes automatically via *AnalogJS content collections.

## File-based routing

Drop a `.md` file under `src/content/`, get a route at the matching path. No per-page wrapper to write. The mapping is direct: the path under `src/content/` becomes the URL.

- `src/content/welcome.md` → `/welcome`
- `src/content/getting-started/about.md` → `/getting-started/about`
- `src/content/concepts/theming.md` → `/concepts/theming`

A common pattern is a section parent at root plus children in a same-named folder:

- `src/content/help.md` → `/help`
- `src/content/help/contribute.md` → `/help/contribute`
- `src/content/help/sponsor.md` → `/help/sponsor`

The parent and its children are independent routes. No `index.md` convention needed.

One shared `src/app/pages/[...slug].page.ts` handles every prose route. It reads the slug from the URL, fetches the matching markdown body, and renders it with `&lt;analog-markdown [content]&gt;`. The pattern mirrors adev (angular.dev) where `docs.component.ts` serves every documentation page.

For pages that need bespoke layouts or want to compose authoring components directly (callouts, tabs, cards, workflows, hero), write a named `.page.ts` in `src/app/pages/` instead. Angular's router prefers the more specific match, so a named route wins over the catch-all.

## Page frontmatter

Frontmatter at the top of each markdown file is parsed and made available as typed attributes:

```md
---
title: Welcome
description: A friendly intro
order: 1
---
```

You can read these in your page component:

```ts
const welcome$ = injectContent<{ title: string; order: number }>('slug');
```

The `'slug'` argument names the route param that the catch-all populates with the URL path. For a named `.page.ts` that handles a specific file, pass `{ customFilename: 'welcome' }` instead.

## Dynamic and catch-all routes

Two kinds of bracket syntax in AnalogJS file routing:

| Pattern | File path | Matches |
|---|---|---|
| Single segment | `src/app/pages/blog/[slug].page.ts` | `/blog/anything` (one segment) |
| Catch-all | `src/app/pages/[...slug].page.ts` | `/anything/at/any/depth` |

NgMd ships only the catch-all (`[...slug].page.ts`) to serve every prose route. Single-segment dynamic routes work the same way if you need them for a specific section. The `slug` param becomes available via `injectActivatedRoute` or by passing `'slug'` as the first arg to `injectContent`.

## Layouts and nested routes

Layouts are just Angular components rendered around the `&lt;router-outlet&gt;`. NgMd's [`app.ts`](https://github.com/erkamyaman/ngmd/blob/main/src/app/app.ts) is the default docs layout: header, sidebar accordion, breadcrumb, scroll-spy TOC, page footer. Replace or extend it like any other Angular component. The catch-all and component pages render inside its `&lt;router-outlet&gt;`.

## Code highlighting

All fenced code blocks pass through Shiki at build time. NgMd emits dual-theme HTML (github-light and github-dark in one pass) and swaps the active palette under `.dark` via a small CSS rule in `styles.css`. To change themes, edit `shikiOptions` in `vite.config.ts`:

```ts
analog({
  content: {
    highlighter: 'shiki',
    shikiOptions: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
```

## Inline media

Two marked extensions ship runtime-side so you can drop media into prose without writing TypeScript.

```html
<ngmd-video src="https://www.youtube.com/watch?v=..." title="Demo"></ngmd-video>

<ngmd-image src="/screenshot.png" alt="Sidebar accordion" caption="The sidebar reads from ngmd.config.ts"></ngmd-image>
```

YouTube and Vimeo URLs are normalised to player iframes. Images get figure plus caption plus lazy-load by default.

## Link integrity

<ngmd-alert severity="critical">
  The build pipeline <strong>fails</strong> on broken anchors. Internal <code>#fragment</code> and <code>/route#fragment</code> markdown links must resolve to real headings. External links inside raw HTML must carry <code>target="_blank"</code>. Broken links error at build time rather than reaching production.
</ngmd-alert>

This is enforced by two Vite plugins: `link-guard.plugin.ts` (internal anchors) and the `externalLinkGuard` defined inline in `vite.config.ts`. Both walk every `.md` body at build and abort if anything would 404.

## Importing code from real files

To keep doc examples in sync with the source, import the file directly with `file="..."` in the fence. GitHub-style line ranges (`#L5-L10`) work too:

```ts file="src/app/pages/[...slug].page.ts#L1-L7"
```

Lines tagged with `// ngmd-ignore-line` are stripped from the imported snippet, so you can hide setup boilerplate from doc readers while keeping the source file runnable.

## Grouped code tabs

Tag adjacent fences with `group="..."` (and an optional `name="..."` for the tab label) to merge them into a tabbed UI. The `active` flag picks the initial tab.

```bash group="install" name="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220" active
pnpm create ngmd@latest my-docs
```

```bash group="install" name="npm" image="https://cdn.simpleicons.org/npm/CB3837"
npm create ngmd@latest my-docs
```

```bash group="install" name="yarn" image="https://cdn.simpleicons.org/yarn/2C8EBB"
yarn create ngmd my-docs
```

```bash group="install" name="bun" image="https://cdn.simpleicons.org/bun/FBF0DF"
bun create ngmd my-docs
```

## Highlighting specific lines

Append `{1,3-5}` after the language to highlight matching lines. The selector accepts comma-separated single lines or ranges.

```ts {3-5}
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  template: '<h1>Hello, NgMd</h1>',
})
export class Hello {}
```

## Auto-linked keywords

Define keywords in `ngmd.config.ts > keywords`. Prefix any name with `*` in markdown prose to turn it into a link without writing the URL each time.

For example, *NgMd is built on *AnalogJS with *Tailwind v4 and *Shiki for code highlighting. Compare against *VitePress, *Starlight, *Nextra, and *Docusaurus to see where the bar sits.

Unknown keywords (`*WrongName`) log a warning at build time and fall back to literal text so the build never fails on a typo.

## Authoring components inside markdown

`&lt;analog-markdown&gt;` renders the body via `[innerHTML]` after `bypassSecurityTrustHtml`. Angular doesn't compile component selectors inside `innerHTML`, so a naive `&lt;ngmd-callout&gt;` in `.md` would render as an empty unknown element. NgMd registers 16 NgmdUi components as **Custom Elements** via `@angular/elements` at app init (code-block is the exception, since fenced ` ``` ` covers that use case), and the browser upgrades them whenever they appear in the DOM, including inside the markdown body. Drop them straight into prose:

<ngmd-callout type="tip" title="This callout lives inside markdown-routes.md">
  No <code>.page.ts</code> wrapper, no special pipeline. The Custom Element registration in <code>src/app/register-elements.ts</code> is what makes this render.
</ngmd-callout>

<ngmd-alert severity="helpful">
  Mixed prose + components scale on the same page. Use components for the structured bits, markdown for the rest.
</ngmd-alert>

<ngmd-card-grid columns="2" class="mt-2">
  <ngmd-card icon="box" title="Components" link="/concepts/components" cta="See all">
    Every NgmdUi component rendered in context.
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming" link="/concepts/theming" cta="Tokens">
    CSS variables and the fuchsia accent wiring.
  </ngmd-card>
</ngmd-card-grid>

<ngmd-accordion class="mt-10">
  <ngmd-accordion-item title="What about per-page wrappers?">
    Drop a <code>.md</code> at the right path and the catch-all routes it. Write a named <code>.page.ts</code> only when the page needs a bespoke layout.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Does this hurt the bundle?">
    The 16 inline-in-markdown components plus <code>&#64;angular/elements</code> add around 15-20KB gzipped to the markdown-route chunk. Every prose page pays that once, in exchange for the full component vocabulary inline in <code>.md</code>.
  </ngmd-accordion-item>
</ngmd-accordion>

Status badges work inline: API stability tags like <ngmd-badge variant="beta">Beta</ngmd-badge> or <ngmd-badge variant="deprecated">Deprecated</ngmd-badge> sit next to text without breaking the line.

`ngmd-video` and `ngmd-image` are wired separately as marked extensions (build-time HTML rewrites), so they work in markdown regardless of what the catch-all imports.

## Per-instance spacing

Every NgmdUi block component (`ngmd-accordion`, `ngmd-callout`, `ngmd-card-grid`, `ngmd-code-block`, `ngmd-image`, `ngmd-tabs`, `ngmd-video`, `ngmd-hero`, `ngmd-workflow`, `ngmd-alert`, `ngmd-pill-row`) defaults to `margin: 1.5rem 0` on the host. Override per instance with a Tailwind margin utility on the tag:

```html
<ngmd-callout class="mt-10">Bigger top gap</ngmd-callout>
<ngmd-card-grid columns="2" class="mt-2">Tighter top</ngmd-card-grid>
<ngmd-accordion class="my-0">No vertical margin</ngmd-accordion>
```

`mt-*`, `mb-*`, `my-*`, `mx-*` all work. The host rule lives in `@layer base`, so any utility class from `@layer utilities` wins on cascade.

Tailwind v4 only scans source files for class names. `styles.css` opts the content tree in:

```css
@source "./content/**/*.md";
```

Skip this line and any margin utility you write in `.md` silently drops out of the bundle.

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/concepts/showcase" title="Showcase"></ngmd-pill>
  <ngmd-pill href="/concepts/components" title="All components"></ngmd-pill>
  <ngmd-pill href="/concepts/theming" title="Theming"></ngmd-pill>
</ngmd-pill-row>
