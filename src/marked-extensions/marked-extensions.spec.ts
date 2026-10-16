import {Marked} from 'marked';
import {findFences, getAttr, hasFlag} from './fences';
import {ngmdImageExtension} from './ngmd-image';
import {ngmdKeywordsExtension} from './ngmd-keywords';
import {ngmdVideoExtension} from './ngmd-video';
import {ngmdRuntimeExtensions} from './runtime';

vi.mock('../ngmd.config.ts', () => ({
  default: {
    keywords: {
      Kw: '/kw',
      'slide.ng': '/slide-ng',
      'Next.js': 'https://nextjs.org',
      'Kw.js': '/kw-js',
    },
  },
}));

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

  describe('dotted keywords', () => {
    it('links a keyword that contains a dot', () => {
      expect(md('Built with *slide.ng today')).toBe(
        '<p>Built with <a href="/slide-ng">slide.ng</a> today</p>\n',
      );
      expect(md('Use *Next.js here')).toBe(
        '<p>Use <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a> here</p>\n',
      );
    });

    it('leaves a trailing dot at the end of a sentence outside the link', () => {
      expect(md('It is *slide.ng.')).toBe('<p>It is <a href="/slide-ng">slide.ng</a>.</p>\n');
      expect(md('See *slide.ng... or *Kw.')).toBe(
        '<p>See <a href="/slide-ng">slide.ng</a>... or <a href="/kw">Kw</a>.</p>\n',
      );
      expect(md('(*slide.ng.) and *slide.ng, *slide.ng; *slide.ng!')).toBe(
        '<p>(<a href="/slide-ng">slide.ng</a>.) and <a href="/slide-ng">slide.ng</a>, <a href="/slide-ng">slide.ng</a>; <a href="/slide-ng">slide.ng</a>!</p>\n',
      );
    });

    it('prefers the longest configured keyword and falls back to a shorter prefix', () => {
      expect(md('*Kw.js is fast')).toBe('<p><a href="/kw-js">Kw.js</a> is fast</p>\n');
      expect(md('*Kw.Other thing')).toBe('<p><a href="/kw">Kw</a>.Other thing</p>\n');
      expect(md('*slide.ng.x')).toBe('<p><a href="/slide-ng">slide.ng</a>.x</p>\n');
    });

    it('keeps dotted keywords out of links and code', () => {
      expect(md('[the *slide.ng docs](/x) `*slide.ng`')).toBe(
        '<p><a href="/x">the slide.ng docs</a> <code>*slide.ng</code></p>\n',
      );
    });

    it('leaves lowercase emphasis and unknown lowercase words alone, without warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      expect(md('*slide.ng* and *other.thing here *note* *constructor x')).toBe(
        '<p><em>slide.ng</em> and *other.thing here <em>note</em> *constructor x</p>\n',
      );
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not treat a double dot or bold as part of the keyword', () => {
      expect(md('**slide.ng** and *slide..ng')).toBe(
        '<p><strong>slide.ng</strong> and *slide..ng</p>\n',
      );
    });
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
