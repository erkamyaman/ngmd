# Competition

Where NgMd sits in the Angular docs starter landscape, what each competitor does well, and where the gap is real vs imagined. Internal-facing; informs prioritisation, not public marketing.

---

## ng-doc

The serious incumbent. Mature, production-tested, used by real Angular libraries today.

**Where ng-doc wins:**

- JSDoc-driven API reference auto-generation. The big one. Globs your TS sources, parses signatures, emits per-symbol pages with `@deprecated` / `@experimental` tags rendered as badges. NgMd has nothing comparable at 0.1.7.
- Component playground with editable code and a live preview. Authors drop a snippet, readers tweak it, see results in-browser.
- Demo extraction. ng-doc can mount an Angular component inline in a doc page and render a real instance, not a screenshot or a static snippet.
- Battle-tested in Angular library docs since 2022. Several published libraries use it.

**Where ng-doc loses:**

- AnalogJS-native. ng-doc runs on Nx + custom Angular setup. NgMd ships on AnalogJS 2.5, Vite 8, modern signals, native SSR/SSG. Setup is `pnpm create ngmd@latest`, not a multi-step Nx generator.
- Tailwind v4 first-class. ng-doc uses its own SCSS theming layer; theming means learning their variable system. NgMd themes through Tailwind tokens consumers already know.
- File-based routing through `src/content/`. ng-doc requires a per-page TS wrapper. NgMd: drop an `.md`, get a route.
- Customisation through copy-and-own. NgMd's chrome and authoring components are files in the user's repo, not imports from a library. Same shadcn-style philosophy ng-doc explicitly rejects.
- Bundle weight and time-to-first-render. NgMd's chrome ships smaller and faster because it's not carrying the legacy of the demo-extraction machinery.

**1.0 implication:** ship API auto-gen and close the only feature gap that matters for library authors. Everything else NgMd already does better.

---

## Compodoc

The older Angular documentation generator. Different category (it generates docs FROM your code, not a docs-site authoring tool), but library authors evaluate it alongside ng-doc.

**Where Compodoc wins:**

- Zero-config auto-gen from TS + JSDoc. Run it, get a docs site.
- Dependency graphs, coverage reports, statistics views built in.
- Has existed since Angular 2; everyone in Angular knows it.

**Where Compodoc loses:**

- The output looks like 2017 because it is from 2017. Visual design hasn't kept up.
- Not an authoring tool. You can't drop a `.md` file and get a routed page that feels like a docs site.
- No content collection, no theming primitives, no palette, no modern stack.

**1.0 implication:** Compodoc users moving forward want what NgMd already provides; auto-gen would close the loop for the ones who want both.

---

## adev (angular.dev)

Not a competitor (Angular's own docs site, not a public starter), but the source of patterns we lift and the bar we measure docs UX against.

**Where adev wins:**

- Single-source-of-truth tooling for the largest Angular docs site in the world.
- Custom WebContainer-based playground in their own domain. Faster than any cross-origin embed.
- View Transitions, palette search, scroll-spy TOC, sidebar accordion, the whole modern docs UX, polished to a high bar.

**Where adev "loses":**

- Not a starter. Not on npm. Not designed for reuse. It's an internal product, not a tool.
- Authoring requires understanding the adev pipeline, not just dropping markdown.

**1.0 implication:** adev is a design reference, not a competitor. NgMd targets the people who want adev-class UX without owning adev's pipeline. Already largely true at 0.1.7.

---

## VitePress / Starlight / Nextra / Docusaurus

The non-Angular incumbents. Everyone evaluating a docs site has used at least one. NgMd's tagline of "Angular's VitePress" is implicit competition with all of them.

**Where they win:**

- Maturity. Each has years of release iterations and a real plugin ecosystem.
- Versioned docs and i18n shipped years ago.
- OG image auto-generation, RSS, search adapters, integrations with translation platforms, all there.
- Larger community of users / templates / examples to crib from.

**Where they lose (for Angular projects):**

- Not Angular. Means giving up Angular components, the signals ecosystem, the type system, and SSR via AnalogJS. Library authors writing Angular libraries don't want to write their docs site in Vue / Astro / React.
- No native API reference for Angular's specific shapes (signal inputs, directives, standalone components, providers).

**1.0 implication:** versioned docs, i18n, OG images, search adapters — these are the table stakes that 1.0 has to clear to be evaluated alongside them. Path to feature parity, not feature leadership.

---

## Where the gap is real vs imagined

**Real gaps NgMd needs to close for 1.0:**

- API reference auto-generation (closes the library author use case)
- Versioned docs (closes the "any project that ships breaking changes" use case)
- i18n (closes the multilingual project use case)
- OG image auto-generation (closes "looks bad when shared on social")
- Stability declaration (closes "is this safe to bet on for the next two years")

**Imagined gaps where NgMd is already ahead:**

- Modern stack: Angular 21 + AnalogJS 2.5 + Vite 8 + Tailwind v4 + Shiki
- Authoring DX: file-based routing, drop-an-md-get-a-route, no per-page wrappers
- Theming: CSS tokens consumers already know, not a custom theming API
- Customisation model: copy-and-own, not import-from-a-library
- Search: Orama BM25 + fuzzy + heading boosts, Algolia DocSearch opt-in, with palette UX modelled on adev
- Performance: smaller chrome bundle, faster cold render

**Strategic positioning:** NgMd is the docs starter for Angular projects on the modern stack. We win on stack + DX + customisation today; we close the feature gap to mature competitors at 1.0. After 1.0, the marketing line writes itself: "the Angular-native docs starter with the polish of the JS ecosystem and the customisation of shadcn."
