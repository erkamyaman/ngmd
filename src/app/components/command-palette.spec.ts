import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {CommandPalette} from './command-palette';

vi.mock('virtual:ngmd/search-index', () => ({
  searchIndex: ['alpha', 'alphabet', 'alphanumeric'].map((word) => ({
    id: `page:/${word}`,
    url: `/${word}`,
    anchor: '',
    kind: 'page',
    pageTitle: word,
    heading: word,
    body: `All about ${word}.`,
  })),
}));
vi.mock('virtual:ngmd/api-index', () => ({apiIndex: []}));

@Component({template: ''})
class Blank {}

describe('CommandPalette', () => {
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', component: Blank}])]});
    trigger = document.body.appendChild(document.createElement('button'));
    trigger.focus();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  function key(target: EventTarget, k: string, init: KeyboardEventInit = {}) {
    target.dispatchEvent(new KeyboardEvent('keydown', {key: k, bubbles: true, ...init}));
  }

  async function openWithResults(query: string) {
    const fixture = TestBed.createComponent(CommandPalette);
    document.body.appendChild(fixture.nativeElement);
    key(document, 'k', {ctrlKey: true});
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = query;
    input.dispatchEvent(new Event('input'));
    await vi.waitFor(
      async () => {
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelectorAll('[role=option]').length).toBe(3);
      },
      {timeout: 3000},
    );
    return {fixture, input};
  }

  it('focuses the combobox and exposes the listbox semantics', async () => {
    const {fixture, input} = await openWithResults('alpha');
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe('ngmd-search-results');
    expect(input.getAttribute('aria-activedescendant')).toBe('ngmd-search-option-0');
    expect(fixture.nativeElement.querySelector('[role=dialog]').getAttribute('aria-modal')).toBe(
      'true',
    );
    expect(fixture.nativeElement.querySelector('[role=status]').textContent.trim()).toBe(
      '3 results',
    );
  });

  it('moves the active option with arrows, Home and End, wrapping at the ends', async () => {
    const {fixture, input} = await openWithResults('alpha');
    const active = async () => {
      await fixture.whenStable();
      return input.getAttribute('aria-activedescendant');
    };
    key(input, 'ArrowUp');
    expect(await active()).toBe('ngmd-search-option-2');
    key(input, 'ArrowDown');
    expect(await active()).toBe('ngmd-search-option-0');
    key(input, 'End');
    expect(await active()).toBe('ngmd-search-option-2');
    key(input, 'Home');
    expect(await active()).toBe('ngmd-search-option-0');
  });

  it('navigates to the active option on Enter and returns focus to the opener', async () => {
    const {fixture, input} = await openWithResults('alpha');
    const router = TestBed.inject(Router);
    key(input, 'ArrowDown');
    await fixture.whenStable();
    const target = fixture.nativeElement.querySelector('[aria-selected=true]').textContent.trim();
    key(input, 'Enter');
    await fixture.whenStable();
    expect(router.url).toBe(`/${target}`);
    expect(fixture.nativeElement.querySelector('[role=dialog]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Escape and restores focus', async () => {
    const {fixture} = await openWithResults('alpha');
    key(document, 'Escape');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=dialog]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
