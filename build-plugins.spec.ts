import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import type {Plugin} from 'vite';
import {internalLinkGuard} from './link-guard.plugin';
import {prerenderRoutes, siteRoot, walkContentFiles} from './plugin-utils';
import {rawMdPlugin} from './raw-md.plugin';
import {searchIndexPlugin} from './search-index.plugin';
import {siteHtmlPlugin} from './site-html.plugin';
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

  it('resolves relative .md links from the linking file', () => {
    expect(
      check(
        '[a](./guide/index.md#setup-1) [b](guide/index.md) [c](./some%20page.md) <a href="./hidden.md">d</a> ![e](./logo.png)',
      ),
    ).toEqual([]);
    const [warning] = check(
      '[a](./missing.md) [b](../README.md) [c](./guide/index.md#nope) [d](./guide/index.md?x=1)',
    );
    expect(warning).toContain('"/missing" is not a known route');
    expect(warning).toContain('"../README.md" is not a page in src/content');
    expect(warning).toContain('"/guide#nope"');
    expect(warning).toContain('"./guide/index.md?x=1" is not a page in src/content');
  });

  it('resolves relative .md links from a nested page and fails the build on a missing one', () => {
    write({'src/content/guide/deep/page.md': '[a](../index.md#cafe) [b](../../some%20page.md)'});
    const plugin = internalLinkGuard();
    call(plugin, 'configResolved', undefined, {root, command: 'build'});
    const ctx = {
      warn: () => undefined,
      error: (m: string) => {
        throw new Error(m);
      },
    };
    expect(
      call(plugin, 'transform', ctx, '', join(root, 'src/content/guide/deep/page.md')),
    ).toBeNull();
    write({'src/content/guide/deep/page.md': '[a](../gone.md)'});
    expect(() =>
      call(plugin, 'transform', ctx, '', join(root, 'src/content/guide/deep/page.md')),
    ).toThrow('"/guide/gone" is not a known route');
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
      'https://example.com/docs/guide',
      'https://example.com/docs/some%20page',
    ]);
    expect(out.get('robots.txt')).toContain('Sitemap: https://example.com/docs/sitemap.xml');
  });

  it('adds the base to every URL and to robots.txt', () => {
    const plugin = sitemapPlugin({siteUrl: 'https://user.github.io/', base: '/repo/'});
    const out = emitted(plugin);
    const locs = [...out.get('sitemap.xml')!.matchAll(/<loc>(.*)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(
      expect.arrayContaining([
        'https://user.github.io/repo/',
        'https://user.github.io/repo/guide',
        'https://user.github.io/repo/some%20page',
      ]),
    );
    expect(locs.every((l) => l.startsWith('https://user.github.io/repo/'))).toBe(true);
    expect(out.get('robots.txt')).toContain('Sitemap: https://user.github.io/repo/sitemap.xml');
  });

  it('does not repeat a base that siteUrl already ends with', () => {
    const plugin = sitemapPlugin({siteUrl: 'https://user.github.io/repo', base: '/repo/'});
    const sitemap = emitted(plugin).get('sitemap.xml')!;
    expect(sitemap).toContain('<loc>https://user.github.io/repo/guide</loc>');
    expect(sitemap).not.toContain('/repo/repo');
  });
});

describe('prerenderRoutes', () => {
  const API = {
    'ngmd.api.ts': "export default defineApi({scope: ['lib/**/*.ts']});\n",
    'lib/math.ts': 'export function add() {}\n',
  };

  it('lists every static route, noIndex pages included, then the 404 page', () => {
    expect(prerenderRoutes(root)).toEqual([
      '/',
      '/api',
      '/guide',
      '/hidden',
      '/some page',
      '/404.html',
    ]);
  });

  it('adds a page per API symbol and lists it in the sitemap too', () => {
    write(API);
    expect(prerenderRoutes(root)).toContain('/api/lib/add');
    const sitemap = emitted(sitemapPlugin({siteUrl: 'https://example.com'})).get('sitemap.xml');
    expect(sitemap).toContain('<loc>https://example.com/api/lib/add</loc>');
    expect(sitemap).toContain('<loc>https://example.com/api</loc>');
  });

  it('keeps the empty /api page out of the sitemap but still prerenders it', () => {
    expect(prerenderRoutes(root)).toContain('/api');
    const sitemap = emitted(sitemapPlugin({siteUrl: 'https://example.com'})).get('sitemap.xml');
    expect(sitemap).not.toContain('/api');
  });

  it('drops /api from the sitemap when ngmd.api.ts matches no symbols', () => {
    write({'ngmd.api.ts': "export default defineApi({scope: ['nothing/**/*.ts']});\n"});
    const sitemap = emitted(sitemapPlugin({siteUrl: 'https://example.com'})).get('sitemap.xml');
    expect(sitemap).not.toContain('/api');
  });

  it("covers every page of this site's own content and API reference", () => {
    const routes = prerenderRoutes(siteRoot);
    const content = walkContentFiles(join(siteRoot, 'src/content'), siteRoot).map(([, r]) => r);
    expect(content.length).toBeGreaterThan(0);
    expect(routes).toEqual(
      expect.arrayContaining([...content, '/', '/api', '/concepts/components', '/404.html']),
    );
    expect(routes).toContain('/api/src-app-ui/NgmdCallout');
    expect(routes.filter((r) => r.includes('['))).toEqual([]);
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

describe('siteHtmlPlugin', () => {
  it('fills the site tokens from config, escaped, without a trailing slash on the URL', () => {
    const plugin = siteHtmlPlugin({
      name: 'A & B <docs>',
      description: 'Say "hi" & more',
      url: 'https://docs.example.com//',
    });
    const html =
      '<title>%SITE_NAME%</title><meta content="%SITE_DESCRIPTION%" />' +
      '<meta content="%SITE_URL%/og.png" /><meta content="%SITE_NAME%" />';
    expect(call(plugin, 'transformIndexHtml', undefined, html)).toBe(
      '<title>A &amp; B &lt;docs></title><meta content="Say &quot;hi&quot; &amp; more" />' +
        '<meta content="https://docs.example.com/og.png" /><meta content="A &amp; B &lt;docs>" />',
    );
  });

  describe('with a base', () => {
    const site = {name: 'Docs', description: 'd', url: 'https://user.github.io'};
    const html = '<base href="%SITE_BASE%" /><meta content="%SITE_URL%/og.png" />';

    it('sets <base href> and puts the base in the social URLs', () => {
      const plugin = siteHtmlPlugin({...site, base: '/repo/'});
      expect(call(plugin, 'transformIndexHtml', undefined, html)).toBe(
        '<base href="/repo/" /><meta content="https://user.github.io/repo/og.png" />',
      );
    });

    it('defaults to the root and does not repeat a base already in site.url', () => {
      expect(call(siteHtmlPlugin(site), 'transformIndexHtml', undefined, html)).toBe(
        '<base href="/" /><meta content="https://user.github.io/og.png" />',
      );
      const plugin = siteHtmlPlugin({...site, url: 'https://user.github.io/repo', base: 'repo'});
      expect(call(plugin, 'transformIndexHtml', undefined, html)).toBe(
        '<base href="/repo/" /><meta content="https://user.github.io/repo/og.png" />',
      );
    });

    it('also fixes an older index.html that hardcodes <base href="/">', () => {
      const plugin = siteHtmlPlugin({...site, base: '/repo/'});
      expect(call(plugin, 'transformIndexHtml', undefined, '<base href="/" />')).toBe(
        '<base href="/repo/" />',
      );
    });
  });
});
