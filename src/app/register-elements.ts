import { Injector, type Type } from '@angular/core';

import { NgmdAccordion, NgmdAccordionItem } from './ui/accordion';
import { NgmdAlert } from './ui/alert';
import { NgmdBadge } from './ui/badge';
import { NgmdCallout } from './ui/callout';
import { NgmdCard } from './ui/card';
import { NgmdCardGrid } from './ui/card-grid';
import { NgmdCodeBlock } from './ui/code-block';
import { NgmdHero } from './ui/hero';
import { NgmdImage } from './ui/image';
import { NgmdPill, NgmdPillRow } from './ui/pill';
import { NgmdTab, NgmdTabs } from './ui/tabs';
import { NgmdVideo } from './ui/video';
import { NgmdStep, NgmdWorkflow } from './ui/workflow';

/**
 * Map of every NgmdUi component to its custom-element tag name.
 *
 * Why this exists: `<analog-markdown [content]>` renders the markdown body
 * via `[innerHTML]` after `bypassSecurityTrustHtml`. Angular does not
 * compile component selectors inside `innerHTML`, so any `<ngmd-callout>`
 * dropped into a `.md` file would be a no-op without this layer.
 *
 * Registering each component as a Custom Element via `@angular/elements`
 * makes them part of the browser's element registry, which DOES upgrade
 * elements that appear inside `innerHTML`. Same source tree, same imports,
 * same outputs — only the host is the browser registry instead of Angular's
 * standalone-imports system.
 *
 * `@angular/elements` is dynamic-imported because it references the DOM's
 * `HTMLElement` at module-load time, which doesn't exist in Node during
 * SSR pre-rendering. The browser-only path is fine because Custom Elements
 * only matter once the markup is in a real document.
 *
 */
const elementMap: Array<[string, Type<unknown>]> = [
  ['ngmd-accordion', NgmdAccordion],
  ['ngmd-accordion-item', NgmdAccordionItem],
  ['ngmd-alert', NgmdAlert],
  ['ngmd-badge', NgmdBadge],
  ['ngmd-callout', NgmdCallout],
  ['ngmd-card', NgmdCard],
  ['ngmd-card-grid', NgmdCardGrid],
  ['ngmd-hero', NgmdHero],
  ['ngmd-image', NgmdImage],
  ['ngmd-pill', NgmdPill],
  ['ngmd-pill-row', NgmdPillRow],
  ['ngmd-step', NgmdStep],
  ['ngmd-tab', NgmdTab],
  ['ngmd-tabs', NgmdTabs],
  ['ngmd-video', NgmdVideo],
  ['ngmd-workflow', NgmdWorkflow],
];

export async function registerNgmdElements(injector: Injector): Promise<void> {
  if (typeof customElements === 'undefined') return;
  const { createCustomElement } = await import('@angular/elements');
  for (const [tag, component] of elementMap) {
    if (customElements.get(tag)) continue;
    customElements.define(tag, createCustomElement(component, { injector }));
  }
}
