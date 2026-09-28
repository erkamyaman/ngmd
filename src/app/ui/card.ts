import {Component, computed, input} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';
import {
  LucideDynamicIcon,
  type LucideIcon,
  LucideBook,
  LucideBox,
  LucideCodeXml,
  LucideCompass,
  LucideFileText,
  LucideLayers,
  LucideLightbulb,
  LucidePalette,
  LucideRocket,
  LucideSearch,
  LucideSettings,
  LucideShield,
  LucideSparkles,
  LucideTerminal,
  LucideWrench,
  LucideZap,
} from '@lucide/angular';

/**
 * Curated icon set, keyed by short name. Author passes one via the `icon`
 * attribute on `<ngmd-card icon="book" .../>` and that name is looked up
 * here. Names are short and topical; the set is intentionally small so the
 * authoring surface stays memorable and the bundle stays light. Unknown
 * names render no icon, with no error.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  book: LucideBook,
  box: LucideBox,
  code: LucideCodeXml,
  compass: LucideCompass,
  file: LucideFileText,
  layers: LucideLayers,
  lightbulb: LucideLightbulb,
  palette: LucidePalette,
  rocket: LucideRocket,
  search: LucideSearch,
  settings: LucideSettings,
  shield: LucideShield,
  sparkles: LucideSparkles,
  terminal: LucideTerminal,
  wrench: LucideWrench,
  zap: LucideZap,
};

@Component({
  selector: 'ngmd-card',
  imports: [NgTemplateOutlet, RouterLink, LucideDynamicIcon],
  host: {
    // `display: block` so the host occupies its grid cell properly. `h-full`
    // so when laid out inside `<ngmd-card-grid>` (which uses
    // `align-items: stretch` from CSS Grid) the inner bordered div can
    // grow to match the tallest sibling card via the `h-full` on it below.
    class: 'block h-full my-4',
  },
  template: `
    @if (link()) {
      @if (isExternal()) {
        <!-- External: plain anchor + target="_blank". routerLink would
             interpret a full URL as a relative route and 404. -->
        <a
          [href]="link()"
          target="_blank"
          rel="noopener noreferrer"
          class="h-full flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 text-inherit no-underline transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
        >
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </a>
      } @else {
        <a
          [routerLink]="link()"
          class="h-full flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 text-inherit no-underline transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
        >
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </a>
      }
    } @else {
      <div
        class="h-full flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5"
      >
        <ng-container *ngTemplateOutlet="body"></ng-container>
      </div>
    }

    <ng-template #body>
      @if (image()) {
        <img
          [src]="image()"
          [alt]="title() || ''"
          class="size-8 mb-4 object-contain"
          aria-hidden="true"
          loading="lazy"
        />
      } @else if (iconImg(); as img) {
        <svg
          [lucideIcon]="img"
          class="size-6 mb-4 text-[color:var(--accent)]"
          aria-hidden="true"
        ></svg>
      }
      @if (title()) {
        <!-- <p> not <h3>: card titles are labels, not section headings.
             Using <h3> here would pollute the page TOC (Toc scanner picks
             up h2/h3 inside analog-markdown) with every card title. -->
        <p class="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{{ title() }}</p>
      }
      <div class="text-sm text-zinc-600 dark:text-zinc-400 flex-1">
        <ng-content></ng-content>
      </div>
      @if (cta()) {
        <span class="mt-3 inline-block text-sm font-medium text-[color:var(--accent)]"
          >{{ cta() }} →</span
        >
      }
    </ng-template>
  `,
})
export class NgmdCard {
  readonly title = input<string>('');
  readonly link = input<string>('');
  readonly cta = input<string>('');

  // External = anything with a scheme (http, https, mailto, tel). RouterLink
  // would interpret these as relative routes and fail to navigate.
  readonly isExternal = computed(() => /^(https?|mailto|tel):/.test(this.link()));
  readonly icon = input<string>('');
  /**
   * Optional image URL (brand logo etc.). Takes priority over `icon` when
   * both are set. Useful for technology cards where the real brand SVG
   * matters more than a generic Lucide glyph.
   */
  readonly image = input<string>('');

  protected readonly iconImg = computed(() => ICON_MAP[this.icon()] ?? null);
}
