# Version switcher rework — adev model

Notes captured to execute tomorrow. Drops the internal `/v/<slug>/` routing model and rebuilds versioning the way angular.dev and primeng.org actually do it. Each version of the docs is its own deployment; the live site only ever renders one version, and the switcher is a flat registry of external URLs you click through to.

The whole feature, in one sentence: **pick a version from the header dropdown, the browser opens that version's site in a new tab.** That's it.

---

## 1. What's wrong with the current model

The implementation we have today tries to keep every version's content in the same repo at `src/content/v/<slug>/...` and route between them via `/v/<slug>/<path>`. Three problems:

- It's not how anyone actually does this. adev runs `v17.angular.dev` / `v18.angular.dev` / `next.angular.dev` as separate deployments built from separate git refs. PrimeNG does the same with `v18.primeng.org` etc. Their repos have one set of content at a time.
- It bloats the repo every release. Every major bump duplicates the full content tree.
- AnalogJS's file router rewrites `.` to `/` in route paths, which already forced us into dot-free version slugs and a workaround layer.

Drop it. Match adev.

---

## 2. The new model

NgMd renders one set of content. The header switcher shows a list of every other version, and clicking one opens that version's deployment in a new tab.

```ts
// src/ngmd.config.ts
versions: {
  self: 'v17',                                    // THIS deployment
  list: [
    {label: 'next', url: 'https://next.ngmd.app',  status: 'next'},
    {label: 'v18',  url: 'https://v18.ngmd.app',   status: 'current'},
    {label: 'v17',  url: 'https://v17.ngmd.app',   status: 'deprecated'},
    {label: 'v16',  url: 'https://v16.ngmd.app',   status: 'deprecated'},
  ],
}
```

The site only knows three things from this:

1. Which entry represents itself (`self`).
2. The full list to render in the dropdown.
3. Which entry is the production current (`status: 'current'`) so the banner can nudge visitors toward it when they're on an older or pre-release version.

No `src/content/v/<slug>/` folder. No URL prefix. No catch-all rewrites.

---

## 3. Switcher UI

Header dropdown next to the theme toggle. Same shape as today but the action changes:

- Trigger label: the entry matching `self`.
- Dropdown rows: every entry in `list`, with the status rendered as a chip.
- Clicking the self row: close menu, no navigation.
- Clicking any other row: open `entry.url` in a new tab via `<a href={url} target="_blank" rel="noopener noreferrer">`. No `Router.navigateByUrl`, no JS navigation.

Visual: mark the self row with a check icon. The non-self rows render an external-link icon to make the new-tab behaviour obvious before the click.

---

## 4. Content banner

When `self`'s entry status is anything other than `current`, render a single banner above the article that points at the production current. Wording depends on status:

- `next` → "You're reading the next release docs. The current stable is {label}."
- `rc` → "You're reading a release candidate. The current stable is {label}."
- `deprecated` → "This version is deprecated. The current stable is {label}."

The link in the banner opens the current entry's url in a new tab. Same external-link affordance as the switcher row.

If `self` IS the current, no banner.

---

## 5. What gets deleted

The current internal-routing scaffolding goes away:

- `src/app/services/version/version-redirect.service.ts` — entire file. No more `/welcome` → `/v/v1/welcome` rewrites.
- `content-index.plugin.ts` — only used by the redirect service.
- The `virtual:ngmd/content-index` declaration in `src/vite-env.d.ts`.
- `contentIndexPlugin()` line in `vite.config.ts`.
- `inject(VersionRedirectService).start()` in `src/app/app.config.ts`.
- `src/content/v/` folder and everything under it.
- `VersionService.parseSlug()`, `urlForVersion()`, `pathWithinVersion()` — there is no internal version path to compute anymore.
- `Sidebar.resolveHref()`'s version-prefix logic — nav links are plain again.
- `navByVersion` field on `VersionsConfig` — per-version sidebar nav makes no sense when each version is its own deployment.

The `ContentBanners` component stays but its logic simplifies: it only watches `VersionService.self()` and `VersionService.current()`, no URL parsing.

---

## 6. What stays

- `VersionService` keeps its existence but the surface area shrinks: just `config()`, `list()`, `self()`, `current()`. No active-from-URL computation.
- `VersionSwitcher` component stays. Visual layout barely changes — just swap the click handler from `Router.navigateByUrl` to a plain anchor.
- `ContentBanners` stays, simpler logic.

---

## 7. Type changes (concrete)

```ts
// src/ngmd.config.ts

export type VersionStatus = 'current' | 'next' | 'rc' | 'deprecated';

export interface VersionEntry {
  /** Switcher label: 'v17', 'v18', 'next', 'rc'. */
  label: string;
  /** External deployment URL. The switcher renders this as a plain
   *  `<a href target="_blank">` for any entry that isn't `self`. */
  url: string;
  /** Lifecycle marker. */
  status: VersionStatus;
}

export interface VersionsConfig {
  /** Label of the entry representing THIS deployment. */
  self: string;
  /** Ordered list, newest first by convention. */
  list: VersionEntry[];
}
```

`status: 'maintenance' | 'archived'` from the old shape gets dropped in favour of adev's vocabulary (`next`, `rc`, `deprecated`). Cleaner mapping to how releases actually flow.

---

## 8. Step-by-step execution order

Doing it tomorrow looks like:

1. Edit `src/ngmd.config.ts` — replace `VersionEntry` + `VersionsConfig` types as in section 7. Drop `navByVersion`.
2. Edit `src/app/services/version/version.service.ts` — drop `parseSlug`, `urlForVersion`, `pathWithinVersion`, `active`. Add `self` (looks up `versions.self` in `list`) and `current` (finds the entry with `status: 'current'`).
3. Delete `src/app/services/version/version-redirect.service.ts`.
4. Delete `content-index.plugin.ts`.
5. Delete `src/vite-env.d.ts` block for `virtual:ngmd/content-index`.
6. Edit `vite.config.ts` — drop the `contentIndexPlugin()` import + plugin entry.
7. Edit `src/app/app.config.ts` — drop the `VersionRedirectService` import + `inject().start()` line.
8. Edit `src/app/components/version-switcher.ts` — swap the click handler. Active row: highlight, no action. Other rows: `<a [href] target="_blank">`.
9. Edit `src/app/components/content-banners.ts` — replace the archived/maintenance branches with a single banner that fires when `versions.self().status !== 'current'`. Banner content depends on the status value (see section 4). Link points at `versions.current().url`.
10. Edit `src/app/components/sidebar.ts` — strip the version-prefix branch from `resolveHref` (just return the href as-is for internal links).
11. Delete `src/content/v/` folder.
12. Update the demo config in `src/ngmd.config.ts` to point at example deployment URLs so the switcher renders without 404s on click.
13. Build + smoke test: navigate to `/welcome`, confirm the switcher shows the list, confirm a non-self click opens a new tab.

Estimated execution time: ~1 hour for the type + service rework, ~30 min for the UI changes and the cleanup, ~30 min for the demo config + verification. Two-hour ticket.

---

## 9. What we keep open for later

A few real questions that don't block tomorrow's execution but should be answered before 1.0:

- **Versions JSON fetched from CDN vs hard-coded?** adev fetches `https://angular.dev/assets/others/versions.json` at runtime with a local file as fallback so older deployments learn about newer releases without redeploying. Same trick is worth doing for NgMd consumers; not blocking 1.0 since the config-file path works fine alone.
- **Mode detection from hostname?** adev derives `currentDocsVersionMode` from the hostname (`v18.*` → `'deprecated'`, `next.*` → `'next'`). NgMd's `self` field is more explicit and lets a consumer name their deployment whatever they want. Stick with `self`.
- **What does the switcher look like when only one version is configured?** Default behaviour: hide the dropdown entirely. Single-version sites get no header chrome for versioning at all.

---

## 10. ROADMAP.md follow-up

After execution lands, ROADMAP.md section 1.2 needs a rewrite. Current text describes the internal-routing model. Replace with a one-paragraph "Switcher of external deployments, no in-repo historical content, matches adev / PrimeNG." Section 6 sprint sequencing can shorten — there's no routing rework to do, just a config + service swap. Drops 1-2 weeks off the runway.
