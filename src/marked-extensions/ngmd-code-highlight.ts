import type {MarkedExtension} from 'marked';
import {highlightCode} from './shiki-shared.ts';
import {findFences, getAttr, replaceFences} from './fences.ts';

/**
 * Fenced code blocks tagged with `{1,3-5}` get the matching lines visually
 * highlighted. Comma-separated ranges, GitHub-style: `{1}`, `{3-5}`, `{1,3-5,8}`.
 *
 *   ```ts {3-5}
 *   import { Component } from '@angular/core';
 *
 *   @Component({
 *     selector: 'app-hello',
 *     template: '<h1>Hello</h1>',
 *   })
 *   export class Hello {}
 *   ```
 *
 * Implementation: preprocess detects the meta, pre-renders the fence via a
 * cached shiki highlighter, then post-processes the rendered HTML to add
 * `class="highlighted"` to matching `<span class="line">` elements. CSS in
 * styles.css tints those lines.
 *
 * Scope: skips fences with `group="..."` (handled by ngmd-code-group) or
 * `file="..."` (handled by ngmd-code-import). One fence, one treatment.
 */

const RANGES_RE = /(?:^|\s)\{([0-9,\-\s]+)\}(?=\s|$)/;

function parseRanges(spec: string, lineCount: number): Set<number> {
  const lines = new Set<number>();
  for (const part of spec
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    const end = Math.min(Math.max(a, b), lineCount);
    for (let i = Math.max(Math.min(a, b), 1); i <= end; i++) lines.add(i);
  }
  return lines;
}

/**
 * Walks the shiki output's `<span class="line">` elements, adds the
 * `highlighted` class to lines whose 1-indexed position is in `set`.
 */
function applyHighlights(html: string, set: Set<number>): string {
  let lineNum = 0;
  return html.replace(/<span class="line"/g, () => {
    lineNum++;
    return set.has(lineNum) ? '<span class="line highlighted"' : '<span class="line"';
  });
}

export const ngmdCodeHighlightExtension: MarkedExtension = {
  hooks: {
    async preprocess(markdown: string): Promise<string> {
      const matches = findFences(markdown).flatMap((f) => {
        const spec = RANGES_RE.exec(f.attrs)?.[1];
        if (
          !spec ||
          getAttr(f.attrs, 'group') !== undefined ||
          getAttr(f.attrs, 'file') !== undefined
        ) {
          return [];
        }
        return [{...f, spec}];
      });
      if (matches.length === 0) return markdown;

      const renders = await Promise.all(
        matches.map(async (mt) =>
          applyHighlights(
            await highlightCode(mt.body, mt.lang),
            parseRanges(mt.spec, mt.body.split('\n').length),
          ),
        ),
      );
      return replaceFences(markdown, matches, renders);
    },
  },
};
