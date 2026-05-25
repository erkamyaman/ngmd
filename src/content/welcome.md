---
title: Introduction
---

<ngmd-hero title="The Angular docs starter you've been missing" gradient>
  Drop a markdown file. Get a route. Compose authoring components without leaving prose.
</ngmd-hero>

# Introduction

A modern docs starter for Angular: markdown content collections, authoring components that work inline in prose, build-time link guards, and a site frame that stays out of your way.

## How it works

NgMd uses a two-layer authoring model that separates **content** from **chrome**.

<ngmd-card-grid columns="2">
  <ngmd-card icon="file" title="Content as markdown">
    Your docs live as <code>.md</code> files under <code>src/content/</code>. The path becomes the URL. Frontmatter handles metadata, marked handles rendering, Shiki handles code highlighting.
  </ngmd-card>
  <ngmd-card icon="code" title="UI as Angular components">
    Site frame and authoring components both live in your codebase under <code>src/app/</code>. Tailwind v4 throughout, signals and ARIA wired by hand. Edit Tailwind classes directly and ship.
  </ngmd-card>
</ngmd-card-grid>

<div class="h-2"></div>

<ngmd-callout type="tip" title="You own the source">
  Both layers are files in your repo, not imports from a library. Customise without fighting a theming API, no version conflicts, no waiting on maintainers for a feature you need today.
</ngmd-callout>

## Get started

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

```bash
cd my-docs
pnpm install
pnpm run dev
```

Open `http://localhost:5173`. You're running.

## What's in the box

<ngmd-card-grid columns="2">
  <ngmd-card icon="layers" title="Site frame">
    Translucent sticky header, sidebar accordion driven by <code>ngmd.config.ts</code>, breadcrumb, scroll-spy TOC, Cmd+K palette over pages plus headings plus body snippets, prev/next footer, and top-right edit + view-source actions per route.
  </ngmd-card>
  <ngmd-card icon="palette" title="Theming">
    Light, dark, and auto theme cycle with no-flash inline boot script. Fuchsia accent wired through sidebar, TOC, palette, prev/next, and link hover. Route crossfades via the browser's View Transitions API.
  </ngmd-card>
  <ngmd-card icon="box" title="17 authoring components">
    Callout, alert, card, card-grid, tabs, pill row, workflow, hero, code-block, accordion, badge, video, image (plus 4 children). Shipped as <code>NgmdUi</code> in <code>src/app/ui/</code>. Sixteen render inline in markdown via Custom Elements; code-block uses fenced <code>```</code> blocks instead.
  </ngmd-card>
  <ngmd-card icon="code" title="Code-fence affordances">
    <code>file="src/foo.ts#L5-L20"</code> imports kept in sync with source, <code>group="install"</code> tabs that pre-render through Shiki, <code>{1,3-5}</code> line highlighting, and <code>*Keyword</code> inline auto-linking from <code>ngmd.config.ts</code>.
  </ngmd-card>
  <ngmd-card icon="shield" title="Build pipeline">
    External anchors must carry <code>target="_blank"</code>, internal anchors must resolve to real headings. Sitemap.xml and robots.txt auto-emitted. Custom title strategy formats every page as <code>NgMd | &lt;title&gt;</code>.
  </ngmd-card>
  <ngmd-card icon="sparkles" title="Agent skills" link="/ai/agent-skills" cta="Read">
    <code>ngmd-new-site</code> and <code>ngmd-authoring</code> ship in <code>skills/</code> for Claude Code, Gemini CLI, Antigravity, and other agentic tools.
  </ngmd-card>
</ngmd-card-grid>

## FAQ

<ngmd-accordion>
  <ngmd-accordion-item title="What is NgMd?" open>
    An Angular docs starter on top of AnalogJS. Drop markdown files in <code>src/content/</code>, get a routed and branded documentation site with the site frame and features above.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Do I need AnalogJS to use this?">
    Yes. NgMd is AnalogJS-native. The runtime, file-based routing, SSR, and markdown content collections all come from AnalogJS.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="What's the difference between markdown content and components?">
    Markdown is your prose: installation guides, API references, conceptual explainers. It lives in <code>src/content/</code> and is edited as plain text. Authoring components wrap prose with structure (callout, alert, card, tabs, accordion, hero, ...) and live in <code>src/app/ui/</code>, edited as TypeScript. They compose in <code>.page.ts</code> or drop inline directly in markdown.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Why copy components instead of installing them?">
    Same philosophy as shadcn/ui. Owning the source means no theming API to learn, no version conflicts, no waiting for maintainers to add a feature you need. Edit Tailwind classes directly and ship.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Is NgMd inspired by VitePress or Starlight?">
    Yes. The "drop markdown, get a docs site" pattern comes from VitePress, Starlight, Nextra, and Docusaurus. NgMd adapts the pattern for Angular on AnalogJS.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Is this production-ready?">
    NgMd is in active early development <ngmd-badge variant="beta">Beta</ngmd-badge>. The core (markdown rendering, theming, navigation, build pipeline) is stable. Versioning, i18n, library-style API reference, and search adapters are on the roadmap.
  </ngmd-accordion-item>
</ngmd-accordion>

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/stack/installation" title="Install"></ngmd-pill>
  <ngmd-pill href="/concepts/showcase" title="Showcase"></ngmd-pill>
  <ngmd-pill href="/concepts/markdown-routes" title="Routing"></ngmd-pill>
  <ngmd-pill href="/concepts/components" title="Components"></ngmd-pill>
</ngmd-pill-row>
