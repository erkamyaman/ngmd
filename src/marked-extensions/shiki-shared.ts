import {createHighlighter, type Highlighter} from 'shiki';

/**
 * Shared shiki highlighter instance used by every build-time fence extension
 * that pre-renders code (code-group, code-import, code-highlight). Loading
 * the highlighter is expensive (parses tmGrammar files for every language),
 * so we keep a single promise per process.
 */

let highlighterPromise: Promise<Highlighter> | null = null;

export const LANGS = [
  'bash',
  'json',
  'ts',
  'tsx',
  'js',
  'jsx',
  'html',
  'css',
  'md',
  'angular-html',
  'angular-ts',
];

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light-default', 'github-dark-default'],
      langs: LANGS,
    }).catch((e: unknown) => {
      highlighterPromise = null;
      throw e;
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: highlighter.getLoadedLanguages().includes(lang) ? lang : 'text',
    themes: {light: 'github-light-default', dark: 'github-dark-default'},
    defaultColor: false,
  });
}
