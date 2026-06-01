import {Component, computed} from '@angular/core';
import {RouterLink} from '@angular/router';
import {apiIndex} from 'virtual:ngmd/api-index';
import {ApiBadges} from '../../ui/api/api-badges';
import {ApiSignature} from '../../ui/api/api-signature';
import {ApiJsDoc} from '../../ui/api/api-jsdoc';

/**
 * API reference landing page. Renders every symbol the api-gen plugin
 * discovered, grouped by the `group` field on each `SymbolRecord` (which
 * tracks the configured `groupBy` strategy from `ngmd.api.ts`).
 *
 * For sites without an `ngmd.api.ts` file, `apiIndex` is empty and this
 * page renders an "API generation is off" empty state. The route itself
 * stays valid so the sidebar can include it unconditionally.
 */
@Component({
  selector: 'app-api-index',
  imports: [RouterLink, ApiBadges, ApiSignature, ApiJsDoc],
  template: `
    <article class="max-w-3xl mx-auto pt-8 px-8 pb-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">API reference</h1>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          Generated from your TypeScript sources at build time.
          @if (totalCount() > 0) {
            <span>{{ totalCount() }} symbols across {{ groupCount() }} groups.</span>
          }
        </p>
      </header>

      @if (totalCount() === 0) {
        <div
          class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-8 text-center"
        >
          <p class="font-medium">API reference generation is off.</p>
          <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add an
            <code class="rounded bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 text-[0.85em]"
              >ngmd.api.ts</code
            >
            scope file at your repo root and the build will populate this page
            on the next run.
          </p>
        </div>
      } @else {
        @for (group of groups(); track group.name) {
          <section class="mb-12">
            <h2
              class="mb-4 text-xl font-semibold tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-2"
            >
              {{ group.name }}
              <span class="ml-2 text-sm font-normal text-zinc-500"
                >{{ group.symbols.length }} symbols</span
              >
            </h2>

            <ul class="grid gap-3">
              @for (sym of group.symbols; track sym.name) {
                <li>
                  <a
                    [routerLink]="urlFor(sym)"
                    class="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 hover:border-[color:var(--accent)] transition-colors"
                  >
                    <div class="flex items-baseline gap-2">
                      <span
                        class="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[0.625rem] uppercase tracking-wider text-zinc-500"
                      >
                        {{ sym.kind }}
                      </span>
                      <span class="font-mono font-medium">{{ sym.name }}</span>
                      <app-api-badges [tags]="sym.badges" />
                    </div>
                    @if (sym.description) {
                      <p
                        class="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2"
                      >
                        {{ shortDescription(sym.description) }}
                      </p>
                    }
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      }
    </article>
  `,
})
export default class ApiIndexPage {
  readonly apiIndex = apiIndex;
  readonly totalCount = computed(() => this.apiIndex.length);

  readonly groups = computed(() => {
    const byGroup = new Map<string, typeof apiIndex>();
    for (const sym of this.apiIndex) {
      const list = byGroup.get(sym.group) ?? [];
      list.push(sym);
      byGroup.set(sym.group, list);
    }
    return [...byGroup.entries()]
      .map(([name, symbols]) => ({
        name,
        symbols: [...symbols].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly groupCount = computed(() => this.groups().length);

  urlFor(sym: (typeof apiIndex)[number]): string {
    return `/api/${encodeURIComponent(sym.group)}/${sym.name}`;
  }

  shortDescription(desc: string): string {
    const firstSentence = desc.split('\n')[0].split('. ')[0];
    return firstSentence.length > 140 ? firstSentence.slice(0, 137) + '…' : firstSentence;
  }
}
