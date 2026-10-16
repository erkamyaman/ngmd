import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {Plugin} from 'vite';
import {siteRoot} from './plugin-utils.ts';

/**
 * Single source of truth for "the current published version" in markdown
 * content. Reads `create-ngmd/package.json` at build time (or the project's
 * own `package.json` in a scaffolded site, where `create-ngmd/` doesn't
 * exist), exposes its `version` as the `{{ngmd-version}}` token, and
 * substitutes it into every `.md` source before AnalogJS hands the body
 * to marked.
 *
 * Saves the two-place hand-update in changelog + technologies pages
 * after every npm publish. Extend the `vars` map if you need more.
 *
 * Shared with `rawMdPlugin` via `substituteMdVars()` so the "Copy
 * Markdown" / "Open in LLM" downloads see the same substituted text
 * as the rendered page.
 */

// Keyed by root: callers pass different roots (the site itself, a scaffolded
// site, a temp dir in tests), and one root's result must never be served for
// another.
const memo = new Map<string, Record<string, string>>();

function readVars(root: string): Record<string, string> {
  const cached = memo.get(root);
  if (cached) return cached;
  let version = '';
  for (const file of ['create-ngmd/package.json', 'package.json']) {
    try {
      const pkg = JSON.parse(readFileSync(join(root, file), 'utf8'));
      if (typeof pkg.version === 'string') {
        version = pkg.version;
        break;
      }
    } catch {}
  }
  const vars = {'ngmd-version': version};
  memo.set(root, vars);
  return vars;
}

/**
 * Apply `{{token}}` substitutions to a markdown body. Unknown tokens
 * are left in place so an unrecognised marker survives to the rendered
 * page rather than silently disappearing.
 */
export function substituteMdVars(body: string, root = siteRoot): string {
  const vars = readVars(root);
  return body.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (match, key) => {
    return key in vars ? vars[key] : match;
  });
}

export function varsPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: 'ngmd-vars',
    enforce: 'pre',
    configResolved(cfg) {
      root = cfg.root;
      memo.clear();
    },
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      const out = substituteMdVars(code, root);
      if (out === code) return null;
      return {code: out, map: null};
    },
  };
}
