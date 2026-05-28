#!/usr/bin/env node
import {cpSync, rmSync, mkdirSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * Generates `create-ngmd/template/` from the parent ngmd repo source so the
 * scaffolder ships an up-to-date starter. Run from anywhere; resolves paths
 * relative to this file.
 *
 * What gets copied (the runtime project):
 *   src/, public/, index.html, vite.config.ts, *.plugin.ts, tsconfig*.json,
 *   angular.json, package.json, .gitignore
 *
 * What gets excluded:
 *   node_modules/, dist/, .git/, .angular/, .vite/, pnpm-lock.yaml,
 *   BACKLOG.md, PLAN.md, README.md, create-ngmd/ itself.
 *
 * Post-copy edits:
 *   - package.json: drop "private", reset version, leave name as `ngmd` so
 *     the CLI can regex-replace it on scaffold.
 *   - Write a starter README.md geared at the new project, not the dev site.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const TEMPLATE = join(HERE, 'template');

const INCLUDE = [
  'src',
  'public',
  'index.html',
  'vite.config.ts',
  'page-meta.plugin.ts',
  'link-guard.plugin.ts',
  'sitemap.plugin.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.spec.json',
  'angular.json',
  'package.json',
  '.gitignore',
];

function clean(dir) {
  if (existsSync(dir)) rmSync(dir, {recursive: true, force: true});
}

function copyOne(name) {
  const from = join(REPO, name);
  const to = join(TEMPLATE, name);
  if (!existsSync(from)) {
    console.warn(`  skip ${name} (missing)`);
    return;
  }
  cpSync(from, to, {recursive: true});
  console.log(`  + ${name}`);
}

function writePkgJson() {
  const path = join(TEMPLATE, 'package.json');
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  delete pkg.private;
  delete pkg.repository;
  delete pkg.bugs;
  delete pkg.homepage;
  delete pkg.author;
  pkg.version = '0.0.1';
  pkg.description = 'NgMd docs site';
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  console.log('  ~ trimmed package.json (dropped repo/bugs/homepage/author)');
}

function writeReadme() {
  const path = join(TEMPLATE, 'README.md');
  const body =
    '# NgMd starter\n\n' +
    'A docs site scaffolded with `create-ngmd`.\n\n' +
    '## Develop\n\n' +
    '```bash\n' +
    'pnpm install    # or npm / yarn / bun\n' +
    'pnpm dev\n' +
    '```\n\n' +
    '## Add a page\n\n' +
    'Drop a `.md` file under `src/content/`. The path becomes the URL: ' +
    '`src/content/install.md` resolves at `/install`, ' +
    '`src/content/guides/auth.md` at `/guides/auth`. No `.page.ts` wrapper ' +
    'needed; the catch-all at `src/app/pages/[...slug].page.ts` renders ' +
    'every prose route.\n\n' +
    '## Build\n\n' +
    '```bash\n' +
    'pnpm build\n' +
    '```\n\n' +
    'Output lands in `dist/`. Sitemap and `robots.txt` emit alongside the ' +
    'client bundle.\n\n' +
    '## Configure\n\n' +
    'Edit `src/ngmd.config.ts` to change brand, navigation, and public URL.\n';
  writeFileSync(path, body);
  console.log('  + README.md (starter)');
}

/**
 * Slim the copied tree down to a starter: drop NgMd's own docs content
 * (about, changelog, theming, stack, etc.) and showcase pages, replace
 * welcome.md with generic placeholder content, leave behind a minimal
 * landing + welcome + 404 so `pnpm dev` works out of the box.
 */
function slimDocsContent() {
  const PAGES = join(TEMPLATE, 'src/app/pages');
  const CONTENT = join(TEMPLATE, 'src/content');

  const dropPages = [
    'concepts',
    'getting-started',
    'stack',
    'support.page.ts',
    'analog-welcome.ts',
  ];
  for (const p of dropPages) {
    const full = join(PAGES, p);
    if (existsSync(full)) {
      rmSync(full, {recursive: true, force: true});
      console.log(`  - src/app/pages/${p}`);
    }
  }

  // Replace src/content/*.md with a single placeholder welcome.md.
  if (existsSync(CONTENT)) {
    rmSync(CONTENT, {recursive: true, force: true});
  }
  const welcome =
    '---\n' +
    'title: Welcome\n' +
    '---\n\n' +
    '# Welcome\n\n' +
    'This is your first docs page, rendered from `src/content/welcome.md`.\n\n' +
    '## Add a page\n\n' +
    'Drop a new `.md` file under `src/content/`. The path becomes the URL: ' +
    '`src/content/install.md` resolves at `/install`, ' +
    '`src/content/guides/auth.md` at `/guides/auth`. The catch-all at ' +
    '`src/app/pages/[...slug].page.ts` renders every prose route, no wrapper ' +
    'required.\n\n' +
    '## Add nav\n\n' +
    'Edit the `nav` array in `src/ngmd.config.ts`. Sidebar, command palette, ' +
    'breadcrumb, and prev/next footer all read from there.\n\n' +
    '## Authoring components\n\n' +
    'NgMd ships a small authoring component library under `src/app/ui/`: callouts, alerts, ' +
    'cards, tabs, pill rows, workflows, hero, and a code ' +
    'block with shiki highlighting. Compose them in a `.page.ts` route for ' +
    'pages that need bespoke layout; for prose pages, stick with markdown.\n';
  mkdirSync(CONTENT, {recursive: true});
  writeFileSync(join(CONTENT, 'welcome.md'), welcome);
  console.log('  + src/content/welcome.md (placeholder)');

  // Trim nav config to a single starter section.
  const cfg = join(TEMPLATE, 'src/ngmd.config.ts');
  if (existsSync(cfg)) {
    let src = readFileSync(cfg, 'utf8');
    const navStart = src.indexOf('nav: [');
    const closeIdx = src.indexOf('  ],\n};', navStart);
    if (navStart !== -1 && closeIdx !== -1) {
      const before = src.slice(0, navStart);
      const after = src.slice(closeIdx);
      const minimalNav =
        'nav: [\n' +
        '    {\n' +
        "      label: 'Getting Started',\n" +
        "      items: [{ label: 'Welcome', href: '/welcome' }],\n" +
        '    },\n  ],\n};';
      src = before + minimalNav + after.replace(/^  \],\n\};/, '');
      writeFileSync(cfg, src);
      console.log('  ~ trimmed nav in src/ngmd.config.ts');
    }
  }
}

/**
 * Replace the busy NgMd landing with a one-screen placeholder that just says
 * "go read /welcome".
 */
function writeIndexPage() {
  const path = join(TEMPLATE, 'src/app/pages/index.page.ts');
  const body =
    "import { Component, inject } from '@angular/core';\n" +
    "import { RouterLink } from '@angular/router';\n" +
    "import { LayoutMode } from '../layout-mode.service';\n\n" +
    '@Component({\n' +
    "  selector: 'app-home',\n" +
    '  imports: [RouterLink],\n' +
    '  template: `\n' +
    '    <section class="mx-auto max-w-2xl px-6 py-24 text-center">\n' +
    '      <h1 class="text-4xl font-bold tracking-tight">Your docs</h1>\n' +
    '      <p class="mt-4 text-zinc-600 dark:text-zinc-400">\n' +
    '        Scaffolded with <code>create-ngmd</code>. Edit\n' +
    '        <code>src/content/welcome.md</code> to make this your own.\n' +
    '      </p>\n' +
    '      <a\n' +
    '        routerLink="/welcome"\n' +
    '        class="mt-8 inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"\n' +
    '      >\n' +
    '        Read the docs →\n' +
    '      </a>\n' +
    '    </section>\n' +
    '  `,\n' +
    '})\n' +
    'export default class HomePage {\n' +
    '  constructor() {\n' +
    '    inject(LayoutMode).chromeHidden.set(true);\n' +
    '  }\n' +
    '}\n';
  writeFileSync(path, body);
  console.log('  ~ replaced src/app/pages/index.page.ts (generic landing)');
}

console.log(`generating template at ${TEMPLATE}`);
clean(TEMPLATE);
for (const name of INCLUDE) copyOne(name);
writePkgJson();
writeReadme();
slimDocsContent();
writeIndexPage();
console.log('done.');
