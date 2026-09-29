/**
 * Heading slug. Matches the algorithm `toc.ts` uses at runtime to
 * overwrite every rendered heading id, and the one `search-index.plugin.ts`
 * uses to anchor search snippets, so all three stay in sync.
 *
 * Lowercase, collapse every run of non-alphanumeric characters (including
 * `.`, `_`, `*`, spaces, etc.) into a single `-`, then trim outer hyphens.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createSlugger(): (text: string) => string {
  const seen = new Set<string>();
  return (text) => {
    const base = slugify(text);
    let slug = base;
    for (let n = 1; seen.has(slug); n++) slug = `${base}-${n}`;
    seen.add(slug);
    return slug;
  };
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * Plain text of a raw markdown heading, as the TOC reads it from the
 * rendered page: badges dropped, links and images reduced to their text,
 * other tags removed and entities decoded.
 */
export function headingText(markdown: string): string {
  const code: string[] = [];
  return markdown
    .replace(/(`+)([\s\S]*?)\1/g, (_, _ticks: string, inner: string) => {
      code.push(inner);
      return `\u0000${code.length - 1}\u0000`;
    })
    .replace(/<ngmd-badge\b[^>]*>[\s\S]*?<\/ngmd-badge>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, e: string) => ENTITIES[e])
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => code[Number(i)])
    .trim();
}
