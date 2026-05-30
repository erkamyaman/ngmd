import {Component, CUSTOM_ELEMENTS_SCHEMA, inject} from '@angular/core';
import {RouterLink} from '@angular/router';

import {NgmdCodeBlock} from '../../ui/code-block';
import {ToastService} from '../../services/toast/toast.service';

@Component({
  selector: 'app-components',
  imports: [RouterLink, NgmdCodeBlock],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <article class="ngmd-prose max-w-3xl mx-auto p-8 space-y-12">
      <header>
        <h1 class="text-4xl font-bold tracking-tight">Components</h1>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          The authoring components NgMd ships in <code>src/app/ui/</code>. Compose them in any
          <code>.page.ts</code> via the <code>NgmdUi</code> barrel, or drop them inline in any
          <code>.md</code> file via the Custom Elements bridge. See
          <a routerLink="/concepts/showcase">the showcase</a> for the markdown-side view.
        </p>
        <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Every block component below accepts a Tailwind class on the markdown tag for per-instance
          spacing.
          <code>&lt;ngmd-callout class="mt-10"&gt;</code>,
          <code>&lt;ngmd-card-grid class="my-0"&gt;</code>, etc. See
          <a routerLink="/concepts/markdown-routes" fragment="per-instance-spacing"
            >per-instance spacing</a
          >
          for the full pattern.
        </p>
      </header>

      <section>
        <h2 id="callout" class="text-2xl font-semibold tracking-tight">Callout</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Bordered box with a coloured side stripe. Five types:
          <code>info</code>, <code>tip</code>, <code>success</code>, <code>warning</code>,
          <code>danger</code>.
        </p>
        <div class="mt-4 space-y-3">
          <ngmd-callout type="info" title="Note">
            Info callout. Context, links, or additional reading.
          </ngmd-callout>
          <ngmd-callout type="tip" title="Tip">
            A soft recommendation. Pair with a code snippet.
          </ngmd-callout>
          <ngmd-callout type="success" title="Done">
            Confirmation that a step worked.
          </ngmd-callout>
          <ngmd-callout type="warning" title="Warning"> Non-blocking caution. </ngmd-callout>
          <ngmd-callout type="danger" title="Critical">
            Breaking-change or data-loss warning. Use sparingly.
          </ngmd-callout>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="calloutCode" />
      </section>

      <section>
        <h2 id="alert" class="text-2xl font-semibold tracking-tight">Alert</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Single-line banner with a side stripe. Lighter than a callout. Severities:
          <code>info</code>, <code>warning</code>, <code>critical</code>, <code>helpful</code>,
          <code>important</code>.
        </p>
        <div class="mt-4 space-y-3">
          <ngmd-alert severity="info"> Plain informational alert. </ngmd-alert>
          <ngmd-alert severity="helpful"> Sidebar context for the reader. </ngmd-alert>
          <ngmd-alert severity="warning"> Watch out, but the page still works. </ngmd-alert>
          <ngmd-alert severity="critical"> Something will break if you ignore this. </ngmd-alert>
          <ngmd-alert severity="important"> Worth pausing for. </ngmd-alert>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="alertCode" />
      </section>

      <section>
        <h2 id="card" class="text-2xl font-semibold tracking-tight">Card</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Bordered card with title and body. Pass <code>link</code> to make the whole card a router
          link with a hover state.
        </p>
        <div class="mt-4 space-y-3">
          <ngmd-card title="Plain card">
            Body content. No link, no hover. Use for grouping prose.
          </ngmd-card>
          <ngmd-card title="Linked card" link="/concepts/markdown-routes" cta="Read more">
            Wraps the whole card in a router link. Hover turns the border fuchsia.
          </ngmd-card>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="cardCode" />
      </section>

      <section>
        <h2 id="tabs" class="text-2xl font-semibold tracking-tight">Tabs</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Tab UI with keyboard navigation. Bodies can be any markup, not just code.
        </p>
        <div class="mt-4">
          <ngmd-tabs>
            <ngmd-tab title="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220">
              <pre class="text-sm"><code>pnpm create ngmd&#64;latest my-docs</code></pre>
            </ngmd-tab>
            <ngmd-tab title="npm" image="https://cdn.simpleicons.org/npm/CB3837">
              <pre class="text-sm"><code>npm create ngmd&#64;latest my-docs</code></pre>
            </ngmd-tab>
            <ngmd-tab title="yarn" image="https://cdn.simpleicons.org/yarn/2C8EBB">
              <pre class="text-sm"><code>yarn create ngmd my-docs</code></pre>
            </ngmd-tab>
            <ngmd-tab title="bun" image="https://bun.sh/logo.svg">
              <pre class="text-sm"><code>bun create ngmd my-docs</code></pre>
            </ngmd-tab>
          </ngmd-tabs>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="tabsCode" />
      </section>

      <section>
        <h2 id="pill-row" class="text-2xl font-semibold tracking-tight">Pill row</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Horizontal pill-shaped links. External URLs auto-target a new tab.
        </p>
        <div class="mt-4">
          <ngmd-pill-row>
            <ngmd-pill href="/concepts/theming" title="Theming" />
            <ngmd-pill href="/concepts/markdown-routes" title="Markdown routes" />
            <ngmd-pill href="/getting-started/changelog" title="Changelog" />
          </ngmd-pill-row>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="pillRowCode" />
      </section>

      <section>
        <h2 id="workflow" class="text-2xl font-semibold tracking-tight">Workflow</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Numbered step list with a connecting line down the side. Each step gets its own title and
          body.
        </p>
        <div class="mt-4">
          <ngmd-workflow>
            <ngmd-step title="Scaffold"
              >Run <code>pnpm create ngmd&#64;latest my-docs</code>.</ngmd-step
            >
            <ngmd-step title="Install"
              >Run <code>pnpm install</code> in the new directory.</ngmd-step
            >
            <ngmd-step title="Develop"
              >Run <code>pnpm dev</code> and open <code>http://localhost:5173</code>.</ngmd-step
            >
          </ngmd-workflow>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="workflowCode" />
      </section>

      <section>
        <h2 id="hero" class="text-2xl font-semibold tracking-tight">Hero</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Page header with optional gradient background. Pass
          <code>gradient</code> for the brand-accent wash (driven by the
          <code>--accent-gradient</code> token), omit for the quiet variant.
        </p>
        <div class="mt-4">
          <ngmd-hero title="Welcome" gradient> The hero you see on the home page. </ngmd-hero>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="heroCode" />
      </section>

      <section>
        <h2 id="code-block" class="text-2xl font-semibold tracking-tight">Code block</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Standalone code block with header bar showing the filename. Lazy-loads Shiki at runtime
          for syntax highlighting. Pass either a raw
          <code>[code]</code> string or fenced markdown.
        </p>
        <div class="mt-4">
          <ngmd-code-block header="src/hello.ts" language="ts" [code]="codeBlockSample" />
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="codeBlockCode" />
      </section>

      <section>
        <h2 id="video" class="text-2xl font-semibold tracking-tight">Video</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          YouTube or Vimeo embed. Pass the canonical watch URL; the component normalises it to the
          player iframe and lazy-loads.
        </p>
        <div class="mt-4">
          <ngmd-video src="https://www.youtube.com/watch?v=_ZcHwv91Rmo" title="Angular intro" />
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="videoCode" />
      </section>

      <section>
        <h2 id="image" class="text-2xl font-semibold tracking-tight">Image</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Figure with optional caption. Lazy-loads, applies the standard rounded border so it sits
          in prose without extra Tailwind.
        </p>
        <div class="mt-4">
          <ngmd-image
            src="https://angular.dev/assets/images/ng-image.jpg"
            alt="Angular open-graph banner"
            caption="Angular open-graph banner pulled from angular.dev."
          />
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="imageCode" />
      </section>

      <section>
        <h2 id="accordion" class="text-2xl font-semibold tracking-tight">Accordion</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Disclosure list, backed by the native <code>&lt;details&gt;</code> element for keyboard,
          ARIA, and SSR-friendly default-open for free. Pass <code>open</code> on an item to start
          it expanded.
        </p>
        <ngmd-accordion>
          <ngmd-accordion-item title="When was NgMd released?" open>
            Initial public release was May 2026. The starter is at v0 while we collect feedback from
            first projects.
          </ngmd-accordion-item>
          <ngmd-accordion-item title="Does it support i18n?">
            Not yet. Locale-prefixed routes plus a header switcher are on the v1 roadmap.
          </ngmd-accordion-item>
          <ngmd-accordion-item title="Can I use it with my existing Angular app?">
            NgMd is a standalone starter, not a library to bolt on. Scaffold a new project and
            migrate content into it, or copy the parts of
            <code>src/app/</code> you want.
          </ngmd-accordion-item>
        </ngmd-accordion>
        <ngmd-code-block header="page.ts" language="html" [code]="accordionCode" />
      </section>

      <section>
        <h2 id="card-grid" class="text-2xl font-semibold tracking-tight">Card grid</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Container around <code>&lt;ngmd-card&gt;</code> for n-up layouts. Two columns by default,
          pass <code>columns="3"</code> for three. Stacks to single column on mobile.
        </p>
        <div class="mb-8">
          <ngmd-card-grid columns="2">
            <ngmd-card title="Markdown routes" link="/concepts/markdown-routes" cta="Read">
              How file-based routing wires content to URLs.
            </ngmd-card>
            <ngmd-card title="Theming" link="/concepts/theming" cta="Read">
              CSS variable tokens and the fuchsia accent wiring.
            </ngmd-card>
          </ngmd-card-grid>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="cardGridCode" />
      </section>

      <section>
        <h2 id="toast" class="text-2xl font-semibold tracking-tight">Toast</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Non-blocking inline feedback for clipboard failures, save confirmations, link copies — any
          short message that shouldn't take over the page. Inject <code>ToastService</code> anywhere
          and call <code>.success()</code>, <code>.error()</code>, or <code>.info()</code>. The
          stack renders top-right from the app-level <code>&lt;app-toaster&gt;</code>; nothing to
          mount per-page.
        </p>
        <div class="mt-4 flex flex-wrap gap-2 items-center">
          <button
            type="button"
            (click)="fireSuccess()"
            class="rounded-md border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
          >
            Show success
          </button>
          <button
            type="button"
            (click)="fireError()"
            class="rounded-md border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            Show error
          </button>
          <button
            type="button"
            (click)="fireInfo()"
            class="rounded-md border border-sky-200 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-500/10 px-3 py-1.5 text-sm font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
          >
            Show info
          </button>
        </div>
        <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Default duration is 3 seconds. Pass 0 as the second arg to keep a toast visible until the
          user clicks the close icon.
        </p>
        <ngmd-code-block header="page.ts" language="ts" [code]="toastCode" />
      </section>

      <section>
        <h2 id="badge" class="text-2xl font-semibold tracking-tight">Badge</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Inline status pill. Six variants, each tied to a lifecycle meaning and a fixed colour so
          the signal reads the same way across every page.
        </p>
        <div class="mt-4 flex flex-wrap gap-2 items-center">
          <ngmd-badge variant="new">New</ngmd-badge>
          <ngmd-badge variant="updated">Updated</ngmd-badge>
          <ngmd-badge variant="alpha">Alpha</ngmd-badge>
          <ngmd-badge variant="beta">Beta</ngmd-badge>
          <ngmd-badge variant="stable">Stable</ngmd-badge>
          <ngmd-badge variant="deprecated">Deprecated</ngmd-badge>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="badgeCode" />
        <ngmd-accordion>
          <ngmd-accordion-item title="Custom labels and variants">
            <p>
              Two independent axes. The <code>variant</code> attribute picks the
              <strong>colour</strong> (lifecycle meaning). Whatever sits between the tags becomes
              the <strong>label</strong>, uppercased automatically. Mix and match.
            </p>
            <ngmd-code-block language="html" [code]="badgeCustomLabelCode" />
            <p class="mt-4">Renders:</p>
            <div class="mt-2 flex flex-wrap gap-2 items-center">
              <ngmd-badge variant="new">Public preview</ngmd-badge>
              <ngmd-badge variant="beta">Opt-in</ngmd-badge>
              <ngmd-badge variant="deprecated">Removed in v3</ngmd-badge>
            </div>
            <p class="mt-4">
              Need a new colour? Every variant lives in one map:
              <code>BADGE_VARIANTS</code> in <code>src/types/badge.ts</code>. Add a row and both the
              inline <code>&lt;ngmd-badge&gt;</code>
              and the whole-page sidebar chip pick it up. Example: a violet
              <code>preview</code> variant.
            </p>
            <ngmd-code-block
              header="src/types/badge.ts"
              language="ts"
              [code]="badgeNewVariantCode"
            />
            <p class="mt-4">
              The <code>BadgeVariant</code> type is derived from this map, so new keys are accepted
              on <code>&lt;ngmd-badge&gt;</code> and on <code>NavItem.status</code> in
              <code>ngmd.config.ts</code>
              immediately.
            </p>
          </ngmd-accordion-item>
          <ngmd-accordion-item title="Sidebar chip via nav config">
            <p>
              For an entire page rather than an inline mention, add
              <code>status:</code> to the nav item in <code>ngmd.config.ts</code>. The same chip
              renders beside the page's sidebar entry. All six variants work as values.
            </p>
            <ngmd-code-block language="ts" [code]="badgeNavStatusCode" />
            <p class="mt-4">
              See
              <a
                routerLink="/concepts/markdown-routes"
                fragment="sidebar-status-badges"
                class="text-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
                >sidebar status badges</a
              >
              for the full list and colour mapping.
            </p>
          </ngmd-accordion-item>
        </ngmd-accordion>
      </section>
    </article>
  `,
})
export default class ComponentsPage {
  private readonly toast = inject(ToastService);

  fireSuccess(): void {
    this.toast.success('Link copied to clipboard.');
  }

  fireError(): void {
    this.toast.error('Could not copy link.');
  }

  fireInfo(): void {
    this.toast.info('Markdown index rebuilt.');
  }

  readonly toastCode = [
    "import {inject} from '@angular/core';",
    "import {ToastService} from '../services/toast/toast.service';",
    '',
    'export class MyComponent {',
    '  private readonly toast = inject(ToastService);',
    '',
    '  save() {',
    "    this.toast.success('Saved.');",
    '  }',
    '',
    '  failed() {',
    "    this.toast.error('Network request failed.');",
    '  }',
    '',
    '  // Pass 0 to keep the toast until the user dismisses it:',
    "  // this.toast.info('Heads up.', 0);",
    '}',
  ].join('\n');

  readonly calloutCode = [
    '<ngmd-callout type="tip" title="Tip">',
    '  Pair with a code snippet.',
    '</ngmd-callout>',
  ].join('\n');

  readonly alertCode = [
    '<ngmd-alert severity="warning">',
    '  Watch out, but the page still works.',
    '</ngmd-alert>',
  ].join('\n');

  readonly cardCode = [
    '<ngmd-card title="Linked card" link="/concepts/markdown-routes" cta="Read more">',
    '  Wraps the whole card in a router link.',
    '</ngmd-card>',
  ].join('\n');

  readonly tabsCode = [
    '<ngmd-tabs>',
    '  <ngmd-tab title="pnpm" image="https://cdn.simpleicons.org/pnpm/F69220">',
    '    <pre><code>pnpm create ngmd@latest my-docs</code></pre>',
    '  </ngmd-tab>',
    '  <ngmd-tab title="npm" image="https://cdn.simpleicons.org/npm/CB3837">',
    '    <pre><code>npm create ngmd@latest my-docs</code></pre>',
    '  </ngmd-tab>',
    '  <!-- icon="..." also works (Lucide set) -->',
    '</ngmd-tabs>',
  ].join('\n');

  readonly pillRowCode = [
    '<ngmd-pill-row>',
    '  <ngmd-pill href="/concepts/theming" title="Theming" />',
    '  <ngmd-pill href="/concepts/markdown-routes" title="Markdown routes" />',
    '</ngmd-pill-row>',
  ].join('\n');

  readonly workflowCode = [
    '<ngmd-workflow>',
    '  <ngmd-step title="Scaffold">Run pnpm create ngmd@latest my-docs.</ngmd-step>',
    '  <ngmd-step title="Install">Run pnpm install.</ngmd-step>',
    '  <ngmd-step title="Develop">Run pnpm dev.</ngmd-step>',
    '</ngmd-workflow>',
  ].join('\n');

  readonly heroCode = [
    '<ngmd-hero title="Welcome" gradient>',
    '  The hero you see on the home page.',
    '</ngmd-hero>',
  ].join('\n');

  readonly codeBlockSample = [
    'export function greet(name: string) {',
    '  console.log(`Hello, ${name}`);',
    '}',
  ].join('\n');

  readonly codeBlockCode = [
    '<ngmd-code-block header="src/hello.ts" language="ts" [code]="snippet" />',
  ].join('\n');

  readonly videoCode = [
    '<ngmd-video',
    '  src="https://www.youtube.com/watch?v=_ZcHwv91Rmo"',
    '  title="Angular intro"',
    '/>',
  ].join('\n');

  readonly imageCode = [
    '<ngmd-image',
    '  src="/screenshot.png"',
    '  alt="Sidebar accordion"',
    '  caption="The sidebar reads from ngmd.config.ts."',
    '/>',
  ].join('\n');

  readonly accordionCode = [
    '<ngmd-accordion>',
    '  <ngmd-accordion-item title="When was NgMd released?" open>',
    '    Initial public release was May 2026.',
    '  </ngmd-accordion-item>',
    '  <ngmd-accordion-item title="Does it support i18n?">',
    '    Not yet, on the v1 roadmap.',
    '  </ngmd-accordion-item>',
    '</ngmd-accordion>',
  ].join('\n');

  readonly cardGridCode = [
    '<ngmd-card-grid columns="2">',
    '  <ngmd-card title="Markdown routes" link="/concepts/markdown-routes" cta="Read">',
    '    How file-based routing wires content to URLs.',
    '  </ngmd-card>',
    '  <ngmd-card title="Theming" link="/concepts/theming" cta="Read">',
    '    CSS variable tokens and the fuchsia accent wiring.',
    '  </ngmd-card>',
    '</ngmd-card-grid>',
  ].join('\n');

  readonly badgeCode = [
    '<ngmd-badge variant="beta">Beta</ngmd-badge>',
    '<ngmd-badge variant="deprecated">Deprecated</ngmd-badge>',
  ].join('\n');

  readonly badgeCustomLabelCode = [
    '<ngmd-badge variant="new">Public preview</ngmd-badge>',
    '<ngmd-badge variant="beta">Opt-in</ngmd-badge>',
    '<ngmd-badge variant="deprecated">Removed in v3</ngmd-badge>',
  ].join('\n');

  readonly badgeNavStatusCode = [
    'nav: [',
    '  {',
    "    label: 'Core Concepts',",
    '    items: [',
    "      {label: 'Search', href: '/concepts/search', status: 'new'},",
    "      {label: 'Theming', href: '/concepts/theming', status: 'updated'},",
    '    ],',
    '  },',
    '],',
  ].join('\n');

  readonly badgeNewVariantCode = [
    'export const BADGE_VARIANTS = {',
    '  // ...existing variants',
    "  preview: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',",
    '} as const satisfies Record<string, string>;',
    '',
    '// Derived automatically. No manual edit needed:',
    'export type BadgeVariant = keyof typeof BADGE_VARIANTS;',
  ].join('\n');
}
