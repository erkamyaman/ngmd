import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutMode } from '../layout-mode.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
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
  `,
})
export default class NotFoundPage implements OnInit, OnDestroy {
  private readonly layout = inject(LayoutMode);

  ngOnInit(): void {
    this.layout.chromeHidden.set(true);
  }

  ngOnDestroy(): void {
    this.layout.chromeHidden.set(false);
  }
}
