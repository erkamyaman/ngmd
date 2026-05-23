<p align="center">
  <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">
    <img src="https://ngmd.netlify.app/logo.svg" alt="NgMd" width="220" />
  </a>
</p>

<p align="center">
  <strong>Angular docs starter. Drop a markdown file, get a route.</strong>
</p>

<p align="center">
  <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">Live demo</a>
  &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/create-ngmd" target="_blank" rel="noopener noreferrer">npm</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/erkamyaman/ngmd" target="_blank" rel="noopener noreferrer">GitHub</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-ngmd" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/create-ngmd.svg?color=d946ef" alt="npm version" /></a>
  <a href="https://github.com/erkamyaman/ngmd/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/l/create-ngmd.svg?color=d946ef" alt="MIT licence" /></a>
</p>

---

Modern stack (Vite 8, Angular 21, Tailwind v4, Shiki, Spartan UI brain), full docs-site frame (sidebar, command palette, TOC, prev/next, edit-on-github, sitemap, link guards), and a build-time pipeline that catches broken anchors before you ship.

## Try it

```bash
pnpm create ngmd@latest my-docs
cd my-docs
pnpm install
pnpm run dev
```

`npm create ngmd@latest`, `yarn create ngmd`, and `bun create ngmd` all work too. The scaffolder detects which one you used and tailors the next-steps output.

## Authoring model

Two patterns. Pick per page.

**Prose pages** stay in markdown. Drop a `.md` file under `src/app/pages/` and it becomes a route automatically (no `.page.ts` required). Frontmatter sets the title, body becomes the page. The sidebar, TOC, prev/next footer, and edit-on-github link all derive from `ngmd.config.ts` and `git log`.

**Chrome pages** compose Angular components in `.page.ts` around your markdown. NgMd ships an authoring suite under `src/app/ui/`: callouts, alerts, cards, tabs (on Spartan brain primitives), pill rows, workflows, hero, code blocks, video, image. Each is a real Angular component with typed inputs, accessibility baked in, and no template-string escape gymnastics.

The fork: prose lives in markdown, authoring components live in TypeScript. The dual-pipeline approach where you write `<docs-callout>` inside `.md` was explored and rejected (see [PLAN.md](./PLAN.md)).

## Build-time affordances

Things the markdown pipeline gives you without writing JavaScript:

- `*Keyword` inline auto-linking. Declare keywords in `ngmd.config.ts > keywords`, write `*AnalogJS` anywhere in prose, get a link.
- `` ```ts file="src/foo.ts#L5-L20" `` imports code from a real source file, GitHub-line-range syntax, header bar links back to GitHub.
- `` ```bash group="install" name="pnpm" active `` clusters adjacent fences into a tabbed group.
- `` ```ts {1,3-5} `` highlights matching lines with the accent stripe.
- `// ngmd-ignore-line` strips a line from an imported snippet.
- External anchors without `target="_blank"` error at build time.
- Broken in-page (`#fragment`) and cross-page (`/route#fragment`) markdown links error at build time.

## Chrome shipped out of the box

- Sticky translucent header with backdrop-blur, brand wordmark
- Sidebar accordion driven by `ngmd.config.ts`, mobile drawer
- Breadcrumb from route, right-side scroll-spy TOC, mobile collapsible
- Cmd+K command palette over pages + headings + body snippets
- Page footer: prev/next sibling, edit-on-github, last-updated (from `git log`)
- Heading hover anchor (`#` button copies the deep link)
- Code-block copy buttons, shiki dual-theme highlighting
- 404 page with chrome-hidden layout
- Light / dark / auto theme cycle, no-flash inline boot script
- Fuchsia accent wired through every active state (sidebar, TOC, palette, hover)

## Configure

`src/ngmd.config.ts` is the single source of truth:

```ts
{
  site: {
    name: 'NgMd',
    tagline: 'Angular docs starter',
    description: '...',
    url: 'https://ngmd.netlify.app',
    githubUrl: 'https://github.com/you/your-repo',
  },
  nav: [
    { label: 'Getting Started', items: [{ label: 'Welcome', href: '/welcome' }] },
  ],
  keywords: {
    AnalogJS: 'https://analogjs.org',
    // ...
  },
}
```

`src/styles.css` carries the theme tokens (`--bg`, `--fg`, `--accent`, `--radius-*`, `--font-*`). Change one var, the whole site follows.

## Stack

| Tool | Role |
|---|---|
| [Angular](https://angular.dev) (v21) | Framework |
| [AnalogJS](https://analogjs.org) | File-based routing, SSR/SSG, content collections |
| [Spartan UI brain](https://www.spartan.ng) | Headless primitives (tabs a11y) |
| [Tailwind v4](https://tailwindcss.com) | Styling |
| [Shiki](https://shiki.style) | Code highlighting |
| [Marked](https://marked.js.org) | Markdown parsing |

## Scripts

```bash
pnpm run dev       # Vite dev server
pnpm run build     # Production build (SSR + static prerender)
pnpm run preview   # Serve the production build
pnpm run test      # Vitest
```

## Deploy

`pnpm run build` produces a static + SSR bundle under `dist/`. Deploy to Vercel, Netlify, or any node host. The sitemap and `robots.txt` land in `dist/client/` automatically. Update `site.url` in `ngmd.config.ts` to wherever you're hosting so the sitemap references the right origin.

## Project layout

```
src/
├── app/
│   ├── components/        Chrome: palette, sidebar, breadcrumb, TOC, footer
│   ├── pages/             File-based routes (.page.ts + .md)
│   ├── ui/                Authoring components: callout, tabs, card, etc.
│   ├── app.config.ts      Wires router + content + title strategy + scroll offset
│   └── app.ts             Shell template
├── content/               Markdown content collection
├── marked-extensions/     Build + runtime marked customisations
├── ngmd.config.ts         Site config (name, nav, keywords)
└── styles.css             Tailwind + theme tokens

create-ngmd/               The `pnpm create ngmd` scaffolder
*.plugin.ts                Build-time vite plugins (page-meta, sitemap, link guards)
```

## Status

v0. Core (markdown rendering, theming, navigation, site frame, authoring components, build pipeline) is in place. Versioning, i18n, library-style API reference, and search adapters are on the roadmap. See [BACKLOG.md](./BACKLOG.md).

## License

MIT © 2026, Kam ([@erkamyaman](https://github.com/erkamyaman))
