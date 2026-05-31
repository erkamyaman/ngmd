/**
 * Shared clipboard helper. Wraps `navigator.clipboard.writeText` with an
 * SSR-safety check and a try/catch so callers get a simple `Promise<boolean>`
 * instead of repeating the same five lines at every copy site.
 *
 * `true` means the text reached the OS clipboard. `false` covers SSR
 * (no `navigator`), permission denials, and any browser-side write failure.
 * The caller decides what UX to fire (toast, inline flash, silent retry).
 */
export async function writeToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
