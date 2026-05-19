import { Injectable, signal } from '@angular/core';

/**
 * Pages that want to render without the docs chrome (sidebar, breadcrumb, TOC)
 * can flip this signal in their constructor. The app shell reads it.
 */
@Injectable({ providedIn: 'root' })
export class LayoutMode {
  readonly chromeHidden = signal(false);
}
