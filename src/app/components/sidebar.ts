import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Injectable,
  Injector,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {LucideDynamicIcon, LucideChevronDown} from '@lucide/angular';
import config from '../../ngmd.config';
import {BADGE_VARIANTS, type BadgeVariant} from '../../types/badge';
import {onNavigation} from '../utils/enhance-on-navigation';
import {RouteUrlService} from '../services/route-url/route-url.service';

@Injectable({providedIn: 'root'})
export class SidebarState {
  readonly openSections = signal<ReadonlySet<string>>(new Set(config.nav.map((s) => s.label)));

  toggle(label: string): void {
    this.openSections.update((set) => {
      const next = new Set(set);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  reveal(href: string): void {
    const section = config.nav.find((s) => s.items.some((i) => i.href === href));
    if (!section || this.openSections().has(section.label)) return;
    this.toggle(section.label);
  }
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon],
  template: `
    <nav aria-label="Documentation" class="flex flex-col gap-4 text-sm">
      @for (section of sections; track section.label) {
        <div>
          <button
            type="button"
            (click)="toggle(section.label)"
            class="flex w-full items-center justify-between rounded px-3 py-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300"
            [attr.aria-expanded]="isOpen(section.label)"
          >
            {{ section.label }}
            <svg
              [lucideIcon]="chevron"
              class="size-4 transition-transform"
              [class]="isOpen(section.label) ? '' : '-rotate-90'"
            ></svg>
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
export class Sidebar implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly state = inject(SidebarState);
  private readonly cleanUrl = inject(RouteUrlService).cleanUrl;

  readonly sections = config.nav;
  readonly chevron = LucideChevronDown;

  isOpen(label: string): boolean {
    return this.state.openSections().has(label);
  }

  toggle(label: string): void {
    this.state.toggle(label);
  }

  statusClass(status: BadgeVariant): string {
    return BADGE_VARIANTS[status];
  }

  ngAfterViewInit(): void {
    // Scroll the active row into view on initial mount and after every
    // navigation. Matters most on the mobile drawer (long sections push
    // the current page well below the fold) and on long Stack sections
    // in the desktop sidebar.
    this.scrollActiveIntoView();
    onNavigation(this.router, this.destroyRef, () => this.scrollActiveIntoView());
  }

  private scrollActiveIntoView(): void {
    if (typeof document === 'undefined') return;
    this.state.reveal(this.cleanUrl());
    afterNextRender(() => this.scrollToActive(), {injector: this.injector});
  }

  private scrollToActive(): void {
    const active = this.host.nativeElement.querySelector<HTMLElement>('a[aria-current="page"]');
    active?.scrollIntoView({block: 'nearest', behavior: 'instant'});
  }
}
