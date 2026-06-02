import {Injectable, computed} from '@angular/core';
import config from '../../../ngmd.config';
import type {VersionEntry} from '../../../ngmd.config';

/**
 * Version registry for the header switcher.
 *
 * Follows the adev / PrimeNG model: each documentation version is its own
 * deployment, and this service exposes the flat list of every other
 * version's URL so the header switcher can render external `<a href>`
 * links. There is NO internal URL parsing — the live site renders one
 * version, the switcher is a registry of external deployments.
 *
 * Two key signals:
 *
 *   - `self`: the entry representing THIS deployment (labelled by
 *     `versions.self` in `ngmd.config.ts`). The switcher marks it
 *     active, the content banner reads its status.
 *   - `current`: the entry whose `status` is `'current'`. The banner
 *     uses this to link visitors stuck on `next` / `rc` / `deprecated`
 *     deployments toward the live production docs.
 */
@Injectable({providedIn: 'root'})
export class VersionService {
  /** Static registry from config. `null` when versions are not configured. */
  readonly config = computed(() => config.versions ?? null);

  /** Every version entry in render order. Empty when not configured. */
  readonly list = computed<readonly VersionEntry[]>(() => this.config()?.list ?? []);

  /** The entry representing this deployment. `null` if config is missing
   *  or `self` doesn't match any entry. */
  readonly self = computed<VersionEntry | null>(() => {
    const cfg = this.config();
    if (!cfg) return null;
    return cfg.list.find((v) => v.label === cfg.self) ?? null;
  });

  /** The entry flagged as the production current. `null` if config is
   *  missing or no entry has `status: 'current'`. Used by the banner to
   *  point visitors stuck on older / pre-release deployments back to
   *  the live stable docs. */
  readonly current = computed<VersionEntry | null>(() => {
    const cfg = this.config();
    if (!cfg) return null;
    return cfg.list.find((v) => v.status === 'current') ?? null;
  });
}
