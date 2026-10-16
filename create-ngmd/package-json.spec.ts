import {resolveOverrideRefs} from './package-json.mjs';

describe('resolveOverrideRefs', () => {
  it('replaces $name references with the range from devDependencies', () => {
    const pkg = {
      devDependencies: {vite: '^8.3.1', vitest: '^4.1.11'},
      overrides: {vite: '$vite', vitest: '$vitest'},
    };
    expect(resolveOverrideRefs(pkg).overrides).toEqual({vite: '^8.3.1', vitest: '^4.1.11'});
  });

  it('prefers dependencies over devDependencies', () => {
    const pkg = {
      dependencies: {a: '^1.0.0'},
      devDependencies: {a: '^2.0.0'},
      overrides: {a: '$a'},
    };
    expect(resolveOverrideRefs(pkg).overrides).toEqual({a: '^1.0.0'});
  });

  it('keeps literal ranges and resolves nested overrides', () => {
    const pkg = {
      dependencies: {b: '~2.0.0'},
      overrides: {c: '1.2.3', d: {'.': '$b', e: '$b'}},
    };
    expect(resolveOverrideRefs(pkg).overrides).toEqual({
      c: '1.2.3',
      d: {'.': '~2.0.0', e: '~2.0.0'},
    });
  });

  it('throws when a reference has no matching dependency', () => {
    expect(() => resolveOverrideRefs({overrides: {x: '$x'}})).toThrow(/\$x/);
  });

  it('leaves a package without overrides alone', () => {
    const pkg = {name: 'a'};
    expect(resolveOverrideRefs(pkg)).toEqual({name: 'a'});
  });

  it('leaves no $ reference in the repo package.json once resolved', async () => {
    const {readFileSync} = await import('node:fs');
    const {join} = await import('node:path');
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    expect(JSON.stringify(resolveOverrideRefs(pkg).overrides ?? {})).not.toContain('$');
  });
});
