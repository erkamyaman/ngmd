#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * End-to-end check for the scaffolder: regenerates `template/`, scaffolds a
 * project with `index.mjs` into a temp directory, then installs, builds and
 * runs the tests there. Removes the generated template and the temp project
 * afterwards (pass `--keep` to leave the temp project for inspection).
 *
 *   node create-ngmd/smoke-test.mjs [--keep]
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, 'template');
const keep = process.argv.includes('--keep');
const templateExisted = existsSync(TEMPLATE);

function run(cmd, args, cwd) {
  console.log(`\n$ ${cmd} ${args.join(' ')}  (${cwd})`);
  execFileSync(cmd, args, {cwd, stdio: 'inherit', env: {...process.env, CI: 'true'}});
}

const work = mkdtempSync(join(tmpdir(), 'create-ngmd-smoke-'));
const project = join(work, 'ngmd-smoke');
let ok = false;
try {
  run(process.execPath, [join(HERE, 'build-template.mjs')], HERE);
  run(process.execPath, [join(HERE, 'index.mjs'), 'ngmd-smoke'], work);
  run('pnpm', ['install'], project);
  run('pnpm', ['build'], project);
  run('pnpm', ['exec', 'vitest', 'run'], project);
  ok = true;
} finally {
  if (!templateExisted) rmSync(TEMPLATE, {recursive: true, force: true});
  if (keep) console.log(`\nkept scaffolded project at ${project}`);
  else rmSync(work, {recursive: true, force: true});
}
console.log(ok ? '\ncreate-ngmd smoke test passed.' : '\ncreate-ngmd smoke test failed.');
