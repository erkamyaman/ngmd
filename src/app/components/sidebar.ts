import {Component, DestroyRef, ElementRef, afterNextRender, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {LucideAngularModule, ChevronDown} from 'lucide-angular';
import config from '../../ngmd.config';
import {BADGE_VARIANTS, type BadgeVariant} from '../../types/badge';
import {onNavigation} from '../utils/enhance-on-navigation';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <nav class="flex flex-col gap-4 text-sm">
      @for (section of sections; track section.label) {
        <div>
          <button
            type="button"
            (click)="toggle(section.label)"
            class="flex w-full items-center justify-between rounded px-3 py-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300"
            [attr.aria-expanded]="isOpen(section.label)"
          >
            {{ section.label }}
            <i-lucide
              [img]="chevron"
              class="size-4 transition-transform"
              [class.-rotate-90]="!isOpen(section.label)"
            ></i-lucide>
          </button>
          @if (isOpen(section.label)) {
            <ul class="mt-1 flex flex-col gap-1">
              @for (item of section.items; track item.href) {
                <li>
                  <a
                    [routerLink]="item.href"
                    routerLinkActive="bg-[color:var(--accent-soft)]! text-[color:var(--accent-strong)]! font-medium"
                    [routerLinkActiveOptions]="{exact: true}"
                    ariaCurrentWhenActive="page"
                    class="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-strong)] focus:outline-none focus-visible:outline-2 focus-visible:outline focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--accent)]"
                  >
                    <span class="min-w-0 truncate">{{ item.label }}</span>
                    @if (item.status; as status) {
                      <span
                        class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider"
                        [class]="statusClass(status)"
                        >{{ status }}</span
                      >
                    }
                  </a>
                </li>
              }
            </ul>
          }
        </div>
      }
    </nav>
  `,
})
export class Sidebar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly sections = config.nav;
  readonly chevron = ChevronDown;
  private readonly openSections = signal<Set<string>>(new Set(config.nav.map((s) => s.label)));

  constructor() {
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Scroll the active row into view on initial mount and after every
      // navigation. Matters most on the mobile drawer (long sections push
      // the current page well below the fold) and on long Stack sections
      // in the desktop sidebar. `afterNextRender` fires only in the
      // browser so the helper is free of `typeof document` guards.
      this.scrollActiveIntoView();
      onNavigation(router, destroyRef, () => {
        // `routerLinkActive` updates synchronously on NavigationEnd, so
        // the class is already on the link by the time we read it.
        this.scrollActiveIntoView();
      });
    });
  }

  isOpen(label: string): boolean {
    return this.openSections().has(label);
  }

  toggle(label: string): void {
    this.openSections.update((set) => {
      const next = new Set(set);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  statusClass(status: BadgeVariant): string {
    return BADGE_VARIANTS[status];
  }

  private scrollActiveIntoView(): void {
    const active = this.host.nativeElement.querySelector<HTMLElement>('a[aria-current="page"]');
    active?.scrollIntoView({block: 'nearest', behavior: 'instant'});
  }
}
