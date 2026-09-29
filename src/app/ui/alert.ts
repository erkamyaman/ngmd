import {Component, computed, input} from '@angular/core';
import {
  LucideDynamicIcon,
  type LucideIcon,
  LucideCircleAlert,
  LucideInfo,
  LucideLightbulb,
  LucideOctagonAlert,
  LucideTriangleAlert,
} from '@lucide/angular';

type AlertSeverity = 'info' | 'warning' | 'critical' | 'helpful' | 'important';

const ICON_MAP: Record<AlertSeverity, LucideIcon> = {
  info: LucideInfo,
  warning: LucideTriangleAlert,
  critical: LucideOctagonAlert,
  helpful: LucideLightbulb,
  important: LucideCircleAlert,
};

const STRIPE: Record<AlertSeverity, string> = {
  info: 'border-l-blue-500',
  warning: 'border-l-amber-500',
  critical: 'border-l-red-500',
  helpful: 'border-l-teal-500',
  important: 'border-l-purple-500',
};

const ACCENT: Record<AlertSeverity, string> = {
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
  helpful: 'text-teal-600 dark:text-teal-400',
  important: 'text-purple-600 dark:text-purple-400',
};

const BOX =
  'px-4 py-3 rounded-r-md border-l-[3px] border-y border-r border-y-zinc-200 border-r-zinc-200 dark:border-y-zinc-800 dark:border-r-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-3';

/**
 * Single-line banner with a coloured side stripe, a severity icon, and an
 * uppercase tag prefix. Shape mirrors adev's `docs-callout`: icon on the
 * left, bold severity tag with colon flowing inline with the body prose.
 *
 * The `[&>:first-child]:inline` on the body wrapper makes the first
 * projected child (typically a `<p>` from markdown rendering) display
 * inline so the tag and content read as one continuous sentence.
 */
@Component({
  selector: 'ngmd-alert',
  imports: [LucideDynamicIcon],
  template: `
    <div [class]="boxClass()">
      <svg
        [lucideIcon]="iconImg()"
        class="size-4 shrink-0 mt-0.5"
        [class]="accentClass()"
        aria-hidden="true"
      ></svg>
      <div class="flex-1 [&>*:first-child]:inline [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <strong class="font-semibold mr-1" [class]="accentClass()">{{ tag() }}:</strong>
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class NgmdAlert {
  readonly severity = input<AlertSeverity>('info');
  /** Optional label override. Defaults to the severity name, uppercased. */
  readonly label = input<string>('');

  private readonly resolved = computed<AlertSeverity>(() =>
    Object.hasOwn(ICON_MAP, this.severity()) ? this.severity() : 'info',
  );
  protected readonly iconImg = computed(() => ICON_MAP[this.resolved()]);
  protected readonly accentClass = computed(() => ACCENT[this.resolved()]);
  protected readonly boxClass = computed(() => `${BOX} ${STRIPE[this.resolved()]}`);
  protected readonly tag = computed(() => (this.label() || this.resolved()).toUpperCase());
}
