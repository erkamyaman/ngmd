import type {MarkedExtension, Tokens} from 'marked';
import config from '../ngmd.config';

/**
 * Inline keyword auto-linking. Any `*Keyword` token (where `Keyword` is
 * defined in `ngmd.config.ts > keywords`) becomes a link.
 *
 *   *AnalogJS  →  <a href="https://analogjs.org">AnalogJS</a>
 *   *NgMd      →  <a href="/welcome">NgMd</a>
 *
 * Unknown keywords log a one-line warning and fall through to the default
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
// of `**Keyword**` (which would leave one stray `*` and one stray `**`).
const KEYWORD_RE = /^\*(?!\*)([A-Z][a-zA-Z0-9]+)\b(?!\*)/;
const HINT_RE = /\*(?!\*)[A-Z]/;
const warned = new Set<string>();

function lookup(keyword: string): string | undefined {
  return config.keywords?.[keyword];
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;');
}

export const ngmdKeywordsExtension: MarkedExtension = {
  extensions: [
    {
      name: 'ngmdKeyword',
      level: 'inline',
      start(src: string) {
        return src.match(HINT_RE)?.index;
      },
      tokenizer(src: string): NgmdKeywordToken | undefined {
        const m = KEYWORD_RE.exec(src);
        if (!m) return undefined;
        const url = lookup(m[1]);
        if (!url) {
          if (!warned.has(m[1])) {
            warned.add(m[1]);
            console.warn(
              `[ngmd-keywords] unknown keyword "${m[1]}" — add it to ngmd.config.ts > keywords or escape the asterisk.`,
            );
          }
          return undefined;
        }
        return {
          type: 'ngmdKeyword',
          raw: m[0],
          keyword: m[1],
          url,
        };
      },
      renderer(token: Tokens.Generic) {
        const t = token as NgmdKeywordToken;
        const isExternal = /^https?:\/\//.test(t.url);
        const targetAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeAttr(t.url)}"${targetAttrs}>${t.keyword}</a>`;
      },
    },
  ],
};
