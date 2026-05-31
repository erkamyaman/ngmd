import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LucideAngularModule, ChevronRight, House} from 'lucide-angular';
import {RouteUrlService} from '../services/route-url/route-url.service';

interface Crumb {
  label: string;
  href: string;
}

const LABELS: Record<string, string> = {
  '': 'Home',
  welcome: 'Introduction',
  'getting-started': 'Getting Started',
  installation: 'Installation',
  'quick-start': 'Quick Start',
  introduction: 'Introduction',
  about: 'About & Credits',
  concepts: 'Core Concepts',
  'markdown-routes': 'Markdown Routes',
  theming: 'Theming',
  components: 'Components',
};

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, LucideAngularModule],
  template: `
    @if (crumbs().length > 0) {
      <nav
        class="flex items-center gap-1.5 px-6 py-3 text-sm border-b border-zinc-200 dark:border-zinc-800"
      >
        <a routerLink="/" class="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          <i-lucide [img]="home" class="size-4"></i-lucide>
        </a>
        @for (crumb of crumbs(); track crumb.href; let last = $last) {
          <i-lucide [img]="chevron" class="size-3.5 text-zinc-400"></i-lucide>
          @if (last) {
            <span class="font-medium">{{ crumb.label }}</span>
          } @else {
            <span class="text-zinc-500">{{ crumb.label }}</span>
          }
        }
      </nav>
    }
  `,
})
export class Breadcrumb {
  private readonly cleanUrl = inject(RouteUrlService).cleanUrl;
  readonly home = House;
  readonly chevron = ChevronRight;

  readonly crumbs = computed<Crumb[]>(() => {
    const segments = this.cleanUrl()
      .split('/')
      .filter((s) => s.length > 0);
    return segments.map((segment, i) => ({
      label: LABELS[segment] ?? this.humanize(segment),
      href: '/' + segments.slice(0, i + 1).join('/'),
    }));
  });

  private humanize(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
