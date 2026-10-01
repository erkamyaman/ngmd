import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';

export function findNxWorkspace(start) {
  let dir = start;
  while (true) {
    if (existsSync(join(dir, 'nx.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function toPosix(p) {
  return p.split('\\').join('/');
}

export function offsetFromRoot(projectRoot) {
  return projectRoot
    .split('/')
    .filter(Boolean)
    .map(() => '../')
    .join('');
}

export function projectJson(name, projectRoot) {
  return {
    name,
    $schema: `${offsetFromRoot(projectRoot)}node_modules/nx/schemas/project-schema.json`,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    tags: [],
    targets: {
      build: {
        executor: '@analogjs/platform:vite',
        outputs: [
          '{options.outputPath}',
          `{workspaceRoot}/dist/${projectRoot}/.nitro`,
          `{workspaceRoot}/dist/${projectRoot}/ssr`,
          `{workspaceRoot}/dist/${projectRoot}/analog`,
        ],
        options: {
          main: `${projectRoot}/src/main.ts`,
          configFile: `${projectRoot}/vite.config.ts`,
          outputPath: `dist/${projectRoot}/client`,
          tsConfig: `${projectRoot}/tsconfig.app.json`,
        },
        defaultConfiguration: 'production',
        configurations: {
          development: {mode: 'development'},
          production: {sourcemap: false, mode: 'production'},
        },
      },
      serve: {
        executor: '@analogjs/platform:vite-dev-server',
        defaultConfiguration: 'development',
        options: {buildTarget: `${name}:build`, port: 5173},
        configurations: {
          development: {buildTarget: `${name}:build:development`, hmr: true},
          production: {buildTarget: `${name}:build:production`},
        },
      },
      test: {
        executor: '@analogjs/vitest-angular:test',
        outputs: ['{projectRoot}/coverage'],
      },
      typecheck: {
        executor: 'nx:run-commands',
        options: {
          cwd: projectRoot,
          command: 'tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.spec.json',
        },
      },
    },
  };
}

const VITE_ANCHOR = 'export default defineConfig(async () => ({\n  build: {\n';

export function nxViteConfig(src, projectRoot) {
  if (!src.includes(VITE_ANCHOR)) {
    throw new Error('vite.config.ts does not match the template layout, cannot add Nx paths');
  }
  const offset = offsetFromRoot(projectRoot);
  return src
    .replace(
      VITE_ANCHOR,
      'export default defineConfig(async () => ({\n' +
        '  root: import.meta.dirname,\n' +
        `  cacheDir: '${offset}node_modules/.vite',\n` +
        '  build: {\n' +
        `    outDir: '${offset}dist/${projectRoot}/client',\n`,
    )
    .replace("mainFields: ['module'],", "mainFields: ['module'],\n    tsconfigPaths: true,");
}

export function nxTsconfig(tsconfig, projectRoot, baseConfig) {
  if (!baseConfig) return tsconfig;
  return {
    extends: `${offsetFromRoot(projectRoot)}${baseConfig}`,
    ...tsconfig,
    compilerOptions: {
      ...tsconfig.compilerOptions,
      outDir: `${offsetFromRoot(projectRoot)}dist/out-tsc`,
      composite: false,
      declarationMap: false,
      emitDeclarationOnly: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  };
}

export function mergeDependencies(rootPkg, templatePkg, extraDev = {}) {
  const added = [];
  const kept = [];
  const out = {...rootPkg};
  for (const field of ['dependencies', 'devDependencies']) {
    const wanted = {...templatePkg[field], ...(field === 'devDependencies' ? extraDev : {})};
    const before = added.length;
    for (const [dep, range] of Object.entries(wanted)) {
      const existing = rootPkg.dependencies?.[dep] ?? rootPkg.devDependencies?.[dep];
      if (existing) {
        if (major(existing) !== major(range)) {
          kept.push(`${dep}@${existing} (NgMd uses ${range})`);
        }
        continue;
      }
      out[field] = {...out[field], [dep]: range};
      added.push(dep);
    }
    if (added.length > before) out[field] = sortKeys(out[field]);
  }
  return {pkg: out, added, kept};
}

function major(range) {
  return range.match(/\d+/)?.[0] ?? range;
}

function sortKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

export function convertToNxProject({workspaceRoot, target, projectRoot, name}) {
  const templatePkg = readJson(join(target, 'package.json'));

  writeJson(join(target, 'package.json'), {
    name,
    version: templatePkg.version,
    private: true,
    type: 'module',
  });
  rmSync(join(target, 'angular.json'), {force: true});
  rmSync(join(target, '.gitignore'), {force: true});
  writeJson(join(target, 'project.json'), projectJson(name, projectRoot));

  const vitePath = join(target, 'vite.config.ts');
  writeFileSync(vitePath, nxViteConfig(readFileSync(vitePath, 'utf8'), projectRoot));

  const baseConfig = ['tsconfig.base.json', 'tsconfig.json'].find((f) =>
    existsSync(join(workspaceRoot, f)),
  );
  const tsPath = join(target, 'tsconfig.json');
  writeJson(tsPath, nxTsconfig(readJson(tsPath), projectRoot, baseConfig));

  const cfgPath = join(target, 'src/ngmd.config.ts');
  if (existsSync(cfgPath)) {
    writeFileSync(
      cfgPath,
      readFileSync(cfgPath, 'utf8').replace(
        /(\n(\s*)githubUrl:\s*'[^']*',)/,
        `$1\n$2githubDir: '${projectRoot}',`,
      ),
    );
  }

  const rootPkgPath = join(workspaceRoot, 'package.json');
  const rootPkg = existsSync(rootPkgPath)
    ? readJson(rootPkgPath)
    : {name: 'workspace', private: true};
  const nxVersion = rootPkg.devDependencies?.nx ?? rootPkg.dependencies?.nx;
  const extraDev = nxVersion ? {'@nx/vite': nxVersion} : {};
  const {pkg, added, kept} = mergeDependencies(rootPkg, templatePkg, extraDev);
  writeJson(rootPkgPath, pkg);

  return {added, kept, relTarget: toPosix(relative(workspaceRoot, target))};
}
