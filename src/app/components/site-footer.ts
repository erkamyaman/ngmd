import {Component} from '@angular/core';
import {GithubIcon} from '../ui/github-icon';
import {DiscordIcon} from '../ui/discord-icon';
import siteConfig from '../../ngmd.config';

@Component({
  selector: 'app-site-footer',
  imports: [GithubIcon, DiscordIcon],
  template: `
    <footer
      class="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 sm:px-6 text-sm text-zinc-500 dark:text-zinc-400"
    >
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© {{ year }} {{ name }} contributors. Released under the MIT License.</span>
        <nav class="flex flex-wrap items-center gap-4" aria-label="Project links">
          @if (sponsorUrl) {
            <a
              [href]="sponsorUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Sponsor
            </a>
          }
          @if (discordUrl) {
            <a
              [href]="discordUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <svg ngmdDiscordIcon class="size-4"></svg>
              Discord
            </a>
          }
          <a
            [href]="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg ngmdGithubIcon class="size-4"></svg>
            {{ repoLabel }}
          </a>
        </nav>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  readonly year = new Date().getFullYear();
  readonly name = siteConfig.site.name;
  readonly sponsorUrl = siteConfig.site.links?.sponsor;
  readonly discordUrl = siteConfig.site.links?.discord;
  readonly githubUrl = siteConfig.site.githubUrl;
  readonly repoLabel = this.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '');
}
