# create-ngmd

Scaffold a new NgMd docs project.

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
pnpm install
pnpm dev
```

## How it works

`index.mjs` copies `template/` into the target directory and rewrites a few
placeholders (`package.json` name, `ngmd.config.ts` brand, `index.html` title)
so the new project matches the name you passed.

`template/` is generated from the parent ngmd repo by `build-template.mjs` and
is git-ignored. The `prepublishOnly` script regenerates it before every
publish so the npm artifact always carries an up-to-date starter.

To preview a scaffolded project locally without publishing:

```bash
node create-ngmd/build-template.mjs   # populate create-ngmd/template/
node create-ngmd/index.mjs my-docs    # scaffold ./my-docs
```
