/**
 * Watch a single `data-*` (or any) attribute on a host element via
 * `MutationObserver`. Calls `onChange` with the attribute's current value
 * synchronously on setup, then again on every change. Returns a teardown
 * fn — wire it into `DestroyRef.onDestroy(...)`.
 *
 * Two Custom-Element-wrapped UI components (`NgmdStep`, `NgmdTab`) need
 * this pattern. Their parent renders inside markdown via
 * `@angular/elements`, so it can't reach into the child via Angular's
 * `ContentChildren`; it sets a `data-*` attribute instead and the child
 * picks the value up here.
 *
 * SSR-safe: when `MutationObserver` is missing (server) the function
 * still calls `onChange` once with whatever the element's initial value
 * is, then returns a noop teardown.
 */
export function watchHostAttribute(
  host: HTMLElement,
  attribute: string,
  onChange: (value: string | null) => void,
): () => void {
  onChange(host.getAttribute(attribute));
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(() => onChange(host.getAttribute(attribute)));
  observer.observe(host, {attributes: true, attributeFilter: [attribute]});
  return () => observer.disconnect();
}
