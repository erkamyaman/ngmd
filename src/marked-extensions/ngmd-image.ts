import type { Tokens } from 'marked';

interface NgmdImageToken extends Tokens.Generic {
  type: 'ngmd-image';
  src: string;
  alt: string;
  caption?: string;
  width?: string;
}

// Accepts both self-closing `<ngmd-image .../>` and paired
// `<ngmd-image ...></ngmd-image>` (HTML5 parsers don't honour the
// self-closing form for custom elements, so authoring docs use the
// paired form). `s` flag lets attributes span multiple lines.
const tagRule = /^<ngmd-image([^>]*?)(?:\/>|>\s*<\/ngmd-image>)/s;
const attrRule = (name: string) => new RegExp(`${name}="([^"]*)"`);

export const ngmdImageExtension = {
  name: 'ngmd-image',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<ngmd-image/m)?.index;
  },
  tokenizer(src: string): NgmdImageToken | undefined {
    const match = tagRule.exec(src);
    if (!match) return undefined;
    const attrs = match[1].trim();
    const srcMatch = attrRule('src').exec(attrs);
    if (!srcMatch) return undefined;
    return {
      type: 'ngmd-image',
      raw: match[0],
      src: srcMatch[1],
      alt: attrRule('alt').exec(attrs)?.[1] ?? '',
      caption: attrRule('caption').exec(attrs)?.[1],
      width: attrRule('width').exec(attrs)?.[1],
    };
  },
  renderer(token: NgmdImageToken) {
    const widthAttr = token.width ? token.width.replace(/"/g, '') : '';
    const alt = token.alt.replace(/"/g, '&quot;');
    const caption = token.caption ? token.caption.replace(/"/g, '&quot;') : '';
    return `<div class="ngmd-image" data-image-src="${token.src}" data-image-alt="${alt}" data-image-caption="${caption}" data-image-width="${widthAttr}"></div>`;
  },
};
