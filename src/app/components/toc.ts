import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface Heading {
  id: string;
  text: string;
  level: number;
}

@Component({
  selector: 'app-toc',
  template: `
    @if (headings().length > 0) {
      <nav class="text-sm">
        <ul class="flex flex-col gap-2">
          @for (h of headings(); track h.id) {
            <li [style.padding-left.rem]="(h.level - 2) * 0.75">
              <a
                [href]="'#' + h.id"
                (click)="scrollToHeading(h.id, $event)"
                class="block text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                [class.text-fuchsia-700]="showActive() && active() === h.id"
                [class.dark:text-fuchsia-300]="showActive() && active() === h.id"
                [class.font-medium]="showActive() && active() === h.id"
              >
                {{ h.text }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class Toc implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly showActive = input<boolean>(true);
  readonly headings = signal<Heading[]>([]);
  readonly active = signal<string>('');
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.scanWithRetry();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.headings.set([]);
        this.scanWithRetry();
      });
  }

  scrollToHeading(id: string, event: MouseEvent): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // index.html has <base href="/">, so a relative `#frag` resolves to
      // `/#frag` and strips the path. Pass the full path explicitly.
      history.replaceState(
        null,
        '',
        `${location.pathname}${location.search}#${id}`,
      );
    }
  }

  private scanWithRetry(attempt = 0): void {
    if (typeof document === 'undefined' || attempt > 20) return;
    const content =
      document.querySelector('main analog-markdown') ??
      document.querySelector('main analog-markdown-route');
    if (!content || content.querySelectorAll('h2, h3').length === 0) {
      setTimeout(() => this.scanWithRetry(attempt + 1), 50);
      return;
    }
    this.scan(content);
  }

  private scan(content: Element): void {
    const nodes = Array.from(content.querySelectorAll('h2, h3'));
    const result: Heading[] = nodes.map((node) => {
      const text = node.textContent?.trim() ?? '';
      // Always overwrite the id with a clean slug so palette deep-links match.
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      node.id = id;
      return {
        id,
        text,
        level: parseInt(node.tagName.substring(1), 10),
      };
    });
    this.headings.set(result);
    this.setupObserver(nodes as HTMLElement[]);
  }

  private setupObserver(nodes: HTMLElement[]): void {
    this.observer?.disconnect();
    if (nodes.length === 0) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.active.set(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );
    nodes.forEach((node) => this.observer!.observe(node));
  }
}
