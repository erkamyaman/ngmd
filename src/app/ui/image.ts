import {Component, input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

/**
 * Inline figure for documentation images, backed by Angular's
 * `NgOptimizedImage` directive.
 *
 * Why `NgOptimizedImage` over a hand-rolled `<img loading="lazy">`:
 *   - reserves aspect-ratio space from `width` × `height`, preventing CLS
 *   - emits an `<link rel="preload">` for `priority` images so the LCP
 *     candidate isn't gated on the JS bundle
 *   - applies `loading="lazy"` only for non-priority images, matching the
 *     directive's intent and platform best-practice
 *   - integrates with image loaders if a project wires one up later
 *
 * Authoring (inside a `.page.ts`):
 *
 *   <ngmd-image
 *     src="https://example.com/screenshot.jpg"
 *     alt="..."
 *     width="1200"
 *     height="630"
 *     caption="..."
 *   />
 *
 * The marked extension that powers `<ngmd-image>` inline in `.md` bodies
 * lives at `src/marked-extensions/ngmd-image.ts` and renders raw
 * `<figure>`/`<img>` via `media-enhancer.ts` — separate codepath, not
 * affected by the inputs declared here.
 */
@Component({
  selector: 'ngmd-image',
  imports: [NgOptimizedImage],
  template: `
    <figure class="mx-0" [style.max-width]="maxWidth() || null">
      <img
        [ngSrc]="src()"
        [alt]="alt()"
        [width]="width()"
        [height]="height()"
        [priority]="priority()"
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

  /** Intrinsic pixel width. Reserves aspect-ratio space; the rendered
   *  size still follows CSS. Required by `NgOptimizedImage`. */
  readonly width = input<number>(1200);
  /** Intrinsic pixel height. See `width`. */
  readonly height = input<number>(630);

  /** Optional CSS `max-width` for the figure, e.g. `48rem` or `80%`. */
  readonly maxWidth = input<string>('');

  /** Mark above-the-fold images as priority so the directive preloads
   *  them and skips `loading="lazy"`. Defaults to lazy. */
  readonly priority = input<boolean>(false);
}
