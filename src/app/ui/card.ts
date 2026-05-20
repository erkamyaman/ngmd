import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ngmd-card',
  imports: [NgTemplateOutlet, RouterLink],
  template: `
    @if (link()) {
      <a
        [routerLink]="link()"
        class="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 my-4 text-inherit no-underline transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
      >
        <ng-container *ngTemplateOutlet="body"></ng-container>
      </a>
    } @else {
      <div
        class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 my-4"
      >
        <ng-container *ngTemplateOutlet="body"></ng-container>
      </div>
    }

    <ng-template #body>
      @if (title()) {
        <h3 class="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{{ title() }}</h3>
      }
      <div class="text-sm text-zinc-600 dark:text-zinc-400">
        <ng-content></ng-content>
      </div>
      @if (cta()) {
        <span class="mt-3 inline-block text-sm font-medium text-zinc-500 dark:text-zinc-400">{{ cta() }} →</span>
      }
    </ng-template>
  `,
})
export class NgmdCard {
  readonly title = input<string>('');
  readonly link = input<string>('');
  readonly cta = input<string>('');
}
