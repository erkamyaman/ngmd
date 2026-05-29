/**
 * NgMd site configuration.
 *
 * Edit this file to customise navigation, site metadata, and external links.
 * Sidebar, command palette, breadcrumb, and header all read from here.
 */

import type {BadgeVariant} from './types/badge';

export interface NavItem {
  label: string;
  href: string;
  /** Optional lifecycle marker rendered as a coloured chip beside the
   * sidebar label. Accepts any value from the shared `BadgeVariant` set
   * (`new`, `updated`, `alpha`, `beta`, `stable`, `deprecated`), so the
   * sidebar chip and inline `<ngmd-badge>` always stay in sync. */
  status?: BadgeVariant;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface SiteConfig {
  /** Brand name shown in the header next to the logo. */
  name: string;
  /** One-liner description used in meta tags + social previews. */
  description: string;
  /** Short tagline shown after the brand in the homepage `<title>`. */
  tagline?: string;
  /** Public origin (no trailing slash). Used by sitemap.xml + robots.txt. */
  url: string;
  /** Repository URL. Powers the GitHub icon in the header. */
  githubUrl: string;
  /** Optional social / community links rendered in the header. */
  links?: {
    twitter?: string;
    discord?: string;
  };
  /**
   * Optional Algolia DocSearch credentials. When all three are set, the
   * command palette queries Algolia instead of the bundled Orama index.
   * Requires `algoliasearch` as a runtime dep: `pnpm add algoliasearch`.
   * Leave undefined to keep the default local search.
   */
  algolia?: {
    appId: string;
    apiKey: string;
    indexName: string;
  };
}

export interface NgmdConfig {
  site: SiteConfig;
  /** Sidebar sections, in render order. */
  nav: NavSection[];
  /**
   * Inline-link keywords. In any `.md` body, `*Keyword` resolves to a link
   * pointing at the configured URL. Unknown keywords log a warning and fall
   * back to literal `*Keyword` text. Change the URL here once, every doc
   * follows.
   */
  keywords?: Record<string, string>;
}

const config: NgmdConfig = {
  site: {
    name: 'NgMd',
    description: 'Modern Angular docs-site starter built on AnalogJS, Vite, and Tailwind.',
    tagline: 'Angular docs starter',
    url: 'https://ngmd.netlify.app',
    githubUrl: 'https://github.com/erkamyaman/ngmd',
  },

  keywords: {
    NgMd: '/welcome',
    AnalogJS: 'https://analogjs.org',
    Angular: 'https://angular.dev',
    Tailwind: 'https://tailwindcss.com',
    Shiki: 'https://shiki.style',
    Marked: 'https://marked.js.org',
    Vite: 'https://vitejs.dev',
    VitePress: 'https://vitepress.dev',
    Starlight: 'https://starlight.astro.build',
    Docusaurus: 'https://docusaurus.io',
    Nextra: 'https://nextra.site',
  },

  nav: [
    {
      label: 'Getting Started',
      items: [
        {label: 'Introduction', href: '/welcome'},
        {label: 'Changelog', href: '/getting-started/changelog', status: 'updated'},
        {label: 'About & Credits', href: '/getting-started/about'},
      ],
    },
    {
      label: 'Core Concepts',
      items: [
        {label: 'Markdown Routes', href: '/concepts/markdown-routes'},
        {label: 'Theming', href: '/concepts/theming'},
        {label: 'Components', href: '/concepts/components'},
        {label: 'Search', href: '/concepts/search', status: 'new'},
        {label: 'Showcase', href: '/concepts/showcase'},
      ],
    },
    {
      label: 'AI',
      items: [{label: 'Agent Skills', href: '/ai/agent-skills', status: 'new'}],
    },
    {
      label: 'Help',
      items: [
        {label: 'Get help', href: '/help/get-help'},
        {label: 'Contribute', href: '/help/contribute'},
        {label: 'Support us', href: '/help/sponsor'},
      ],
    },
    {
      label: 'Stack',
      items: [
        {label: 'Overview', href: '/stack/overview'},
        {label: 'Technologies', href: '/stack/technologies'},
        {label: 'Installation', href: '/stack/installation'},
      ],
    },
  ],
};

export default config;

/** Flattened list of all nav items, useful for command palette / search. */
export const navItems = config.nav.flatMap((section) =>
  section.items.map((item) => ({
    label: item.label,
    href: item.href,
    section: section.label,
  })),
);

/** Map of last URL segment to its human label, useful for breadcrumb. */
export const navLabels = Object.fromEntries(
  config.nav.flatMap((section) =>
    section.items.map((item) => [item.href.split('/').pop() ?? '', item.label]),
  ),
);
