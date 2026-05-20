import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ngmd-hero',
  template: `
    <header
      class="my-8 rounded-2xl px-6 py-10 sm:px-10 sm:py-14"
      [class]="bgClass()"
    >
      <h1
        class="text-3xl sm:text-4xl font-bold tracking-tight m-0 mb-3"
        [class]="titleClass()"
      >
        {{ title() }}
      </h1>
      <div
        class="text-base sm:text-lg leading-relaxed max-w-prose [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        [class]="bodyClass()"
      >
        <ng-content></ng-content>
      </div>
    </header>
  `,
})
export class NgmdHero {
  readonly title = input.required<string>();
  readonly gradient = input(false, { transform: (v: boolean | string) => v === '' || v === true || v === 'true' });

  readonly bgClass = computed(() =>
    this.gradient()
      ? 'bg-gradient-to-br from-rose-500/10 via-fuchsia-500/10 to-purple-500/10 border border-zinc-200 dark:border-zinc-800'
      : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
  );

  readonly titleClass = computed(() =>
    this.gradient()
      ? 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent'
      : 'text-zinc-900 dark:text-zinc-100',
  );

  readonly bodyClass = computed(() => 'text-zinc-700 dark:text-zinc-300');
}
