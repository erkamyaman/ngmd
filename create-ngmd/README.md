# create-ngmd

Scaffold a new [NgMd](https://github.com/erkamyaman/ngmd) docs project.

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

- File-based markdown routes — drop `.md` under `src/app/pages/`, get a route
- Authoring components: callout, alert, card, tabs, pill row, workflow, hero, code-block, video, image (all under `src/app/ui/`)
- Sticky translucent header, sidebar, breadcrumb, scroll-spy TOC, Cmd+K palette
- Per-page footer: prev/next navigation, edit-on-github, last-updated
- Heading anchor copy buttons, code-block copy buttons
- Build-time link guards (external + internal)
- Sitemap + robots.txt auto-generated
- Light / dark / auto theme with no-flash boot script
- `*Keyword` inline auto-linking
- ` ```ts file="src/foo.ts#L5-L20" ` code imports, group code tabs, line highlighting

See the [NgMd repo](https://github.com/erkamyaman/ngmd) for the feature list.

## Next steps

1. Edit `src/content/welcome.md` to make the first page your own.
2. Edit `src/ngmd.config.ts` to set brand name, navigation, and accent.
3. Drop more `.md` files in `src/app/pages/` or `src/content/`.
4. Build with `pnpm run build`, deploy `dist/` to any static host.

## How it works

`index.mjs` (Node 20+, zero npm deps) copies `template/` into the target directory and rewrites a few placeholders (`package.json` name, `ngmd.config.ts` brand, `index.html` title) so the new project matches the name you passed.

`template/` is generated from the parent ngmd repo by `build-template.mjs` and is git-ignored. The `prepublishOnly` script regenerates it before every publish, so the npm artifact always carries an up-to-date starter.

To preview a scaffolded project locally without publishing:

```bash
node create-ngmd/build-template.mjs   # populate create-ngmd/template/
node create-ngmd/index.mjs my-docs    # scaffold ./my-docs
```

## Licence

MIT
