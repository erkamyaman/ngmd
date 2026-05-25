---
title: Theming
---

<ngmd-hero title="Theming" gradient>
  Rebrand NgMd in one file. CSS variables on Tailwind v4 mean a new accent, font, or radius is a token swap, not a refactor.
</ngmd-hero>

# Theming

NgMd is built on *Tailwind v4 with CSS variables for theme tokens. Rebrand in one file: `src/styles.css`. The fuchsia accent you see across the site is the default, not a baked-in choice. No component in this repo hardcodes a Tailwind colour like `text-fuchsia-500`; every accent-aware class reads `var(--accent)` instead, so swapping one token re-skins the whole site.

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
--accent-strong: #a21caf;
--accent-fg: #ffffff;
--accent-soft: rgba(217, 70, 239, 0.12);
--accent-gradient: linear-gradient(
  to right,
  #f43f5e 0%,
  #d946ef 50%,
  #a855f7 100%
);
--accent-gradient-soft: linear-gradient(
  to bottom right,
  rgba(244, 63, 94, 0.10) 0%,
  rgba(217, 70, 239, 0.10) 50%,
  rgba(168, 85, 247, 0.10) 100%
);
```

Six accent tokens cover everything:

| Token | What it's for |
|---|---|
| `--accent` | Card icons, link hover, focus rings, code-preview headings, the "live" tag |
| `--accent-strong` | Active sidebar item, active TOC heading. Deeper saturation reads better on light surfaces |
| `--accent-fg` | Foreground colour to pair with a solid `--accent` surface (rare; used by adjacent components) |
| `--accent-soft` | Tinted background for active rows in the palette, sidebar, and TOC |
| `--accent-gradient` | Hero title fill, homepage hero band, logo stroke |
| `--accent-gradient-soft` | Hero background wash, homepage spotlight backdrop |

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

`--font-display` powers the wordmark in the header, `--font-sans` is the default body face, `--font-mono` is for inline code and code blocks.

## Light / dark mode

NgMd uses class-based dark mode. The `ThemeService` toggles a `dark` class on `<html>`:

```ts
this.document.documentElement.classList.toggle('dark', mode === 'dark');
```

User preference is persisted in localStorage and falls back to `prefers-color-scheme` on first visit. An inline boot script in `index.html` sets the class before Angular bootstraps so there is no flash on refresh.

## Picking a brand colour

<ngmd-callout type="tip" title="One accent, two declarations">
  Set the accent in both <code>:root</code> and <code>.dark</code> with a slightly lighter shade for dark mode so contrast stays readable.
</ngmd-callout>

Pick one accent and update its companion tokens in both `:root` and `.dark`. The `--accent-soft` is the same hue at 10-15% opacity; `--accent-strong` is a deeper shade for active text on light surfaces:

```css
:root {
  --accent: #dd0031;             /* example: Angular red */
  --accent-strong: #991b1b;      /* deeper for active text on light bg */
  --accent-soft: rgba(221, 0, 49, 0.12);
}

.dark {
  --accent: #ef4444;             /* lighter for dark backgrounds */
  --accent-strong: #fca5a5;      /* lighter still for active text on dark */
  --accent-soft: rgba(239, 68, 68, 0.15);
}
```

For a full rebrand, also update `--accent-gradient` and `--accent-gradient-soft` with the colours you want in the hero wash.

Components that lean on the accent (sidebar active item, TOC active heading, command palette row, page footer hover, heading anchor hover, card icon, card CTA arrow, pill hover, hero gradient, code-preview headings) all pick the new colour up automatically.

## How components consume tokens

Tailwind v4 supports arbitrary-value classes that read a CSS variable directly. NgMd uses this pattern wherever a component needs the accent:

```html
<!-- text colour from --accent -->
<span class="text-[color:var(--accent)]">Active</span>

<!-- background tint from --accent-soft -->
<div class="bg-[color:var(--accent-soft)]">Highlighted row</div>

<!-- hover state from --accent -->
<a class="hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]">Link</a>

<!-- gradient on title via bg-clip-text -->
<h1 class="bg-clip-text text-transparent" style="background-image: var(--accent-gradient)">Hero</h1>
```

Why this matters: the Tailwind shade utilities (`text-fuchsia-500`, `bg-rose-100/10`) bake the colour into the class name and survive a token swap untouched. The bracket syntax reads the variable at render time, so any change to `--accent` in `:root` / `.dark` propagates through the whole site without touching component code.

<ngmd-callout type="tip" title="Gradient images use inline style">
  Tailwind v4's class scanner doesn't always pick up <code>bg-[image:var(...)]</code> reliably. NgMd uses <code>style="background-image: var(--accent-gradient)"</code> for hero and spotlight elements — same CSS variable, just dropped into the inline style attribute so it always works regardless of class generation.
</ngmd-callout>

When an active state needs to win against a static `text-zinc-500` (or similar base utility), append `!` to bump specificity:

```html
<a [class]="isActive ? 'bg-[color:var(--accent-soft)]! text-[color:var(--accent-strong)]!' : ''">
  Item
</a>
```

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

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/concepts/components" title="See components"></ngmd-pill>
  <ngmd-pill href="/concepts/markdown-routes" title="Routing"></ngmd-pill>
  <ngmd-pill href="/concepts/showcase" title="Showcase"></ngmd-pill>
</ngmd-pill-row>
