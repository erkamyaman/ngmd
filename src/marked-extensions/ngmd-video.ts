import type {Tokens} from 'marked';

interface NgmdVideoToken extends Tokens.Generic {
  type: 'ngmd-video';
  src: string;
  title?: string;
}

// Accepts both self-closing `<ngmd-video .../>` and paired
// `<ngmd-video ...></ngmd-video>` (HTML5 parsers don't honour the
// self-closing form for custom elements, so authoring docs use the
// paired form). `s` flag lets attributes span multiple lines.
const tagRule = /^<ngmd-video([^>]*?)(?:\/>|>\s*<\/ngmd-video>)/s;
const srcRule = /src="([^"]*)"/;
const titleRule = /title="([^"]*)"/;

function buildEmbedUrl(src: string): string {
  if (src.startsWith('https://www.youtube.com/embed/')) return src;
  const yt = src.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const ytShort = src.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const vm = src.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return src;
}

export const ngmdVideoExtension = {
  name: 'ngmd-video',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<ngmd-video/m)?.index;
  },
  tokenizer(src: string): NgmdVideoToken | undefined {
    const match = tagRule.exec(src);
    if (!match) return undefined;
    const attrs = match[1].trim();
    const srcMatch = srcRule.exec(attrs);
    if (!srcMatch) return undefined;
    return {
      type: 'ngmd-video',
      raw: match[0],
      src: srcMatch[1],
      title: titleRule.exec(attrs)?.[1],
    };
  },
  renderer(token: NgmdVideoToken) {
    const url = buildEmbedUrl(token.src);
    const title = (token.title ?? 'Video player').replace(/"/g, '&quot;');
    return `<div class="ngmd-video" data-video-src="${url}" data-video-title="${title}"></div>`;
  },
};
