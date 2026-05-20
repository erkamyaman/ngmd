/**
 * NgMd site configuration.
 *
 * Edit this file to customise navigation, site metadata, and external links.
 * Sidebar, command palette, breadcrumb, and header all read from here.
 */

export interface NavItem {
  label: string;
  href: string;
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
  /** Repository URL. Powers the GitHub icon in the header. */
  githubUrl: string;
  /** Optional social / community links rendered in the header. */
  links?: {
    twitter?: string;
    discord?: string;
  };
}

export interface NgmdConfig {
  site: SiteConfig;
  /** Sidebar sections, in render order. */
  nav: NavSection[];
}

const config: NgmdConfig = {
  site: {
    name: 'NgMd',
    description:
      'Modern Angular docs-site starter built on AnalogJS, Spartan UI, and Tailwind.',
    githubUrl: 'https://github.com/erkamyaman/ngmd',
  },

  nav: [
    {
      label: 'Getting Started',
      items: [
        { label: 'Introduction', href: '/welcome' },
        { label: 'Changelog', href: '/getting-started/changelog' },
        { label: 'About & Credits', href: '/getting-started/about' },
      ],
    },
    {
      label: 'Core Concepts',
      items: [
        { label: 'Markdown Routes', href: '/concepts/markdown-routes' },
        { label: 'Theming', href: '/concepts/theming' },
        { label: 'Components', href: '/concepts/components' },
        { label: 'Markdown Components', href: '/concepts/markdown-components' },
      ],
    },
    {
      label: 'Help',
      items: [{ label: 'Support', href: '/support' }],
    },
    {
      label: 'Stack',
      items: [
        { label: 'Overview', href: '/stack/overview' },
        { label: 'Technologies', href: '/stack/technologies' },
        { label: 'Installation', href: '/stack/installation' },
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
