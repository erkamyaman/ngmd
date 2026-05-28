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

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(HERE, 'template');

/**
 * `create-ngmd <project-name>` — scaffolds a fresh NgMd project.
 *
 * Behaviour:
 *   1. Accept project name from argv[2] or interactive prompt.
 *   2. Validate (lowercase, hyphenated, no path traversal, dir not present).
 *   3. Copy `template/` into ./<project-name>/.
 *   4. Replace placeholders ({{name}}) in package.json, ngmd.config.ts, index.html.
 *   5. Print next-step commands tailored to the detected package manager.
 *
 * Zero npm dependencies. Node 20+ builtins only.
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
  ];

  for (const {file, replacer} of subs) {
    const path = join(target, file);
    if (!existsSync(path)) continue;
    writeFileSync(path, replacer(readFileSync(path, 'utf8')));
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const requested = argv[0];

  console.log(
    `\n${c.bold}${c.cyan}create-ngmd${c.reset} ${c.dim}— scaffold a new NgMd project${c.reset}\n`,
  );

  if (!existsSync(TEMPLATE_DIR)) {
    console.error(`${c.red}error:${c.reset} template directory missing at ${TEMPLATE_DIR}`);
    console.error('Run `node create-ngmd/build-template.mjs` from the ngmd repo first.');
    process.exit(1);
  }

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

  const target = resolve(process.cwd(), name);
  if (existsSync(target)) {
    const isEmpty = readdirSync(target).length === 0;
    if (!isEmpty) {
      console.error(
        `${c.red}error:${c.reset} directory "${name}" already exists and is not empty.`,
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

  // npm rewrites .gitignore → .npmignore on publish; restore the dotfile.
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
