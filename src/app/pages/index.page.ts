import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  BookOpen,
  Palette,
  Zap,
  Search,
  Code,
  Sparkles,
  ArrowRight,
  Github,
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideAngularModule],
  template: `
    <!-- Spotlight backdrop -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-24 size-[60rem] rounded-full bg-gradient-to-br from-rose-500/20 via-purple-500/10 to-transparent blur-3xl"
      ></div>
    </div>

    <!-- Hero -->
    <section class="relative">
      <div class="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <a
          href="https://github.com/erkamyaman/ngmd"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-6 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span class="text-rose-500">★</span>
          Star on GitHub
          <i-lucide [img]="arrowIcon" class="size-3"></i-lucide>
        </a>

        <h1 class="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
          The Angular docs
          <span
            class="block bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent"
          >
            starter you've been missing
          </span>
        </h1>

        <p class="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Drop a markdown file. Get a route. Beautifully branded out of the box,
          powered by AnalogJS, Spartan UI, and Tailwind.
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            routerLink="/welcome"
            class="inline-flex items-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-50 px-6 py-3 text-base font-medium text-zinc-50 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Get Started
            <i-lucide [img]="arrowIcon" class="size-4"></i-lucide>
          </a>
          <a
            href="https://github.com/erkamyaman/ngmd"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur px-6 py-3 text-base font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <i-lucide [img]="githubIcon" class="size-4"></i-lucide>
            View on GitHub
          </a>
        </div>

        <!-- Stack badges -->
        <div class="mt-14">
          <p class="text-xs font-medium tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-5">
            BUILT ON
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <a
            href="https://angular.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
          >
            <svg class="size-5" viewBox="0 0 223 236" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#ng-a)">
                <path fill="url(#ng-b)" d="m222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"/>
                <path fill="url(#ng-c)" d="m222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"/>
              </g>
              <defs>
                <linearGradient id="ng-b" x1="49.009" x2="225.829" y1="213.75" y2="129.722" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#E40035"/>
                  <stop offset=".24" stop-color="#F60A48"/>
                  <stop offset=".352" stop-color="#F20755"/>
                  <stop offset=".494" stop-color="#DC087D"/>
                  <stop offset=".745" stop-color="#9717E7"/>
                  <stop offset="1" stop-color="#6C00F5"/>
                </linearGradient>
                <linearGradient id="ng-c" x1="41.025" x2="156.741" y1="28.344" y2="160.344" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FF31D9"/>
                  <stop offset="1" stop-color="#FF5BE1" stop-opacity="0"/>
                </linearGradient>
                <clipPath id="ng-a">
                  <path fill="#fff" d="M0 0h223v236H0z"/>
                </clipPath>
              </defs>
            </svg>
            Angular
          </a>
          <a
            href="https://analogjs.org"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
          >
            <img
              src="https://analogjs.org/img/logos/analog-logo.svg"
              alt="AnalogJS"
              class="h-5 w-auto"
            />
            AnalogJS
          </a>
          <a
            href="https://www.spartan.ng"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
          >
            <svg class="h-4 w-auto" viewBox="0 0 630 268" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M191.5 244.5L560 135L191.5 23.5L126.5 98.5L69.5 62L24 137.5L64.5 211L131 174.5L191.5 244.5Z" fill="#DD0031"/>
              <path d="M562.848 144.586L594.816 135.087L562.896 125.429L194.396 13.9285L188.19 12.0506L183.943 16.9507L124.586 85.4401L74.3593 53.5573L65.7181 48.0721L60.4351 56.8383L14.9351 132.338L11.9592 137.276L14.7416 142.326L55.2416 215.826L60.0445 224.542L68.7839 219.781L128.705 187.138L183.934 251.039L188.157 255.925L194.348 254.086L562.848 144.586Z" stroke="#36000D" stroke-width="20"/>
              <path d="M23.5 137.5L64 211L131 174.5L191.5 244.5L560.891 135L23.5 137.5Z" fill="#75011D"/>
              <path d="M260.533 136L260.533 170.86L199 187.374L199 218L474 136.141L473.527 136L384.145 136L384.651 136.141L298.463 160.134L298.463 136L260.533 136Z" fill="#DD0031"/>
              <path d="M260.533 136L260.533 101.14L199 84.6265L199 54L474 135.859L473.527 136L384.145 136L384.651 135.859L298.463 111.866L298.463 136L260.533 136Z" fill="#75011D"/>
            </svg>
            Spartan UI
          </a>
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="#38BDF8" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6C9.33 6 7.67 7.33 7 10c1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98.99 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.47 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35.98.99 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.61 13.15 9.47 12 7 12z"/>
            </svg>
            Tailwind
          </a>
          <a
            href="https://shiki.style"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="m9 11-6 6v3h9l3-3"/>
              <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
            </svg>
            Shiki
          </a>
          <a
            href="https://vitejs.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
          >
            <svg class="size-5" viewBox="0 0 410 404" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M399.641 59.5246L215.643 388.545C211.844 395.338 202.084 395.378 198.228 388.618L10.5817 59.5563C6.38087 52.1896 12.6802 43.2665 21.0281 44.7586L205.223 77.6824C206.398 77.8924 207.601 77.8904 208.776 77.6763L389.119 44.8058C397.439 43.2894 403.768 52.1434 399.641 59.5246Z" fill="url(#vite-a)"/>
              <path d="M292.965 1.5744L156.801 28.2552C154.563 28.6937 152.906 30.5903 152.771 32.8664L144.395 175.668C144.198 179.014 147.258 181.62 150.539 180.876L188.461 172.107C192.039 171.299 195.272 174.479 194.512 178.10L183.255 233.422C182.467 237.183 185.964 240.398 189.694 239.428L213.092 232.41C216.832 231.43 220.342 234.728 219.518 238.532L201.62 322.95C200.398 328.679 207.821 331.81 210.97 326.926L213.024 323.715L324.886 79.7223C326.792 75.5562 323.31 70.8951 318.864 71.7551L279.821 79.2861C275.811 80.0641 272.388 76.2151 273.408 72.2241L298.892 0.4451C299.916 -3.5709 296.443 -7.4259 292.965 1.5744Z" fill="url(#vite-b)"/>
              <defs>
                <linearGradient id="vite-a" x1="6" y1="32.945" x2="235" y2="344" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#41D1FF"/>
                  <stop offset="1" stop-color="#BD34FE"/>
                </linearGradient>
                <linearGradient id="vite-b" x1="194.651" y1="8.818" x2="236.076" y2="292.989" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FFEA83"/>
                  <stop offset="0.083" stop-color="#FFDD35"/>
                  <stop offset="1" stop-color="#FFA800"/>
                </linearGradient>
              </defs>
            </svg>
            Vite
          </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Code preview -->
    <section class="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
      <div class="mx-auto max-w-5xl px-6 py-20">
        <div class="text-center mb-10">
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">Zero config to ship a page</h2>
          <p class="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Markdown in, route out. No descriptors, no boilerplate, no proprietary syntax.
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <div
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <div
              class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-mono text-zinc-500"
            >
              <span>src/content/welcome.md</span>
              <span class="text-zinc-400">markdown</span>
            </div>
            <pre
              class="p-4 text-sm overflow-x-auto"
            ><code><span class="text-zinc-400"># Welcome</span>
<span class="text-zinc-400">NgMd is a modern Angular</span>
<span class="text-zinc-400">docs starter.</span>
<span class="text-zinc-400">## Quick start</span>
<span class="text-zinc-400">- Drop a .md file</span>
<span class="text-zinc-400">- Get a route</span>
<span class="text-zinc-400">- Done.</span></code></pre>
          </div>
          <div
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <div
              class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-mono text-zinc-500"
            >
              <span>Browser → /welcome</span>
              <span class="text-rose-500">live</span>
            </div>
            <div class="p-6">
              <h3 class="text-2xl font-bold mb-3">Welcome</h3>
              <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                NgMd is a modern Angular docs starter.
              </p>
              <h4 class="text-lg font-semibold mb-2">Quick start</h4>
              <ul class="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                <li>Drop a .md file</li>
                <li>Get a route</li>
                <li>Done.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need</h2>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Batteries-included docs without the bloat.
        </p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (feature of features; track feature.title) {
          <div
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ feature.emoji }}</span>
              <code
                class="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-sm font-mono font-semibold"
              >
                {{ feature.title }}
              </code>
            </div>
            <p class="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        }
      </div>
    </section>

    <!-- CTA -->
    <section class="border-t border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">Ready to ship docs?</h2>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          One command, a few markdown files, and you've got a beautiful docs site.
        </p>
        <div class="mt-8 inline-flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3 font-mono text-sm">
          <span class="text-zinc-400">$</span>
          <span>pnpm create ngmd&#64;latest my-docs</span>
        </div>
        <div class="mt-8">
          <a
            routerLink="/welcome"
            class="inline-flex items-center gap-2 text-base font-medium text-rose-500 hover:text-rose-600"
          >
            Read the docs
            <i-lucide [img]="arrowIcon" class="size-4"></i-lucide>
          </a>
        </div>
      </div>
    </section>
  `,
})
export default class Home {
  readonly arrowIcon = ArrowRight;
  readonly githubIcon = Github;

  readonly features = [
    {
      emoji: '📝',
      title: 'Markdown routes',
      description: 'Drop a .md file in src/content, get a route. Powered by AnalogJS content collections.',
    },
    {
      emoji: '🎨',
      title: 'Branding-first',
      description: 'Tailwind tokens and CSS variables make a complete rebrand a one-file change.',
    },
    {
      emoji: '✨',
      title: 'Shiki highlighting',
      description: 'Beautiful syntax highlighting for code blocks. Same engine as VS Code.',
    },
    {
      emoji: '⚔️',
      title: 'Spartan UI',
      description: 'shadcn-style copy/paste Angular components. Own the source, theme freely.',
    },
    {
      emoji: '🔍',
      title: 'Cmd+K search',
      description: 'Built-in command palette with keyboard navigation. Press ⌘K to try it.',
    },
    {
      emoji: '⚡',
      title: 'AnalogJS-native',
      description: 'File-based routing, SSR/SSG, Vite dev server. The fast Angular stack.',
    },
  ];
}
