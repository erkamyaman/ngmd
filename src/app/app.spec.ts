import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {provideLocationMocks} from '@angular/common/testing';

import {App} from './app';

@Component({template: ''})
class Blank {}

describe('App', () => {
  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{path: '**', component: Blank}]), provideLocationMocks()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('traps focus in the open drawer and returns it on Escape', async () => {
    const fixture = TestBed.createComponent(App);
    document.body.appendChild(fixture.nativeElement);
    await TestBed.inject(Router).navigateByUrl('/welcome');
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const menu = el.querySelector<HTMLButtonElement>('button[aria-label="Open menu"]')!;
    menu.click();
    await fixture.whenStable();
    const drawer = el.querySelector<HTMLElement>('aside[aria-label="Documentation menu"]')!;
    expect(drawer.hasAttribute('inert')).toBe(false);
    expect(document.documentElement.classList.contains('max-lg:overflow-hidden')).toBe(true);

    const links = drawer.querySelectorAll<HTMLElement>('a[href], button');
    links[links.length - 1].focus();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    expect(document.activeElement).toBe(menu);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    expect(document.activeElement).toBe(links[0]);

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    await fixture.whenStable();
    expect(drawer.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(menu);
    expect(document.documentElement.classList.contains('max-lg:overflow-hidden')).toBe(false);
    fixture.nativeElement.remove();
  });
});
