---
title: Theming
---

# Theming

NgMd is built on Tailwind v4 with CSS variables for theme tokens. Rebrand in one file: `src/styles.css`.

## Token groups

The token block lives under `@layer base` in `src/styles.css`. Four groups, declared twice (once under `:root` for light, once under `.dark` for dark mode):

### Surface

```css
--bg: #ffffff;
--bg-muted: #f4f4f5;
--fg: #0a0a0a;
--muted: #71717a;
--border: #e4e4e7;
--border-strong: #d4d4d8;
```

`--bg-muted` is for card backgrounds, callout bodies, header surfaces. `--border-strong` is for hover states where the regular border should darken.

### Brand

```css
--primary: #18181b;
--primary-fg: #fafafa;
--accent: #d946ef;
--accent-fg: #ffffff;
--accent-soft: rgba(217, 70, 239, 0.12);
--accent-gradient: linear-gradient(
  to right,
  #f43f5e 0%,
  #d946ef 50%,
  #a855f7 100%
);
```

`--accent` is the active-state colour (sidebar item, TOC active heading, palette row highlight, prev/next hover, heading anchor hover, link focus ring). `--accent-soft` is the tinted background variant. `--accent-gradient` powers the hero component and the logo stroke.

### Geometry

```css
--radius-sm: 0.25rem;
--radius: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
```

### Typography

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, sans-serif;
--font-display: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo,
  monospace;
--font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
```

`--font-display` powers the wordmark in the header; `--font-sans` is the default body face; `--font-mono` is for inline code and code blocks.

## Light / dark mode

NgMd uses class-based dark mode. The `ThemeService` toggles a `dark` class on `<html>`:

```ts
this.document.documentElement.classList.toggle('dark', mode === 'dark');
```

User preference is persisted in localStorage and falls back to `prefers-color-scheme` on first visit. An inline boot script in `index.html` sets the class before Angular bootstraps so there is no flash on refresh.

## Picking a brand colour

Pick one accent and set it in both `:root` and `.dark`:

```css
:root {
  --accent: #dd0031;             /* example: Angular red */
  --accent-soft: rgba(221, 0, 49, 0.12);
}

.dark {
  --accent: #ef4444;             /* lighter for dark backgrounds */
  --accent-soft: rgba(239, 68, 68, 0.15);
}
```

Components that lean on the accent (`NgmdCallout`, `NgmdAlert`, sidebar active item, TOC active heading, command palette row, page footer hover, heading anchor hover, markdown link focus ring) all pick the new colour up automatically.

## Custom fonts

Self-host or load from a CDN, then swap the token:

```css
:root {
  --font-sans: 'YourFont', Inter, system-ui, sans-serif;
}
```

For self-hosted fonts, declare an `@font-face` rule at the top of `styles.css`.

## Reaching outside the tokens

For one-off styling beyond the token system, use Tailwind utilities directly. Any colour from the Tailwind palette works out of the box:

```html
<a class="bg-blue-600 hover:bg-blue-700 text-white">Custom</a>
```

## Typography plugin

Long-form markdown content uses `@tailwindcss/typography`'s `prose` class. Override prose tokens with CSS variables under `.prose` to tune your reading experience.
