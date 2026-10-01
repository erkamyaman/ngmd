# create-ngmd

[![npm version](https://img.shields.io/npm/v/create-ngmd.svg)](https://www.npmjs.com/package/create-ngmd)

Scaffold a new [NgMd](https://github.com/erkamyaman/ngmd) docs project.

Live demo: [ngmd.netlify.app](https://ngmd.netlify.app)

```bash
pnpm create ngmd@latest my-docs
# or
npm create ngmd@latest my-docs
# or
yarn create ngmd my-docs
# or
bun create ngmd my-docs
```

Then:

```bash
cd my-docs
pnpm install   # or npm install / yarn / bun install
pnpm dev
```

Open `http://localhost:5173`.

## What you get

A working AnalogJS + Tailwind v4 + Shiki docs site with:

- File-based markdown routes — drop `.md` under `src/content/`, get a route
- Seventeen authoring components: accordion, accordion-item, alert, badge, callout, card, card-grid, code-block, hero, image, pill, pill-row, step, tab, tabs, video, workflow (all under `src/app/ui/`)
- Toast notifications via `ToastService`
- Sticky translucent header, sidebar, breadcrumb, scroll-spy TOC, Cmd+K palette
- Per-page prev/next navigation, edit-on-GitHub and view-source actions
- Heading anchor copy buttons, code-block copy buttons
- Build-time link guards (external + internal)
- Relative `.md` links (`[Setup](./setup.md)`) that work on GitHub and on the site
- Page title, description and Open Graph / Twitter tags filled from `ngmd.config.ts`
- Sitemap + robots.txt auto-generated
- Light / dark / auto theme with no-flash boot script
- `*Keyword` inline auto-linking
- ` ```ts file="src/foo.ts#L5-L20" ` code imports, group code tabs, line highlighting

See the [NgMd repo](https://github.com/erkamyaman/ngmd) for the feature list.

## Next steps

1. Edit `src/content/welcome.md` to make the first page your own.
2. Edit `src/ngmd.config.ts` to set brand name, navigation, and accent.
3. Drop more `.md` files in `src/content/`, or `.page.ts` components in `src/app/pages/`.
4. Build with `pnpm run build` and deploy `dist/analog/public/` to any static host (with a fallback to `/index.html`), or run `dist/analog/server/` on Node.

## Nx workspaces

Run the command anywhere inside an Nx workspace and the site becomes an Nx app instead of a standalone project:

```bash
pnpm create ngmd@latest docs                         # apps/docs, Nx project "docs"
pnpm create ngmd@latest docs --directory sites/docs  # another folder
pnpm install
pnpm nx serve docs
```

The app gets a `project.json` with `build`, `serve`, `test` and `typecheck` targets (the same AnalogJS executors as `nx g @analogjs/platform:application`), and its dependencies go to the workspace root `package.json`. Versions the workspace already has are kept and listed. Pass `--no-nx` to get a standalone project anyway, or `--nx` to fail when no `nx.json` is found. See [Nx Monorepos](https://ngmd.netlify.app/stack/nx).

Inside a monorepo, keep the scaffolded `.prettierrc.json` and `.prettierignore` in the NgMd folder. Otherwise the root Prettier config reformats NgMd's files (bracket spacing, for example) and they drift from upstream.

## How it works

`index.mjs` (zero npm deps; warns if your Node is below the template's `engines.node` floor) copies `template/` into the target directory and rewrites a few placeholders (`package.json` name, `ngmd.config.ts` brand and GitHub URL, `README.md` heading; `index.html` reads its title and meta tags from `ngmd.config.ts`) so the new project matches the name you passed. It refuses a non-empty target directory, and does not install dependencies or run `git init`. Inside an Nx workspace, `nx.mjs` then turns the copy into an Nx project.

`template/` is generated from the parent ngmd repo by `build-template.mjs` and is git-ignored. The `prepublishOnly` script regenerates it before every publish, so the npm artifact always carries an up-to-date starter.

To preview a scaffolded project locally without publishing:

```bash
node create-ngmd/build-template.mjs   # populate create-ngmd/template/
node create-ngmd/index.mjs my-docs    # scaffold ./my-docs
```

## Licence

MIT
