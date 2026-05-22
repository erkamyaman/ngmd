# NgMd vs ng-doc — Competitive Synthesis

## 1. One-line summary
ng-doc is an Angular-coupled docs builder that injects into the host app's build to auto-render API tables from JSDoc, ship interactive playgrounds/demos, and stitch in Mermaid, Nunjucks, and Orama search — a heavy-batteries-included alternative to Storybook + Compodoc, paid for in build/runtime cost and Angular-version lock-in.

## 2. Feature parity

| Area | ng-doc | NgMd | Gap |
|---|---|---|---|
| Stack coupling | Custom Angular Builder, webpack→Vite migrated in v17 | AnalogJS + Vite 8, Angular 21, Tailwind v4 | skip (NgMd ahead) |
| Install / scaffold | `ng add @ng-doc/add` mutates angular.json | `create-ngmd` copies template | skip (parity) |
| Pages / categories | `ng-doc.page.ts` + `ng-doc.category.ts`, multi-tab pages, status badges | file-based `.page.ts` from Analog, sidebar from config | nice-to-have (multi-tab, status badges) |
| Callouts / blockquotes | 5 variants via `> **Note**` blockquote pragma | NgmdCallout + NgmdAlert (5×2 variants) as components | skip (parity, different ergonomics) |
| Images / video | Manual `<img>`/iframe, no platform normalize | NgmdImage (figure+caption+lazy), NgmdVideo (YT/Vimeo normalize) | skip (NgMd ahead) |
| Code blocks | name/group/icon/active tabs, file-import with `#L5-L10` line ranges, line highlighting `{1,3-5}` | Shiki dual-theme + copy button | blocker (file-import + line ranges + group tabs) |
| Mermaid | `provideMermaid()` opt-in, lazy bundle | none | nice-to-have |
| Nunjucks templating | full templating, macros, `NgDocPage`/`NgDocActions` | none | skip (rejected dual-pipeline) |
| Demo / DemoPane | live Angular component embeds via `demos` field | none | nice-to-have |
| Playground | auto-generates controls from `@Input` types (string/number/bool/union) | none | nice-to-have |
| Keywords / auto-linking | API keywords, page keywords (`*MyKeyword`), global keywords, anchor + querystring | none | blocker (single highest-ROI feature) |
| API auto-generation | `ng-doc.api.ts` glob scopes, JSDoc parse, markdown in comments | none | blocker if NgMd targets library docs; skip if pure content |
| Rendering API | `NgDocApi.Api()` / `Details()`, `JSDoc.Description/Tag/Tags/HasTag` in Nunjucks | n/a | depends on above |
| Page skeleton | `providePageSkeleton()` swap breadcrumbs / TOC / nav individually | hardcoded but well-built | nice-to-have (DX for forks) |
| Page processors | CSS-selector → Angular component replacement/wrapping at runtime | static marked extensions only | nice-to-have |
| Search | Orama + stemmers, `{% index false %}` exclusion, custom engine via class extension | Cmd+K palette over pages+headings+body snippets | nice-to-have (stemmers + exclusion blocks) |
| Layout | CSS-var width/padding/navbar/sidebar + `NgDocCustomNavbarDirective` swap | CSS-var tokens, no swap directive | nice-to-have |
| Themes | data-theme attr, `NgDocThemeService.set('auto')`, Shiki per-theme | class-based dark, no-flash boot, Shiki dual-theme | skip (parity) |
| Icons | Feather pack + drop-in SVG folder | n/a (consumer brings own) | nice-to-have |
| Performance | `cache: true` → `node_modules/.cache/ng-doc` incremental | Vite-native | skip |
| SSR | supported, but `ng add @angular/ssr` clashes with custom builder | Analog SSR native | skip (NgMd ahead) |
| Migrations | `ng update @ng-doc/builder` schematics across v16→v18 | none yet | nice-to-have once v2 ships |
| File-line ignore | `// ng-doc-ignore-line [n]` | none | nice-to-have (pairs with file-import) |
| Versioning / i18n | none documented | none | skip (both behind) |

## 3. What ng-doc does better (lift list)

- **Code-block `file=` import with `#L5-L10` line ranges.** Documentation stops rotting when the example *is* the source. Highest-leverage code feature ng-doc has and NgMd lacks.
- **Tab groups on code blocks via `group="install"` + `active`.** Beats hand-rolling NgmdTabs around `<pre>` blocks for the npm/pnpm/yarn pattern.
- **Keyword auto-linking with three tiers (API / page / global) plus anchors and querystrings.** Page-level keywords decouple prose from URLs; no other static-site generator handles symbol-anchor casing rules this carefully.
- **JSDoc-driven API tables with `@alpha`/`@beta`/`@experimental`/`@deprecated` rendered as styled blockquotes.** Forces an opinion about stability surface — ng-doc treats lifecycle metadata as first-class.
- **Page processor hook (`selector` + `extractOptions` + optional `nodeToReplace`).** A clean extension point that turns post-markdown HTML into typed Angular component inputs — the right shape for the marked-extension problem NgMd hit and worked around.
- **Orama search with `{% index false %}` exclusion blocks and pluggable stemmers.** Lets authors deliberately demote scaffolding text; stemmers matter for non-English docs.
- **Status badges in sidebar (`@status` with color + label).** Tiny touch, big signal for marking NEW / BETA / DEPRECATED pages without writing prose.
- **`ng update` migration schematics.** Sets the precedent that breaking releases ship a codemod, not a changelog.

## 4. What NgMd already does better

- **Vite + AnalogJS over custom Angular Builder.** Faster cold start, no `@ng-doc/generated` TS-error caveat, no v17 webpack→Vite migration scar tissue.
- **Authoring components over markdown pragmas.** NgmdCallout/Alert/Card/Workflow are explicit Angular components in `.page.ts` — typed, testable, refactorable; ng-doc's `> **Note**` blockquote convention is opaque to tooling.
- **Media handling.** NgmdVideo's YT/Vimeo URL normalization and NgmdImage's figure+caption+lazy default beat ng-doc's "construct your own iframe" stance.
- **Link integrity at build time.** `internalLinkGuard` catches broken anchors and `externalLinkGuard` audits outbound links; ng-doc has neither documented.
- **Page chrome polish.** Translucent sticky header + backdrop-blur, scroll-spy TOC, Cmd+K palette over headings+body snippets, prev/next footer, edit-on-github, git-derived last-updated — most ship in ng-doc but none with NgMd's tokened consistency or the no-flash dark-boot script.

## 5. Roadmap — next 3 PRs

1. **Code-block file imports with line ranges + ignore-line markers.** Land a marked extension that resolves `` ```ts file="src/foo.ts#L5-L20" `` against the repo and supports `// ngmd-ignore-line [n]`. This is the highest-impact missing feature: it kills doc rot and unlocks the demo story without committing to a full playground runtime. Pair with grouped code tabs (`group="install" active`) since the parser work overlaps.
2. **Keyword auto-linking (page tier first, API tier deferred).** Add a `keywords` field to page frontmatter and a `*Keyword` inline-code resolver in the marked pipeline; throw on unknown page keywords, warn on unknown anchors. Skip API keywords until step 3 lands. Unblocks cross-page refactors and matches the single ng-doc feature reviewers will miss most.
3. **JSDoc-driven API reference (scoped, opt-in).** A `ngmd.api.ts`-style scope file that globs TS sources, parses JSDoc via ts-morph or the Angular compiler API, and emits virtual `.page.ts` routes with `@deprecated`/`@experimental` badges. Defer playgrounds and demo runtime — those are a separate, larger bet that conflicts with NgMd's "static-first" posture and can wait until adopters ask.

Skipped intentionally: Mermaid (lazy-bundle problem, niche), Nunjucks (dual-pipeline friction, explicitly rejected upstream), page processors (NgMd's component-in-`.page.ts` model already solves the underlying need), live playgrounds (runtime cost vs. NgMd's static posture).
