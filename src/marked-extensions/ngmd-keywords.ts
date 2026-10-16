import type {MarkedExtension, TokenizerThis, Tokens} from 'marked';
import config from '../ngmd.config.ts';
import {escapeHtml} from './escape-html.ts';

/**
 * Inline keyword auto-linking. Any `*Keyword` token (where `Keyword` is
 * defined in `ngmd.config.ts > keywords`) becomes a link.
 *
 *   *AnalogJS  →  <a href="https://analogjs.org">AnalogJS</a>
 *   *NgMd      →  <a href="/welcome">NgMd</a>
 *   *slide.ng  →  <a href="...">slide.ng</a>   (dotted names work too)
 *
 * A name may contain dots, so `slide.ng` and `Next.js` can be keywords; the
 * longest configured name wins and a trailing dot stays outside the link.
 * Unknown capitalised keywords log a one-line warning and fall through to the default
 * inline tokenizer — they render as literal `*Keyword` text. External URLs
 * get `target="_blank" rel="noopener noreferrer"` automatically.
 *
 * Lives in the inline tokenizer chain, so it never fires inside fenced code
 * blocks or inline code (those are block-level and tokenized first).
 */

interface NgmdKeywordToken extends Tokens.Generic {
  type: 'ngmdKeyword';
  keyword: string;
  url: string;
}

// `(?!\*)` after the leading `*` prevents matching the second `*` of a
// `**bold**` pair. `(?!\*)` after the keyword prevents matching the inside
// of `**Keyword**` and of `*emphasis*` (which would leave a stray `*`).
// A keyword is letters and digits with optional `.segment` parts. A dot only
// belongs to the keyword when a letter or digit follows it, so the full stop
// that ends a sentence (`*slide.ng.`) stays outside the link.
const KEYWORD_RE = /^\*(?!\*)([A-Za-z][A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)(?![A-Za-z0-9_])(?!\*)/;
const HINT_RE = /\*(?!\*)[A-Za-z]/;
const EMPHASIS_RE = /^\*[^*\n]*[^*\s]\*/;
const warned = new Set<string>();

function lookup(keyword: string): string | undefined {
  const keywords = config.keywords;
  return keywords && Object.prototype.hasOwnProperty.call(keywords, keyword)
    ? keywords[keyword]
    : undefined;
}

/**
 * The longest configured keyword at the start of `candidate`, trying each
 * dotted prefix in turn (`Kw.js.x` → `Kw.js.x`, `Kw.js`, `Kw`).
 */
function resolve(candidate: string): {keyword: string; url: string} | undefined {
  for (let end = candidate.length; end > 0;) {
    const keyword = candidate.slice(0, end);
    const url = lookup(keyword);
    if (url) return {keyword, url};
    end = keyword.lastIndexOf('.');
  }
  return undefined;
}

export const ngmdKeywordsExtension: MarkedExtension = {
  extensions: [
    {
      name: 'ngmdKeyword',
      level: 'inline',
      start(src: string) {
        return src.match(HINT_RE)?.index;
      },
      tokenizer(this: TokenizerThis, src: string): Tokens.Generic | undefined {
        const m = KEYWORD_RE.exec(src);
        if (!m) return undefined;
        const hit = resolve(m[1]);
        if (!hit) {
          // Only capitalised names are assumed to be intended keywords;
          // `*note here` or `*foo.bar` stay quiet because they are far more
          // likely to be stray asterisks or emphasis.
          if (/^[A-Z]/.test(m[1]) && !warned.has(m[1]) && !EMPHASIS_RE.test(src)) {
            warned.add(m[1]);
            console.warn(
              `[ngmd-keywords] unknown keyword "${m[1]}" — add it to ngmd.config.ts > keywords or escape the asterisk.`,
            );
          }
          return undefined;
        }
        const raw = '*' + hit.keyword;
        if (this.lexer.state.inLink) return {type: 'text', raw, text: hit.keyword};
        return {
          type: 'ngmdKeyword',
          raw,
          keyword: hit.keyword,
          url: hit.url,
        };
      },
      renderer(token: Tokens.Generic) {
        const t = token as NgmdKeywordToken;
        const isExternal = /^https?:\/\//.test(t.url);
        const targetAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(t.url)}"${targetAttrs}>${t.keyword}</a>`;
      },
    },
  ],
};
