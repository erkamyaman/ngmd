import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowRight,
  Eye,
  Github,
  FileText,
  Palette,
  Code,
  Box,
  Search,
  Zap,
} from 'lucide-angular';
import { animate, stagger } from 'motion';
import siteConfig from '../../ngmd.config';

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
        class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-24 size-[60rem] rounded-full opacity-20 blur-3xl"
        style="background-image: var(--accent-gradient)"
      ></div>
    </div>

    <!-- Hero -->
    <section class="relative">
      <div class="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <a
          [href]="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur px-4 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-6 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span class="text-yellow-400">★</span>
          Star on GitHub
          <i-lucide [img]="arrowIcon" class="size-3.5"></i-lucide>
        </a>

        <h1 #hero class="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
          <span class="ngmd-hero-anim inline-block">The</span>&nbsp;<span class="ngmd-hero-anim inline-block">Angular</span>&nbsp;<span class="ngmd-hero-anim inline-block">docs</span>
          <span
            class="ngmd-hero-anim block bg-clip-text text-transparent ngmd-hero-gradient pb-1"
            style="background-image: var(--accent-gradient)"
          >
            starter you've been missing
          </span>
        </h1>

        <p class="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Drop a markdown file. Get a route. Beautifully branded out of the box,
          powered by AnalogJS, Angular, Vite, Tailwind, and Shiki.
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            routerLink="/welcome"
            class="inline-flex items-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-50 px-6 py-3 text-base font-medium text-zinc-50 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Get started
            <i-lucide [img]="arrowIcon" class="size-4"></i-lucide>
          </a>
          <a
            routerLink="/concepts/showcase"
            class="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur px-6 py-3 text-base font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <i-lucide [img]="eyeIcon" class="size-4"></i-lucide>
            Showcase
          </a>
          <a
            [href]="githubUrl"
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
          @for (tech of stack; track tech.name) {
            <a
              [href]="tech.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
            >
              <img [src]="tech.logo" [alt]="tech.name" class="size-5 object-contain" />
              {{ tech.name }}
            </a>
          }
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
              class="p-4 text-sm overflow-x-auto text-zinc-700 dark:text-zinc-300 leading-relaxed"
            ><code><span class="text-[color:var(--accent)] font-semibold"># Welcome</span>

NgMd is a modern Angular docs starter.

<span class="text-[color:var(--accent)] font-semibold">## Quick start</span>

<span class="text-zinc-400">-</span> Drop a .md file
<span class="text-zinc-400">-</span> Get a route
<span class="text-zinc-400">-</span> Done.</code></pre>
          </div>
          <div
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <div
              class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-mono text-zinc-500"
            >
              <span>Browser → /welcome</span>
              <span class="text-[color:var(--accent)]">live</span>
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
            <i-lucide
              [img]="feature.icon"
              class="size-6 mb-4 text-[color:var(--accent)]"
              aria-hidden="true"
            ></i-lucide>
            <p class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {{ feature.title }}
            </p>
            <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
        <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          or <code>npm create ngmd</code>, <code>yarn create ngmd</code>, <code>bun create ngmd</code>
        </p>
        <div class="mt-8">
          <a
            routerLink="/welcome"
            class="inline-flex items-center gap-2 text-base font-medium text-[color:var(--accent)] hover:opacity-80"
          >
            Read the docs
            <i-lucide [img]="arrowIcon" class="size-4"></i-lucide>
          </a>
        </div>
      </div>
    </section>
  `,
})
export default class Home implements AfterViewInit {
  readonly hero = viewChild<ElementRef<HTMLElement>>('hero');

  readonly arrowIcon = ArrowRight;
  readonly eyeIcon = Eye;
  readonly githubIcon = Github;
  readonly githubUrl = siteConfig.site.githubUrl;

  ngAfterViewInit(): void {
    // Browser-only. Motion touches window; SSR would crash. Skipping here
    // also means SSR'd HTML ships with words visible (no inline opacity:0),
    // which is the correct fallback if hydration or motion ever fails.
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const root = this.hero()?.nativeElement;
    if (!root) return;
    const parts = root.querySelectorAll<HTMLElement>('.ngmd-hero-anim');
    if (parts.length === 0) return;

    animate(
      parts,
      { opacity: [0, 1], transform: ['translateY(0.5em)', 'translateY(0)'] },
      { duration: 1.1, delay: stagger(0.18), ease: [0.22, 1, 0.36, 1] },
    );
  }

  readonly stack = [
    { name: 'Angular', url: 'https://angular.dev', logo: '/logos/angular.svg' },
    { name: 'AnalogJS', url: 'https://analogjs.org', logo: 'https://analogjs.org/img/logos/analog-logo.svg' },
    { name: 'Vite', url: 'https://vite.dev', logo: '/logos/vite.svg' },
    { name: 'Tailwind', url: 'https://tailwindcss.com', logo: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
    { name: 'Shiki', url: 'https://shiki.style', logo: 'https://shiki.style/logo.svg' },
  ];

  readonly features = [
    {
      icon: FileText,
      title: 'Markdown routes',
      description: 'Drop a .md file in src/content, get a route. Powered by AnalogJS content collections.',
    },
    {
      icon: Palette,
      title: 'Branding-first',
      description: 'Tailwind tokens and CSS variables make a complete rebrand a one-file change.',
    },
    {
      icon: Code,
      title: 'Shiki highlighting',
      description: 'Beautiful syntax highlighting for code blocks. Same engine as VS Code.',
    },
    {
      icon: Box,
      title: 'Own your components',
      description: 'shadcn-style ownership. Authoring components live in your repo, theme freely.',
    },
    {
      icon: Search,
      title: 'Cmd+K search',
      description: 'Built-in command palette with keyboard navigation. Press ⌘K to try it.',
    },
    {
      icon: Zap,
      title: 'AnalogJS-native',
      description: 'File-based routing, SSR/SSG, Vite dev server. The fast Angular stack.',
    },
  ];
}
