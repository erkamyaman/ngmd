import type { MarkedExtension } from 'marked';
import { ngmdVideoExtension } from './ngmd-video';
import { ngmdImageExtension } from './ngmd-image';

/**
 * Marked extensions are split into two arrays.
 *
 * `ngmdRuntimeExtensions` — safe to register on the browser-side marked
 * instance via `app.config.ts > provideAppInitializer`. Only token-level
 * extensions with no Node deps (currently `<ngmd-video>` and `<ngmd-image>`).
 *
 * `ngmdBuildExtensions` — used at build time by `vite.config.ts >
 * markedOptions.extensions`. Adds the build-only extensions that touch
 * `node:fs` (code-import) or load a shiki highlighter (code-group), which
 * would crash if pulled into the client bundle.
 *
 * Chrome (cards, tabs, callouts, alerts, pill rows, workflows, hero, code
 * blocks) lives as Angular components under `src/app/ui/`, not here.
 */
export const ngmdRuntimeExtensions: MarkedExtension[] = [
  {
    extensions: [ngmdVideoExtension, ngmdImageExtension],
  },
];

// Build-time-only extensions are imported lazily below so the runtime bundle
// never resolves their `node:fs` / `shiki` imports. The async getter is
// called by `vite.config.ts` (Node context) only.
export async function getBuildExtensions(): Promise<MarkedExtension[]> {
  const [
    { ngmdCodeImportExtension },
    { ngmdCodeGroupExtension },
    { ngmdCodeHighlightExtension },
  ] = await Promise.all([
    import('./ngmd-code-import'),
    import('./ngmd-code-group'),
    import('./ngmd-code-highlight'),
  ]);
  return [
    ...ngmdRuntimeExtensions,
    ngmdCodeImportExtension,
    ngmdCodeGroupExtension,
    ngmdCodeHighlightExtension,
  ];
}
