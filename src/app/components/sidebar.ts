import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import config from '../../ngmd.config';

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
                    [routerLinkActiveOptions]="{ exact: true }"
                    class="block rounded-md px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-strong)] focus:outline-none focus-visible:outline-none"
                  >
                    {{ item.label }}
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
  private readonly openSections = signal<Set<string>>(
    new Set(config.nav.map((s) => s.label)),
  );

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
}
