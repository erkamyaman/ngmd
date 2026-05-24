import { Component } from '@angular/core';
import { LucideAngularModule, Github } from 'lucide-angular';

@Component({
  selector: 'app-site-footer',
  imports: [LucideAngularModule],
  template: `
    <footer
      class="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 sm:px-6 text-sm text-zinc-500 dark:text-zinc-400"
    >
      <div
        class="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <span>
          © {{ year }}
          <a
            href="https://github.com/erkamyaman"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-zinc-700 dark:text-zinc-300 hover:text-[color:var(--accent)]"
          >Erkam Yaman</a>.
          Released under the MIT License.
        </span>
        <a
          href="https://github.com/erkamyaman/ngmd"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300"
          aria-label="GitHub repository"
        >
          <i-lucide [img]="githubIcon" class="size-4"></i-lucide>
          erkamyaman/ngmd
        </a>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  readonly githubIcon = Github;
  readonly year = new Date().getFullYear();
}
