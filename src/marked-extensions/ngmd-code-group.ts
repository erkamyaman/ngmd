import type {MarkedExtension} from 'marked';
import {highlightCode} from './shiki-shared.ts';
import {escapeHtml} from './escape-html.ts';
import {findFences, getAttr, hasFlag, replaceFences, type Fence} from './fences.ts';

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

interface GroupFence extends Fence {
  group: string;
}

export const ngmdCodeGroupExtension: MarkedExtension = {
  hooks: {
    async preprocess(markdown: string): Promise<string> {
      const fences: GroupFence[] = [];
      for (const f of findFences(markdown)) {
        const group = getAttr(f.attrs, 'group');
        if (group) fences.push({...f, group});
      }
      if (fences.length === 0) return markdown;

      // Cluster consecutive same-group fences (whitespace-only between).
      const clusters: GroupFence[][] = [];
      let current: GroupFence[] = [];
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

      const merged = clusters.filter((c) => c.length > 1);
      const wrappers: string[] = [];
      for (const c of merged) {
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
              const html = await highlightCode(f.body, f.lang);
              return `<div class="ngmd-code-group__panel" data-id="${groupId}-${idx}" data-active="${idx === activeIdx}">${html}</div>`;
            }),
          )
        ).join('');

        wrappers.push(
          `<div class="ngmd-code-group" data-group="${groupId}"><div class="ngmd-code-group__tabs">${tabs}</div>${panels}</div>`,
        );
      }

      return replaceFences(
        markdown,
        merged.map((c) => ({start: c[0].start, end: c.at(-1)!.end})),
        wrappers,
      );
    },
  },
};
