import {Component, computed, inject} from '@angular/core';
import {LucideAngularModule, Pencil, Code} from 'lucide-angular';
import {pageMeta} from 'virtual:ngmd/page-meta';
import {LlmActions} from './llm-actions';
import {RouteUrlService} from '../services/route-url/route-url.service';

/**
 * Top-right floating icon row showing two GitHub links per route:
 *   - Edit (pencil) → opens the source `.md` / `.page.ts` in GitHub's editor
 *   - Source (`<>`) → opens the same file in GitHub's blob viewer
 *
 * Both URLs derive from the `editUrl` baked at build time by the page-meta
 * Vite plugin. The blob view is the edit URL with `/edit/` swapped for
 * `/blob/`, which is the canonical GitHub pattern.
 */
@Component({
  selector: 'app-source-actions',
  imports: [LucideAngularModule, LlmActions],
  template: `
    @if (editUrl(); as edit) {
      <div class="flex items-center justify-end gap-2 px-4 sm:px-8 pt-4">
        <app-llm-actions />
        <a
          [href]="edit"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Edit this page on GitHub"
          aria-label="Edit this page on GitHub"
        >
          <i-lucide [img]="editIcon" class="size-4"></i-lucide>
        </a>
        <a
          [href]="sourceUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="View source on GitHub"
          aria-label="View source on GitHub"
        >
          <i-lucide [img]="sourceIcon" class="size-4"></i-lucide>
        </a>
      </div>
    }
  `,
})
export class SourceActions {
  private readonly cleanUrl = inject(RouteUrlService).cleanUrl;

  readonly editIcon = Pencil;
  readonly sourceIcon = Code;

  protected readonly editUrl = computed(() => pageMeta[this.cleanUrl()]?.editUrl ?? '');
  protected readonly sourceUrl = computed(() => this.editUrl().replace('/edit/', '/blob/'));
}
