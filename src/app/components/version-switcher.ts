import {Component, computed, ElementRef, HostListener, inject, signal} from '@angular/core';
import {LucideAngularModule, ChevronDown, Check, ExternalLink} from 'lucide-angular';
import type {VersionStatus} from '../../ngmd.config';
import {VersionService} from '../services/version/version.service';

/**
 * Header dropdown of every documentation version.
 *
 * Renders only when `versions` config is set with more than one entry.
 * Trigger reads the active deployment's label; the dropdown lists every
 * entry with its lifecycle chip. The active row is visually marked with
 * a check icon and does nothing on click. Every other row is a plain
 * `<a href target="_blank">` to the entry's deployment URL.
 *
 * Mirrors the adev / PrimeNG model: no internal route navigation, no
 * URL parsing. The live site only renders one version of the docs; the
 * switcher is a registry of external sibling deployments.
 */
@Component({
  selector: 'app-version-switcher',
  imports: [LucideAngularModule],
  template: `
    @if (visible()) {
      <div class="relative">
        <button
          type="button"
          (click)="toggle()"
          [attr.aria-expanded]="open()"
          aria-haspopup="listbox"
          class="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {{ triggerLabel() }}
          <i-lucide [img]="chevronIcon" class="size-3 text-zinc-500"></i-lucide>
        </button>
        @if (open()) {
          <ul
            role="listbox"
            class="absolute right-0 top-[calc(100%+0.375rem)] z-40 min-w-52 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-1 shadow-lg"
          >
            @for (entry of list(); track entry.label) {
              <li role="presentation">
                @if (entry.label === selfLabel()) {
                  <span
                    role="option"
                    aria-selected="true"
                    class="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm bg-zinc-50 dark:bg-zinc-900"
                  >
                    <span class="flex items-center gap-2">
                      <i-lucide [img]="checkIcon" class="size-3 text-zinc-500"></i-lucide>
                      {{ entry.label }}
                    </span>
                    <span
                      class="rounded px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider"
                      [class]="chipClasses(entry.status)"
                    >
                      {{ chipLabel(entry.status) }}
                    </span>
                  </span>
                } @else {
                  <a
                    role="option"
                    aria-selected="false"
                    [href]="entry.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    (click)="open.set(false)"
                    class="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    <span class="flex items-center gap-2">
                      <i-lucide [img]="externalIcon" class="size-3 text-zinc-400"></i-lucide>
                      {{ entry.label }}
                    </span>
                    <span
                      class="rounded px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider"
                      [class]="chipClasses(entry.status)"
                    >
                      {{ chipLabel(entry.status) }}
                    </span>
                  </a>
                }
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class VersionSwitcher {
  private readonly versions = inject(VersionService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly chevronIcon = ChevronDown;
  readonly checkIcon = Check;
  readonly externalIcon = ExternalLink;

  readonly open = signal(false);
  /** Hide when the registry is empty or has only one entry. With one
   *  version there's nothing to switch to. */
  readonly visible = computed(() => this.versions.list().length > 1);
  readonly list = computed(() => this.versions.list());

  readonly selfLabel = computed(() => this.versions.self()?.label ?? '');
  readonly triggerLabel = computed(
    () => this.versions.self()?.label ?? this.list()[0]?.label ?? '',
  );

  toggle(): void {
    this.open.update((v) => !v);
  }

  chipLabel(status: VersionStatus): string {
    if (status === 'current') return 'Latest';
    if (status === 'next') return 'Next';
    if (status === 'rc') return 'RC';
    return 'Deprecated';
  }

  chipClasses(status: VersionStatus): string {
    if (status === 'current') {
      return 'bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]';
    }
    if (status === 'next' || status === 'rc') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    }
    return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500';
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }
}
