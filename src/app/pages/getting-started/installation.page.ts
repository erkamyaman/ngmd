import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { injectContent, MarkdownComponent } from '@analogjs/content';

@Component({
  selector: 'app-installation',
  imports: [AsyncPipe, MarkdownComponent],
  template: `
    @if (content$ | async; as doc) {
      <article class="max-w-3xl mx-auto p-8">
        <analog-markdown [content]="doc.content" />
      </article>
    }
  `,
})
export default class InstallationPage {
  readonly content$ = injectContent<{ title: string }>({ customFilename: 'installation' });
}
