import {appBase, normalizeBase, publicUrl, resolveBase, withBase} from './base';

describe('normalizeBase', () => {
  it('gives a path that starts and ends with a slash', () => {
    expect(normalizeBase('repo')).toBe('/repo/');
    expect(normalizeBase('/repo')).toBe('/repo/');
    expect(normalizeBase('repo/')).toBe('/repo/');
    expect(normalizeBase(' /a/b// ')).toBe('/a/b/');
  });

  it('treats empty, slash and missing values as the root', () => {
    for (const v of [undefined, null, '', ' ', '/', '//']) expect(normalizeBase(v)).toBe('/');
  });

  it('rejects full URLs and relative paths', () => {
    expect(() => normalizeBase('https://example.com/repo/')).toThrow(/path/);
    expect(() => normalizeBase('//cdn.example.com/x')).toThrow(/path/);
    expect(() => normalizeBase('./')).toThrow(/absolute/);
    expect(() => normalizeBase('/a/../b')).toThrow(/absolute/);
  });
});

describe('resolveBase', () => {
  it('lets the environment variable win over the config', () => {
    expect(resolveBase('/from-config/', '/from-env/')).toBe('/from-env/');
    expect(resolveBase('/from-config/', 'env')).toBe('/env/');
  });

  it('uses the config when the variable is unset or blank', () => {
    expect(resolveBase('/from-config/', undefined)).toBe('/from-config/');
    expect(resolveBase('/from-config/', '  ')).toBe('/from-config/');
    expect(resolveBase(undefined, undefined)).toBe('/');
  });
});

describe('publicUrl', () => {
  it('adds the base to the origin without a trailing slash', () => {
    expect(publicUrl('https://user.github.io', '/repo/')).toBe('https://user.github.io/repo');
    expect(publicUrl('https://user.github.io/', '/repo/')).toBe('https://user.github.io/repo');
    expect(publicUrl('https://example.com/', '/')).toBe('https://example.com');
  });

  it('does not repeat a base that site.url already ends with', () => {
    expect(publicUrl('https://user.github.io/repo', '/repo/')).toBe('https://user.github.io/repo');
    expect(publicUrl('https://example.com/docs/', '/docs/')).toBe('https://example.com/docs');
    expect(publicUrl('https://example.com/docs', '/v2/')).toBe('https://example.com/docs/v2');
  });
});

describe('withBase', () => {
  it('prefixes root-absolute paths only', () => {
    expect(withBase('/repo/', '/images/a.png')).toBe('/repo/images/a.png');
    expect(withBase('/repo/', '/')).toBe('/repo/');
    expect(withBase('/repo/', 'images/a.png')).toBe('images/a.png');
    expect(withBase('/repo/', 'https://x.dev/a')).toBe('https://x.dev/a');
    expect(withBase('/repo/', '//cdn.x.dev/a')).toBe('//cdn.x.dev/a');
    expect(withBase('/', '/images/a.png')).toBe('/images/a.png');
  });
});

describe('appBase', () => {
  it('reads Vite BASE_URL and defaults to the root', () => {
    expect(appBase()).toBe('/');
  });
});
