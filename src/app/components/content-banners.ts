import {Component, computed, inject} from '@angular/core';
import {LucideAngularModule, AlertTriangle, Archive, ExternalLink, Rocket} from 'lucide-angular';
import {VersionService} from '../services/version/version.service';

/**
 * Banner rendered above every documentation route when THIS deployment
 * isn't the production current. Reads `versions.self` (the entry for
 * this deployment) and `versions.current` (the entry whose status is
 * `'current'`) and points visitors at the latter when they're stuck on
 * a `next` / `rc` / `deprecated` deployment.
 *
 * No DOM when versions config is absent, when self matches the current,
 * or when there's no current entry to link to. The banner is opt-out via
 * config: drop the registry and nothing renders.
 */
@Component({
  selector: 'app-content-banners',
  imports: [LucideAngularModule],
  template: `
    @if (banner(); as b) {
      <div
        class="mb-6 flex items-start gap-3 rounded-lg border px-4 py-3"
        [class]="b.containerClass"
      >
        <i-lucide [img]="b.icon" class="mt-0.5 size-5 shrink-0" [class]="b.iconClass"></i-lucide>
        <div class="text-sm">
          <p class="font-medium">{{ b.title }}</p>
          <p class="mt-1" [class]="b.bodyClass">
            {{ b.prefix }}
            <a
              [href]="b.currentUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 font-medium text-[color:var(--accent-strong)] underline"
            >
              {{ b.currentLabel }}
              <i-lucide [img]="externalIcon" class="size-3"></i-lucide>
            </a>
            .
          </p>
        </div>
      </div>
    }
  `,
})
export class ContentBanners {
  private readonly versions = inject(VersionService);

  readonly externalIcon = ExternalLink;

  readonly banner = computed(() => {
    const self = this.versions.self();
    const current = this.versions.current();
    if (!self || !current) return null;
    if (self.status === 'current') return null;

    const currentUrl = current.url;
    const currentLabel = current.label;

    if (self.status === 'next') {
      return {
        title: "You're reading the next-release docs.",
        prefix: 'The current stable is',
        currentUrl,
        currentLabel,
        icon: Rocket,
        containerClass:
          'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40',
        iconClass: 'text-amber-600',
        bodyClass: 'text-amber-700 dark:text-amber-300',
      };
    }
    if (self.status === 'rc') {
      return {
        title: "You're reading a release candidate.",
        prefix: 'The current stable is',
        currentUrl,
        currentLabel,
        icon: AlertTriangle,
        containerClass:
          'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40',
        iconClass: 'text-amber-600',
        bodyClass: 'text-amber-700 dark:text-amber-300',
      };
    }
    return {
      title: `This is ${self.label}, no longer the current release.`,
      prefix: 'The current stable is',
      currentUrl,
      currentLabel,
      icon: Archive,
      containerClass:
        'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900',
      iconClass: 'text-zinc-500',
      bodyClass: 'text-zinc-600 dark:text-zinc-400',
    };
  });
}
