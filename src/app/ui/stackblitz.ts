import {Component, computed, inject, input} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {LucideAngularModule, ExternalLink} from 'lucide-angular';

/**
 * Inline StackBlitz embed for Angular code samples.
 *
 * Two source shapes, exactly one required:
 *   - `id="<project-id>"`     → published project on stackblitz.com
 *   - `repo="org/name"`       → "github.com/<repo>" opened via stackblitz's
 *                               GitHub importer (lets you point at any
 *                               public Angular sample without uploading)
 *
 * Optional inputs:
 *   - `file="src/main.ts"`    → open the editor focused on this file
 *   - `title="..."`           → iframe title for screen readers
 *   - `view="default|editor|preview"` → which pane(s) show on load.
 *     `default` (the default) is StackBlitz's split editor + preview;
 *     `editor` collapses to code only, `preview` to the running app only.
 *   - `height="500"`          → iframe height in px (default 500)
 *
 * Usage in markdown:
 *   <ngmd-stackblitz repo="angular-architects/flights42" file="src/app/app.ts">
 *   </ngmd-stackblitz>
 *
 * Usage in `.page.ts`:
 *   <ngmd-stackblitz repo="angular-architects/flights42" file="src/app/app.ts" />
 */
@Component({
  selector: 'ngmd-stackblitz',
  imports: [LucideAngularModule],
  template: `
    <figure class="my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <iframe
        [src]="safeUrl()"
        [title]="title()"
        [style.height.px]="height()"
        class="block w-full border-0 bg-zinc-50 dark:bg-zinc-900"
        loading="lazy"
        credentialless
        allow="cross-origin-isolated; clipboard-write"
      ></iframe>
      <figcaption
        class="flex items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-500"
      >
        <span class="truncate">{{ caption() }}</span>
        <a
          [href]="openUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-zinc-500 hover:text-[color:var(--accent-strong)] transition-colors"
        >
          Open in StackBlitz
          <i-lucide [img]="externalIcon" class="size-3"></i-lucide>
        </a>
      </figcaption>
    </figure>
  `,
})
export class NgmdStackBlitz {
  private readonly sanitizer = inject(DomSanitizer);

  readonly externalIcon = ExternalLink;

  readonly id = input<string>('');
  readonly repo = input<string>('');
  readonly file = input<string>('');
  readonly title = input<string>('StackBlitz playground');
  readonly view = input<'default' | 'preview' | 'editor'>('default');
  readonly height = input<number>(500);

  /** URL pointing at the embedded edit view. `id` wins over `repo` if both
   * are passed (rare but well-defined). */
  private readonly embedUrl = computed(() => {
    const id = this.id().trim();
    const repo = this.repo().trim();
    const base = id
      ? `https://stackblitz.com/edit/${id}`
      : repo
        ? `https://stackblitz.com/github/${repo}`
        : '';
    if (!base) return '';
    // `view=default` is StackBlitz's split editor + preview shape; only
    // emit the param when a specific single pane is requested.
    const params = new URLSearchParams({embed: '1', hideExplorer: '0'});
    const view = this.view();
    if (view !== 'default') params.set('view', view);
    const file = this.file().trim();
    if (file) params.set('file', file);
    return `${base}?${params.toString()}`;
  });

  /** Same project / repo, but opens StackBlitz in a full tab (no embed
   * params). Used by the "Open in StackBlitz" link. */
  readonly openUrl = computed(() => {
    const id = this.id().trim();
    const repo = this.repo().trim();
    return id
      ? `https://stackblitz.com/edit/${id}`
      : repo
        ? `https://stackblitz.com/github/${repo}`
        : 'https://stackblitz.com';
  });

  readonly safeUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl()));

  /** Caption text under the iframe. Falls back to a generic label when
   * neither `id` nor `repo` is set so an unconfigured tag still reads
   * cleanly during authoring. */
  readonly caption = computed(() => {
    const id = this.id().trim();
    const repo = this.repo().trim();
    if (id) return `stackblitz.com/edit/${id}`;
    if (repo) return `stackblitz.com/github/${repo}`;
    return 'StackBlitz embed (set id="..." or repo="...")';
  });
}
