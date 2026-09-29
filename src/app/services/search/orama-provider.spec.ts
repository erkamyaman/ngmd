import {OramaSearchProvider} from './orama-provider';

vi.mock('virtual:ngmd/search-index', () => ({
  searchIndex: [
    {
      id: 'page:/tags',
      url: '/tags',
      anchor: '',
      kind: 'page',
      pageTitle: 'Tags & markup',
      heading: 'Tags & markup',
      body: 'Wrap <ngmd-alert> in a paragraph & keep it short.',
    },
    {
      id: 'section:/tags#amplify',
      url: '/tags',
      anchor: 'amplify',
      kind: 'section',
      pageTitle: 'Tags & markup',
      heading: 'Amplify',
      body: 'Amplify output.',
    },
  ],
}));

vi.mock('virtual:ngmd/api-index', () => ({
  apiIndex: [
    {
      kind: 'class',
      name: 'NgmdAlert',
      filePath: 'src/app/ui/alert.ts',
      line: 50,
      signature: 'class NgmdAlert',
      description: 'Banner with a stripe.',
      badges: [],
      group: 'src-app-ui',
    },
  ],
}));

describe('OramaSearchProvider', () => {
  it('escapes text before highlighting so matches never land inside entities', async () => {
    const hits = await new OramaSearchProvider().search('amp');
    const section = hits.find((h) => h.kind === 'section')!;
    expect(section.labelHtml).toBe('<mark>Amp</mark>lify');
    expect(section.subLabelHtml).toBe('Tags &amp; markup');
  });

  it('highlights every query token and keeps markup in the text escaped', async () => {
    const hits = await new OramaSearchProvider().search('tags markup');
    const page = hits.find((h) => h.kind === 'page')!;
    expect(page.labelHtml).toBe('<mark>Tags</mark> &amp; <mark>markup</mark>');
  });

  it('indexes API symbols under their encoded reference url', async () => {
    const [hit] = await new OramaSearchProvider().search('NgmdAlert');
    expect(hit).toMatchObject({kind: 'symbol', url: '/api/src-app-ui/NgmdAlert'});
    expect(hit.subLabelHtml).toBe('class <mark>NgmdAlert</mark>');
  });

  it('returns nothing for a blank query', async () => {
    expect(await new OramaSearchProvider().search('   ')).toEqual([]);
  });
});
