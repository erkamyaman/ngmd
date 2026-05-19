---
title: Installation
---

# Installation

Get NgMd running locally in under two minutes.

## Prerequisites

You'll need:

- **Node.js** 20.19.1 or newer
- **pnpm** 8+ (npm or yarn also work, pnpm is fastest)
- A terminal you're comfortable with

NgMd has no global CLI dependency. Everything ships through pnpm.

## Quick install

The fastest way to start a new NgMd project:

```bash
pnpm create ngmd@latest my-docs
cd my-docs
pnpm install
pnpm run dev
```

Open `http://localhost:5173` and you're running.

## Manual setup

If you'd rather wire NgMd into an existing AnalogJS project:

```bash
pnpm add @analogjs/content @analogjs/router marked-shiki shiki@^1.29.2
pnpm add -D @tailwindcss/vite @tailwindcss/typography
```

Then add the content plugin to your `vite.config.ts`:

```ts
import analog from '@analogjs/platform';

export default defineConfig({
  plugins: [
    analog({
      content: { highlighter: 'shiki' },
    }),
  ],
});
```

## Verify your install

Run the build to confirm everything compiles:

```bash
pnpm run build
```

If you see `The '@analogjs/platform' server has been successfully built.` you're good. Move on to the Quick Start.
