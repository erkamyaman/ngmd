import {Component, DestroyRef, HostListener, computed, inject, signal} from '@angular/core';
import {
  LucideAngularModule,
  ChevronDown,
  Check,
  Copy,
  Link,
  Github,
  Sparkles,
  MessageSquare,
} from 'lucide-angular';
import {pageMeta} from 'virtual:ngmd/page-meta';
import {ToastService} from '../services/toast/toast.service';
import {RouteUrlService} from '../services/route-url/route-url.service';
import {writeToClipboard} from '../utils/clipboard';

interface MenuItem {
  label: string;
  icon: typeof Copy;
  /** Either a click handler or a target URL — drives the `<button>` vs
   * `<a>` rendering and what action fires. Return value is ignored; the
   * loose typing accommodates handlers that report success via boolean. */
  handler?: () => void | Promise<unknown>;
  href?: string;
}

/**
 * "Copy Markdown" dropdown that gives readers + LLM agents one-click access
 * to the page's raw source. Sits in the page header on every prose route,
 * next to the existing edit / view-source icons.
 *
 * Five actions:
 *   - Copy Markdown        → clipboard, the page body (fetched from the
 *                            `.md` permalink served by `raw-md.plugin.ts`)
 *   - Copy Markdown Link   → clipboard, the same URL
 *   - Open in GitHub       → editUrl from page-meta
 *   - Open in ChatGPT      → chatgpt.com prompt with the `.md` URL
 *   - Open in Claude       → claude.ai prompt with the `.md` URL
 *
 * Pattern lifted from react.dev / PrimeNG docs so agents that follow links
 * land on raw markdown instead of compiled HTML.
 */
@Component({
  selector: 'app-llm-actions',
  imports: [LucideAngularModule],
  template: `
    @if (hasMdSource()) {
      <div class="relative">
        <div
          class="inline-flex items-stretch rounded border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs text-zinc-600 dark:text-zinc-300"
        >
          <button
            type="button"
            (click)="copyMarkdownAction($event)"
            class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 min-w-[7.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            [attr.aria-label]="copied() ? 'Markdown copied' : 'Copy markdown to clipboard'"
          >
            <i-lucide
              [img]="copied() ? checkIcon : copyIcon"
              class="size-3.5"
              [class.text-emerald-500]="copied()"
            ></i-lucide>
            <span>{{ copied() ? 'Copied!' : 'Copy Markdown' }}</span>
          </button>
          <button
            type="button"
            (click)="toggle($event)"
            class="inline-flex items-center px-1.5 border-l border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            [attr.aria-expanded]="open()"
            aria-haspopup="menu"
            aria-label="Show more actions"
          >
            <i-lucide
              [img]="chevronIcon"
              class="size-3.5 transition-transform"
              [class.rotate-180]="open()"
            ></i-lucide>
          </button>
        </div>
        @if (open()) {
          <div
            role="menu"
            (click)="$event.stopPropagation()"
            class="absolute right-0 mt-1 z-20 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg overflow-hidden text-sm"
          >
            @for (item of items(); track item.label) {
              @if (item.href) {
                <a
                  role="menuitem"
                  [href]="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  (click)="close()"
                >
                  <i-lucide [img]="item.icon" class="size-4 text-zinc-500"></i-lucide>
                  {{ item.label }}
                </a>
              } @else {
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  (click)="runAndClose(item.handler!)"
                >
                  <i-lucide [img]="item.icon" class="size-4 text-zinc-500"></i-lucide>
                  {{ item.label }}
                </button>
              }
            }
          </div>
        }
      </div>
    }
  `,
})
export class LlmActions {
  private readonly toast = inject(ToastService);
  private readonly cleanUrl = inject(RouteUrlService).cleanUrl;
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Belt-and-braces: if the user navigates away mid-flash, kill the
    // pending setTimeout so we don't tick a signal on a destroyed component.
    inject(DestroyRef).onDestroy(() => this.clearCopiedTimer());
  }

  private clearCopiedTimer(): void {
    if (this.copiedTimer != null) {
      clearTimeout(this.copiedTimer);
      this.copiedTimer = null;
    }
  }

  readonly copyIcon = Copy;
  readonly checkIcon = Check;
  readonly chevronIcon = ChevronDown;
  readonly linkIcon = Link;
  readonly githubIcon = Github;
  readonly chatGptIcon = Sparkles;
  readonly claudeIcon = MessageSquare;

  readonly open = signal(false);
  readonly copied = signal(false);

  protected readonly editUrl = computed(() => pageMeta[this.cleanUrl()]?.editUrl ?? '');

  /** True only for routes whose source is a `.md` file under `src/content/`.
   * Routes backed by `.page.ts` (the home `index.page.ts`, the catch-all,
   * the components reference page) don't have a corresponding raw markdown
   * source, so the dropdown hides itself to avoid leading the user to a
   * dead `.md` URL. */
  protected readonly hasMdSource = computed(() => {
    const edit = this.editUrl();
    return !!edit && /\/src\/content\/.+\.md$/.test(edit);
  });

  /** Permalink to the raw `.md`. Built from the current pathname + `.md`,
   * served by `raw-md.plugin.ts` in dev and emitted as a static asset in
   * production. Absolute (with origin) so LLM URLs are shareable. */
  protected readonly mdUrl = computed(() => {
    const path = this.cleanUrl();
    if (typeof window === 'undefined') return `${path}.md`;
    return `${window.location.origin}${path}.md`;
  });

  private prompt(): string {
    return `Please read this NgMd documentation page and help me with it: ${this.mdUrl()}`;
  }

  protected readonly items = computed<MenuItem[]>(() => [
    {label: 'Copy Markdown Link', icon: this.linkIcon, handler: () => this.copyLinkAction()},
    {label: 'Open in GitHub', icon: this.githubIcon, href: this.editUrl()},
    {
      label: 'Open in ChatGPT',
      icon: this.chatGptIcon,
      href: `https://chatgpt.com/?q=${encodeURIComponent(this.prompt())}`,
    },
    {
      label: 'Open in Claude',
      icon: this.claudeIcon,
      href: `https://claude.ai/new?q=${encodeURIComponent(this.prompt())}`,
    },
  ]);

  toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  /** Main split-button action: copies the markdown directly and flashes a
   * 1.5s "Copied!" confirmation in place of the label. Only flashes when
   * the underlying fetch + clipboard write succeed. Also closes the
   * dropdown if it happened to be open — matches the behaviour of items
   * inside the menu. */
  async copyMarkdownAction(event: Event): Promise<void> {
    event.stopPropagation();
    this.close();
    const ok = await this.copyMarkdown();
    if (!ok) {
      this.toast.error('Could not copy markdown.');
      return;
    }
    this.copied.set(true);
    this.clearCopiedTimer();
    this.copiedTimer = setTimeout(() => this.copied.set(false), 1500);
  }

  close(): void {
    this.open.set(false);
  }

  async runAndClose(fn: () => void | Promise<unknown>): Promise<void> {
    try {
      await fn();
    } finally {
      this.close();
    }
  }

  @HostListener('document:click') onDocClick(): void {
    if (this.open()) this.close();
  }

  @HostListener('document:keydown.escape') onEsc(): void {
    if (this.open()) this.close();
  }

  private async copyMarkdown(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch(this.mdUrl());
      if (!res.ok) return false;
      return writeToClipboard(await res.text());
    } catch {
      return false;
    }
  }

  private async copyLink(): Promise<boolean> {
    return writeToClipboard(this.mdUrl());
  }

  private async copyLinkAction(): Promise<void> {
    const ok = await this.copyLink();
    if (ok) this.toast.success('Link copied to clipboard.');
    else this.toast.error('Could not copy link.');
  }
}
