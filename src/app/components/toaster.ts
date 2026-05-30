import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {PLATFORM_ID} from '@angular/core';
import {LucideAngularModule, CheckCircle2, AlertCircle, Info, X} from 'lucide-angular';
import {ToastService, type Toast} from '../services/toast/toast.service';

/** ms the slide-out keyframes take. Matches `ngmd-toast-slide-out` in
 * `styles.css`. Toasts dwell `duration` ms, then play the exit animation
 * for this long before the service entry is removed. */
const EXIT_MS = 220;

/**
 * Renders the toast stack from `ToastService`. Mounted once at the app root;
 * everything else just calls `toastService.success/error/info()`.
 *
 * Position: fixed top-right, newest on top. The service is a plain queue;
 * this component owns auto-dismiss timing and the slide-out animation so
 * exits don't snap out of view.
 */
@Component({
  selector: 'app-toaster',
  imports: [LucideAngularModule],
  template: `
    @if (toasts().length) {
      <div
        class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[min(90vw,24rem)] pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        @for (t of toasts(); track t.id) {
          <div
            role="status"
            class="pointer-events-auto flex items-center gap-2.5 rounded-lg border bg-white dark:bg-zinc-950 px-3 py-2.5 shadow-md text-sm"
            [class]="variantClass(t.variant) + ' ' + animClass(t.id)"
          >
            <i-lucide [img]="iconFor(t.variant)" class="size-4 shrink-0"></i-lucide>
            <span class="flex-1 text-zinc-700 dark:text-zinc-200 leading-snug">{{
              t.message
            }}</span>
            <button
              type="button"
              (click)="requestDismiss(t.id)"
              class="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Dismiss"
            >
              <i-lucide [img]="closeIcon" class="size-3.5"></i-lucide>
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class Toaster {
  private readonly toastService = inject(ToastService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly toasts = this.toastService.toasts;

  protected readonly closeIcon = X;
  private readonly successIcon = CheckCircle2;
  private readonly errorIcon = AlertCircle;
  private readonly infoIcon = Info;

  /** Ids currently animating out. Used to swap in the slide-out class
   * before the service entry is actually removed. */
  private readonly leaving = signal<Set<number>>(new Set());
  /** Ids we've already scheduled an auto-dismiss for, so the effect that
   * watches `toasts()` doesn't double-schedule on resubscription. */
  private readonly scheduled = new Set<number>();
  private readonly dismissTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly removeTimers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        for (const t of this.toasts()) {
          if (this.scheduled.has(t.id) || t.duration <= 0) continue;
          this.scheduled.add(t.id);
          const handle = setTimeout(() => this.requestDismiss(t.id), t.duration);
          this.dismissTimers.set(t.id, handle);
        }
      });
    }

    inject(DestroyRef).onDestroy(() => {
      for (const h of this.dismissTimers.values()) clearTimeout(h);
      for (const h of this.removeTimers.values()) clearTimeout(h);
      this.dismissTimers.clear();
      this.removeTimers.clear();
    });
  }

  /** Begin the slide-out: mark the toast leaving, then ask the service to
   * actually drop it once the animation has played. Idempotent — repeat
   * calls (X-click during auto-dismiss countdown, etc.) are absorbed. */
  protected requestDismiss(id: number): void {
    if (this.leaving().has(id)) return;
    const dismissHandle = this.dismissTimers.get(id);
    if (dismissHandle != null) {
      clearTimeout(dismissHandle);
      this.dismissTimers.delete(id);
    }
    this.leaving.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
    const removeHandle = setTimeout(() => {
      this.toastService.dismiss(id);
      this.leaving.update((set) => {
        const next = new Set(set);
        next.delete(id);
        return next;
      });
      this.scheduled.delete(id);
      this.removeTimers.delete(id);
    }, EXIT_MS);
    this.removeTimers.set(id, removeHandle);
  }

  protected iconFor(variant: Toast['variant']) {
    return variant === 'success'
      ? this.successIcon
      : variant === 'error'
        ? this.errorIcon
        : this.infoIcon;
  }

  protected variantClass(variant: Toast['variant']): string {
    switch (variant) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-500/30 [&_i-lucide:first-of-type]:text-emerald-500';
      case 'error':
        return 'border-red-200 dark:border-red-500/30 [&_i-lucide:first-of-type]:text-red-500';
      default:
        return 'border-zinc-200 dark:border-zinc-800 [&_i-lucide:first-of-type]:text-sky-500';
    }
  }

  protected animClass(id: number): string {
    return this.leaving().has(id) ? 'ngmd-toast-slide-out' : 'ngmd-toast-slide';
  }
}
