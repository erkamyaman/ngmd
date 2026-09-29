import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {
  LucideDynamicIcon,
  LucideMenu,
  LucideMoon,
  LucideSearch,
  LucideSun,
  LucideSunMoon,
  LucideX,
} from '@lucide/angular';
import {GithubIcon} from './ui/github-icon';
import {DiscordIcon} from './ui/discord-icon';
import {ThemeService} from './theme';
import {LayoutMode} from './layout-mode.service';
import {RouteUrlService} from './services/route-url/route-url.service';
import {onNavigation} from './utils/enhance-on-navigation';
import siteConfig from '../ngmd.config';
import {CommandPalette} from './components/command-palette';
import {Sidebar} from './components/sidebar';
import {Breadcrumb} from './components/breadcrumb';
import {Toc} from './components/toc';
import {CodeCopy} from './components/code-copy';
import {ExternalLinks} from './components/external-links';
import {HeadingAnchors} from './components/heading-anchors';
import {CodeGroup} from './components/code-group';
import {PageFooter} from './components/page-footer';
import {SourceActions} from './components/source-actions';
import {MediaEnhancer} from './components/media-enhancer';
import {SiteFooter} from './components/site-footer';
import {Toaster} from './components/toaster';
import {VersionSwitcher} from './components/version-switcher';
import {ContentBanners} from './components/content-banners';

@Component({
  selector: 'app-root',
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  imports: [
    RouterLink,
    RouterOutlet,
    LucideDynamicIcon,
    GithubIcon,
    DiscordIcon,
    CommandPalette,
    Sidebar,
    Breadcrumb,
    Toc,
    CodeCopy,
    ExternalLinks,
    HeadingAnchors,
    CodeGroup,
    MediaEnhancer,
    PageFooter,
    SourceActions,
    SiteFooter,
    Toaster,
    VersionSwitcher,
    ContentBanners,
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <header
        class="sticky top-0 z-30 flex items-center gap-2 sm:gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm px-4 py-3"
      >
        @if (showSidebar()) {
          <button
            #menuButton
            type="button"
            (click)="toggleDrawer()"
            class="lg:hidden rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            [attr.aria-label]="drawerOpen() ? 'Close menu' : 'Open menu'"
          >
            <svg [lucideIcon]="drawerOpen() ? closeIcon : menuIcon" class="size-5"></svg>
          </button>
        }

        <a
          routerLink="/"
          class="flex items-center gap-2 text-lg font-bold tracking-tight font-[Geist_Mono,ui-monospace,monospace]"
        >
          <img
            src="/logo-mark.svg"
            alt=""
            class="size-[34px] text-zinc-900 dark:text-zinc-50"
            aria-hidden="true"
          />
          {{ siteName }}
        </a>

        @if (headerNav.length > 0) {
          <nav aria-label="Main" class="hidden sm:flex items-center gap-1 text-sm">
            @for (item of headerNav; track item.href) {
              @if (isExternal(item.href)) {
                <a
                  [href]="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {{ item.label }}
                </a>
              } @else {
                <a
                  [routerLink]="item.href"
                  class="rounded px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {{ item.label }}
                </a>
              }
            }
          </nav>
        }

        <div class="ml-auto flex items-center gap-1 sm:gap-2">
          <app-version-switcher></app-version-switcher>
          <button
            type="button"
            (click)="palette.toggle()"
            class="hidden lg:inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-56"
          >
            <svg [lucideIcon]="searchIcon" class="size-4"></svg>
            <span class="flex-1 text-left">Search documentation...</span>
            <span class="flex items-center gap-0.5">
              <kbd
                class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1 text-xs font-medium"
              >
                ⌘
              </kbd>
              <kbd
                class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1 text-xs font-medium"
              >
                K
              </kbd>
            </span>
          </button>
          <button
            type="button"
            (click)="palette.toggle()"
            class="lg:hidden rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Search"
          >
            <svg [lucideIcon]="searchIcon" class="size-5"></svg>
          </button>
          <span class="hidden sm:block h-4 w-px bg-zinc-300/60 dark:bg-zinc-700/60"></span>
          <a
            [href]="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="GitHub"
          >
            <svg ngmdGithubIcon class="size-5"></svg>
          </a>
          @if (discordUrl) {
            <a
              [href]="discordUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Discord"
            >
              <svg ngmdDiscordIcon class="size-5"></svg>
            </a>
          }
          <span class="hidden sm:block h-4 w-px bg-zinc-300/60 dark:bg-zinc-700/60"></span>
          <button
            type="button"
            (click)="theme.cycle()"
            class="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            [attr.aria-label]="'Theme: ' + theme.mode()"
            [title]="'Theme: ' + theme.mode()"
          >
            <svg
              [lucideIcon]="
                theme.mode() === 'light' ? sunIcon : theme.mode() === 'dark' ? moonIcon : autoIcon
              "
              class="size-5"
            ></svg>
          </button>
        </div>
      </header>

      <div class="flex flex-1">
        @if (showSidebar()) {
          <aside
            aria-label="Sidebar"
            class="ngmd-scroll-track-mini hidden lg:flex w-64 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto sticky top-[57px] self-start h-[calc(100vh-57px)]"
          >
            <app-sidebar />
          </aside>

          <!-- Mobile drawer. Always mounted so its slide-in / slide-out
               animation has something to transition against; pointer-events
               and visibility flip off when closed so it can't intercept
               touches while hidden. -->
          <div
            class="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
            [class.opacity-0]="!drawerOpen()"
            [class.opacity-100]="drawerOpen()"
            [class.pointer-events-none]="!drawerOpen()"
            (click)="closeDrawer()"
            aria-hidden="true"
          ></div>
          <aside
            #drawer
            aria-label="Documentation menu"
            class="lg:hidden fixed left-0 top-[57px] bottom-0 z-40 w-64 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transform transition-transform duration-200 ease-out"
            [class.-translate-x-full]="!drawerOpen()"
            [class.translate-x-0]="drawerOpen()"
            [attr.aria-hidden]="!drawerOpen()"
            [attr.inert]="!drawerOpen() ? '' : null"
          >
            <app-sidebar />
          </aside>
        }

        <main class="flex-1 min-w-0 flex flex-col">
          <div class="flex-1">
            @if (showBreadcrumb()) {
              <app-breadcrumb />
            }
            @if (showFooter()) {
              <app-source-actions />
              <app-content-banners class="block mx-auto max-w-3xl px-4 sm:px-8" />
            }
            @if (showToc()) {
              <details
                #tocDetails
                class="xl:hidden mx-4 sm:mx-6 mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group"
              >
                <summary
                  class="flex items-center justify-between cursor-pointer list-none px-4 py-2.5 text-sm font-semibold"
                >
                  On this page
                  <span class="text-zinc-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div class="px-4 pb-4" (click)="tocDetails.open = false">
                  <app-toc [showActive]="false" />
                </div>
              </details>
            }
            <router-outlet />
            @if (showFooter()) {
              <div class="mx-auto max-w-3xl px-4 sm:px-8">
                <app-page-footer />
              </div>
            }
          </div>
          <app-site-footer />
        </main>

        @if (showToc()) {
          <aside
            aria-label="On this page"
            class="ngmd-scroll-track-mini hidden xl:block w-56 shrink-0 border-l border-zinc-200 dark:border-zinc-800 p-6 sticky top-[57px] self-start max-h-[calc(100vh-57px)] overflow-y-auto"
          >
            <p class="mb-3 text-sm font-semibold">On this page</p>
            <app-toc />
          </aside>
        }
      </div>
    </div>

    <app-command-palette #palette />
    <app-code-copy />
    <app-external-links />
    <app-heading-anchors />
    <app-code-group />
    <app-media-enhancer />
    <app-toaster />
  `,
})
export class App implements OnInit {
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly layout = inject(LayoutMode);
  private readonly routeUrl = inject(RouteUrlService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');

  readonly menuIcon = LucideMenu;
  readonly closeIcon = LucideX;
  readonly searchIcon = LucideSearch;
  readonly sunIcon = LucideSun;
  readonly moonIcon = LucideMoon;
  readonly autoIcon = LucideSunMoon;

  readonly siteName = siteConfig.site.name;
  readonly githubUrl = siteConfig.site.githubUrl;
  readonly discordUrl = siteConfig.site.links?.discord;
  readonly headerNav = siteConfig.headerNav ?? [];

  readonly drawerOpen = signal(false);

  constructor() {
    effect(() =>
      this.document.documentElement.classList.toggle('max-lg:overflow-hidden', this.drawerOpen()),
    );
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const desktop = window.matchMedia('(min-width: 64rem)');
    const onChange = () => {
      if (desktop.matches) this.drawerOpen.set(false);
    };
    desktop.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => desktop.removeEventListener('change', onChange));
  }

  private readonly isDocsRoute = computed(() => {
    const url = this.routeUrl.cleanUrl();
    return url !== '/' && url !== '' && !this.layout.chromeHidden();
  });
  readonly showSidebar = this.isDocsRoute;
  readonly showBreadcrumb = this.isDocsRoute;
  readonly showToc = this.isDocsRoute;
  readonly showFooter = this.isDocsRoute;

  isExternal(href: string): boolean {
    return /^https?:\/\//.test(href);
  }

  toggleDrawer(): void {
    if (this.drawerOpen()) {
      this.closeDrawer();
      return;
    }
    this.drawerOpen.set(true);
    afterNextRender(
      () => this.drawer()?.nativeElement.querySelector<HTMLElement>('a[href], button')?.focus(),
      {injector: this.injector},
    );
  }

  closeDrawer(): void {
    if (!this.drawerOpen()) return;
    this.drawerOpen.set(false);
    this.menuButton()?.nativeElement.focus();
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.drawerOpen()) return;
    if (event.key === 'Escape') {
      this.closeDrawer();
      return;
    }
    const menuButton = this.menuButton()?.nativeElement;
    const drawer = this.drawer()?.nativeElement;
    if (event.key !== 'Tab' || !menuButton || !drawer) return;
    const focusable = [
      menuButton,
      ...drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ];
    const index = focusable.indexOf(this.document.activeElement as HTMLElement);
    const step = event.shiftKey ? -1 : 1;
    const next = index === -1 ? (event.shiftKey ? focusable.length - 1 : 0) : index + step;
    event.preventDefault();
    focusable[(next + focusable.length) % focusable.length].focus();
  }

  ngOnInit(): void {
    this.theme.initFromStorage();
    onNavigation(this.router, this.destroyRef, () => {
      this.drawerOpen.set(false);
      if (typeof window === 'undefined' || window.location.hash) return;
      setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 0);
    });
  }
}
