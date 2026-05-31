import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  QueryList,
  signal,
} from '@angular/core';
import {watchHostAttribute} from '../utils/watch-host-attribute';

@Component({
  selector: 'ngmd-step',
  template: `
    <div class="flex gap-4 pb-8 relative ngmd-step">
      <div
        class="flex-shrink-0 w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center font-semibold text-sm relative z-10"
      >
        {{ index() + 1 }}
      </div>
      <div class="flex-1 min-w-0">
        @if (title()) {
          <h3 class="text-lg font-semibold mt-1.5 mb-2 text-zinc-900 dark:text-zinc-100">
            {{ title() }}
          </h3>
        }
        <div
          class="text-zinc-700 dark:text-zinc-300 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        >
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class NgmdStep {
  readonly title = input<string>('');
  readonly index = signal(0);

  constructor() {
    // When this step is used inside a `<ngmd-workflow>` rendered from a
    // markdown body, the workflow can't see this step via `ContentChildren`
    // because each `<ngmd-step>` is its own Custom Element host. The
    // workflow instead sets a `data-step-index` attribute on each child
    // element; we read it here on setup and on every later change.
    // Component-pages (where ContentChildren works) still call `index.set(i)`
    // directly; the attribute path is a no-op for them.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const stop = watchHostAttribute(host, 'data-step-index', (value) => {
      if (value === null) return;
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) this.index.set(n);
    });
    inject(DestroyRef).onDestroy(stop);
  }
}

@Component({
  selector: 'ngmd-workflow',
  template: `
    <div
      class="[&_ngmd-step:not(:last-child)_.ngmd-step]:before:content-[''] [&_ngmd-step:not(:last-child)_.ngmd-step]:before:absolute [&_ngmd-step:not(:last-child)_.ngmd-step]:before:left-5 [&_ngmd-step:not(:last-child)_.ngmd-step]:before:top-11 [&_ngmd-step:not(:last-child)_.ngmd-step]:before:bottom-0 [&_ngmd-step:not(:last-child)_.ngmd-step]:before:w-px [&_ngmd-step:not(:last-child)_.ngmd-step]:before:bg-zinc-200 dark:[&_ngmd-step:not(:last-child)_.ngmd-step]:before:bg-zinc-800"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdWorkflow implements AfterContentInit, AfterViewInit {
  @ContentChildren(NgmdStep) private readonly steps!: QueryList<NgmdStep>;
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  ngAfterContentInit(): void {
    // Component-pages path: ContentChildren finds Angular instances
    // directly because the projected children are real Angular components
    // (no Custom Element boundary in the way).
    this.steps.forEach((step, i) => step.index.set(i));
  }

  ngAfterViewInit(): void {
    // Markdown path: child `<ngmd-step>` elements are Custom Elements that
    // ContentChildren can't see through. Walk the DOM and set
    // `data-step-index="N"` on each one; the step's MutationObserver picks
    // the new value up and updates its signal. Safe to run in both contexts:
    // for component pages this is a redundant attribute set that the step
    // ignores (its signal is already the right value).
    if (typeof document === 'undefined') return;
    const els = this.host.nativeElement.querySelectorAll<HTMLElement>('ngmd-step');
    els.forEach((el, i) => el.setAttribute('data-step-index', String(i)));
  }
}
