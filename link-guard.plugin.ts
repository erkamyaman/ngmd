import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Build-time guard that errors on broken internal links inside markdown files.
 *
 * Validates three cases:
 *   - `[text](#fragment)` — fragment must be a real heading slug in the same file
 *   - `[text](/path)` — `/path` must be a known route
 *   - `[text](/path#fragment)` — both the route and the heading slug must exist
 *
 * Routes are discovered by walking `src/content/**\/*.md` (each markdown
 * file's path under content/ becomes its route) and `src/app/pages/**\/*.page.ts`.
 * External (`http(s)://`), mail (`mailto:`), and relative (`./foo`) links are
 * skipped; the existing externalLinkGuard covers raw HTML external anchors.
 *
 * Heading slugs are computed with the same lowercase + dash + strip-punct
 * rule the rendered TOC uses, so dev-time and runtime stay in sync.
 */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function walkPageFiles(dir: string, root: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
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
 * Route mirrors the path under `src/content/` with the .md stripped.
 * Example: `src/content/concepts/theming.md` → `/concepts/theming`.
 */
function walkContentFiles(
  dir: string,
  root: string,
  baseDir: string = dir,
  out: Array<[string, string]> = [],
): Array<[string, string]> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkContentFiles(full, root, baseDir, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = relative(root, full);
      const fromContent = relative(baseDir, full)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');
      out.push([rel, '/' + fromContent]);
    }
  }
  return out;
}

function routeFromPagePath(rel: string): string {
  const trimmed = rel
    .replace(/^src\/app\/pages\//, '')
    .replace(/\.page\.ts$/, '');
  if (trimmed === 'index') return '/';
  if (trimmed.startsWith('[')) return '';
  return '/' + trimmed;
}

function extractHeadings(markdown: string): Set<string> {
  const slugs = new Set<string>();
  const headingRe = /^#{1,6}\s+(.+?)\s*$/gm;
  let m;
  while ((m = headingRe.exec(markdown)) !== null) {
    slugs.add(slugify(m[1]));
  }
  return slugs;
}

export function internalLinkGuard(): Plugin {
  let root = process.cwd();
  // route → headings, populated lazily on first transform() call
  const headingsByRoute = new Map<string, Set<string>>();
  // route → source file (relative path)
  const routes = new Map<string, string>();
  let primed = false;

  function prime(): void {
    if (primed) return;
    primed = true;

    // .md → route (walk src/content/ tree)
    const contentDir = join(root, 'src/content');
    try {
      statSync(contentDir);
      for (const [rel, route] of walkContentFiles(contentDir, root)) {
        const full = join(root, rel);
        routes.set(route, rel);
        headingsByRoute.set(route, extractHeadings(readFileSync(full, 'utf8')));
      }
    } catch {
      // src/content missing — skip
    }

    // .page.ts → route (no heading scrape; just makes the route resolvable)
    const pagesDir = join(root, 'src/app/pages');
    try {
      const pageFiles = walkPageFiles(pagesDir, root);
      for (const rel of pageFiles) {
        const route = routeFromPagePath(rel);
        if (!route) continue;
        if (!routes.has(route)) routes.set(route, rel);
      }
    } catch {
      // src/app/pages missing — fine for non-app projects
    }
  }

  return {
    name: 'ngmd-internal-link-guard',
    enforce: 'pre',
    configResolved(cfg) {
      root = cfg.root;
    },
    transform(_code, id) {
      // Vite may append `?import` / `?raw` query suffixes
      const cleanId = id.split('?')[0];
      if (!cleanId.endsWith('.md')) return null;
      prime();

      const file = cleanId;
      const content = readFileSync(file, 'utf8');
      const ownSlugs = extractHeadings(content);
      const issues: string[] = [];

      const validate = (href: string, label: string) => {
        if (!href) return;
        // external / mail / relative — skip
        if (
          /^(https?:|mailto:|tel:|#)/.test(href) === false &&
          !href.startsWith('/')
        )
          return;
        if (/^(https?:|mailto:|tel:)/.test(href)) return;

        const [path, fragment] = href.split('#');
        if (path === '') {
          // in-page fragment: must exist in this file
          if (fragment && !ownSlugs.has(fragment)) {
            issues.push(
              `  ${label} → "#${fragment}" has no matching heading in this file`,
            );
          }
          return;
        }

        // absolute route: must be a known route
        if (!routes.has(path)) {
          issues.push(`  ${label} → "${path}" is not a known route`);
          return;
        }
        if (fragment) {
          const targetSlugs = headingsByRoute.get(path);
          if (targetSlugs && !targetSlugs.has(fragment)) {
            issues.push(
              `  ${label} → "${path}#${fragment}" — fragment not found in target page`,
            );
          }
          // if targetSlugs is undefined (e.g. .page.ts route), skip fragment check
        }
      };

      const mdLinkRe = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
      const htmlAnchorRe = /<a\s[^>]*href=["']([^"']+)["']/g;
      let m: RegExpExecArray | null;
      while ((m = mdLinkRe.exec(content)) !== null) {
        validate(m[2], `[${m[1]}](${m[2]})`);
      }
      while ((m = htmlAnchorRe.exec(content)) !== null) {
        validate(m[1], `<a href="${m[1]}">`);
      }

      if (issues.length > 0) {
        this.error(
          `[ngmd] Broken internal links in ${relative(root, file)}:\n${issues.join('\n')}\n` +
            `Fix the link target, or update the heading slug it points to.`,
        );
      }

      return null;
    },
  };
}
