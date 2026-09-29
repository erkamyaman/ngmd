import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {ApiJsDoc} from './api-jsdoc';

vi.mock('virtual:ngmd/api-index', () => ({
  apiIndex: [{kind: 'class', name: 'NgmdCard', group: 'src-app-ui'}],
}));

describe('ApiJsDoc', () => {
  async function render(text: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    const fixture = TestBed.createComponent(ApiJsDoc);
    fixture.componentRef.setInput('text', text);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('links {@link} tags to symbol pages and falls back to code for unknown targets', async () => {
    const el = await render('Wraps {@link NgmdCard} and {@link Missing | the missing one}.');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/api/src-app-ui/NgmdCard');
    expect(link.textContent).toBe('NgmdCard');
    expect(el.textContent).toBe('Wraps NgmdCard and the missing one.');
  });

  it('keeps trailing punctuation out of bare URLs and renders markup as text', async () => {
    const el = await render('See https://angular.dev/guide. Use `Array<string>` <b>now</b>.');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('https://angular.dev/guide');
    expect(el.querySelector('code')!.textContent).toBe('Array<string>');
    expect(el.querySelector('b')).toBeNull();
    expect(el.textContent).toContain('<b>now</b>.');
  });

  it('splits paragraphs on blank lines', async () => {
    const el = await render('One\nline.\n\nTwo.');
    expect([...el.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['One line.', 'Two.']);
  });
});
