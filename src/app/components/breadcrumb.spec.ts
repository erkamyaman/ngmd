import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import config from '../../ngmd.config';
import {RouteUrlService} from '../services/route-url/route-url.service';
import {Breadcrumb, crumbLabel} from './breadcrumb';

const section = config.nav[0];
const item = section.items[0];

describe('crumbLabel', () => {
  it('uses the nav item label for a page', () => {
    expect(crumbLabel(item.href)).toBe(item.label);
  });

  it('uses the section label for a folder whose pages share one section', () => {
    for (const s of config.nav) {
      for (const i of s.items) {
        const folder = i.href.split('/').slice(0, -1).join('/');
        const owners = new Set(
          config.nav.filter((o) => o.items.some((x) => x.href.startsWith(folder + '/'))),
        );
        if (folder && owners.size === 1) expect(crumbLabel(folder)).toBe(s.label);
      }
    }
  });

  it('returns null for paths outside the nav', () => {
    expect(crumbLabel('/zz-nowhere')).toBeNull();
  });
});

describe('Breadcrumb', () => {
  const cleanUrl = signal(item.href);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Breadcrumb],
      providers: [provideRouter([]), {provide: RouteUrlService, useValue: {cleanUrl}}],
    });
  });

  const labels = (el: HTMLElement) =>
    [...el.querySelectorAll('li')].map((li) => li.textContent?.trim());

  it('renders a labelled trail that marks the current page', async () => {
    const fixture = TestBed.createComponent(Breadcrumb);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(el.querySelector('a')?.getAttribute('aria-label')).toBe('Home');
    expect(labels(el).at(-1)).toBe(item.label);
    expect(el.querySelector('[aria-current="page"]')?.textContent).toBe(item.label);
  });

  it('falls back to humanised segments', async () => {
    cleanUrl.set('/zz-nowhere/some-group');
    const fixture = TestBed.createComponent(Breadcrumb);
    await fixture.whenStable();
    expect(labels(fixture.nativeElement)).toEqual(['', 'Zz Nowhere', 'Some Group']);
  });
});
