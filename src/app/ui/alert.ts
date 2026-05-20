import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type AlertSeverity = 'info' | 'warning' | 'critical' | 'helpful' | 'important';

const BOX = 'my-5 px-4 py-3 rounded-r-md border-l-[3px] bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0';

@Component({
  selector: 'ngmd-alert',
  imports: [NgTemplateOutlet],
  template: `
    @switch (severity()) {
      @case ('warning') {
        <div [class]="box + ' border-l-amber-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @case ('critical') {
        <div [class]="box + ' border-l-red-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @case ('helpful') {
        <div [class]="box + ' border-l-teal-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @case ('important') {
        <div [class]="box + ' border-l-purple-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      @default {
        <div [class]="box + ' border-l-blue-500'">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
    }

    <ng-template #body><ng-content></ng-content></ng-template>
  `,
})
export class NgmdAlert {
  readonly severity = input<AlertSeverity>('info');
  protected readonly box = BOX;
}
