import {Marked} from 'marked';
import {ngmdImageExtension} from './ngmd-image';
import {ngmdVideoExtension} from './ngmd-video';

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
