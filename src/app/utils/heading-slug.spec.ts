import {createSlugger, headingText, slugify} from './heading-slug';

describe('slugify', () => {
  it('lowercases and collapses non-alphanumerics into single hyphens', () => {
    expect(slugify('  Connect over HTTP  ')).toBe('connect-over-http');
    expect(slugify('`ngmd.config.ts` > nav')).toBe('ngmd-config-ts-nav');
  });
});

describe('createSlugger', () => {
  it('suffixes repeated headings in document order', () => {
    const slug = createSlugger();
    expect(slug('Flags')).toBe('flags');
    expect(slug('Usage')).toBe('usage');
    expect(slug('Flags')).toBe('flags-1');
    expect(slug('flags')).toBe('flags-2');
  });

  it('skips suffixes already taken by a literal heading', () => {
    const slug = createSlugger();
    expect(slug('Flags 1')).toBe('flags-1');
    expect(slug('Flags')).toBe('flags');
    expect(slug('Flags')).toBe('flags-2');
  });

  it('keeps separate state per slugger', () => {
    expect(createSlugger()('Flags')).toBe('flags');
    expect(createSlugger()('Flags')).toBe('flags');
  });
});

describe('headingText', () => {
  it('matches what the rendered heading shows', () => {
    expect(headingText('Prerequisites <ngmd-badge variant="stable">MIT</ngmd-badge>')).toBe(
      'Prerequisites',
    );
    expect(headingText('Read [the guide](/guide) and ![logo](/logo.svg)')).toBe(
      'Read the guide and logo',
    );
    expect(headingText('Use `<router-outlet>` here')).toBe('Use <router-outlet> here');
    expect(slugify(headingText('Use `<router-outlet>`'))).toBe('use-router-outlet');
    expect(headingText('Install <code>&#64;scope/pkg</code> &amp; run')).toBe(
      'Install @scope/pkg & run',
    );
  });
});
