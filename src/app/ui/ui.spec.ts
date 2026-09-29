import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {NgmdBadge} from './badge';
import {NgmdCard} from './card';
import {NgmdCardGrid} from './card-grid';
import {NgmdImage} from './image';
import {NgmdPill} from './pill';
import {NgmdTab, NgmdTabs} from './tabs';

describe('NgmdBadge', () => {
  it('falls back to the new variant for unknown or inherited keys', async () => {
    for (const variant of ['nope', 'toString', 'constructor']) {
      const fixture = TestBed.createComponent(NgmdBadge);
      fixture.componentRef.setInput('variant', variant);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('span').className).toContain('bg-sky-100');
    }
  });
});

describe('NgmdCard', () => {
  beforeEach(() => TestBed.configureTestingModule({providers: [provideRouter([])]}));

  it('keeps the fragment and query of an internal link', async () => {
    const fixture = TestBed.createComponent(NgmdCard);
    fixture.componentRef.setInput('link', '/concepts/theming?tab=css#tokens');
    await fixture.whenStable();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('href')).toBe('/concepts/theming?tab=css#tokens');
    expect(a.hasAttribute('target')).toBe(false);
  });

  it('opens external links in a new tab and hides the CTA arrow', async () => {
    const fixture = TestBed.createComponent(NgmdCard);
    fixture.componentRef.setInput('link', 'https://angular.dev');
    fixture.componentRef.setInput('cta', 'Visit');
    await fixture.whenStable();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.querySelector('[aria-hidden="true"]')?.textContent).toBe('→');
  });

  it('reads the avatar attribute as a boolean', async () => {
    const fixture = TestBed.createComponent(NgmdCard);
    fixture.componentRef.setInput('image', '/me.png');
    fixture.componentRef.setInput('avatar', '');
    await fixture.whenStable();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.className).toContain('rounded-full');
    expect(img.getAttribute('alt')).toBe('');
  });
});

describe('NgmdCardGrid', () => {
  it('maps the columns attribute and falls back to two', async () => {
    const fixture = TestBed.createComponent(NgmdCardGrid);
    const grid = (): string => fixture.nativeElement.querySelector('div').className;
    fixture.componentRef.setInput('columns', '3');
    await fixture.whenStable();
    expect(grid()).toContain('sm:grid-cols-3');
    fixture.componentRef.setInput('columns', 'abc');
    await fixture.whenStable();
    expect(grid()).toContain('sm:grid-cols-2');
  });
});

describe('NgmdPill', () => {
  beforeEach(() => TestBed.configureTestingModule({providers: [provideRouter([])]}));

  it('treats mailto as external and keeps internal fragments', async () => {
    const fixture = TestBed.createComponent(NgmdPill);
    fixture.componentRef.setInput('title', 'Mail');
    fixture.componentRef.setInput('href', 'mailto:hi@example.com');
    await fixture.whenStable();
    let a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('href')).toBe('mailto:hi@example.com');

    fixture.componentRef.setInput('href', '/help#faq');
    await fixture.whenStable();
    a = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('href')).toBe('/help#faq');
  });
});

describe('NgmdImage', () => {
  it('adds px to a unitless width and keeps CSS lengths', async () => {
    const fixture = TestBed.createComponent(NgmdImage);
    const figure = (): HTMLElement => fixture.nativeElement.querySelector('figure');
    fixture.componentRef.setInput('src', '/logo.svg');
    fixture.componentRef.setInput('width', '640');
    await fixture.whenStable();
    expect(figure().style.maxWidth).toBe('640px');
    fixture.componentRef.setInput('width', '50%');
    await fixture.whenStable();
    expect(figure().style.maxWidth).toBe('50%');
  });
});

describe('NgmdTab', () => {
  it('is a focusable tab panel that follows data-active', async () => {
    const fixture = TestBed.createComponent(NgmdTab);
    const host: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();
    expect(host.getAttribute('role')).toBe('tabpanel');
    expect(host.getAttribute('tabindex')).toBe('0');
    expect(host.hidden).toBe(true);
    host.setAttribute('data-active', 'true');
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    expect(host.hidden).toBe(false);
  });
});

@Component({
  imports: [NgmdTabs, NgmdTab],
  template: `
    <ngmd-tabs>
      <ngmd-tab title="One">first</ngmd-tab>
      <ngmd-tab title="Two">second</ngmd-tab>
    </ngmd-tabs>
  `,
})
class TabsHost {}

describe('NgmdTabs', () => {
  it('activates the first panel and moves with the arrow keys', async () => {
    const fixture = TestBed.createComponent(TabsHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('ngmd-tab'));
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role=tab]'));
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(['One', 'Two']);
    expect(panels.map((p) => p.hidden)).toEqual([false, true]);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
    await fixture.whenStable();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(panels.map((p) => p.hidden)).toEqual([true, false]);
    expect(document.activeElement === tabs[1] || !tabs[1].isConnected).toBe(true);
  });
});
