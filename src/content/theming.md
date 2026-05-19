---
title: Theming
---

# Theming

NgMd is built on Tailwind v4 with CSS variables for theme tokens. Rebrand in one file.

## Theme tokens

Open `src/styles.css`. The two colour palettes live under `@layer base`:

```css
:root {
  --bg: #ffffff;
  --fg: #0a0a0a;
  --muted: #71717a;
  --border: #e4e4e7;
}

.dark {
  --bg: #0a0a0a;
  --fg: #fafafa;
  --muted: #a1a1aa;
  --border: #27272a;
}
```

Change these four values per mode and the whole site follows.

## Light / dark mode

NgMd uses class-based dark mode. The `ThemeService` toggles a `dark` class on `<html>`:

```ts
this.document.documentElement.classList.toggle('dark', mode === 'dark');
```

User preference is persisted in localStorage and falls back to `prefers-color-scheme` on first visit.

## Customising colors

For finer control beyond the four tokens, use Tailwind utility classes directly. Any colour from the Tailwind palette (`zinc`, `slate`, `blue`, etc.) works out of the box.

```html
<a class="bg-blue-600 hover:bg-blue-700 text-white">Custom</a>
```

## Custom fonts

Edit the `font-family` rule in `src/styles.css`:

```css
:root {
  font-family: 'Inter', system-ui, sans-serif;
}
```

For self-hosted fonts, import them at the top of `styles.css` or wire them through `@font-face`.

## Typography plugin

Long-form markdown content uses `@tailwindcss/typography`'s `prose` class. Override prose tokens with CSS variables under `.prose` to tune your reading experience.
