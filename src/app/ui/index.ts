export { NgmdAlert } from './alert';
export { NgmdCallout } from './callout';
export { NgmdCard } from './card';
export { NgmdCodeBlock } from './code-block';
export { NgmdHero } from './hero';
export { NgmdImage } from './image';
export { NgmdPill, NgmdPillRow } from './pill';
export { NgmdStep, NgmdWorkflow } from './workflow';
export { NgmdTab, NgmdTabs } from './tabs';
export { NgmdVideo } from './video';

import { NgmdAlert } from './alert';
import { NgmdCallout } from './callout';
import { NgmdCard } from './card';
import { NgmdCodeBlock } from './code-block';
import { NgmdHero } from './hero';
import { NgmdImage } from './image';
import { NgmdPill, NgmdPillRow } from './pill';
import { NgmdStep, NgmdWorkflow } from './workflow';
import { NgmdTab, NgmdTabs } from './tabs';
import { NgmdVideo } from './video';

/**
 * Spread into a page's `imports` to get every chrome component in one go:
 *   `imports: [...NgmdUi]`. For lighter pages, import only what you use.
 *
 * Not declared `as const`: Angular's standalone-component compiler needs
 * to resolve the array contents statically; a readonly tuple makes it
 * bail out and the page silently renders empty.
 */
export const NgmdUi = [
  NgmdAlert,
  NgmdCallout,
  NgmdCard,
  NgmdCodeBlock,
  NgmdHero,
  NgmdImage,
  NgmdPill,
  NgmdPillRow,
  NgmdStep,
  NgmdWorkflow,
  NgmdTab,
  NgmdTabs,
  NgmdVideo,
];
