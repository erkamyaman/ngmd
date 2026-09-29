import {TestBed} from '@angular/core/testing';
import {SearchService, type HistoryItem} from './search.service';

vi.mock('virtual:ngmd/search-index', () => ({
  searchIndex: [
    {
      id: 'page:/theming',
      url: '/theming',
      anchor: '',
      kind: 'page',
      pageTitle: 'Theming',
      heading: 'Theming',
      body: 'Tokens.',
    },
  ],
}));
vi.mock('virtual:ngmd/api-index', () => ({apiIndex: []}));

const KEY = 'ngmd-search-history-v1';

function hit(url: string) {
  return {id: url, kind: 'page' as const, url, labelHtml: `<mark>${url}</mark>`, subLabelHtml: ''};
}

describe('SearchService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('starts empty instead of throwing when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(TestBed.inject(SearchService).history()).toEqual([]);
  });

  it('drops malformed and duplicate stored entries', () => {
    const good: HistoryItem = {id: 'a', url: '/a', labelHtml: 'A', subLabelHtml: '', createdAt: 1};
    localStorage.setItem(KEY, JSON.stringify([null, {url: 3}, good, {...good, id: 'b'}]));
    expect(TestBed.inject(SearchService).history()).toEqual([good]);
  });

  it('records visits newest first, strips highlights, dedupes and caps recents', () => {
    const search = TestBed.inject(SearchService);
    for (let i = 0; i < 12; i++) search.recordVisit(hit(`/p${i}`));
    search.recordVisit(hit('/p5'));
    const urls = search.recents().map((h) => h.url);
    expect(urls.length).toBe(10);
    expect(urls.slice(0, 2)).toEqual(['/p5', '/p11']);
    expect(search.recents()[0].labelHtml).toBe('/p5');
    expect(JSON.parse(localStorage.getItem(KEY)!).length).toBe(10);
  });

  it('puts a newly pinned favourite first and survives clearing recents', () => {
    const search = TestBed.inject(SearchService);
    ['/a', '/b', '/c'].forEach((url) => search.recordVisit(hit(url)));
    search.toggleFavorite('/a');
    search.toggleFavorite('/b');
    expect(search.favorites().map((h) => h.url)).toEqual(['/b', '/a']);
    search.clearRecents();
    expect(search.history().map((h) => h.url)).toEqual(['/b', '/a']);
    search.toggleFavorite('/a');
    expect(search.recents().map((h) => h.url)).toEqual(['/a']);
    search.removeFromHistory('/b');
    expect(search.favorites()).toEqual([]);
  });

  it('reports loading, not "no results", while the query is debouncing', async () => {
    const search = TestBed.inject(SearchService);
    search.query.set('zzzz');
    TestBed.tick();
    expect(search.loading()).toBe(true);
    expect(search.hasNoResults()).toBe(false);
    await vi.waitFor(() => expect(search.hasNoResults()).toBe(true), {timeout: 3000});
    search.query.set('theming');
    TestBed.tick();
    await vi.waitFor(() => expect(search.results()[0]?.url).toBe('/theming'), {timeout: 3000});
  });
});
