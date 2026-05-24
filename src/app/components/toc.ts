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
                class="block rounded px-2 -mx-2 py-0.5 text-zinc-500 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-strong)] focus:outline-none focus-visible:outline-none"
                [class]="isActive(h.id) ? 'bg-[color:var(--accent-soft)]! text-[color:var(--accent-strong)]! font-medium' : ''"
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
  private contentObserver?: MutationObserver;

  isActive(id: string): boolean {
    return this.showActive() && this.active() === id;
  }

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
    this.destroyRef.onDestroy(() => this.contentObserver?.disconnect());
  }

  scrollToHeading(id: string, event: MouseEvent): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Force-activate the clicked id. The IntersectionObserver uses a
      // `rootMargin: '0px 0px -70% 0px'` so only the top 30% of viewport
      // counts as "in view"; the LAST heading can't reach that region if
      // there isn't enough content below it, leaving scroll-spy stuck on
      // an earlier heading. Setting active directly here bypasses that.
      this.active.set(id);
      // index.html has <base href="/">, so a relative `#frag` resolves to
      // `/#frag` and strips the path. Pass the full path explicitly.
      history.replaceState(
        null,
        '',
        `${location.pathname}${location.search}#${id}`,
      );
    }
  }

  private scanWithRetry(): void {
    if (typeof document === 'undefined') return;
    // Reset any prior observer before scanning. Navigation churn would
    // otherwise leave a stale observer firing on the wrong route's <main>.
    this.contentObserver?.disconnect();

    // TS-driven pages render synchronously: the headings are in the DOM
    // by the time AfterViewInit fires. Try once, succeed immediately.
    if (this.tryScan()) return;

    // Markdown routes resolve asynchronously through the catch-all:
    // route → injectContent observable → fetch + parse → analog-markdown
    // renders. The old 20×50ms polling window timed out on slow first loads.
    // MutationObserver instead waits for the actual content insertion, then
    // disconnects itself once h2/h3 nodes appear.
    const main = document.querySelector('main');
    if (!main) {
      // <main> not in DOM yet (very early in the lifecycle). One micro-delay
      // and we'll find it.
      setTimeout(() => this.scanWithRetry(), 50);
      return;
    }
    this.contentObserver = new MutationObserver(() => {
      if (this.tryScan()) this.contentObserver?.disconnect();
    });
    this.contentObserver.observe(main, { childList: true, subtree: true });
  }

  private tryScan(): boolean {
    // Prefer the markdown wrappers for content-driven pages; fall back to
    // `main article` for TS-driven pages (components.page.ts, etc.) that
    // render Angular templates directly without analog-markdown.
    const content =
      document.querySelector('main analog-markdown') ??
      document.querySelector('main analog-markdown-route') ??
      document.querySelector('main article');
    if (!content || content.querySelectorAll('h2, h3').length === 0) {
      return false;
    }
    this.scan(content);
    return true;
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

    // Bottom-of-page guard: when the user scrolls within ~100px of the
    // bottom of the document, force-activate the last heading. The
    // IntersectionObserver alone can't reach this state because the last
    // heading never enters the top 30% of the viewport if there's not
    // enough content below it.
    const last = nodes[nodes.length - 1];
    const onScroll = () => {
      const scrolled = window.innerHeight + window.scrollY;
      const fullHeight = document.documentElement.scrollHeight;
      if (scrolled >= fullHeight - 100) {
        this.active.set(last.id);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() =>
      window.removeEventListener('scroll', onScroll),
    );
  }
}
