import {cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
  convertToNxProject,
  findNxWorkspace,
  mergeDependencies,
  nxTsconfig,
  nxViteConfig,
  offsetFromRoot,
  projectJson,
} from './nx.mjs';

const REPO = join(__dirname, '..');
const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

describe('create-ngmd Nx support', () => {
  let work: string;
  beforeEach(() => {
    work = mkdtempSync(join(tmpdir(), 'ngmd-nx-spec-'));
  });
  afterEach(() => rmSync(work, {recursive: true, force: true}));

  it('finds nx.json in the start folder or above it', () => {
    writeFileSync(join(work, 'nx.json'), '{}');
    mkdirSync(join(work, 'apps/a'), {recursive: true});
    expect(findNxWorkspace(join(work, 'apps/a'))).toBe(work);
    expect(findNxWorkspace(tmpdir())).toBeNull();
  });

  it('builds the Analog project.json layout for the project root', () => {
    expect(offsetFromRoot('apps/docs')).toBe('../../');
    expect(offsetFromRoot('docs')).toBe('../');
    const p = projectJson('docs', 'apps/docs');
    expect(p.targets.build.executor).toBe('@analogjs/platform:vite');
    expect(p.targets.build.options).toEqual({
      main: 'apps/docs/src/main.ts',
      configFile: 'apps/docs/vite.config.ts',
      outputPath: 'dist/apps/docs/client',
      tsConfig: 'apps/docs/tsconfig.app.json',
    });
    expect(p.targets.serve.executor).toBe('@analogjs/platform:vite-dev-server');
    expect(p.targets.serve.configurations.development.buildTarget).toBe('docs:build:development');
    expect(p.targets.test.executor).toBe('@analogjs/vitest-angular:test');
    expect(p.targets.typecheck.options.cwd).toBe('apps/docs');
  });

  it('pins the vite config to its own folder and the workspace dist', () => {
    const out = nxViteConfig(readFileSync(join(REPO, 'vite.config.ts'), 'utf8'), 'apps/docs');
    expect(out).toContain('  root: import.meta.dirname,\n');
    expect(out).toContain("  cacheDir: '../../node_modules/.vite',\n");
    expect(out).toContain("    outDir: '../../dist/apps/docs/client',\n");
    expect(out).toContain('    tsconfigPaths: true,\n');
    expect(() => nxViteConfig('export default {}', 'apps/docs')).toThrow(/template layout/);
  });

  it('extends the workspace base tsconfig and turns off project-build options', () => {
    const ts = readJson(join(REPO, 'tsconfig.json'));
    expect(nxTsconfig(ts, 'apps/docs', undefined)).toBe(ts);
    const out = nxTsconfig(ts, 'apps/docs', 'tsconfig.base.json');
    expect(out.extends).toBe('../../tsconfig.base.json');
    expect(out.compilerOptions.composite).toBe(false);
    expect(out.compilerOptions.emitDeclarationOnly).toBe(false);
    expect(out.compilerOptions.moduleResolution).toBe('bundler');
    expect(out.angularCompilerOptions).toEqual(ts.angularCompilerOptions);
  });

  it('adds missing dependencies and keeps the versions the workspace already has', () => {
    const {pkg, added, kept} = mergeDependencies(
      {name: 'ws', devDependencies: {typescript: '~5.9.0', nx: '23.2.0', vite: '^8.0.0'}},
      {dependencies: {marked: '^15.0.7'}, devDependencies: {typescript: '~6.0.3', vite: '^8.3.1'}},
      {'@nx/vite': '23.2.0'},
    );
    expect(pkg.dependencies).toEqual({marked: '^15.0.7'});
    expect(pkg.devDependencies).toEqual({
      '@nx/vite': '23.2.0',
      nx: '23.2.0',
      typescript: '~5.9.0',
      vite: '^8.0.0',
    });
    expect(added).toEqual(['marked', '@nx/vite']);
    expect(kept).toEqual(['typescript@~5.9.0 (NgMd uses ~6.0.3)']);
  });

  it('turns a copied template into an Nx project', () => {
    writeFileSync(join(work, 'nx.json'), '{}');
    writeFileSync(join(work, 'tsconfig.base.json'), '{}');
    writeFileSync(
      join(work, 'package.json'),
      JSON.stringify({name: 'ws', devDependencies: {nx: '23.2.0'}}),
    );
    const target = join(work, 'apps/docs');
    mkdirSync(join(target, 'src'), {recursive: true});
    for (const f of ['vite.config.ts', 'tsconfig.json', 'angular.json', 'package.json']) {
      cpSync(join(REPO, f), join(target, f));
    }
    cpSync(join(REPO, 'src/ngmd.config.ts'), join(target, 'src/ngmd.config.ts'));
    writeFileSync(join(target, '.gitignore'), '/dist\n');

    const {added, relTarget} = convertToNxProject({
      workspaceRoot: work,
      target,
      projectRoot: 'apps/docs',
      name: 'docs',
    });

    expect(relTarget).toBe('apps/docs');
    expect(readJson(join(target, 'package.json'))).toMatchObject({name: 'docs', type: 'module'});
    expect(readJson(join(target, 'project.json')).name).toBe('docs');
    expect(() => readFileSync(join(target, 'angular.json'))).toThrow();
    expect(() => readFileSync(join(target, '.gitignore'))).toThrow();
    expect(readJson(join(target, 'tsconfig.json')).extends).toBe('../../tsconfig.base.json');
    expect(readFileSync(join(target, 'src/ngmd.config.ts'), 'utf8')).toContain(
      "githubDir: 'apps/docs',",
    );
    const root = readJson(join(work, 'package.json'));
    expect(root.dependencies['@analogjs/content']).toBeDefined();
    expect(root.devDependencies['@analogjs/platform']).toBeDefined();
    expect(root.devDependencies['@nx/vite']).toBe('23.2.0');
    expect(added).toContain('@nx/vite');
  });
});
