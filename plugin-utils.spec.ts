import {mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
  fenceTracker,
  isNoIndex,
  pageRouteMatcher,
  parseFrontmatter,
  resolveInside,
  routeFromPagePath,
  walkContentFiles,
  withoutCode,
} from './plugin-utils';

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

describe('routeFromPagePath', () => {
  it('maps index pages, route groups and dot segments like the Analog router', () => {
    expect(routeFromPagePath('src/app/pages/index.page.ts')).toBe('/');
    expect(routeFromPagePath('src/app/pages/api/index.page.ts')).toBe('/api');
    expect(routeFromPagePath('src/app/pages/(docs)/guide.page.ts')).toBe('/guide');
    expect(routeFromPagePath('src/app/pages/blog.post.page.ts')).toBe('/blog/post');
  });

  it('skips dynamic and catch-all pages, and matches dynamic ones by pattern', () => {
    expect(routeFromPagePath('src/app/pages/[...slug].page.ts')).toBe('');
    expect(routeFromPagePath('src/app/pages/api/[group]/[symbol].page.ts')).toBe('');
    expect(pageRouteMatcher('src/app/pages/[...slug].page.ts')).toBeNull();
    expect(pageRouteMatcher('src/app/pages/api/index.page.ts')).toBeNull();
    const re = pageRouteMatcher('src/app/pages/api/[group]/[symbol].page.ts')!;
    expect(re.test('/api/core/Foo')).toBe(true);
    expect(re.test('/api/core')).toBe(false);
  });
});

describe('walkContentFiles', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ngmd-content-'));
    mkdirSync(join(dir, 'guide'));
    writeFileSync(join(dir, 'guide/index.md'), '');
    writeFileSync(join(dir, 'guide/setup.md'), '');
    writeFileSync(join(dir, 'index.md'), '');
  });
  afterEach(() => rmSync(dir, {recursive: true, force: true}));

  it('serves index.md at its folder route', () => {
    expect(new Map(walkContentFiles(dir, dir).map(([rel, route]) => [rel, route]))).toEqual(
      new Map([
        ['guide/index.md', '/guide'],
        ['guide/setup.md', '/guide/setup'],
        ['index.md', '/'],
      ]),
    );
  });
});

describe('parseFrontmatter', () => {
  it('reads YAML the way Analog does, including CRLF and quotes', () => {
    const {attributes, body} = parseFrontmatter(
      '---\r\ntitle: "A: b"\r\nnoIndex: "true"\r\n---\r\nBody',
    );
    expect(attributes).toEqual({title: 'A: b', noIndex: 'true'});
    expect(body).toBe('Body');
    expect(parseFrontmatter('no frontmatter').attributes).toEqual({});
    expect(parseFrontmatter('---\n: [broken\n---\nx').body).toContain('x');
  });

  it('accepts the documented noIndex spellings only', () => {
    for (const v of [true, 'true', 'True', 'yes', 1]) expect(isNoIndex({noIndex: v})).toBe(true);
    for (const v of [false, 'false', 'no', undefined]) expect(isNoIndex({noIndex: v})).toBe(false);
  });
});

describe('withoutCode', () => {
  it('blanks fenced and inline code', () => {
    expect(withoutCode('a `[x](/y)` b\n~~~\n[x](/z)\n~~~\n[ok](/w)')).toBe('a   b\n\n\n\n[ok](/w)');
  });
});
