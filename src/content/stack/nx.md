---
title: Nx Monorepos
description: Add an NgMd docs app to an existing Nx workspace with create-ngmd.
---

<ngmd-hero title="Nx Monorepos" gradient>
  Run create-ngmd inside an Nx workspace and it adds the docs site as an Nx app, laid out like an AnalogJS app from the Analog generator.
</ngmd-hero>

# Nx Monorepos

`create-ngmd` notices when it runs inside an *Nx workspace (a folder with `nx.json`, or a folder below one). Instead of a standalone project, it writes an Nx app with a `project.json`, so you build and serve it with `nx` like any other app in the repo.

## Add a docs app

Run the scaffolder from anywhere in the workspace:

```bash group="nx" name="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220" active
pnpm create ngmd@latest docs
```

```bash group="nx" name="npm" image="https://cdn.simpleicons.org/npm/CB3837"
npm create ngmd@latest docs
```

```bash group="nx" name="yarn" image="https://cdn.simpleicons.org/yarn/2C8EBB"
yarn create ngmd docs
```

```bash group="nx" name="bun" image="https://bun.sh/logo.svg"
bun create ngmd docs
```

The app lands in `apps/docs`, and `docs` is its Nx project name. Then, from the workspace root:

```bash
pnpm install
pnpm nx serve docs
```

Open `http://localhost:5173`. `pnpm nx build docs` writes the static site to `dist/apps/docs/analog/public` and the Node server to `dist/apps/docs/analog/server`.

## Options

| Option              | What it does                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `--directory <dir>` | Puts the app somewhere other than `apps/<name>`, relative to the workspace root. Example: `--directory docs/site`. |
| `--nx`              | Fails instead of creating a standalone project when no `nx.json` is found.                       |
| `--no-nx`           | Creates a standalone project even inside an Nx workspace.                                        |

## What changes compared to a standalone project

The app has the same `src/`, `public/`, build plugins and `vite.config.ts` as a standalone NgMd site. The differences are what an Nx app needs:

- **`project.json`** has `build`, `serve` and `test` targets that use the same executors as the Analog generator (`@analogjs/platform:vite`, `@analogjs/platform:vite-dev-server` and `@analogjs/vitest-angular:test`), plus a `typecheck` target that runs `tsc --noEmit`.
- **Dependencies go to the workspace root `package.json`.** The scaffolder adds the ones the workspace doesn't have yet, including `@nx/vite` at your `nx` version (the Analog executors need it). It never changes a version you already have, and it lists any version that differs from NgMd's, so you can check those.
- **`vite.config.ts`** sets `root` to its own folder, builds into `dist/<app folder>`, shares the workspace Vite cache and resolves the `paths` from your tsconfig, so imports from workspace libraries work.
- **`tsconfig.json`** extends the workspace `tsconfig.base.json`.
- **`site.githubDir`** in `src/ngmd.config.ts` is set to the app folder, so edit and source links point at the right files.
- **No `.gitignore`, lockfile or `angular.json`** inside the app, and no `git init`. The workspace already owns those.

<ngmd-callout type="warning" title="Angular versions">
  NgMd needs Angular 22 and Vite 8. If the workspace pins older versions, the scaffolder keeps them and lists them, and the build will most likely fail until you update them (<code>nx migrate</code> handles Angular).
</ngmd-callout>

## Code imports in a monorepo

Paths in ` ```ts file="..." ` blocks are relative to the app folder, the same as in a standalone site, even though Nx runs Vite from the workspace root.

## Start from an empty Analog app

If you already ran `nx g @analogjs/platform:application` and haven't changed the app yet, it's simpler to replace it than to merge NgMd into it. Remove the app folder, then run the scaffolder with the same name and folder:

```bash
rm -rf apps/analog-app
pnpm create ngmd@latest analog-app --directory apps/analog-app
pnpm install
```

To add NgMd to an Analog app that already has your own code, follow the manual path on the [Installation](/stack/installation) page.
