import {Marked} from 'marked';
import {findFences, getAttr, hasFlag} from './fences';
import {ngmdImageExtension} from './ngmd-image';
import {ngmdKeywordsExtension} from './ngmd-keywords';
import {ngmdVideoExtension} from './ngmd-video';
import {ngmdRuntimeExtensions} from './runtime';

vi.mock('../ngmd.config.ts', () => ({default: {keywords: {Kw: '/kw'}}}));

function render(markdown: string): string {
  return new Marked({extensions: [ngmdImageExtension, ngmdVideoExtension]}).parse(
    markdown,
  ) as string;
}

describe('ngmd-image', () => {
  it('escapes every attribute it writes', () => {
    const html = render(
      '<ngmd-image src="/a.png?x=1&y=2" alt="<b" caption="Tom & Jerry" width="3<"></ngmd-image>',
    );
    expect(html).toContain('data-image-src="/a.png?x=1&amp;y=2"');
    expect(html).toContain('data-image-alt="&lt;b"');
    expect(html).toContain('data-image-caption="Tom &amp; Jerry"');
    expect(html).toContain('data-image-width="3&lt;"');
  });
});

describe('ngmd-video', () => {
  it('builds embed URLs for YouTube and Vimeo', () => {
    expect(render('<ngmd-video src="https://youtu.be/abc123"></ngmd-video>')).toContain(
      'data-video-src="https://www.youtube.com/embed/abc123"',
    );
    expect(render('<ngmd-video src="https://vimeo.com/42"></ngmd-video>')).toContain(
      'data-video-src="https://player.vimeo.com/video/42"',
    );
  });

  it('refuses other URLs and escapes the title', () => {
    const html = render('<ngmd-video src="javascript:alert(1)" title="a <b"></ngmd-video>');
    expect(html).toContain('data-video-src="about:blank"');
    expect(html).toContain('data-video-title="a &lt;b"');
  });
});

describe('findFences', () => {
  it('returns only closed top-level fences, with CRLF and tildes', () => {
    const md = [
      '````md',
      '```ts {1}',
      'inner',
      '```',
      '````',
      '~~~ts  title="a b"  {2}',
      'x',
      '~~~',
      '  ```ts {1}',
      '  indented',
      '  ```',
      '```ts',
      'unclosed',
    ].join('\r\n');
    const fences = findFences(md);
    expect(fences.map((f) => [f.lang, f.attrs, f.body])).toEqual([
      ['md', '', '```ts {1}\ninner\n```'],
      ['ts', 'title="a b"  {2}', 'x'],
    ]);
    expect(md.slice(fences[1].start, fences[1].end)).toBe('~~~ts  title="a b"  {2}\r\nx\r\n~~~');
  });

  it('reads attributes by whole name and flags outside quoted values', () => {
    expect(getAttr('filename="a" name="b"', 'name')).toBe('b');
    expect(getAttr('data-group="a"', 'group')).toBeUndefined();
    expect(hasFlag('name="active tab"', 'active')).toBe(false);
    expect(hasFlag('name="x" active', 'active')).toBe(true);
  });
});

describe('ngmd-keywords', () => {
  const md = (src: string) => new Marked(ngmdKeywordsExtension).parse(src) as string;

  it('links keywords but not inside links or code', () => {
    expect(md('*Kw. [the *Kw docs](/x) `*Kw`')).toBe(
      '<p><a href="/kw">Kw</a>. <a href="/x">the Kw docs</a> <code>*Kw</code></p>\n',
    );
  });

  it('does not warn about emphasis that starts with a capital', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(md('*Note:* hi')).toBe('<p><em>Note:</em> hi</p>\n');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('runtime extensions', () => {
  it('makes tables keyboard focusable so they can scroll', () => {
    const html = new Marked(...ngmdRuntimeExtensions).parse('| a |\n| - |\n| 1 |') as string;
    expect(html).toContain('<table tabindex="0">');
  });
});
