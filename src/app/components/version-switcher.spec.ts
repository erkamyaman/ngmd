import {computed} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import type {VersionEntry} from '../../ngmd.config';
import {VersionService} from '../services/version/version.service';
import {VersionSwitcher} from './version-switcher';

const list: VersionEntry[] = [
  {label: 'v2', url: 'https://v2.example.com', status: 'current'},
  {label: 'v1', url: 'https://v1.example.com', status: 'deprecated'},
];

describe('VersionSwitcher', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VersionSwitcher],
      providers: [
        {
          provide: VersionService,
          useValue: {list: computed(() => list), self: computed(() => list[0])},
        },
      ],
    });
  });

  it('opens on click and closes on Escape', async () => {
    const fixture = TestBed.createComponent(VersionSwitcher);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const trigger = el.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    expect(trigger.textContent).toContain('v2');
    expect(el.querySelector('#ngmd-version-list')).toBeNull();

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelectorAll('#ngmd-version-list li').length).toBe(2);
    expect(el.querySelector('[aria-current="true"]')?.textContent).toContain('v2');
    expect(el.querySelector('a[href="https://v1.example.com"]')).not.toBeNull();

    document.body.appendChild(el);
    el.querySelector<HTMLElement>('a')!.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#ngmd-version-list')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when a click lands outside', async () => {
    const fixture = TestBed.createComponent(VersionSwitcher);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(el.querySelector('#ngmd-version-list')).not.toBeNull();

    document.body.click();
    await fixture.whenStable();
    expect(el.querySelector('#ngmd-version-list')).toBeNull();
  });
});
