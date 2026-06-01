import {Component, computed, input} from '@angular/core';

/**
 * Renders a symbol's JSDoc body. Plain prose for now; once `marked` is
 * exposed on the runtime side via a shared helper, this component will
 * render the description through the same pipeline as `.md` content (code
 * fences highlighted, inline links resolved, keyword auto-linking applied).
 *
 * Today: paragraphs split on blank lines, `<code>` for backtick-wrapped
 * tokens, inline `<a>` for autolink-style URLs. Enough for the v1 cut.
 */
@Component({
  selector: 'app-api-jsdoc',
  template: `
    @for (block of paragraphs(); track $index) {
      <p
        class="text-zinc-700 dark:text-zinc-300 leading-relaxed [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:dark:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]"
        [innerHTML]="block"
      ></p>
    }
  `,
})
export class ApiJsDoc {
  readonly text = input<string>('');

  readonly paragraphs = computed(() => {
    const body = this.text().trim();
    if (!body) return [];
    return body.split(/\n\s*\n/).map((p) => formatParagraph(p));
  });
}

/**
 * Cheap-and-cheerful markdown-ish rendering for JSDoc bodies. The goal is
 * readable HTML without pulling in the full marked pipeline at this point.
 */
function formatParagraph(input: string): string {
  let out = escapeHtml(input).replace(/\n/g, ' ');
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
  out = out.replace(/(https?:\/\/[^\s<]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[color:var(--accent-strong)] underline">${url}</a>`);
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
