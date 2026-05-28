import type {MarkedExtension} from 'marked';
import {getHighlighter, LANGS, escapeHtml} from './shiki-shared';

/**
 * Adjacent fenced code blocks tagged with `group="..."` merge into a tabbed
 * UI. Tab labels default to the language; pass `name="pnpm"` to override.
 * Mark the initial tab with the `active` flag.
 *
 *   ```bash group="install" name="pnpm" active
 *   pnpm create ngmd@latest my-docs
 *   ```
 *
 *   ```bash group="install" name="npm"
 *   npm create ngmd@latest my-docs
 *   ```
 *
 * Implementation: preprocess runs before marked tokenizes. It finds
 * consecutive group fences, pre-renders each body through a cached shiki
 * highlighter, and emits a single self-contained HTML wrapper. By the time
 * marked sees it, it's a finished `<div>` block with `<pre>` children — no
 * fenced-code re-parsing, no tokenizer race with marked-shiki, no marked
 * HTML-block quirks.
 */

let groupCounter = 0;

const FENCE_WITH_GROUP_RE =
  /^```([\w-]+)?[\t ]+([^\n]*?\bgroup="([^"]+)"[^\n]*)\n([\s\S]*?)\n```$/gm;

interface Fence {
  start: number;
  end: number;
  lang: string;
  attrs: string;
  group: string;
  body: string;
}

function getAttr(attrs: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1];
}

function hasFlag(attrs: string, name: string): boolean {
  return new RegExp(`(^|\\s)${name}(\\s|$)`).test(attrs);
}

async function renderCode(body: string, lang: string): Promise<string> {
  const safeLang = LANGS.includes(lang) ? lang : 'text';
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(body, {
    lang: safeLang,
    themes: {light: 'github-light', dark: 'github-dark'},
    defaultColor: false,
  });
}

export const ngmdCodeGroupExtension: MarkedExtension = {
  hooks: {
    async preprocess(markdown: string): Promise<string> {
      const fences: Fence[] = [];
      const re = new RegExp(FENCE_WITH_GROUP_RE.source, FENCE_WITH_GROUP_RE.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(markdown)) !== null) {
        fences.push({
          start: m.index,
          end: m.index + m[0].length,
          lang: m[1] ?? '',
          attrs: m[2],
          group: m[3],
          body: m[4],
        });
      }
      if (fences.length === 0) return markdown;

      // Cluster consecutive same-group fences (whitespace-only between).
      const clusters: Fence[][] = [];
      let current: Fence[] = [];
      for (const f of fences) {
        if (
          current.length > 0 &&
          current[0].group === f.group &&
          /^\s*$/.test(markdown.slice(current.at(-1)!.end, f.start))
        ) {
          current.push(f);
        } else {
          if (current.length > 0) clusters.push(current);
          current = [f];
        }
      }
      if (current.length > 0) clusters.push(current);

      // Replace from end to start so indices stay valid.
      let result = markdown;
      for (let i = clusters.length - 1; i >= 0; i--) {
        const c = clusters[i];
        if (c.length < 2) continue;

        const groupId = `cg-${++groupCounter}`;
        let activeIdx = c.findIndex((f) => hasFlag(f.attrs, 'active'));
        if (activeIdx === -1) activeIdx = 0;

        const tabs = c
          .map((f, idx) => {
            const name = getAttr(f.attrs, 'name') ?? (f.lang || `tab ${idx + 1}`);
            const image = getAttr(f.attrs, 'image');
            const imgHtml = image
              ? `<img src="${escapeHtml(image)}" alt="" aria-hidden="true" class="ngmd-code-group__icon" loading="lazy" />`
              : '';
            return `<button type="button" class="ngmd-code-group__tab" data-target="${groupId}-${idx}" data-active="${idx === activeIdx}">${imgHtml}${escapeHtml(name)}</button>`;
          })
          .join('');

        const panels = (
          await Promise.all(
            c.map(async (f, idx) => {
              const html = await renderCode(f.body, f.lang);
              return `<div class="ngmd-code-group__panel" data-id="${groupId}-${idx}" data-active="${idx === activeIdx}">${html}</div>`;
            }),
          )
        ).join('');

        const wrapper = `\n\n<div class="ngmd-code-group" data-group="${groupId}"><div class="ngmd-code-group__tabs">${tabs}</div>${panels}</div>\n\n`;

        result = result.slice(0, c[0].start) + wrapper + result.slice(c.at(-1)!.end);
      }

      return result;
    },
  },
};
