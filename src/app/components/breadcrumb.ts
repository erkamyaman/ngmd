import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LucideDynamicIcon, LucideChevronRight, LucideHouse} from '@lucide/angular';
import {navItems} from '../../ngmd.config';
import {RouteUrlService} from '../services/route-url/route-url.service';

interface Crumb {
  label: string;
  href: string;
}

export function crumbLabel(href: string): string | null {
  const item = navItems.find((n) => n.href === href);
  if (item) return item.label;
  const sections = new Set(
    navItems.filter((n) => n.href.startsWith(href + '/')).map((n) => n.section),
  );
  return sections.size === 1 ? [...sections][0] : null;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, LucideDynamicIcon],
  template: `
    @if (crumbs().length > 0) {
      <nav
        aria-label="Breadcrumb"
        class="px-6 py-3 text-sm border-b border-zinc-200 dark:border-zinc-800"
      >
        <ol class="flex flex-wrap items-center gap-1.5">
          <li class="flex">
            <a
              routerLink="/"
              aria-label="Home"
              class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              <svg [lucideIcon]="home" class="size-4"></svg>
            </a>
          </li>
          @for (crumb of crumbs(); track crumb.href; let last = $last) {
            <li class="flex items-center gap-1.5">
              <svg [lucideIcon]="chevron" class="size-3.5 text-zinc-400"></svg>
              @if (last) {
                <span class="font-medium" aria-current="page">{{ crumb.label }}</span>
              } @else {
                <span class="text-zinc-500 dark:text-zinc-400">{{ crumb.label }}</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class Breadcrumb {
  private readonly cleanUrl = inject(RouteUrlService).cleanUrl;
  readonly home = LucideHouse;
  readonly chevron = LucideChevronRight;

  readonly crumbs = computed<Crumb[]>(() => {
    const segments = this.cleanUrl()
      .split('/')
      .filter((s) => s.length > 0);
    return segments.map((segment, i) => {
      const href = '/' + segments.slice(0, i + 1).join('/');
      return {href, label: crumbLabel(href) ?? this.humanize(segment)};
    });
  });

  private humanize(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
