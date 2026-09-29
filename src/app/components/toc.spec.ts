import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {Toc} from './toc';

@Component({template: ''})
class Blank {}

describe('Toc', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', component: Blank}])]});
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    vi.unstubAllGlobals();
    history.replaceState(null, '', '/');
    document.body.innerHTML = '';
  });

  function placeHeadings(tops: Record<string, number>): void {
    for (const [id, top] of Object.entries(tops)) {
      document.getElementById(id)!.getBoundingClientRect = () => ({top}) as DOMRect;
    }
  }

  it('gives repeated headings unique ids and lists only h2 and h3', async () => {
    document.body.innerHTML = `
      <main><analog-markdown>
        <h2>Install</h2><h3>Flags</h3><h4>Flags</h4>
        <h2>Run</h2><h3>Flags</h3>
        <h2>Setup <ngmd-badge>New</ngmd-badge></h2>
      </analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();

    const ids = Array.from(document.querySelectorAll('h2, h3, h4')).map((h) => h.id);
    expect(ids).toEqual(['install', 'flags', 'flags-1', 'run', 'flags-2', 'setup']);
    expect(fixture.componentInstance.headings().map((h) => h.id)).toEqual([
      'install',
      'flags',
      'run',
      'flags-2',
      'setup',
    ]);
    fixture.destroy();
  });

  it('links keep the page path', async () => {
    history.replaceState(null, '', '/guide/page');
    document.body.innerHTML = `<main><analog-markdown><h2>Install</h2></analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/guide/page#install');
    fixture.destroy();
  });

  it('starts on the heading in the URL hash', async () => {
    history.replaceState(null, '', '/page#run');
    document.body.innerHTML = `
      <main><analog-markdown><h2>Install</h2><h2>Run</h2><h2>Where to next</h2></analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();

    expect(fixture.componentInstance.active()).toBe('run');
    fixture.destroy();
  });

  it('marks the last heading above the top 30% of the viewport after a scroll', async () => {
    document.body.innerHTML = `
      <main><analog-markdown><h2>Install</h2><h2>Run</h2><h2>Where to next</h2></analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe('install');

    placeHeadings({install: -900, run: -400, 'where-to-next': 600});
    window.dispatchEvent(new Event('wheel'));
    window.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.active()).toBe('run');

    placeHeadings({install: -100, run: 400, 'where-to-next': 1400});
    window.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.active()).toBe('install');
    fixture.destroy();
  });

  it('keeps a clicked heading active until the user scrolls', async () => {
    document.body.innerHTML = `
      <main><analog-markdown><h2>Install</h2><h2>Run</h2><h2>Where to next</h2></analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();
    placeHeadings({install: -900, run: -400, 'where-to-next': 600});

    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    links[2].click();
    window.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.active()).toBe('where-to-next');
    expect(location.hash).toBe('#where-to-next');

    window.dispatchEvent(new Event('wheel'));
    window.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.active()).toBe('run');
    fixture.destroy();
  });

  it('drops the previous page on navigation', async () => {
    document.body.innerHTML = `
      <main><analog-markdown><h2>Install</h2><h2>Run</h2></analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();

    document.querySelector('analog-markdown')!.innerHTML = '<p>No sections here.</p>';
    await TestBed.inject(Router).navigateByUrl('/other');
    await fixture.whenStable();

    expect(fixture.componentInstance.headings()).toEqual([]);
    expect(fixture.componentInstance.active()).toBe('');
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    fixture.destroy();
  });
});
