import { Component } from '@angular/core';
import { NgmdUi } from '../../ui';

@Component({
  selector: 'app-markdown-components',
  imports: [...NgmdUi],
  template: `
    <article class="max-w-3xl mx-auto p-8">
      <ngmd-hero title="Markdown components" gradient>
        A growing vocabulary of layout components you compose around your
        markdown. Backed by Angular and Spartan UI, not preprocess hacks.
      </ngmd-hero>

      <h2 id="callout" class="text-2xl font-semibold mt-12 mb-3">Callout</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        A bordered box with optional title and a coloured side stripe.
      </p>
      <ngmd-callout type="tip" title="Reading the source">
        Each callout supports <code>info</code>, <code>tip</code>,
        <code>success</code>, <code>warning</code>, and <code>danger</code>.
      </ngmd-callout>
      <ngmd-code-block header="page.ts" language="html" [code]="calloutCode" />

      <h2 id="alert" class="text-2xl font-semibold mt-12 mb-3">Alert</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        A single-line banner with a side stripe. Lighter than a callout.
      </p>
      <ngmd-alert severity="helpful">
        NgMd's authoring components mirror adev's vocabulary so a future
        migration carries over without rewriting markup.
      </ngmd-alert>

      <h2 id="card" class="text-2xl font-semibold mt-12 mb-3">Card</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        A bordered card with title, body, and an optional link.
        Pass <code>link</code> to make the whole card a router link.
      </p>
      <ngmd-card title="Markdown routes" link="/concepts/markdown-routes" cta="Learn more">
        Drop a <code>.md</code> file under <code>src/app/pages/</code> and it
        becomes a route. No <code>.page.ts</code> needed.
      </ngmd-card>

      <h2 id="pill-row" class="text-2xl font-semibold mt-12 mb-3">Pill row</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        Horizontal pill links. External URLs get
        <code>target="_blank"</code> automatically.
      </p>
      <ngmd-pill-row>
        <ngmd-pill href="/getting-started/installation" title="Installation" />
        <ngmd-pill href="/getting-started/quick-start" title="Quick start" />
        <ngmd-pill href="/concepts/components" title="Components" />
      </ngmd-pill-row>

      <h2 id="tabs" class="text-2xl font-semibold mt-12 mb-3">Tabs</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        Spartan-brain-backed tabs with keyboard navigation and a11y.
      </p>
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

      <h2 id="code-block" class="text-2xl font-semibold mt-12 mb-3">Code block</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        Code with a header bar showing the filename. Pass raw code as input.
      </p>
      <ngmd-code-block header="src/app/hello.ts" language="ts" [code]="helloCode" />

      <h2 id="video" class="text-2xl font-semibold mt-12 mb-3">Video</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        Embed a YouTube or Vimeo player. The component normalises
        watch URLs to player iframes automatically.
      </p>
      <ngmd-video
        src="https://www.youtube.com/watch?v=_ZcHwv91Rmo"
        title="Angular on YouTube"
      />

      <h2 id="image" class="text-2xl font-semibold mt-12 mb-3">Image</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        A <code>&lt;figure&gt;</code> with optional caption and lazy loading.
      </p>
      <ngmd-image
        src="https://angular.dev/assets/images/ng-image.jpg"
        alt="Angular open-graph banner"
        caption="Angular open-graph banner pulled from angular.dev."
      />

      <h2 id="workflow" class="text-2xl font-semibold mt-12 mb-3">Workflow</h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        Numbered step list with a connecting line down the side.
      </p>
      <ngmd-workflow>
        <ngmd-step title="Install NgMd">
          Scaffold a new project with your favourite package manager.
        </ngmd-step>
        <ngmd-step title="Drop in a markdown file">
          Add a <code>.md</code> file under <code>src/app/pages/</code>.
          Frontmatter handles metadata. The body becomes the page.
        </ngmd-step>
        <ngmd-step title="Compose components when you need chrome">
          Switch to <code>.page.ts</code> only when you want tabs, cards,
          callouts, or other layout components around your markdown.
        </ngmd-step>
      </ngmd-workflow>
    </article>
  `,
})
export default class MarkdownComponentsPage {
  readonly calloutCode = [
    '<ngmd-callout type="tip" title="Reading the source">',
    '  Each callout supports info, tip, success, warning, and danger.',
    '</ngmd-callout>',
  ].join('\n');

  readonly helloCode = [
    "import { Component } from '@angular/core';",
    '',
    '@Component({',
    "  selector: 'app-hello',",
    "  template: '<h1>Hello, NgMd</h1>',",
    '})',
    'export class Hello {}',
  ].join('\n');
}
