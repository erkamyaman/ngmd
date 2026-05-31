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
    const tabs = group.querySelectorAll<HTMLButtonElement>('.ngmd-code-group__tab');
    const panels = group.querySelectorAll<HTMLElement>('.ngmd-code-group__panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        if (!target) return;
        tabs.forEach((t) => t.setAttribute('data-active', t === tab ? 'true' : 'false'));
        panels.forEach((p) =>
          p.setAttribute('data-active', p.getAttribute('data-id') === target ? 'true' : 'false'),
        );
      });
    });
  }
}
