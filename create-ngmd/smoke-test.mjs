#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * End-to-end check for the scaffolder: regenerates `template/`, scaffolds a
 * project with `index.mjs` into a temp directory, then installs, builds and
 * runs the tests there. Removes the generated template and the temp project
 * afterwards (pass `--keep` to leave the temp project for inspection).
 * With `--nx`, scaffolds into a minimal Nx workspace instead and runs the
 * project's Nx build, test and typecheck targets.
 *
 *   node create-ngmd/smoke-test.mjs [--nx] [--keep]
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, 'template');
const keep = process.argv.includes('--keep');
const nx = process.argv.includes('--nx');
const NX_VERSION = '^23.2.0';
const templateExisted = existsSync(TEMPLATE);

function run(cmd, args, cwd) {
  console.log(`\n$ ${cmd} ${args.join(' ')}  (${cwd})`);
  execFileSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    env: {...process.env, CI: 'true', NX_DAEMON: 'false', NX_NO_CLOUD: 'true'},
  });
}

const work = mkdtempSync(join(tmpdir(), 'create-ngmd-smoke-'));
const workspace = join(work, 'nx-smoke');
const project = nx ? join(workspace, 'apps/ngmd-smoke') : join(work, 'ngmd-smoke');

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

function smokeStandalone() {
  run(process.execPath, [join(HERE, 'index.mjs'), 'ngmd-smoke'], work);
  for (const file of ['.gitignore', '.prettierrc.json', '.prettierignore']) {
    if (!existsSync(join(project, file))) throw new Error(`scaffolded project is missing ${file}`);
  }
  run('pnpm', ['install'], project);
  run('pnpm', ['build'], project);
  run('pnpm', ['exec', 'vitest', 'run'], project);
}

function smokeNx() {
  mkdirSync(workspace);
  writeJson(join(workspace, 'nx.json'), {});
  writeJson(join(workspace, 'tsconfig.base.json'), {compilerOptions: {paths: {}}});
  writeJson(join(workspace, 'package.json'), {
    name: 'nx-smoke',
    private: true,
    devDependencies: {nx: NX_VERSION},
  });
  run(process.execPath, [join(HERE, 'index.mjs'), 'ngmd-smoke'], workspace);
  for (const file of ['project.json', 'vite.config.ts', '.prettierrc.json']) {
    if (!existsSync(join(project, file))) throw new Error(`Nx project is missing ${file}`);
  }
  for (const file of ['angular.json', '.gitignore', 'pnpm-lock.yaml']) {
    if (existsSync(join(project, file))) throw new Error(`Nx project should not have ${file}`);
  }
  run('pnpm', ['install'], workspace);
  run('pnpm', ['nx', 'build', 'ngmd-smoke'], workspace);
  if (!existsSync(join(workspace, 'dist/apps/ngmd-smoke/analog/public/index.html'))) {
    throw new Error('Nx build did not write dist/apps/ngmd-smoke/analog/public/index.html');
  }
  run('pnpm', ['nx', 'test', 'ngmd-smoke'], workspace);
  run('pnpm', ['nx', 'typecheck', 'ngmd-smoke'], workspace);
}

let ok = false;
try {
  run(process.execPath, [join(HERE, 'build-template.mjs')], HERE);
  if (nx) smokeNx();
  else smokeStandalone();
  ok = true;
} finally {
  if (!templateExisted) rmSync(TEMPLATE, {recursive: true, force: true});
  if (keep) console.log(`\nkept scaffolded project at ${project}`);
  else rmSync(work, {recursive: true, force: true});
}
const label = nx ? 'create-ngmd Nx smoke test' : 'create-ngmd smoke test';
console.log(ok ? `\n${label} passed.` : `\n${label} failed.`);
