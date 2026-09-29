---
title: Kitchen sink
description: Every NgMd component and markdown feature, on one page, for checking styles and behaviour.
noIndex: true
---

<ngmd-hero title="Kitchen sink" logo="/logo-mark.svg" gradient>
  Every component and markdown feature on one page. Use it to check styles, dark mode and spacing after a change. It is left out of search and the sitemap.
</ngmd-hero>

# Kitchen sink

Each section shows one feature with its common options. The [Components](/concepts/components) page documents every attribute.

## Text

### Inline formatting

Plain text, **bold**, _italic_, `inline code`, ~~strikethrough~~ and a **UI label** like **Record**. A line with a [site link](/concepts/theming), an [anchor link](#tables), an [external link](https://angular.dev) and keyword links such as *Angular.

### Lists

- Unordered item
- Another item with `code`
  - Nested item

1. First step
2. Second step
3. Third step

### Tables

| Column   | Type      | Notes                                   |
| -------- | --------- | --------------------------------------- |
| `name`   | `string`  | Short text.                             |
| `count`  | `number`  | Right after the name.                   |
| `active` | `boolean` | A longer note that wraps on small screens to check the cell layout. |

### Blockquote

> A quoted line for the rare case a page needs one.

### Headings with extras

#### A fourth level heading

Headings from `####` down get anchors but don't appear in "On this page".

### Heading with a badge <ngmd-badge variant="beta">Beta</ngmd-badge>

The badge is left out of the anchor, so this heading links as `#heading-with-a-badge`.

### Heading with `code`

## Code

### Plain fence

```ts
// src/app/app.config.ts
import {ApplicationConfig} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [],
};
```

### Line highlights

```ts {2,5-7}
// src/main.ts
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';

bootstrapApplication(App, appConfig).then(() => {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    return import('./dev-tools');
  }
  return undefined;
});
```

### Code group

```bash group="install" name="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220" active
pnpm create ngmd@latest my-docs
```

```bash group="install" name="npm" image="https://cdn.simpleicons.org/npm/CB3837"
npm create ngmd@latest my-docs
```

```bash group="install" name="yarn" image="https://cdn.simpleicons.org/yarn/2C8EBB"
yarn create ngmd my-docs
```

```bash group="install" name="bun" image="https://bun.sh/logo.svg"
bun create ngmd my-docs
```

### File import

```ts file="src/ngmd.config.ts#L1-L12"
```

### Other languages

```json
{
  "mcpServers": {
    "docs": {"command": "npx", "args": ["my-docs-mcp"]}
  }
}
```

```html
<button type="button" aria-label="Open search">Open</button>
```

```css
:root {
  --accent: #d946ef;
}
```

## Callouts

<ngmd-callout type="info" title="Info">
  Context the reader may need, with <code>code</code> and a <a href="/concepts/theming">link</a>.
</ngmd-callout>

Callouts are never adjacent on real pages. The text between them here keeps that rule.

<ngmd-callout type="tip" title="Tip">
  A shortcut or a better way to do something.
</ngmd-callout>

Text between callouts.

<ngmd-callout type="success" title="Success">
  Confirms a result.
</ngmd-callout>

Text between callouts.

<ngmd-callout type="warning" title="Warning">
  Something that can go wrong.
</ngmd-callout>

Text between callouts.

<ngmd-callout type="danger" title="Danger">
  Data loss or a security risk.
</ngmd-callout>

## Alerts

<ngmd-alert severity="info">
  An info alert.
</ngmd-alert>

Text between alerts.

<ngmd-alert severity="helpful">
  A helpful alert.
</ngmd-alert>

Text between alerts.

<ngmd-alert severity="important">
  An important alert.
</ngmd-alert>

Text between alerts.

<ngmd-alert severity="warning">
  A warning alert.
</ngmd-alert>

Text between alerts.

<ngmd-alert severity="critical" label="Custom label">
  A critical alert with a custom label.
</ngmd-alert>

## Badges

<ngmd-badge variant="new">New</ngmd-badge> <ngmd-badge variant="updated">Updated</ngmd-badge> <ngmd-badge variant="alpha">Alpha</ngmd-badge> <ngmd-badge variant="beta">Beta</ngmd-badge> <ngmd-badge variant="stable">Stable</ngmd-badge> <ngmd-badge variant="deprecated">Deprecated</ngmd-badge>

## Cards

### Three columns with icons

<ngmd-card-grid columns="3">
  <ngmd-card icon="box" title="With a link" link="/concepts/components" cta="Open">
    A card that links inside the site.
  </ngmd-card>
  <ngmd-card icon="shield" title="External link" link="https://angular.dev" cta="Visit">
    A card that opens another site in a new tab.
  </ngmd-card>
  <ngmd-card icon="zap" title="No link">
    A card with inline <code>code</code> and no link.
  </ngmd-card>
</ngmd-card-grid>

### Two columns with images

<ngmd-card-grid columns="2">
  <ngmd-card image="https://cdn.simpleicons.org/ngrx/BA2BD2" title="Brand image">
    A logo instead of an icon.
  </ngmd-card>
  <ngmd-card avatar image="https://github.com/erkamyaman.png?size=96" title="Avatar" link="https://github.com/erkamyaman" cta="GitHub">
    A round profile photo.
  </ngmd-card>
</ngmd-card-grid>

### Every icon

<ngmd-card-grid columns="3">
  <ngmd-card icon="book" title="book"></ngmd-card>
  <ngmd-card icon="box" title="box"></ngmd-card>
  <ngmd-card icon="code" title="code"></ngmd-card>
  <ngmd-card icon="compass" title="compass"></ngmd-card>
  <ngmd-card icon="file" title="file"></ngmd-card>
  <ngmd-card icon="layers" title="layers"></ngmd-card>
  <ngmd-card icon="lightbulb" title="lightbulb"></ngmd-card>
  <ngmd-card icon="palette" title="palette"></ngmd-card>
  <ngmd-card icon="rocket" title="rocket"></ngmd-card>
  <ngmd-card icon="search" title="search"></ngmd-card>
  <ngmd-card icon="settings" title="settings"></ngmd-card>
  <ngmd-card icon="shield" title="shield"></ngmd-card>
  <ngmd-card icon="sparkles" title="sparkles"></ngmd-card>
  <ngmd-card icon="terminal" title="terminal"></ngmd-card>
  <ngmd-card icon="wrench" title="wrench"></ngmd-card>
  <ngmd-card icon="zap" title="zap"></ngmd-card>
</ngmd-card-grid>

## Workflow

<ngmd-workflow>
  <ngmd-step title="Scaffold a site">
    Run <code>pnpm create ngmd&#64;latest my-docs</code>.
  </ngmd-step>
  <ngmd-step title="Write a page">
    Add a markdown file under <code>src/content</code>.
  </ngmd-step>
  <ngmd-step title="Build">
    Run <code>pnpm build</code>. The link guards check every link.
  </ngmd-step>
</ngmd-workflow>

## Tabs

<ngmd-tabs>
  <ngmd-tab title="Express" icon="terminal">
    Content of the first tab.
  </ngmd-tab>
  <ngmd-tab title="Vite" image="https://cdn.simpleicons.org/vite/646CFF">
    Content of the second tab, with an image instead of an icon.
  </ngmd-tab>
  <ngmd-tab title="Plain">
    A tab with no icon.
  </ngmd-tab>
</ngmd-tabs>

## Accordion

<ngmd-accordion>
  <ngmd-accordion-item title="Open by default" open>
    This item starts open.
  </ngmd-accordion-item>
  <ngmd-accordion-item title="Closed by default">
    This item starts closed.
  </ngmd-accordion-item>
</ngmd-accordion>

## Media

### Image

<ngmd-image src="/images/cats.jpg" alt="Two tabby kittens, Angular and Excel, looking up, one sitting in a flower pot" width="360"></ngmd-image>

<p style="max-width: 360px; margin-top: -1rem; text-align: center; font-size: 0.875rem; color: var(--muted)">Say hi to <a href="https://github.com/erkamyaman" target="_blank" rel="noopener noreferrer">my</a> cats Angular and Excel 👋</p>

### Video

<ngmd-video src="https://www.youtube.com/watch?v=Ata9cSC2WpM" title="Angular in 100 seconds"></ngmd-video>

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/concepts/components" title="Components"></ngmd-pill>
  <ngmd-pill href="/concepts/showcase" title="Showcase"></ngmd-pill>
  <ngmd-pill href="https://angular.dev" title="angular.dev"></ngmd-pill>
</ngmd-pill-row>
