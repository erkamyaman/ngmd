import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {LucideAngularModule, ArrowLeft, ExternalLink} from 'lucide-angular';
import {apiIndex} from 'virtual:ngmd/api-index';
import {ApiBadges} from '../../../ui/api/api-badges';
import {ApiSignature} from '../../../ui/api/api-signature';
import {ApiJsDoc} from '../../../ui/api/api-jsdoc';
import config from '../../../../ngmd.config';

/**
 * Per-symbol API reference page at `/api/<group>/<symbol>`.
 *
 * Looks the requested symbol up in `virtual:ngmd/api-index` (the build-time
 * snapshot emitted by the api-gen plugin). When the symbol isn't found,
 * renders an empty state directing the user back to the index instead of
 * 404-ing — this is friendlier for stale bookmarks after a refactor.
 */
@Component({
  selector: 'app-api-symbol',
  imports: [RouterLink, LucideAngularModule, ApiBadges, ApiSignature, ApiJsDoc],
  template: `
    <article class="max-w-3xl mx-auto pt-8 px-8 pb-4">
      <a
        routerLink="/api"
        class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[color:var(--accent-strong)] mb-6"
      >
        <i-lucide [img]="backIcon" class="size-3.5"></i-lucide>
        All symbols
      </a>

      @if (symbol(); as sym) {
        <header class="mb-6">
          <div class="flex items-baseline gap-3 flex-wrap">
            <span
              class="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs uppercase tracking-wider text-zinc-500"
            >
              {{ sym.kind }}
            </span>
            <h1 class="font-mono text-3xl font-bold tracking-tight">{{ sym.name }}</h1>
            <app-api-badges [tags]="sym.badges" />
          </div>
          <p class="mt-2 text-sm text-zinc-500">
            <span class="font-mono">{{ sym.filePath }}:{{ sym.line }}</span>
            @if (sourceUrl(); as url) {
              <a
                [href]="url"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-2 inline-flex items-center gap-1 text-zinc-500 hover:text-[color:var(--accent-strong)]"
              >
                view source
                <i-lucide [img]="externalIcon" class="size-3"></i-lucide>
              </a>
            }
          </p>
        </header>

        <section class="mb-6">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Signature
          </h2>
          <app-api-signature [text]="sym.signature" />
        </section>

        @if (sym.description) {
          <section class="mb-6">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Description
            </h2>
            <app-api-jsdoc [text]="sym.description" />
          </section>
        }
      } @else {
        <section
          class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-8 text-center"
        >
          <p class="font-medium">Symbol not found.</p>
          <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <code class="rounded bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 text-[0.85em]"
              >{{ requested() }}</code
            >
            isn't in the current API index. It may have been renamed or removed.
          </p>
        </section>
      }
    </article>
  `,
})
export default class ApiSymbolPage {
  private readonly route = inject(ActivatedRoute);
  readonly backIcon = ArrowLeft;
  readonly externalIcon = ExternalLink;

  private readonly params = toSignal(this.route.paramMap, {requireSync: true});

  readonly requested = computed(() => this.params().get('symbol') ?? '');
  private readonly requestedGroup = computed(() => this.params().get('group') ?? '');

  readonly symbol = computed(() => {
    const name = this.requested();
    const group = this.requestedGroup();
    if (!name) return null;
    return apiIndex.find((s) => s.name === name && s.group === decodeURIComponent(group)) ?? null;
  });

  readonly sourceUrl = computed(() => {
    const sym = this.symbol();
    if (!sym || !config.site.githubUrl) return '';
    return `${config.site.githubUrl}/blob/main/${sym.filePath}#L${sym.line}`;
  });
}
