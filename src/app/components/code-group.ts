import {AfterViewInit, Component, DestroyRef, inject} from '@angular/core';
import {Router} from '@angular/router';
import {enhanceOnNavigation} from '../utils/enhance-on-navigation';

/**
 * Wires tab-switching for `<div class="ngmd-code-group">` blocks emitted by
 * the `ngmd-code-group` marked extension. Each tab's `data-target` points at
 * a sibling panel's `data-id`; clicking flips `data-active` on the pair.
 *
 * Same pattern as CodeCopy / ExternalLinks / HeadingAnchors: scan `<main>`
 * after each route change, idempotent via `data-enhanced` marker.
 */
@Component({
  selector: 'app-code-group',
  template: '',
  styles: `
    :host {
      display: none;
    }
  `,
})
export class CodeGroup implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    enhanceOnNavigation(
      this.router,
      this.destroyRef,
      'main .ngmd-code-group:not([data-enhanced])',
      (group) => this.enhance(group),
    );
  }

  private enhance(group: HTMLElement): void {
    group.setAttribute('data-enhanced', 'true');
    const tabs = [...group.querySelectorAll<HTMLButtonElement>('.ngmd-code-group__tab')];
    group.querySelector('.ngmd-code-group__tabs')?.setAttribute('role', 'tablist');

    for (const tab of tabs) {
      const target = tab.getAttribute('data-target');
      const panel = target ? group.querySelector<HTMLElement>(`[data-id="${target}"]`) : null;
      if (!target || !panel) continue;
      tab.id = `${target}-tab`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', target);
      panel.id = target;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;

      tab.addEventListener('click', () => {
        selectTab(tab);
        const label = tabLabel(tab);
        try {
          localStorage.setItem(STORAGE_KEY, label);
        } catch {}
        for (const other of document.querySelectorAll<HTMLButtonElement>(
          '.ngmd-code-group[data-enhanced] .ngmd-code-group__tab',
        )) {
          if (other !== tab && tabLabel(other) === label) selectTab(other);
        }
      });
      tab.addEventListener('keydown', (event) => {
        const index = tabs.indexOf(tab);
        const next =
          event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : event.key === 'ArrowLeft'
              ? (index - 1 + tabs.length) % tabs.length
              : event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? tabs.length - 1
                  : -1;
        if (next === -1) return;
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    }

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const initial =
      tabs.find((t) => stored !== null && tabLabel(t) === stored) ??
      tabs.find((t) => t.getAttribute('data-active') === 'true') ??
      tabs[0];
    if (initial) selectTab(initial);
  }
}

const STORAGE_KEY = 'ngmd-code-group';

function tabLabel(tab: HTMLElement): string {
  return tab.textContent?.trim() ?? '';
}

function selectTab(tab: HTMLButtonElement): void {
  const group = tab.closest('.ngmd-code-group');
  if (!group) return;
  for (const t of group.querySelectorAll<HTMLButtonElement>('.ngmd-code-group__tab')) {
    const active = t === tab;
    t.setAttribute('data-active', String(active));
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
  }
  const target = tab.getAttribute('data-target');
  for (const p of group.querySelectorAll<HTMLElement>('.ngmd-code-group__panel')) {
    p.setAttribute('data-active', String(p.getAttribute('data-id') === target));
  }
}
