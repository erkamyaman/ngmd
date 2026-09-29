import {AlgoliaSearchProvider} from './algolia-provider';

const search = vi.fn();

vi.mock('algoliasearch/lite', () => ({liteClient: () => ({search})}));

describe('AlgoliaSearchProvider', () => {
  it('escapes record text and maps hits to relative urls with highlights', async () => {
    search.mockResolvedValue({
      results: [
        {
          hits: [
            {
              objectID: '1',
              url: 'https://example.com/guide/tags?x=1#use-template',
              hierarchy: {lvl0: 'Docs', lvl1: 'Tags <b>', lvl2: 'Use <template>', lvl3: null},
              _snippetResult: {
                content: {value: 'Wrap __ngmd_mark__<ng-content>__/ngmd_mark__ & go'},
                hierarchy: {lvl2: {value: 'Use __ngmd_mark__<template>__/ngmd_mark__'}},
              },
            },
            {objectID: '2', url: '/intro', hierarchy: {lvl0: 'Docs', lvl1: 'Intro', lvl2: null}},
          ],
        },
      ],
    });
    const provider = new AlgoliaSearchProvider({appId: 'a', apiKey: 'k', indexName: 'i'});
    const [section, page] = await provider.search(' template ');

    expect(search.mock.calls[0][0][0].params).toMatchObject({
      query: 'template',
      highlightPreTag: '__ngmd_mark__',
      highlightPostTag: '__/ngmd_mark__',
    });
    expect(section).toEqual({
      id: '1',
      kind: 'section',
      url: '/guide/tags?x=1#use-template',
      labelHtml: 'Use <mark>&lt;template&gt;</mark>',
      subLabelHtml: 'Tags &lt;b&gt;',
      contentHtml: 'Wrap <mark>&lt;ng-content&gt;</mark> &amp; go',
      score: undefined,
    });
    expect(page).toMatchObject({kind: 'page', url: '/intro', labelHtml: 'Intro', subLabelHtml: ''});
  });
});
