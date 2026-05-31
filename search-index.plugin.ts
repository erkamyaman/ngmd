import {readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import type {Plugin} from 'vite';
import type {IndexDoc, SearchHitKind} from './src/types/search';
import {slugify, walkContentFiles} from './plugin-utils';

/**
 * Build-time search index. Walks `src/content/**\/*.md` and emits a flat list
 * of `IndexDoc` records (one per page + one per `##` heading + one per
 * paragraph chunk) under the virtual id `virtual:ngmd/search-index`.
 *
 * The runtime Orama provider takes this raw list, builds an in-memory
 * index, and queries it. Algolia's hosted index uses a similar
 * page → section → snippet shape, so the same `SearchHit` UI works against
 * either backend.
 *
 * Pages can opt out by setting `noIndex: true` in their frontmatter.
 */

const VIRTUAL_ID = 'virtual:ngmd/search-index';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

interface Frontmatter {
  title?: string;
  noIndex?: boolean;
}

function parseFrontmatter(text: string): {fm: Frontmatter; body: string} {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return {fm: {}, body: text};
  const fm: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    const key = m[1];
    const raw = m[2].replace(/^['"]|['"]$/g, '');
    if (key === 'title') fm.title = raw;
    if (key === 'noIndex') fm.noIndex = /^(true|yes|1)$/i.test(raw);
  }
  return {fm, body: match[2]};
}

const ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#64;': '@',
  '&nbsp;': ' ',
};

/** Strip markdown syntax so search hits show clean prose, not markup. */
function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/&(?:lt|gt|amp|quot|apos|nbsp|#39|#64);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split raw markdown body into sections delimited by `##`+ headings.
 * Returns an array where each entry has the heading text (or empty for
 * the lead-in before the first heading) and the prose that follows. */
function splitSections(body: string): Array<{heading: string; body: string}> {
  const lines = body.split(/\r?\n/);
  const sections: Array<{heading: string; body: string}> = [];
  let current: {heading: string; body: string} = {heading: '', body: ''};
  for (const line of lines) {
    const m = line.match(/^(##+)\s+(.+?)\s*$/);
    if (m) {
      if (current.heading || current.body.trim()) sections.push(current);
      current = {heading: m[2], body: ''};
    } else {
      current.body += line + '\n';
    }
  }
  if (current.heading || current.body.trim()) sections.push(current);
  return sections;
}

/** Break a stripped body into snippet chunks. ~280 chars each, snapped to
 * a sentence boundary if one is nearby and to a word boundary otherwise so
 * chunks never start or end mid-word. */
function chunkBody(body: string, target = 280): string[] {
  if (!body) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < body.length) {
    let end = Math.min(body.length, i + target);
    if (end < body.length) {
      const sentence = body.lastIndexOf('. ', end);
      if (sentence > i + 80) {
        end = sentence + 1;
      } else {
        const word = body.lastIndexOf(' ', end);
        if (word > i + 80) end = word;
      }
    }
    const piece = body.slice(i, end).trim();
    if (piece) chunks.push(piece);
    i = end < body.length ? end + 1 : end;
  }
  return chunks;
}

export function searchIndexPlugin(): Plugin {
  let root = process.cwd();

  return {
    name: 'ngmd-search-index',
    configResolved(cfg) {
      root = cfg.root;
    },
    /** Markdown edits invalidate the virtual module so HMR rebuilds the
     * index without a server restart. */
    handleHotUpdate(ctx) {
      if (!ctx.file.endsWith('.md')) return;
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) ctx.server.moduleGraph.invalidateModule(mod);
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const docs: IndexDoc[] = [];
      const contentDir = join(root, 'src/content');
      try {
        statSync(contentDir);
      } catch {
        return `export const searchIndex = [];`;
      }

      for (const [rel, url] of walkContentFiles(contentDir, contentDir)) {
        let raw: string;
        try {
          raw = readFileSync(join(contentDir, rel), 'utf8');
        } catch {
          continue;
        }
        const {fm, body} = parseFrontmatter(raw);
        if (fm.noIndex) continue;

        const slug = url.split('/').pop() || '';
        const pageTitle =
          fm.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        // page record: title-only. Body matches surface through snippet
        // records below, which carry their enclosing heading's anchor so
        // a click jumps to the right section instead of the page top.
        // Keeping body off the page record stops fuzzy hits from dragging
        // unrelated pages into the result list on short queries.
        docs.push({
          id: `page:${url}`,
          url,
          anchor: '',
          kind: 'page' as SearchHitKind,
          pageTitle,
          heading: pageTitle,
          body: '',
        });

        // Split the body into sections delimited by `##`+ headings. Pure
        // prose before the first heading goes under an empty anchor (lands
        // on the page top). Each section produces (1) a section record at
        // its heading anchor and (2) snippet records anchored to the same
        // heading so clicking a snippet jumps to its section, not the top.
        for (const section of splitSections(body)) {
          if (section.heading) {
            const headingText = stripMarkdown(section.heading);
            const anchor = slugify(headingText);
            docs.push({
              id: `section:${url}#${anchor}`,
              url,
              anchor,
              kind: 'section',
              pageTitle,
              heading: headingText,
              body: '',
            });
            const sectionBody = stripMarkdown(section.body);
            for (const [i, chunk] of chunkBody(sectionBody).entries()) {
              docs.push({
                id: `snippet:${url}#${anchor}:${i}`,
                url,
                anchor,
                kind: 'snippet',
                pageTitle,
                heading: headingText,
                body: chunk,
              });
            }
          } else {
            // Pre-first-heading prose. Anchorless.
            const sectionBody = stripMarkdown(section.body);
            for (const [i, chunk] of chunkBody(sectionBody).entries()) {
              docs.push({
                id: `snippet:${url}:lead:${i}`,
                url,
                anchor: '',
                kind: 'snippet',
                pageTitle,
                heading: '',
                body: chunk,
              });
            }
          }
        }
      }

      return `export const searchIndex = ${JSON.stringify(docs)};`;
    },
  };
}
