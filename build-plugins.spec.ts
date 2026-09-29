import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import type {Plugin} from 'vite';
import {internalLinkGuard} from './link-guard.plugin';
import {rawMdPlugin} from './raw-md.plugin';
import {searchIndexPlugin} from './search-index.plugin';
import {sitemapPlugin} from './sitemap.plugin';

type Hook = (this: unknown, ...args: unknown[]) => unknown;

function call(plugin: Plugin, hook: keyof Plugin, ctx: unknown, ...args: unknown[]): unknown {
  return (plugin[hook] as Hook).call(ctx, ...args);
}

let root: string;

function write(files: Record<string, string>): void {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), {recursive: true});
    writeFileSync(join(root, path), text);
  }
}

function emitted(plugin: Plugin): Map<string, string> {
  const out = new Map<string, string>();
  call(plugin, 'configResolved', undefined, {root});
  call(plugin, 'generateBundle', {
    emitFile: (f: {fileName: string; source: string}) => out.set(f.fileName, f.source),
  });
  return out;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'ngmd-plugins-'));
  write({
    'public/logo.svg': '',
    'src/app/pages/index.page.ts': '',
    'src/app/pages/[...slug].page.ts': '',
    'src/app/pages/api/index.page.ts': '',
    'src/app/pages/api/[group]/[symbol].page.ts': '',
    'src/content/guide/index.md': '---\ntitle: Guide\n---\n## Café\n\n## Setup\n\n## Setup\n',
    'src/content/hidden.md': '---\r\nnoIndex: "true"\r\n---\r\nSecret\r\n',
    'src/content/some page.md': '# Some page\n',
  });
});

afterEach(() => rmSync(root, {recursive: true, force: true}));

describe('internalLinkGuard', () => {
  function check(markdown: string): string[] {
    write({'src/content/check.md': markdown});
    const plugin = internalLinkGuard();
    call(plugin, 'configResolved', undefined, {root, command: 'serve'});
    const warnings: string[] = [];
    call(
      plugin,
      'transform',
      {warn: (m: string) => warnings.push(m)},
      '',
      join(root, 'src/content/check.md?analog-content-file=true'),
    );
    return warnings;
  }

  it('accepts index routes, dynamic pages, public files, queries, slashes and encoding', () => {
    expect(
      check(
        [
          '[a](/guide) [b](/guide/#cafe) [c](/guide?tab=1#setup-1) [d](/api) [e](/api/core/Foo)',
          '![logo](/logo.svg) [raw](/guide.md) [f](/some%20page) [g](#local) [h](//cdn.example.com/x)',
          '## Local',
        ].join('\n'),
      ),
    ).toEqual([]);
  });

  it('ignores links inside code and still reports real breakage', () => {
    const [warning] = check(
      '```md\n[x](/nope)\n```\n\n`[y](/nope2)`\n\n[z](/missing) ![i](/missing.png) [w](/guide#nope)',
    );
    expect(warning).not.toContain('/nope"');
    expect(warning).not.toContain('/nope2');
    expect(warning).toContain('"/missing" is not a known route');
    expect(warning).toContain('"/missing.png" is not a known route or file in public/');
    expect(warning).toContain('"/guide#nope"');
  });
});

describe('searchIndexPlugin', () => {
  function index(): Array<Record<string, string>> {
    const plugin = searchIndexPlugin();
    call(plugin, 'configResolved', undefined, {root});
    const code = call(plugin, 'load', undefined, '\0virtual:ngmd/search-index') as string;
    return JSON.parse(code.replace(/^export const searchIndex = |;$/g, ''));
  }

  it('uses index routes, YAML frontmatter and TOC anchors, and skips noIndex pages', () => {
    const docs = index();
    expect(docs.some((d) => d['url'] === '/hidden')).toBe(false);
    const guide = docs.filter((d) => d['url'] === '/guide');
    expect(guide.map((d) => d['anchor'])).toEqual(['', 'cafe', 'setup', 'setup-1']);
    expect(guide[0]['pageTitle']).toBe('Guide');
  });

  it('keeps inline code text, drops fenced code and loses no characters when chunking', () => {
    const long = 'x'.repeat(700);
    write({
      'src/content/code.md': `## Use \`<router-outlet>\`\n\nCall \`a_b()\` now.\n\n~~~ts\nsecret()\n~~~\n\n## Long\n\n${long}\n`,
    });
    const docs = index().filter((d) => d['url'] === '/code');
    expect(docs[1]['heading']).toBe('Use <router-outlet>');
    expect(docs[2]['body']).toBe('Call a_b() now.');
    expect(JSON.stringify(docs)).not.toContain('secret');
    const chunks = docs.filter((d) => d['anchor'] === 'long' && d['kind'] === 'snippet');
    expect(chunks.map((d) => d['body']).join('')).toBe(long);
  });
});

describe('sitemapPlugin', () => {
  it('lists static routes once, encoded, under a subpath, without noIndex pages', () => {
    const plugin = sitemapPlugin({siteUrl: 'https://example.com/docs/'});
    const out = emitted(plugin);
    const locs = [...out.get('sitemap.xml')!.matchAll(/<loc>(.*)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      'https://example.com/docs/',
      'https://example.com/docs/api',
      'https://example.com/docs/guide',
      'https://example.com/docs/some%20page',
    ]);
    expect(out.get('robots.txt')).toContain('Sitemap: https://example.com/docs/sitemap.xml');
  });
});

describe('rawMdPlugin', () => {
  it('emits index pages at their route plus .md', () => {
    const out = emitted(rawMdPlugin());
    expect(out.get('guide.md')).toContain('## Setup');
    expect(out.get('guide/index.md')).toBe(out.get('guide.md'));
    expect(out.has('some page.md')).toBe(true);
  });
});
