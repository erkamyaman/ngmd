import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngmd-video',
  template: `
    <div class="relative w-full aspect-video my-6 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <iframe
        [src]="safeUrl()"
        [title]="title()"
        class="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
  `,
})
export class NgmdVideo {
  private readonly sanitizer = inject(DomSanitizer);

  readonly src = input.required<string>();
  readonly title = input<string>('Video player');

  readonly safeUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl()),
  );

  private readonly embedUrl = computed(() => {
    const src = this.src();
    if (src.startsWith('https://www.youtube.com/embed/')) return src;
    const yt = src.match(/youtube\.com\/watch\?v=([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const ytShort = src.match(/youtu\.be\/([\w-]+)/);
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
    const vm = src.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    return src;
  });
}
