#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInterface} from 'node:readline/promises';
import {stdin, stdout} from 'node:process';
import {convertToNxProject, findNxWorkspace, toPosix} from './nx.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(HERE, 'template');

/**
 * `create-ngmd <project-name> [--nx | --no-nx] [--directory <dir>]` — scaffolds
 * a fresh NgMd project.
 *
 * Behaviour:
 *   1. Accept project name from the first positional argument or a prompt.
 *   2. Validate (lowercase, hyphenated, no path traversal, dir not present).
 *   3. Copy `template/` into ./<project-name>/, or into <dir> (default
 *      apps/<project-name>) of the enclosing Nx workspace when there is one.
 *   4. Replace placeholders ({{name}}) in package.json, ngmd.config.ts, index.html.
 *   5. In an Nx workspace, turn the copy into an Nx project (see nx.mjs).
 *   6. Print next-step commands tailored to the detected package manager.
 *
 * Zero npm dependencies. Node builtins only.
 */

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function detectPM() {
  const ua = process.env.npm_config_user_agent ?? '';
  if (ua.startsWith('pnpm')) return 'pnpm';
  if (ua.startsWith('yarn')) return 'yarn';
  if (ua.startsWith('bun')) return 'bun';
  return 'npm';
}

function satisfiesNode(range, version) {
  const [major, minor, patch] = version.split('.').map(Number);
  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  return range.split('||').some((part) => {
    const m = part.trim().match(/^(\^|>=)?\s*(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return true;
    const min = [Number(m[2]), Number(m[3]), Number(m[4])];
    if (cmp([major, minor, patch], min) < 0) return false;
    return m[1] === '^' ? major === min[0] : true;
  });
}

function warnIfNodeTooOld() {
  let range = '';
  try {
    range =
      JSON.parse(readFileSync(join(TEMPLATE_DIR, 'package.json'), 'utf8')).engines?.node ?? '';
  } catch {
    return;
  }
  if (!range || satisfiesNode(range, process.versions.node)) return;
  console.warn(
    `${c.yellow}warning:${c.reset} the generated project requires Node ${range}, ` +
      `but you are running ${process.versions.node}.\n` +
      `Scaffolding will continue, but install, dev and build will fail until you upgrade Node.\n`,
  );
}

function validName(s) {
  return /^[a-z0-9][a-z0-9._-]*$/.test(s) && !s.includes('..');
}

async function prompt(rl, question, defaultValue) {
  const tail = defaultValue ? ` ${c.dim}(${defaultValue})${c.reset}` : '';
  const answer = (await rl.question(`${question}${tail}: `)).trim();
  return answer || defaultValue || '';
}

function replacePlaceholders(target, name) {
  const subs = [
    {
      file: 'package.json',
      replacer: (s) => s.replace(/"name":\s*"ngmd"/, `"name": "${name}"`),
    },
    {
      file: 'src/ngmd.config.ts',
      replacer: (s) =>
        s
          .replace(/name:\s*'NgMd'/, `name: '${name}'`)
          .replace(/githubUrl:\s*'[^']*'/, `githubUrl: 'https://github.com/your-org/${name}'`),
    },
    {
      file: 'index.html',
      replacer: (s) =>
        s
          .replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`)
          .replace(/og:title"\s+content="[^"]*"/, `og:title" content="${name}"`),
    },
    {
      file: 'README.md',
      replacer: (s) => s.replace(/^# NgMd starter$/m, `# ${name}`),
    },
  ];

  for (const {file, replacer} of subs) {
    const path = join(target, file);
    if (!existsSync(path)) continue;
    writeFileSync(path, replacer(readFileSync(path, 'utf8')));
  }
}

function parseArgs(argv) {
  const args = {name: undefined, nx: undefined, directory: undefined};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--nx') args.nx = true;
    else if (a === '--no-nx') args.nx = false;
    else if (a === '--directory' || a === '--dir') args.directory = argv[++i];
    else if (a.startsWith('--directory=')) args.directory = a.slice('--directory='.length);
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else if (!args.name) args.name = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  return args;
}

function validDirectory(dir) {
  const parts = toPosix(dir).split('/').filter(Boolean);
  return (
    parts.length > 0 &&
    !dir.startsWith('/') &&
    !/^[a-zA-Z]:/.test(dir) &&
    parts.every((p) => p !== '..' && p !== '.' && /^[a-zA-Z0-9._@-]+$/.test(p))
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const requested = args.name;

  console.log(
    `\n${c.bold}${c.cyan}create-ngmd${c.reset} ${c.dim}— scaffold a new NgMd project${c.reset}\n`,
  );

  if (!existsSync(TEMPLATE_DIR)) {
    console.error(`${c.red}error:${c.reset} template directory missing at ${TEMPLATE_DIR}`);
    console.error('Run `node create-ngmd/build-template.mjs` from the ngmd repo first.');
    process.exit(1);
  }

  warnIfNodeTooOld();

  let name = requested;
  if (!name) {
    const rl = createInterface({input: stdin, output: stdout});
    name = await prompt(rl, 'Project name', 'my-docs');
    rl.close();
  }

  if (!validName(name)) {
    console.error(
      `${c.red}error:${c.reset} "${name}" is not a valid project name.\n` +
        `Use lowercase letters, digits, dots, underscores, or hyphens.`,
    );
    process.exit(1);
  }

  const workspaceRoot = args.nx === false ? null : findNxWorkspace(process.cwd());
  if (args.nx && !workspaceRoot) {
    console.error(
      `${c.red}error:${c.reset} --nx was passed but no nx.json was found in this directory or above it.`,
    );
    process.exit(1);
  }
  if (args.directory !== undefined && !workspaceRoot) {
    console.error(`${c.red}error:${c.reset} --directory only applies inside an Nx workspace.`);
    process.exit(1);
  }
  if (args.directory !== undefined && !validDirectory(args.directory)) {
    console.error(
      `${c.red}error:${c.reset} "${args.directory}" is not a valid directory. ` +
        `Use a path relative to the workspace root, like apps/docs.`,
    );
    process.exit(1);
  }

  const projectRoot = workspaceRoot
    ? toPosix(args.directory ?? `apps/${name}`).replace(/^\/+|\/+$/g, '')
    : null;
  const target = workspaceRoot ? join(workspaceRoot, projectRoot) : resolve(process.cwd(), name);
  const shown = workspaceRoot ? projectRoot : name;
  if (workspaceRoot) {
    console.log(`${c.dim}Nx workspace found at${c.reset} ${workspaceRoot}`);
  }
  if (existsSync(target)) {
    const isEmpty = readdirSync(target).length === 0;
    if (!isEmpty) {
      console.error(
        `${c.red}error:${c.reset} directory "${shown}" already exists and is not empty.`,
      );
      process.exit(1);
    }
  } else {
    mkdirSync(target, {recursive: true});
  }

  console.log(`${c.dim}scaffolding into${c.reset} ${target}\n`);

  cpSync(TEMPLATE_DIR, target, {
    recursive: true,
    filter: (src) => {
      const base = src.replace(TEMPLATE_DIR, '').replace(/^[/\\]/, '');
      // Belt-and-braces: never copy these, even if they slip into template/.
      return !/^(node_modules|dist|\.angular|\.vite|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb)/.test(
        base,
      );
    },
  });

  // npm drops .gitignore on publish, so the template ships it as `gitignore`.
  const gitignoreFromNpm = join(target, 'gitignore');
  if (existsSync(gitignoreFromNpm)) {
    cpSync(gitignoreFromNpm, join(target, '.gitignore'));
    const {rmSync} = await import('node:fs');
    rmSync(gitignoreFromNpm);
  }

  replacePlaceholders(target, name);

  const pm = detectPM();
  const install = pm === 'yarn' ? 'yarn' : `${pm} install`;
  const dev = pm === 'npm' ? 'npm run dev' : `${pm} dev`;

  if (workspaceRoot) {
    const {added, kept} = convertToNxProject({workspaceRoot, target, projectRoot, name});
    const nx = {npm: 'npx nx', pnpm: 'pnpm nx', yarn: 'yarn nx', bun: 'bunx nx'}[pm];
    console.log(`${c.green}✓${c.reset} ${c.bold}done${c.reset}\n`);
    console.log(
      `${c.dim}Added${c.reset} ${added.length} ${c.dim}dependencies to the workspace package.json.${c.reset}`,
    );
    if (kept.length) {
      console.log(
        `${c.yellow}Kept your versions of these, which are a different major than NgMd uses:${c.reset}`,
      );
      for (const k of kept) console.log(`  ${k}`);
    }
    console.log(`\n${c.bold}Next steps:${c.reset}`);
    if (process.cwd() !== workspaceRoot) console.log(`  ${c.cyan}cd${c.reset} ${workspaceRoot}`);
    console.log(`  ${c.cyan}${install}${c.reset}`);
    console.log(`  ${c.cyan}${nx} serve ${name}${c.reset}\n`);
    console.log(`${c.dim}Docs:${c.reset} https://ngmd.netlify.app/stack/nx`);
    console.log(`${c.dim}Issues:${c.reset} https://github.com/erkamyaman/ngmd/issues\n`);
    return;
  }

  console.log(`${c.green}✓${c.reset} ${c.bold}done${c.reset}\n`);
  console.log(`${c.bold}Next steps:${c.reset}`);
  console.log(`  ${c.cyan}cd${c.reset} ${name}`);
  console.log(`  ${c.cyan}${install}${c.reset}`);
  console.log(`  ${c.cyan}${dev}${c.reset}\n`);
  console.log(`${c.dim}Docs:${c.reset} https://ngmd.netlify.app`);
  console.log(`${c.dim}Issues:${c.reset} https://github.com/erkamyaman/ngmd/issues\n`);
}

main().catch((err) => {
  console.error(`\n${c.red}aborted:${c.reset} ${err.message ?? err}\n`);
  process.exit(1);
});

function statSafe(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}
