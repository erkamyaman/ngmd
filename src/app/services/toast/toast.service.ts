import {Injectable, signal, type Signal} from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  /** ms before auto-dismiss. `0` keeps the toast until the user clicks
   * the close icon. The `Toaster` component owns the actual timer so it
   * can play the exit animation before removing the entry. */
  duration: number;
}

const DEFAULT_DURATION = 3000;

/**
 * Minimal toast queue. Components call `success` / `error` / `info` and
 * the `Toaster` component picks them up via the `toasts` signal, schedules
 * auto-dismiss, and runs the slide-out animation.
 *
 * Service stays as a dumb queue. UI concerns (timing, animation) live in
 * the component. Service is SSR-safe by construction — no platform checks
 * or timers.
 */
@Injectable({providedIn: 'root'})
export class ToastService {
  private readonly state = signal<Toast[]>([]);
  private nextId = 0;

  /** Currently visible toasts, newest first. */
  readonly toasts: Signal<Toast[]> = this.state.asReadonly();

  show(message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION): number {
    const id = ++this.nextId;
    this.state.update((items) => [{id, message, variant, duration}, ...items]);
    return id;
  }

  success(message: string, duration?: number): number {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): number {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): number {
    return this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    this.state.update((items) => items.filter((t) => t.id !== id));
  }

  clear(): void {
    this.state.set([]);
  }
}
