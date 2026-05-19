---
title: Components
---

# Components

NgMd ships a small set of components you copy into your project and own.

## hlm-card

A Spartan-style card used for feature grids and content blocks:

```html
<hlm-card title="Markdown routes" description="Drop a .md file, get a route">
  <p>Powered by AnalogJS content collections.</p>
</hlm-card>
```

The card supports a title, description, and arbitrary projected content. Restyle via Tailwind utilities or replace the source entirely.

## Command palette

The Cmd+K command palette lives in `src/app/components/command-palette.ts`. It listens for the global keyboard shortcut and filters a list of pages by query.

```ts
@HostListener('document:keydown', ['$event'])
onKeydown(event: KeyboardEvent) {
  const metaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
  if (metaK) this.toggle();
}
```

Add new entries to the `ITEMS` array to make them searchable.

## Sidebar

The sidebar reads its sections from a hardcoded `SECTIONS` array. Each section has a label and a list of items. Sections are collapsible with chevron rotation.

## TOC (On this page)

The right-side TOC component scans the rendered markdown for `h2` and `h3` elements, generates ids, and wires an `IntersectionObserver` for active-link highlighting as you scroll.

## Breadcrumb

The breadcrumb component derives crumbs from the current URL. Override the label dictionary to customise how segments are humanised:

```ts
const LABELS: Record<string, string> = {
  welcome: 'Welcome',
  'getting-started': 'Getting Started',
};
```

## What's next

Browse the `src/app/components/` directory to see all the source. Every component is yours to fork, restyle, or delete.
