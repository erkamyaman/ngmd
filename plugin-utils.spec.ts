import {mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fenceTracker, resolveInside} from './plugin-utils';

function outsideFences(markdown: string): string[] {
  const inFence = fenceTracker();
  return markdown.split('\n').filter((line) => !inFence(line));
}

describe('fenceTracker', () => {
  it('skips lines inside backtick and tilde fences', () => {
    const md = ['## Real', '```bash', '## Not a heading', '```', '~~~', '# Nope', '~~~', 'after'];
    expect(outsideFences(md.join('\n'))).toEqual(['## Real', 'after']);
  });

  it('closes only on the same character with at least the opener length', () => {
    const md = ['````md', '```ts', '## Nested', '```', '~~~~', '````', '## Out'];
    expect(outsideFences(md.join('\n'))).toEqual(['## Out']);
  });

  it('does not open a backtick fence whose info string has a backtick', () => {
    const md = ['``` not `a fence`', '## Heading', 'after'];
    expect(outsideFences(md.join('\n'))).toEqual(md);
  });

  it('does not close on a fence line with an info string', () => {
    const md = ['```', '```ts', '## Still inside', '```', '## Out'];
    expect(outsideFences(md.join('\n'))).toEqual(['## Out']);
  });
});

describe('resolveInside', () => {
  let base: string;
  let root: string;

  beforeEach(() => {
    base = mkdtempSync(join(tmpdir(), 'ngmd-'));
    root = join(base, 'site');
    mkdirSync(join(root, 'src'), {recursive: true});
    writeFileSync(join(root, 'src/app.ts'), 'inside');
    writeFileSync(join(base, 'secret.txt'), 'outside');
    symlinkSync(join(base, 'secret.txt'), join(root, 'link.txt'));
  });

  afterEach(() => rmSync(base, {recursive: true, force: true}));

  it('resolves a file inside the root', () => {
    expect(resolveInside(root, 'src/app.ts')).toMatch(/site\/src\/app\.ts$/);
  });

  it('refuses paths that climb out of the root', () => {
    expect(() => resolveInside(root, '../secret.txt')).toThrow('outside the project root');
  });

  it('refuses a symlink that points outside the root', () => {
    expect(() => resolveInside(root, 'link.txt')).toThrow('outside the project root');
  });
});
