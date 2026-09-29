import {existsSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import type {Plugin} from 'vite';
import {
  createSlugger,
  fenceTracker,
  pageRouteMatcher,
  routeFromPagePath,
  headingText,
  slugify,
  walkContentFiles,
  walkPageFiles,
  withoutCode,
} from './plugin-utils.ts';

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
 * Heading slugs are computed with the same algorithm the rendered TOC uses
 * (see `plugin-utils.slugify`), so dev-time and runtime stay in sync.
 */

function extractHeadings(markdown: string): Set<string> {
  const slugs = new Set<string>();
  const inFence = fenceTracker();
  const slug = createSlugger();
  for (const line of markdown.split(/\r?\n/)) {
    if (inFence(line)) continue;
    const m = /^ {0,3}(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = headingText(m[2]);
    slugs.add(m[1].length === 1 ? slugify(text) : slug(text));
  }
  return slugs;
}

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function internalLinkGuard(): Plugin {
  let root = process.cwd();
  // route → headings, populated lazily on first transform() call
  const headingsByRoute = new Map<string, Set<string>>();
  // route → source file (relative path)
  const routes = new Map<string, string>();
  const dynamicRoutes: RegExp[] = [];
  let primed = false;
  let isBuild = true;

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
        const matcher = pageRouteMatcher(rel);
        if (matcher) dynamicRoutes.push(matcher);
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
      isBuild = cfg.command === 'build';
    },
    watchChange(id) {
      if (!id.endsWith('.md') && !id.endsWith('.page.ts')) return;
      primed = false;
      routes.clear();
      dynamicRoutes.length = 0;
      headingsByRoute.clear();
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
        if (!href.startsWith('#') && (!href.startsWith('/') || href.startsWith('//'))) return;

        const hashAt = href.indexOf('#');
        const fragment = hashAt === -1 ? '' : decode(href.slice(hashAt + 1));
        const rawPath = (hashAt === -1 ? href : href.slice(0, hashAt)).split('?')[0];
        if (rawPath === '') {
          // in-page fragment: must exist in this file
          if (fragment && !ownSlugs.has(fragment)) {
            issues.push(`  ${label} → "#${fragment}" has no matching heading in this file`);
          }
          return;
        }

        const path = decode(rawPath).replace(/(.)\/+$/, '$1');
        if (!routes.has(path)) {
          if (dynamicRoutes.some((re) => re.test(path))) return;
          if (!/\.[^/]+$/.test(path)) {
            issues.push(`  ${label} → "${path}" is not a known route`);
          } else if (
            !(path.endsWith('.md') && routes.has(path.slice(0, -3))) &&
            !existsSync(join(root, 'public', path))
          ) {
            issues.push(`  ${label} → "${path}" is not a known route or file in public/`);
          }
          return;
        }
        if (fragment) {
          const targetSlugs = headingsByRoute.get(path);
          if (targetSlugs && !targetSlugs.has(fragment)) {
            issues.push(`  ${label} → "${path}#${fragment}" — fragment not found in target page`);
          }
          // if targetSlugs is undefined (e.g. .page.ts route), skip fragment check
        }
      };

      const scanned = withoutCode(content);
      const mdLinkRe = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
      const htmlAnchorRe = /<a\s[^>]*href=["']([^"']+)["']/g;
      let m: RegExpExecArray | null;
      while ((m = mdLinkRe.exec(scanned)) !== null) {
        validate(m[2], `[${m[1]}](${m[2]})`);
      }
      while ((m = htmlAnchorRe.exec(scanned)) !== null) {
        validate(m[1], `<a href="${m[1]}">`);
      }

      if (issues.length > 0) {
        const message =
          `[ngmd] Broken internal links in ${relative(root, file)}:\n${issues.join('\n')}\n` +
          `Fix the link target, or update the heading slug it points to.`;
        if (isBuild) this.error(message);
        this.warn(message);
      }

      return null;
    },
  };
}
