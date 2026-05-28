import type {MarkedExtension} from 'marked';
import {getHighlighter, LANGS} from './shiki-shared';

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

// Capture: lang, line ranges in {}, body. Skips fences whose info string
// contains `group=` or `file=` so those routes own the fence.
const FENCE_RE = /^```([\w-]+)?[\t ]+\{([0-9,\-\s]+)\}[\t ]*\n([\s\S]*?)\n```$/gm;

function parseRanges(spec: string): Set<number> {
  const lines = new Set<number>();
  for (const part of spec
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const start = parseInt(m[1], 10);
    const end = m[2] ? parseInt(m[2], 10) : start;
    for (let i = start; i <= end; i++) lines.add(i);
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
      // Quick negative check before scanning.
      if (!/^```[\w-]*[\t ]+\{[0-9,\-\s]+\}/m.test(markdown)) return markdown;

      const matches: {start: number; end: number; lang: string; spec: string; body: string}[] = [];
      const re = new RegExp(FENCE_RE.source, FENCE_RE.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(markdown)) !== null) {
        // Skip if the fence also carries `group=` or `file=` (other ext owns).
        const infoLineEnd = markdown.indexOf('\n', m.index);
        const infoLine = markdown.slice(m.index, infoLineEnd);
        if (/\b(?:group|file)="/.test(infoLine)) continue;
        matches.push({
          start: m.index,
          end: m.index + m[0].length,
          lang: m[1] ?? '',
          spec: m[2],
          body: m[3],
        });
      }
      if (matches.length === 0) return markdown;

      const highlighter = await getHighlighter();
      const renders = await Promise.all(
        matches.map(async (mt) => {
          const safeLang = LANGS.includes(mt.lang) ? mt.lang : 'text';
          const raw = highlighter.codeToHtml(mt.body, {
            lang: safeLang,
            themes: {light: 'github-light', dark: 'github-dark'},
            defaultColor: false,
          });
          return applyHighlights(raw, parseRanges(mt.spec));
        }),
      );

      let result = markdown;
      for (let i = matches.length - 1; i >= 0; i--) {
        const mt = matches[i];
        result = result.slice(0, mt.start) + `\n\n${renders[i]}\n\n` + result.slice(mt.end);
      }
      return result;
    },
  },
};
