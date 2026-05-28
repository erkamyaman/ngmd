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
      themes: ['github-light', 'github-dark'],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
