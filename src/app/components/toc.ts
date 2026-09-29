import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {Router} from '@angular/router';
import {onNavigation} from '../utils/enhance-on-navigation';
import {createSlugger} from '../utils/heading-slug';

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
                [href]="path() + '#' + h.id"
                (click)="scrollToHeading(h.id, $event)"
                class="block rounded px-2 -mx-2 py-0.5 text-zinc-500 dark:text-zinc-400 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-strong)] focus:outline-none focus-visible:outline-none"
                [class]="
                  isActive(h.id)
                    ? 'bg-[color:var(--accent-soft)]! text-[color:var(--accent-strong)]! font-medium'
                    : ''
                "
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
  readonly path = signal('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect((onCleanup) => {
      const id = this.active();
      if (!this.showActive() || !id) return;
      const frame = requestAnimationFrame(() => this.revealActive(id));
      onCleanup(() => cancelAnimationFrame(frame));
    });
  }

  private scrollBox(): HTMLElement | null {
    let box = this.host.nativeElement.parentElement;
    while (box && box !== document.body && !/auto|scroll/.test(getComputedStyle(box).overflowY)) {
      box = box.parentElement;
    }
    return box === document.body ? null : box;
  }

  private revealActive(id: string): void {
    const index = this.headings().findIndex((h) => h.id === id);
    const link = this.host.nativeElement.querySelectorAll('a')[index];
    const box = this.scrollBox();
    if (!link || !box) return;
    const linkRect = link.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const margin = 48;
    if (linkRect.top < boxRect.top + margin) {
      box.scrollTop -= boxRect.top + margin - linkRect.top;
    } else if (linkRect.bottom > boxRect.bottom - margin) {
      box.scrollTop += linkRect.bottom - (boxRect.bottom - margin);
    }
  }
  private nodes: HTMLElement[] = [];
  private pinned: string | null = null;
  private contentObserver?: MutationObserver;
  private retryTimer?: ReturnType<typeof setTimeout>;

  isActive(id: string): boolean {
    return this.showActive() && this.active() === id;
  }

  ngAfterViewInit(): void {
    this.scanWithRetry();
    onNavigation(this.router, this.destroyRef, () => {
      this.headings.set([]);
      this.nodes = [];
      this.active.set('');
      this.scrollBox()?.scrollTo({top: 0});
      this.scanWithRetry();
    });

    if (typeof window !== 'undefined') {
      const onScroll = () => this.updateActive();
      const unpin = () => (this.pinned = null);
      const inputs = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
      window.addEventListener('scroll', onScroll, {passive: true});
      inputs.forEach((type) => window.addEventListener(type, unpin, {passive: true}));
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        inputs.forEach((type) => window.removeEventListener(type, unpin));
      });
    }

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.retryTimer);
      this.contentObserver?.disconnect();
    });
  }

  scrollToHeading(id: string, event: MouseEvent): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
      this.pinned = id;
      this.active.set(id);
      // index.html has <base href="/">, so a relative `#frag` resolves to
      // `/#frag` and strips the path. Pass the full path explicitly.
      history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
    }
  }

  private scanWithRetry(): void {
    if (typeof document === 'undefined') return;
    // Reset any prior observer before scanning. Navigation churn would
    // otherwise leave a stale observer firing on the wrong route's <main>.
    this.contentObserver?.disconnect();
    clearTimeout(this.retryTimer);

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
      this.retryTimer = setTimeout(() => this.scanWithRetry(), 50);
      return;
    }
    this.contentObserver = new MutationObserver(() => {
      if (this.tryScan()) this.contentObserver?.disconnect();
    });
    this.contentObserver.observe(main, {childList: true, subtree: true});
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
    const slug = createSlugger();
    const nodes: HTMLElement[] = [];
    const result: Heading[] = [];
    for (const node of Array.from(content.querySelectorAll<HTMLElement>('h2, h3, h4, h5, h6'))) {
      const copy = node.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('ngmd-badge').forEach((badge) => badge.remove());
      const text = copy.textContent?.trim() ?? '';
      // Always overwrite the id with a clean slug so palette deep-links match.
      node.id = slug(text);
      const level = parseInt(node.tagName.substring(1), 10);
      if (level > 3) continue;
      nodes.push(node);
      result.push({id: node.id, text, level});
    }
    this.path.set(`${location.pathname}${location.search}`);
    this.headings.set(result);
    this.nodes = nodes;
    const hash = location.hash.slice(1);
    this.pinned = !hash ? nodes[0].id : nodes.some((node) => node.id === hash) ? hash : null;
    this.updateActive();
  }

  private updateActive(): void {
    const nodes = this.nodes;
    if (!this.showActive() || nodes.length === 0) return;
    if (this.pinned) {
      this.active.set(this.pinned);
      return;
    }
    const scrolled = window.innerHeight + window.scrollY;
    if (window.scrollY > 0 && scrolled >= document.documentElement.scrollHeight - 100) {
      this.active.set(nodes[nodes.length - 1].id);
      return;
    }
    const line = window.innerHeight * 0.3;
    let id = nodes[0].id;
    for (const node of nodes) {
      if (node.getBoundingClientRect().top > line) break;
      id = node.id;
    }
    this.active.set(id);
  }
}
