import {
  AfterContentInit,
  Component,
  ContentChildren,
  input,
  QueryList,
  signal,
} from '@angular/core';

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
          <h3 class="text-lg font-semibold mt-1.5 mb-2 text-zinc-900 dark:text-zinc-100">{{ title() }}</h3>
        }
        <div class="text-zinc-700 dark:text-zinc-300 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class NgmdStep {
  readonly title = input<string>('');
  readonly index = signal(0);
}

@Component({
  selector: 'ngmd-workflow',
  template: `
    <div
      class="my-8 [&_.ngmd-step:not(:last-child)]:before:content-[''] [&_.ngmd-step:not(:last-child)]:before:absolute [&_.ngmd-step:not(:last-child)]:before:left-5 [&_.ngmd-step:not(:last-child)]:before:top-11 [&_.ngmd-step:not(:last-child)]:before:bottom-0 [&_.ngmd-step:not(:last-child)]:before:w-px [&_.ngmd-step:not(:last-child)]:before:bg-zinc-200 dark:[&_.ngmd-step:not(:last-child)]:before:bg-zinc-800"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class NgmdWorkflow implements AfterContentInit {
  @ContentChildren(NgmdStep) private readonly steps!: QueryList<NgmdStep>;

  ngAfterContentInit(): void {
    this.steps.forEach((step, i) => step.index.set(i));
  }
}
