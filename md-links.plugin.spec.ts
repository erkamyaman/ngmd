import {mdLinksPlugin, resolveDocLinks, resolveMdHref} from './md-links.plugin';

describe('resolveMdHref', () => {
  const page = '/src/content/getting-started/installation';

  it('resolves sibling, parent and nested .md links to routes and keeps the fragment', () => {
    expect(resolveMdHref('./configuration.md', page)).toBe('/getting-started/configuration');
    expect(resolveMdHref('vite.md#analog', page)).toBe('/getting-started/vite#analog');
    expect(resolveMdHref('../inspectors/router.md#tools', page)).toBe('/inspectors/router#tools');
    expect(resolveMdHref('../security.md', page)).toBe('/security');
    expect(resolveMdHref('./guide/index.md', '/src/content/intro.md')).toBe('/guide');
    expect(resolveMdHref('../index.md', page)).toBe('/');
  });

  it('resolves against the directory of an index page', () => {
    expect(resolveMdHref('./setup.md', '/src/content/guide/index')).toBe('/guide/setup');
  });

  it('ignores routes, fragments, external links, other files and paths outside content', () => {
    for (const href of [
      '/getting-started/vite',
      '#local',
      'https://angular.dev/guide.md',
      'mailto:a@b.md',
      './diagram.png',
      './configuration',
      '../../../../README.md',
    ]) {
      expect(resolveMdHref(href, page)).toBeNull();
    }
  });
});

describe('resolveDocLinks', () => {
  it('rewrites relative .md hrefs in HTML and leaves the rest alone', () => {
    const html =
      '<a href="./configuration.md#auth">a</a> <a class="x" href=\'../security.md\'>b</a> ' +
      '<a href="/agents/tools">c</a> <a href="https://github.com/x/README.md">d</a>';
    expect(resolveDocLinks(html, '/src/content/getting-started/installation')).toBe(
      '<a href="/getting-started/configuration#auth">a</a> <a class="x" href=\'/security\'>b</a> ' +
        '<a href="/agents/tools">c</a> <a href="https://github.com/x/README.md">d</a>',
    );
  });

  it('leaves escaped markup in code and non-anchor attributes alone', () => {
    const html =
      '<pre><code>&lt;a href="./configuration.md"&gt;</code></pre> ' +
      '<a data-href="./security.md" href="./security.md">a</a> <link href="./x.md">';
    expect(resolveDocLinks(html, '/src/content/getting-started/installation')).toBe(
      '<pre><code>&lt;a href="./configuration.md"&gt;</code></pre> ' +
        '<a data-href="./security.md" href="/getting-started/security">a</a> <link href="./x.md">',
    );
  });
});

describe('mdLinksPlugin', () => {
  type Hook = (this: unknown, ...args: unknown[]) => unknown;
  const plugin = mdLinksPlugin();
  (plugin.configResolved as Hook).call(undefined, {root: '/site'});
  const transform = (code: string, id: string) =>
    (plugin.transform as Hook).call(
      {
        error: (m: string) => {
          throw new Error(m);
        },
      },
      code,
      id,
    );

  it('rewrites the rendered content module of a page', () => {
    const html = '---\ntitle: Vite\n---\n\n<a href="./cli.md#flags">CLI</a>';
    expect(
      transform(
        `export default ${JSON.stringify(html)}`,
        '/site/src/content/getting-started/vite.md?analog-content-file=true',
      ),
    ).toEqual({
      code: `export default ${JSON.stringify(html.replace('./cli.md', '/getting-started/cli'))}`,
      map: null,
    });
  });

  it('skips other modules and fails on an unexpected module shape', () => {
    expect(transform('x', '/site/src/content/vite.md?raw')).toBeNull();
    expect(transform('x', '/site/README.md?analog-content-file=true')).toBeNull();
    expect(() =>
      transform('export const x = 1', '/site/src/content/vite.md?analog-content-file=true'),
    ).toThrow('Unexpected content module shape');
  });
});
