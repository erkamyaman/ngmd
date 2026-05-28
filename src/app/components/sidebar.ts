import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {LucideAngularModule, ChevronDown} from 'lucide-angular';
import config from '../../ngmd.config';
import {pageMeta} from 'virtual:ngmd/page-meta';
import {BADGE_VARIANTS, type PageStatus} from '../../types/badge';

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
                    class="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-strong)] focus:outline-none focus-visible:outline-none"
                  >
                    <span class="min-w-0 truncate">{{ item.label }}</span>
                    @if (statusFor(item.href); as status) {
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
  readonly sections = config.nav;
  readonly chevron = ChevronDown;
  private readonly openSections = signal<Set<string>>(new Set(config.nav.map((s) => s.label)));

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

  /** Pulls the lifecycle status from the page's frontmatter via the
   * build-time `virtual:ngmd/page-meta` map. Returns undefined when the
   * page either has no entry or doesn't declare a status. */
  statusFor(href: string): PageStatus | undefined {
    return pageMeta[href]?.status;
  }

  statusClass(status: PageStatus): string {
    return BADGE_VARIANTS[status];
  }
}
