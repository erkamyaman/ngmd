import {Component, DestroyRef, computed, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {LucideAngularModule, Github, Menu, X, Search, Sun, Moon, SunMoon} from 'lucide-angular';
import {ThemeService} from './theme';
import {LAYOUT_CHROME_HIDDEN} from './layout-mode.service';
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

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    LucideAngularModule,
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
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <header
        class="sticky top-0 z-30 flex items-center gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm px-4 py-3"
      >
        @if (showSidebar()) {
          <button
            type="button"
            (click)="drawerOpen.set(!drawerOpen())"
            class="lg:hidden rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            [attr.aria-label]="drawerOpen() ? 'Close menu' : 'Open menu'"
          >
            <i-lucide [img]="drawerOpen() ? closeIcon : menuIcon" class="size-5"></i-lucide>
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
          NgMd
        </a>

        <nav class="hidden sm:flex items-center gap-1 text-sm">
          <a
            routerLink="/welcome"
            class="rounded px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Docs
          </a>
          <a
            routerLink="/help/get-help"
            class="rounded px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Help
          </a>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <app-version-switcher></app-version-switcher>
          <button
            type="button"
            (click)="palette.toggle()"
            class="hidden lg:inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-56"
          >
            <i-lucide [img]="searchIcon" class="size-4"></i-lucide>
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
            <i-lucide [img]="searchIcon" class="size-5"></i-lucide>
          </button>
          <span class="h-4 w-px bg-zinc-300/60 dark:bg-zinc-700/60"></span>
          <a
            [href]="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="GitHub"
          >
            <i-lucide [img]="githubIcon" class="size-5"></i-lucide>
          </a>
          <span class="h-4 w-px bg-zinc-300/60 dark:bg-zinc-700/60"></span>
          <button
            type="button"
            (click)="theme.cycle()"
            class="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            [attr.aria-label]="'Theme: ' + theme.mode()"
            [title]="'Theme: ' + theme.mode()"
          >
            <i-lucide
              [img]="
                theme.mode() === 'light' ? sunIcon : theme.mode() === 'dark' ? moonIcon : autoIcon
              "
              class="size-5"
            ></i-lucide>
          </button>
        </div>
      </header>

      <div class="flex flex-1">
        @if (showSidebar()) {
          <aside
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
            (click)="drawerOpen.set(false)"
            aria-hidden="true"
          ></div>
          <aside
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
            }
            @if (showToc()) {
              <details
                class="xl:hidden mx-4 sm:mx-6 mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group"
              >
                <summary
                  class="flex items-center justify-between cursor-pointer list-none px-4 py-2.5 text-sm font-semibold"
                >
                  On this page
                  <span class="text-zinc-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div class="px-4 pb-4">
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
  protected readonly chromeHidden = inject(LAYOUT_CHROME_HIDDEN);
  private readonly routeUrl = inject(RouteUrlService);

  readonly menuIcon = Menu;
  readonly closeIcon = X;
  readonly searchIcon = Search;
  readonly githubIcon = Github;
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly autoIcon = SunMoon;

  readonly githubUrl = siteConfig.site.githubUrl;

  readonly drawerOpen = signal(false);

  private readonly isDocsRoute = computed(() => {
    const url = this.routeUrl.cleanUrl();
    return url !== '/' && url !== '' && !this.chromeHidden();
  });
  readonly showSidebar = this.isDocsRoute;
  readonly showBreadcrumb = this.isDocsRoute;
  readonly showToc = this.isDocsRoute;
  readonly showFooter = this.isDocsRoute;

  ngOnInit(): void {
    this.theme.initFromStorage();
    onNavigation(this.router, this.destroyRef, () => {
      this.drawerOpen.set(false);
      if (typeof window === 'undefined' || window.location.hash) return;
      setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 0);
    });
  }
}
