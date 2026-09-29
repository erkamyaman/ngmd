import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {CodeGroup} from './code-group';

function group(id: string, labels: string[]): string {
  const tabs = labels
    .map(
      (l, i) =>
        `<button type="button" class="ngmd-code-group__tab" data-target="${id}-${i}" data-active="${i === 0}">${l}</button>`,
    )
    .join('');
  const panels = labels
    .map(
      (_, i) =>
        `<div class="ngmd-code-group__panel" data-id="${id}-${i}" data-active="${i === 0}"><pre>${i}</pre></div>`,
    )
    .join('');
  return `<div class="ngmd-code-group" data-group="${id}"><div class="ngmd-code-group__tabs">${tabs}</div>${panels}</div>`;
}

describe('CodeGroup', () => {
  let main: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    main = document.createElement('main');
    main.innerHTML = group('a', ['pnpm', 'npm']) + group('b', ['pnpm', 'npm', 'yarn']);
    document.body.appendChild(main);
    TestBed.configureTestingModule({imports: [CodeGroup], providers: [provideRouter([])]});
  });

  afterEach(() => main.remove());

  const selected = () =>
    [...main.querySelectorAll('[role="tab"][aria-selected="true"]')].map((t) => t.textContent);

  it('adds tab semantics with a roving tabindex', async () => {
    const fixture = TestBed.createComponent(CodeGroup);
    await fixture.whenStable();
    const tabs = main.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(main.querySelectorAll('[role="tablist"]').length).toBe(2);
    expect(tabs[0].getAttribute('aria-controls')).toBe('a-0');
    expect(main.querySelector('#a-0')?.getAttribute('role')).toBe('tabpanel');
    expect(main.querySelector('#a-0')?.getAttribute('aria-labelledby')).toBe('a-0-tab');
    expect([tabs[0].tabIndex, tabs[1].tabIndex]).toEqual([0, -1]);
  });

  it('moves with arrow keys and syncs the choice across groups', async () => {
    const fixture = TestBed.createComponent(CodeGroup);
    await fixture.whenStable();
    const first = main.querySelector<HTMLButtonElement>('[data-target="a-0"]')!;
    first.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));
    expect(selected()).toEqual(['npm', 'npm']);
    expect(main.querySelector('[data-id="b-1"]')?.getAttribute('data-active')).toBe('true');
    expect(localStorage.getItem('ngmd-code-group')).toBe('npm');
  });

  it('restores the stored choice', async () => {
    localStorage.setItem('ngmd-code-group', 'yarn');
    const fixture = TestBed.createComponent(CodeGroup);
    await fixture.whenStable();
    expect(selected()).toEqual(['pnpm', 'yarn']);
  });
});
