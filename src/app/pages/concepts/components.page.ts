import { Component } from '@angular/core';
import { NgmdUi } from '../../ui';

@Component({
  selector: 'app-components',
  imports: [...NgmdUi],
  template: `
    <article class="max-w-3xl mx-auto p-8 space-y-12">
      <header>
        <h1 class="text-4xl font-bold tracking-tight">Components</h1>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          The chrome components NgMd ships with. Drop them into any
          <code>.page.ts</code> to add callouts, tabbed code blocks, cards, and
          link rows around your markdown.
        </p>
      </header>

      <section>
        <h2 class="text-2xl font-semibold tracking-tight">Callout</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Highlight a tip, warning, or note that breaks the flow of prose. Five
          severity variants: <code>info</code>, <code>tip</code>,
          <code>success</code>, <code>warning</code>, <code>danger</code>.
        </p>

        <div class="mt-4 space-y-3">
          <ngmd-callout type="info" title="Note">
            This is an info callout. Useful for context, links, or additional reading.
          </ngmd-callout>
          <ngmd-callout type="tip" title="Tip">
            A soft recommendation. Pair it with a code snippet for best effect.
          </ngmd-callout>
          <ngmd-callout type="success" title="You're set">
            Confirmation that a step worked or the reader can move on.
          </ngmd-callout>
          <ngmd-callout type="warning" title="Heads up">
            A non-blocking caution. Renders inside any page.
          </ngmd-callout>
          <ngmd-callout type="danger" title="Critical">
            A breaking-change or data-loss warning. Use sparingly.
          </ngmd-callout>
        </div>

        <ngmd-code-block header="page.ts" language="html" [code]="calloutCode" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold tracking-tight">Tabbed code block</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Switch between equivalent snippets without scrolling. Backed by
          Spartan brain tabs, with full keyboard navigation.
        </p>

        <div class="mt-4">
          <ngmd-tabs>
            <ng-template ngmdTab="pnpm">
              <pre class="text-sm"><code>pnpm create ngmd&#64;latest my-docs</code></pre>
            </ng-template>
            <ng-template ngmdTab="npm">
              <pre class="text-sm"><code>npm create ngmd&#64;latest my-docs</code></pre>
            </ng-template>
            <ng-template ngmdTab="yarn">
              <pre class="text-sm"><code>yarn create ngmd my-docs</code></pre>
            </ng-template>
            <ng-template ngmdTab="bun">
              <pre class="text-sm"><code>bun create ngmd my-docs</code></pre>
            </ng-template>
          </ngmd-tabs>
        </div>

        <ngmd-code-block header="page.ts" language="html" [code]="tabsCode" />
      </section>

      <section>
        <h2 class="text-2xl font-semibold tracking-tight">Pill row</h2>
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          A horizontal row of pill-shaped links. Use for "Related" or
          "See also" sections at the bottom of a page.
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
    </article>
  `,
})
export default class ComponentsPage {
  readonly calloutCode = [
    '<ngmd-callout type="tip" title="Tip">',
    '  Pair it with a code snippet for best effect.',
    '</ngmd-callout>',
  ].join('\n');

  readonly tabsCode = [
    '<ngmd-tabs>',
    '  <ng-template ngmdTab="pnpm">',
    '    <pre><code>pnpm create ngmd@latest my-docs</code></pre>',
    '  </ng-template>',
    '  <ng-template ngmdTab="npm">',
    '    <pre><code>npm create ngmd@latest my-docs</code></pre>',
    '  </ng-template>',
    '</ngmd-tabs>',
  ].join('\n');

  readonly pillRowCode = [
    '<ngmd-pill-row>',
    '  <ngmd-pill href="/concepts/theming" title="Theming" />',
    '  <ngmd-pill href="/concepts/markdown-routes" title="Markdown routes" />',
    '</ngmd-pill-row>',
  ].join('\n');
}
