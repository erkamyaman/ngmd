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
    const trigger = el.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]')!;
    expect(trigger.textContent).toContain('v2');
    expect(el.querySelector('[role="listbox"]')).toBeNull();

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelectorAll('[role="option"]').length).toBe(2);

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });
});
