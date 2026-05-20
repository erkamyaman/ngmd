import type { MarkedExtension } from 'marked';
import { ngmdVideoExtension } from './ngmd-video';
import { ngmdImageExtension } from './ngmd-image';

/**
 * Marked extensions kept around after the Spartan migration. Only inline
 * media tags (video, image) live here. Chrome (cards, tabs, callouts, alerts,
 * pill rows, workflows, hero, code blocks) is now Angular components under
 * `src/app/ui/`.
 */
export const ngmdMarkedExtensions: MarkedExtension[] = [
  {
    extensions: [ngmdVideoExtension, ngmdImageExtension],
  },
];
