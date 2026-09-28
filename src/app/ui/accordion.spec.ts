import {TestBed} from '@angular/core/testing';
import {NgmdAccordionItem} from './accordion';

describe('NgmdAccordionItem', () => {
  it('toggles aria-expanded and rotates the chevron', async () => {
    const fixture = TestBed.createComponent(NgmdAccordionItem);
    fixture.componentRef.setInput('title', 'Question');
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const chevron = (): string => button.querySelector('svg')!.getAttribute('class') ?? '';

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(chevron()).not.toContain('rotate-180');

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(chevron()).toContain('rotate-180');
    expect(chevron()).toContain('size-4');

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(chevron()).not.toContain('rotate-180');
  });

  it('starts expanded when the open input is set', async () => {
    const fixture = TestBed.createComponent(NgmdAccordionItem);
    fixture.componentRef.setInput('title', 'Question');
    fixture.componentRef.setInput('open', '');
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
