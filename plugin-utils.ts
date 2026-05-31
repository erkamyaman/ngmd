import {execSync} from 'node:child_process';
import {readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

/**
 * Shared helpers for the build-time Vite plugins (`page-meta`, `sitemap`,
 * `link-guard`, `search-index`). Every plugin walks `src/content/**\/*.md`
 * and `src/app/pages/**\/*.page.ts` the same way; centralising those walks
 * here keeps the discovery rules in sync.
 *
 * Routes are derived from filesystem paths:
 *   - `.md` under `src/content/`: `src/content/concepts/theming.md` → `/concepts/theming`
 *   - `.page.ts` under `src/app/pages/`: `home/index.page.ts` → `/home`,
 *     `index.page.ts` → `/`, dynamic / catch-all (`[...slug].page.ts`) → '' (skipped)
 *
 * The `slugify` rule matches the runtime TOC's heading-id algorithm so
 * build-time link validation and runtime fragments stay aligned.
 */

/** Walk `src/app/pages/**\/*.page.ts` and return paths relative to `root`. */
export function walkPageFiles(dir: string, root: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPageFiles(full, root, out);
    } else if (entry.isFile() && entry.name.endsWith('.page.ts')) {
      out.push(relative(root, full));
    }
  }
  return out;
}

/**
 * Walk `src/content/**\/*.md` and return `[relativePath, route]` pairs.
 * `relativePath` is from `root`; `route` mirrors the path under `baseDir`
 * (defaults to `dir`) with the `.md` stripped.
 */
export function walkContentFiles(
  dir: string,
  root: string,
  baseDir: string = dir,
  out: Array<[string, string]> = [],
): Array<[string, string]> {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkContentFiles(full, root, baseDir, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = relative(root, full);
      const fromContent = relative(baseDir, full).replace(/\\/g, '/').replace(/\.md$/, '');
      out.push([rel, '/' + fromContent]);
    }
  }
  return out;
}

/** `src/app/pages/foo/bar.page.ts` → `/foo/bar`. `index.page.ts` → `/`.
 * Dynamic / catch-all (`[...slug].page.ts`) returns `''`, signalling "skip". */
export function routeFromPagePath(rel: string): string {
  const trimmed = rel.replace(/^src\/app\/pages\//, '').replace(/\.page\.ts$/, '');
  if (trimmed === 'index') return '/';
  if (trimmed.startsWith('[')) return '';
  return '/' + trimmed;
}

/**
 * Last-commit date for `file` (YYYY-MM-DD), via `git log -1 --format=%cs`.
 * Falls back to file mtime when the file is uncommitted, and to `''`
 * (or whatever `mtimeFallback` returns) when both are unavailable.
 */
export function gitDate(file: string, cwd: string, mtimeFallback: () => string = () => ''): string {
  try {
    const stamp = execSync(`git log -1 --format=%cs -- "${file}"`, {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (stamp) return stamp;
  } catch {
    // fall through to mtime
  }
  try {
    return statSync(join(cwd, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return mtimeFallback();
  }
}

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
