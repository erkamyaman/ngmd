import { AsyncPipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { injectContent, MarkdownComponent } from '@analogjs/content';
import { LayoutMode } from '../layout-mode.service';

/**
 * Catch-all route for every markdown page.
 *
 * Mirrors the adev pattern: one shared component renders every prose route.
 * `injectContent()` reads the `slug` route param (which the `[...slug]`
 * convention populates with the full nested path) and looks up the matching
 * `src/content/<slug>.md`. Pages that need bespoke layouts (the landing
 * page, the components gallery) keep their named `.page.ts` and Angular's
 * router prefers the more specific match.
 *
 * NgmdUi components render via `@angular/elements`-registered Custom
 * Elements (see `register-elements.ts`). That bypasses Angular's component
 * compiler (which doesn't walk `[innerHTML]`) and lets the browser upgrade
 * `<ngmd-callout>` etc. tags inside the markdown body directly. The schema
 * below tells the template parser to tolerate the unknown selectors so we
 * don't have to maintain a duplicate `NgmdUi` imports array.
 *
 * Doubles as the 404 page: when no markdown matches the requested URL,
 * `injectContent` returns the sentinel below as the body, the docs chrome
 * is hidden, and the 404 UI is rendered instead.
 */

const NOT_FOUND = '__ngmd-not-found__';

@Component({
  selector: 'app-doc',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [AsyncPipe, MarkdownComponent, RouterLink],
  template: `
    @if (content$ | async; as doc) {
      @if (doc.content === notFound) {
        <section class="mx-auto max-w-2xl px-6 py-24 text-center">
          <p class="text-sm font-medium tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            404
          </p>
          <h1 class="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Page not found
          </h1>
          <p class="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            The page you're looking for doesn't exist or has moved.
          </p>
          <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              routerLink="/"
              class="rounded-md bg-zinc-900 dark:bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-50 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              Go home
            </a>
            <a
              routerLink="/welcome"
              class="rounded-md border border-zinc-200 dark:border-zinc-800 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Read the docs
            </a>
          </div>
        </section>
      } @else {
        <article class="max-w-3xl mx-auto pt-8 px-8 pb-4">
          <analog-markdown [content]="doc.content" />
        </article>
      }
    }
  `,
})
export default class DocPage implements OnDestroy {
  private readonly layout = inject(LayoutMode);
  protected readonly notFound = NOT_FOUND;

  readonly content$ = injectContent<{ title: string }>('slug', NOT_FOUND);
  private readonly doc = toSignal(this.content$);
  private readonly missing = computed(() => this.doc()?.content === NOT_FOUND);

  constructor() {
    effect(() => this.layout.chromeHidden.set(this.missing()));
  }

  ngOnDestroy(): void {
    this.layout.chromeHidden.set(false);
  }
}
