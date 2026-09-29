import {Component, input} from '@angular/core';
import siteConfig from '../../ngmd.config';

@Component({
  selector: 'app-sponsor-list',
  template: `
    @if (sponsors.length > 0) {
      <ul class="flex flex-wrap gap-4 list-none p-0 m-0">
        @for (sponsor of sponsors; track sponsor.login) {
          <li class="m-0">
            <a
              [href]="'https://github.com/' + sponsor.login"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col items-center gap-2 rounded-lg p-2 no-underline! hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <img
                [src]="'https://github.com/' + sponsor.login + '.png?size=' + size() * 2"
                [width]="size()"
                [height]="size()"
                [alt]="sponsor.name"
                loading="lazy"
                class="rounded-full border border-zinc-200 dark:border-zinc-800"
              />
              @if (showNames()) {
                <span class="text-sm font-medium">{{ sponsor.name }}</span>
              }
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class SponsorList {
  readonly size = input(60);
  readonly showNames = input(false);
  protected readonly sponsors = siteConfig.sponsors ?? [];
}
