import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {MarkedExtension} from 'marked';
import {getHighlighter, LANGS, escapeHtml} from './shiki-shared';
import config from '../ngmd.config';

/**
 * Fenced code blocks can import their content from a source file by adding
 * `file="..."` to the info string. Supports GitHub-style `#L5-L20` line
 * ranges so docs reference the *real* code instead of a hand-typed copy
 * that rots out of sync.
 *
 *   ```ts file="src/app/hello.ts"
 *   ```
 *
 *   ```ts file="src/app/hello.ts#L5-L20"
 *   ```
 *
 * Renders as a `<div class="ngmd-code-import">` wrapper with a header bar
 * linking to the file on GitHub (via `ngmd.config.ts > site.githubUrl`).
 * Lines marked `// ngmd-ignore-line` are stripped from the imported snippet.
 *
 * Pre-rendered through the shared shiki highlighter so the output is one
 * self-contained HTML block — marked never sees the inner fence.
 */

const FENCE_RE = /^```([\w-]+)?[\t ]+file="([^"]+)"[^\n]*\n(?:([\s\S]*?)\n)?```$/gm;
const IGNORE_LINE_RE = /^.*\/\/\s*ngmd-ignore-line\s*$/;

function loadFile(spec: string): {code: string; rangeFragment: string} {
  const [path, range] = spec.split('#');
  const full = resolve(process.cwd(), path);
  let content = readFileSync(full, 'utf8');

  let rangeFragment = '';
  if (range) {
    const m = range.match(/^L(\d+)(?:-L?(\d+))?$/);
    if (m) {
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : start;
      const lines = content.split('\n');
      content = lines.slice(start - 1, end).join('\n');
      rangeFragment = m[2] ? `#L${start}-L${end}` : `#L${start}`;
    }
  }

  const filtered = content
    .split('\n')
    .filter((l) => !IGNORE_LINE_RE.test(l))
    .join('\n');

  return {code: filtered.replace(/\n+$/, ''), rangeFragment};
}

function githubBlobUrl(filePath: string, rangeFragment: string): string {
  const repo = config.site.githubUrl.replace(/\.git$/, '');
  // encodeURI keeps `/` and `.` as-is but escapes brackets, so paths like
  // `src/app/pages/[...slug].page.ts` resolve on GitHub instead of breaking.
  return `${repo}/blob/main/${encodeURI(filePath)}${rangeFragment}`;
}

export const ngmdCodeImportExtension: MarkedExtension = {
  hooks: {
    async preprocess(markdown: string): Promise<string> {
      if (!/^```[\w-]*[\t ]+file="/m.test(markdown)) return markdown;

      const matches: {
        start: number;
        end: number;
        lang: string;
        filePath: string;
        rangeFragment: string;
        code: string;
      }[] = [];

      const re = new RegExp(FENCE_RE.source, FENCE_RE.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(markdown)) !== null) {
        const lang = m[1] ?? '';
        const spec = m[2];
        try {
          const {code, rangeFragment} = loadFile(spec);
          matches.push({
            start: m.index,
            end: m.index + m[0].length,
            lang,
            filePath: spec.split('#')[0],
            rangeFragment,
            code,
          });
        } catch (e) {
          const msg = (e as Error).message ?? String(e);
          console.warn(`[ngmd-code-import] failed to load "${spec}": ${msg}`);
        }
      }
      if (matches.length === 0) return markdown;

      const highlighter = await getHighlighter();
      const renders = matches.map((mt) => {
        const safeLang = LANGS.includes(mt.lang) ? mt.lang : 'text';
        const codeHtml = highlighter.codeToHtml(mt.code, {
          lang: safeLang,
          themes: {light: 'github-light', dark: 'github-dark'},
          defaultColor: false,
        });
        const headerLabel = mt.filePath + (mt.rangeFragment || '');
        const headerHtml = `<a class="ngmd-code-import__header" href="${escapeHtml(githubBlobUrl(mt.filePath, mt.rangeFragment))}" target="_blank" rel="noopener noreferrer">${escapeHtml(headerLabel)}</a>`;
        return `<div class="ngmd-code-import">${headerHtml}${codeHtml}</div>`;
      });

      let result = markdown;
      for (let i = matches.length - 1; i >= 0; i--) {
        const mt = matches[i];
        result = result.slice(0, mt.start) + `\n\n${renders[i]}\n\n` + result.slice(mt.end);
      }
      return result;
    },
  },
};
