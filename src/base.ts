/**
 * Helpers for hosting a site under a sub-path such as
 * `https://user.github.io/repo/`. The base is a path that starts and ends
 * with `/`; `/` means the site sits at the root of its host.
 *
 * Used by `vite.config.ts` and the build plugins in Node, and by the
 * browser code, which reads the same value from `import.meta.env.BASE_URL`
 * (Vite sets it from the `base` option).
 */

/**
 * Turn `repo`, `/repo`, `repo/` or `/repo/` into `/repo/`. Empty, `/` and
 * `undefined` give `/`. A full URL or a relative path (`./`) is rejected
 * because the base has to be an absolute path on the host.
 */
export function normalizeBase(value?: string | null): string {
  const raw = (value ?? '').trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || /^\/\/+[^/]/.test(raw)) {
    throw new Error(`[ngmd] base must be a path like "/repo/", got "${raw}".`);
  }
  if (raw === '.' || raw.startsWith('./') || raw.split('/').includes('..')) {
    throw new Error(`[ngmd] base must be an absolute path like "/repo/", got "${raw}".`);
  }
  const trimmed = raw.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/**
 * The base to build with: `env` (the `NGMD_BASE` environment variable) when
 * it is set and not blank, otherwise `site.base` from the config.
 */
export function resolveBase(configBase?: string | null, env?: string): string {
  return normalizeBase(env !== undefined && env.trim() !== '' ? env : configBase);
}

/**
 * Public root of the site without a trailing slash: the origin from
 * `site.url` plus the base. A `site.url` that already ends with the base
 * path (`https://user.github.io/repo` with base `/repo/`) is kept as is.
 */
export function publicUrl(siteUrl: string, base: string): string {
  const url = siteUrl.replace(/\/+$/, '');
  const path = base.replace(/\/+$/, '');
  if (!path || url.endsWith(path)) return url;
  return url + path;
}

/** Prefix a root-absolute path (`/images/a.png`) with the base. Other values pass through. */
export function withBase(base: string, path: string): string {
  if (base === '/' || !path.startsWith('/') || path.startsWith('//')) return path;
  return base + path.slice(1);
}

/** The base the running app was built with. */
export function appBase(): string {
  return normalizeBase(
    (import.meta as ImportMeta & {env?: {BASE_URL?: string}}).env?.BASE_URL ?? '/',
  );
}
