import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgmdCodeBlock } from '../../ui/code-block';

@Component({
  selector: 'app-components',
  imports: [RouterLink, NgmdCodeBlock],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <article class="max-w-3xl mx-auto p-8 space-y-12">
      <header>
        <h1 class="text-4xl font-bold tracking-tight">Components</h1>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          The authoring components NgMd ships in <code>src/app/ui/</code>.
          Compose them in any <code>.page.ts</code> via the
          <code>NgmdUi</code> barrel, or drop them inline in any
          <code>.md</code> file via the Custom Elements bridge.
          See <a routerLink="/concepts/demo">the showcase</a> for the
          markdown-side view.
        </p>
      </header>

      <section>
        <h2 id="callout" class="text-2xl font-semibold tracking-tight">Callout</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Bordered box with a coloured side stripe. Five types:
          <code>info</code>, <code>tip</code>, <code>success</code>,
          <code>warning</code>, <code>danger</code>.
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
          <ngmd-callout type="warning" title="Warning">
            Non-blocking caution.
          </ngmd-callout>
          <ngmd-callout type="danger" title="Critical">
            Breaking-change or data-loss warning. Use sparingly.
          </ngmd-callout>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="calloutCode" />
      </section>

      <section>
        <h2 id="alert" class="text-2xl font-semibold tracking-tight">Alert</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Single-line banner with a side stripe. Lighter than a callout.
          Severities: <code>info</code>, <code>warning</code>,
          <code>critical</code>, <code>helpful</code>, <code>important</code>.
        </p>
        <div class="mt-4 space-y-3">
          <ngmd-alert severity="info">
            Plain informational alert.
          </ngmd-alert>
          <ngmd-alert severity="helpful">
            Sidebar context for the reader.
          </ngmd-alert>
          <ngmd-alert severity="warning">
            Watch out, but the page still works.
          </ngmd-alert>
          <ngmd-alert severity="critical">
            Something will break if you ignore this.
          </ngmd-alert>
          <ngmd-alert severity="important">
            Worth pausing for.
          </ngmd-alert>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="alertCode" />
      </section>

      <section>
        <h2 id="card" class="text-2xl font-semibold tracking-tight">Card</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Bordered card with title and body. Pass <code>link</code> to make
          the whole card a router link with a hover state.
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
          Tab UI with keyboard navigation. Bodies can be any
          markup, not just code.
        </p>
        <div class="mt-4">
          <ngmd-tabs>
            <ngmd-tab title="pnpm">
              <pre class="text-sm"><code>pnpm create ngmd&#64;latest my-docs</code></pre>
            </ngmd-tab>
            <ngmd-tab title="npm">
              <pre class="text-sm"><code>npm create ngmd&#64;latest my-docs</code></pre>
            </ngmd-tab>
            <ngmd-tab title="yarn">
              <pre class="text-sm"><code>yarn create ngmd my-docs</code></pre>
            </ngmd-tab>
            <ngmd-tab title="bun">
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
          Numbered step list with a connecting line down the side. Each step
          gets its own title and body.
        </p>
        <div class="mt-4">
          <ngmd-workflow>
            <ngmd-step title="Scaffold">Run <code>pnpm create ngmd&#64;latest my-docs</code>.</ngmd-step>
            <ngmd-step title="Install">Run <code>pnpm install</code> in the new directory.</ngmd-step>
            <ngmd-step title="Develop">Run <code>pnpm dev</code> and open <code>http://localhost:5173</code>.</ngmd-step>
          </ngmd-workflow>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="workflowCode" />
      </section>

      <section>
        <h2 id="hero" class="text-2xl font-semibold tracking-tight">Hero</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Page header with optional gradient background. Pass
          <code>gradient</code> for the rose-fuchsia-purple wash, omit for the
          quiet variant.
        </p>
        <div class="mt-4">
          <ngmd-hero title="Welcome" gradient>
            The hero you see on the home page.
          </ngmd-hero>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="heroCode" />
      </section>

      <section>
        <h2 id="code-block" class="text-2xl font-semibold tracking-tight">Code block</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Standalone code block with header bar showing the filename. Lazy-loads
          Shiki at runtime for syntax highlighting. Pass either a raw
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
          YouTube or Vimeo embed. Pass the canonical watch URL; the component
          normalises it to the player iframe and lazy-loads.
        </p>
        <div class="mt-4">
          <ngmd-video src="https://www.youtube.com/watch?v=_ZcHwv91Rmo" title="Angular intro" />
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="videoCode" />
      </section>

      <section>
        <h2 id="image" class="text-2xl font-semibold tracking-tight">Image</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Figure with optional caption. Lazy-loads, applies the standard
          rounded border so it sits in prose without extra Tailwind.
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
          Disclosure list, backed by the native <code>&lt;details&gt;</code>
          element for keyboard, ARIA, and SSR-friendly default-open for free.
          Pass <code>open</code> on an item to start it expanded.
        </p>
        <ngmd-accordion>
          <ngmd-accordion-item title="When was NgMd released?" open>
            Initial public release was May 2026. The starter is at v0 while
            we collect feedback from first projects.
          </ngmd-accordion-item>
          <ngmd-accordion-item title="Does it support i18n?">
            Not yet. Locale-prefixed routes plus a header switcher are on
            the v1 roadmap.
          </ngmd-accordion-item>
          <ngmd-accordion-item title="Can I use it with my existing Angular app?">
            NgMd is a standalone starter, not a library to bolt on. Scaffold
            a new project and migrate content into it, or copy the parts of
            <code>src/app/</code> you want.
          </ngmd-accordion-item>
        </ngmd-accordion>
        <ngmd-code-block header="page.ts" language="html" [code]="accordionCode" />
      </section>

      <section>
        <h2 id="card-grid" class="text-2xl font-semibold tracking-tight">Card grid</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Container around <code>&lt;ngmd-card&gt;</code> for n-up layouts.
          Two columns by default, pass <code>columns="3"</code> for three.
          Stacks to single column on mobile.
        </p>
        <ngmd-card-grid columns="2">
          <ngmd-card title="Markdown routes" link="/concepts/markdown-routes" cta="Read">
            How file-based routing wires content to URLs.
          </ngmd-card>
          <ngmd-card title="Theming" link="/concepts/theming" cta="Read">
            CSS variable tokens and the fuchsia accent wiring.
          </ngmd-card>
        </ngmd-card-grid>
        <ngmd-code-block header="page.ts" language="html" [code]="cardGridCode" />
      </section>

      <section>
        <h2 id="badge" class="text-2xl font-semibold tracking-tight">Badge</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Inline status pill. Five variants: <code>alpha</code>,
          <code>beta</code>, <code>stable</code>, <code>deprecated</code>,
          <code>new</code>. Pairs well with headings and inline references.
        </p>
        <div class="mt-4 flex flex-wrap gap-2 items-center">
          <ngmd-badge variant="alpha">Alpha</ngmd-badge>
          <ngmd-badge variant="beta">Beta</ngmd-badge>
          <ngmd-badge variant="stable">Stable</ngmd-badge>
          <ngmd-badge variant="deprecated">Deprecated</ngmd-badge>
          <ngmd-badge variant="new">New</ngmd-badge>
        </div>
        <ngmd-code-block header="page.ts" language="html" [code]="badgeCode" />
      </section>
    </article>
  `,
})
export default class ComponentsPage {
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
    '  <ngmd-tab title="pnpm">',
    '    <pre><code>pnpm create ngmd@latest my-docs</code></pre>',
    '  </ngmd-tab>',
    '  <ngmd-tab title="npm">',
    '    <pre><code>npm create ngmd@latest my-docs</code></pre>',
    '  </ngmd-tab>',
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
    "export function greet(name: string) {",
    "  console.log(`Hello, ${name}`);",
    "}",
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
}
