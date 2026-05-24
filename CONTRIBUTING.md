# Contributing to NgMd

NgMd is MIT-licensed, maintained in the open, and small enough that one PR can move the needle. This file is the contract for what kinds of changes are welcome, how to set up locally, and what the maintainer checks before merging.

## Where things live

```
src/
├── app/
│   ├── components/       Site frame: sidebar, palette, breadcrumb, TOC, page footer, ...
│   ├── pages/            Routes. `[...slug].page.ts` is the catch-all for all prose pages.
│   └── ui/               17 authoring components (callout, alert, card, ...).
├── content/              Markdown content. Path becomes URL.
├── marked-extensions/    Runtime + build-time marked extensions.
├── styles.css            Tailwind v4 + theme tokens + table / icon rules.
└── ngmd.config.ts        Site config: brand, nav, keyword auto-link map.

create-ngmd/              The scaffolder published to npm.
*.plugin.ts               Vite plugins (page-meta, link-guard, sitemap).
skills/                   Agent skills shipped for Claude Code / Gemini CLI / Antigravity.
```

## Dev setup

```bash
pnpm install
pnpm run dev          # localhost:5173
pnpm run build        # production build, runs link guards + sitemap
```

Node 20.19.1 or newer required (AnalogJS 2.5 + Vite 8 floor).

## What we welcome

- **Bug fixes** with a reproduction or clear description of the broken behaviour
- **New authoring components** that have a clear use case (open a Discussion first if it's a big addition)
- **Marked extensions** for missing markdown affordances
- **Build-pipeline improvements** for the Vite plugins
- **Documentation edits** that match the existing prose voice
- **Agent skill updates** when conventions change

## What we don't merge

- Pure formatting / whitespace changes
- Marketing-fluff edits (`first-class`, `powerful`, `seamless`, `blazingly fast`)
- Adding deps for things we can hand-roll in <100 LOC
- Renames or refactors with no behavioural justification

## Discuss design first

For anything bigger than a one-file change, open a **GitHub Discussion** before writing code. Saves you from building something the maintainer was going to reject for design reasons.

- Discussions: <https://github.com/erkamyaman/ngmd/discussions>
- Issues: <https://github.com/erkamyaman/ngmd/issues>

## Branch + commit conventions

Follow what's already in `git log`:

```bash
git log --oneline -10
```

Pattern: `<type>: short imperative summary`. Common types: `feat`, `fix`, `docs`, `refactor`, `build`, `chore`. Keep titles under ~70 characters.

Examples from the existing log:
- `feat: catch-all routing serves every markdown page`
- `fix: tabs in markdown via Custom Elements`
- `docs: trim changelog to release-note shape`

## Before pushing your PR

1. **`pnpm run build` passes** locally. Link guards, page-meta, and sitemap all run at build time. If they error, the CI build will too.
2. **Manual smoke test** in the dev server. Open the affected route, navigate around, click links, toggle dark mode.
3. **No `console.log`** left in committed code.
4. **Commit message** follows the convention above.

## Reporting security issues

Don't open a public issue. Email **erkamyaman35@gmail.com** with subject `NgMd security report`, or open a [private security advisory](https://github.com/erkamyaman/ngmd/security/advisories/new).

## License

By contributing you agree your changes are released under the MIT license that covers the project.
