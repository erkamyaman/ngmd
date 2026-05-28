---
name: ngmd-new-site
description: Scaffolds a new NgMd Angular docs site using the create-ngmd CLI. Use this skill whenever a user wants to start a new NgMd project. Covers Node and package-manager prerequisites, what the scaffolder produces, and the first edits a new project needs (site config, sidebar nav, first page).
license: MIT
compatibility: Requires Node >= 20.19.1 and one of pnpm, npm, yarn, or bun.
metadata:
  author: Kam (@erkamyaman)
  version: '1.0'
---

# NgMd New Site

You are an expert in TypeScript, Angular, AnalogJS, and the NgMd docs starter. You scaffold new NgMd sites and orient the user around the project layout so they can start writing within a minute. Code style is terse, comment-light, signals-first.

When creating a new NgMd site for a user, follow these steps in order.

## 1. Check the Node version

NgMd requires Node 20.19.1 or newer (AnalogJS 2.5 and Vite 8 share that floor). Verify before scaffolding:

```bash
node --version
```

If the version is older, ask the user to upgrade. Recommend `nvm install 20 && nvm use 20` or `fnm install 20`. Do not proceed on an unsupported Node.

## 2. Pick a package manager

`create-ngmd` works with pnpm, npm, yarn, and bun. Default to **pnpm** if installed (`which pnpm`); fall back to npm. Do not switch the user's existing package manager.

## 3. Scaffold the site

Either suggest a directory name based on the user's prompt or ask for one. Then run the matching command:

```bash
# pnpm (recommended)
pnpm create ngmd@latest <name>

# npm
npm create ngmd@latest <name>

# yarn
yarn create ngmd <name>

# bun
bun create ngmd <name>
```

The scaffolder is a single Node script with no dependencies. It copies a slim template into `<name>/`, prints a quick-start, and exits. It never runs `git init` or `pnpm install` for the user.

## 4. Install and start the dev server

```bash
cd <name>
pnpm install      # or npm install / yarn / bun install
pnpm run dev      # or the equivalent for the chosen package manager
```

The dev server runs on `http://localhost:5173` by default. The home route renders `src/app/pages/index.page.ts`. The first docs route is `/welcome`, which renders `src/content/welcome.md`.

## 5. Orient the user around the layout

After scaffolding, point the user at these files in this order:

| File                              | Purpose                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ngmd.config.ts`              | Site name, description, public URL, GitHub URL, sidebar nav, keyword auto-link map. Edit this first.                                                                                                                                                                                                                                                                               |
| `src/content/welcome.md`          | First prose page. Its path under `src/content/` becomes the URL: `welcome.md` resolves at `/welcome`.                                                                                                                                                                                                                                                                              |
| `src/app/pages/[...slug].page.ts` | The one catch-all that renders every prose route. Reads the URL, fetches the matching markdown, renders it. Mirror of adev's `docs.component.ts`.                                                                                                                                                                                                                                  |
| `src/app/pages/index.page.ts`     | Home route. TypeScript-driven, composes `NgmdUi` authoring components.                                                                                                                                                                                                                                                                                                             |
| `src/styles.css`                  | Tailwind v4 entry. Theme tokens (`--bg`, `--accent`, `--accent-strong`, `--accent-soft`, `--accent-gradient`, `--accent-gradient-soft`, font + radius tokens) live in `:root` and `.dark`. No component hardcodes a Tailwind colour like `text-fuchsia-500` — they read `var(--accent)` via `text-[color:var(--accent)]` or inline style, so swapping one token re-skins the site. |
| `vite.config.ts`                  | AnalogJS config plus the four NgMd build plugins (page-meta, internal/external link guards, sitemap).                                                                                                                                                                                                                                                                              |

**Two-pattern authoring model**: prose pages are `.md` files under `src/content/`, no wrapper required. Pages that need authoring components (callouts, tabs, cards) live in `src/app/pages/` as `.page.ts` and compose `NgmdUi` directly. The user picks per page. See the `ngmd-authoring` skill for which pattern fits which page.

## 6. First edits the user almost always wants

After the dev server is up, walk through these edits in order. Each is small.

### a. Site identity

Edit `src/ngmd.config.ts`:

```ts
site: {
  name: 'My Docs',
  description: 'One-liner for meta tags and social previews.',
  url: 'https://my-docs.example.com',          // no trailing slash
  githubUrl: 'https://github.com/me/my-docs',
},
```

`url` powers `sitemap.xml` and `robots.txt` at build time. `githubUrl` powers the header icon and the "Edit on GitHub" footer link.

### b. Sidebar nav

The same file, `nav` array. Sections render in order, items render in order within. Each href must match a real route:

```ts
nav: [
  {
    label: 'Getting Started',
    items: [
      { label: 'Welcome', href: '/welcome' },
      { label: 'Install', href: '/install' },
    ],
  },
],
```

### c. Add a page

For a prose page at `/install`:

1. Create `src/content/install.md` with frontmatter:

   ```md
   ---
   title: Install
   description: Get NgMd running locally.
   ---

   # Install

   Body content here.
   ```

2. Add `{ label: 'Install', href: '/install' }` to the nav in `src/ngmd.config.ts`.

That's it. The catch-all `[...slug].page.ts` resolves `/install` to `src/content/install.md` automatically. For nested routes like `/guides/auth`, drop the file at `src/content/guides/auth.md`. The dev server picks up both changes live.

For a section with a parent and children, place the parent at root and children in a same-named folder:

- `src/content/guides.md` → `/guides`
- `src/content/guides/auth.md` → `/guides/auth`
- `src/content/guides/api.md` → `/guides/api`

The parent and children are independent routes; no `index.md` convention is in play.

If a page needs a bespoke layout or wants to compose authoring components directly, create a named `.page.ts` in `src/app/pages/` instead (e.g., `src/app/pages/install.page.ts`); Angular's router prefers the more specific match over the catch-all.

## 7. Build and verify

Before the user deploys, run a production build at least once. It catches broken internal anchors and missing `target="_blank"` on raw external HTML:

```bash
pnpm run build
```

Output lands in `dist/`. `dist/client/` includes the prerendered HTML, sitemap, and robots.txt; `dist/server/` is the SSR bundle for hosts that want it.

_IMPORTANT_: The build will fail on a broken internal link rather than ship it. If the build errors with a link-guard message, point at the offending file and let the user fix the slug or frontmatter heading.

## 8. Deploy

The output is a static + SSR bundle. Any Node-friendly host works (Netlify, Vercel, Cloudflare, custom Node server). The user does not need any host-specific config beyond pointing the build command at `pnpm run build` and the publish directory at `dist/client/`. If the user asks for host-specific instructions, point them at the host's "Angular" or "AnalogJS" docs rather than guessing flags.

## Guardrails

- Do **not** scaffold into a non-empty directory; `create-ngmd` refuses and you should respect that.
- Do **not** run `git init` automatically; the user may want to scaffold inside an existing repo.
- Do **not** run `npm publish` or any deploy command. The user owns those verbs.
- Do **not** invent config keys. The `SiteConfig` type in `src/ngmd.config.ts` is the contract; anything else is dead weight.
- After scaffolding, prefer **editing** `src/ngmd.config.ts` and `src/content/welcome.md` over creating new files. Most "first edits" are configuration, not new code.

## Next step for the user

Once the dev server is running and the user has edited the site name in `ngmd.config.ts`, hand off to the `ngmd-authoring` skill for the actual writing work.
