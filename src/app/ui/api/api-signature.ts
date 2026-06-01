import {Component, computed, input} from '@angular/core';

/**
 * Renders a single-line code signature for an API symbol. Lightweight by
 * design: no Shiki, no Monaco. Symbol pages can stack several signatures
 * (overloads), and the full file source is always one click away via the
 * "view source" link the page template renders separately.
 */
@Component({
  selector: 'app-api-signature',
  template: `
    <pre
      class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm font-mono overflow-x-auto"
    ><code>{{ display() }}</code></pre>
  `,
})
export class ApiSignature {
  readonly text = input.required<string>();
  readonly display = computed(() => this.text().trim());
}
