---
title: Stack Installation
---

# Stack Installation

Install the full NgMd stack into a fresh AnalogJS project.

## Prerequisites

- **Node.js** 20.19.1 or newer
- A package manager: **pnpm**, **npm**, **yarn**, or **bun** are all supported

NgMd's commands are package-manager agnostic. Examples use **pnpm** by default; substitute your manager's equivalent (`npm install`, `yarn`, `bun install`, etc.).

## Step 1. scaffold AnalogJS

```bash
pnpm create analog@latest my-docs
cd my-docs
```

Choose the latest Angular template and answer **yes** to Tailwind.

## Step 2. install content dependencies

```bash
pnpm add @analogjs/content marked-shiki shiki@^1.29.2
pnpm add -D @tailwindcss/typography
```

## Step 3. enable content in `vite.config.ts`

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

## Step 4. provide content renderer

In `src/app/app.config.ts`:

```ts
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withShikiHighlighter } from '@analogjs/content/shiki-highlighter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideContent(withMarkdownRenderer(), withShikiHighlighter()),
  ],
};
```

## Step 5. add Spartan brain

```bash
pnpm add @spartan-ng/brain
```

You're ready. Drop `.md` files in `src/content/` and `.page.ts` route components in `src/app/pages/`.
