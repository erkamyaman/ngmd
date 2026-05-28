<h1 align="center">
  <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">
    <img src="https://ngmd.netlify.app/logo-mark.svg" alt="" height="72" align="absmiddle" />
  </a>
  &nbsp;NgMd
</h1>

<p align="center">
  Angular docs starter. Drop a markdown file, get a route.
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

Modern stack (Vite 8, Angular 21, Tailwind v4, Shiki), full docs-site frame (sidebar, command palette, TOC, prev/next, edit-on-github, sitemap, link guards), and a build-time pipeline that catches broken anchors before you ship.

## Try it

```bash
pnpm create ngmd@latest my-docs
cd my-docs
pnpm install
pnpm run dev
```

`npm create ngmd@latest`, `yarn create ngmd`, and `bun create ngmd` all work too.

## Authoring model

Two patterns, pick per page. **Prose pages** are markdown files under `src/content/`. Drop `theming.md` under `src/content/concepts/` and `/concepts/theming` resolves to it; one catch-all route handles every prose page. Sidebar, TOC, prev/next, and edit-on-github derive from `ngmd.config.ts` and `git log`. **Component pages** compose Angular components in `.page.ts` directly using NgMd's seventeen authoring components (callout, alert, card, card-grid, tabs, tab, pill-row, pill, workflow, step, hero, code-block, accordion, accordion-item, badge, video, image). Sixteen of them also render inline in markdown via Custom Elements; code-block uses fenced ` ``` ` blocks instead.

The fork: prose in markdown, authoring components in TypeScript. The dual-pipeline approach where you write `<docs-callout>` inside `.md` was explored and rejected (see [PLAN.md](./PLAN.md)).

## What's in the box

Site frame, palette, prev/next footer, edit-on-github, heading anchors, shiki dual-theme, fuchsia accent. Build-time link guards, sitemap, page-meta plugin. Authoring components and code-fence affordances (`*Keyword` auto-linking, ` ```ts file="..." ` imports, group tabs, line highlighting). [Agent skills](https://ngmd.netlify.app/ai/agent-skills) for Claude Code / Gemini CLI / Antigravity so coding agents already know the conventions.

Full feature list and live demos at <a href="https://ngmd.netlify.app" target="_blank" rel="noopener noreferrer">ngmd.netlify.app</a>.

## Stack

| Tool                                                                                        | Role                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| <a href="https://angular.dev" target="_blank" rel="noopener noreferrer">Angular</a> (v21)   | Framework                                        |
| <a href="https://analogjs.org" target="_blank" rel="noopener noreferrer">AnalogJS</a>       | File-based routing, SSR/SSG, content collections |
| <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">Tailwind v4</a> | Styling                                          |
| <a href="https://shiki.style" target="_blank" rel="noopener noreferrer">Shiki</a>           | Code highlighting                                |
| <a href="https://marked.js.org" target="_blank" rel="noopener noreferrer">Marked</a>        | Markdown parsing                                 |

## Deploy

`pnpm run build` produces a static + SSR bundle under `dist/`. Deploy to Vercel, Netlify, or any node host. Sitemap and `robots.txt` land in `dist/client/` automatically. Update `site.url` in `ngmd.config.ts` to your live origin so the sitemap references the right URL.

## Status

v0. Core (markdown rendering, theming, navigation, site frame, authoring components, build pipeline) is in place. Versioning, i18n, library-style API reference, and search adapters are on the roadmap. See [BACKLOG.md](./BACKLOG.md).

## Community

- [Get help](https://ngmd.netlify.app/help/get-help) — issues, discussions, paid support
- [Contribute](https://ngmd.netlify.app/help/contribute) — guidelines and where to start, full notes in [CONTRIBUTING.md](./CONTRIBUTING.md)
- [Sponsor](https://ngmd.netlify.app/help/sponsor) — back the project on GitHub Sponsors

## License

MIT © 2026, Kam (<a href="https://github.com/erkamyaman" target="_blank" rel="noopener noreferrer">@erkamyaman</a>)
