import {Component, input} from '@angular/core';

@Component({
  selector: 'ngmd-image',
  template: `
    <figure class="mx-0" [style.max-width]="width()">
      <img
        [src]="src()"
        [alt]="alt()"
        loading="lazy"
        class="w-full h-auto rounded-lg border border-zinc-200 dark:border-zinc-800"
      />
      @if (caption()) {
        <figcaption class="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {{ caption() }}
        </figcaption>
      }
    </figure>
  `,
})
export class NgmdImage {
  readonly src = input.required<string>();
  readonly alt = input<string>('');
  readonly caption = input<string>('');
  readonly width = input<string>('');
}
