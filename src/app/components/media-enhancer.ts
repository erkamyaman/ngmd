import {AfterViewInit, Component, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

/**
 * Hydrates the placeholder divs emitted by the ngmd-video and ngmd-image
 * marked extensions. The marked extensions output plain `<div data-...>`
 * elements; this enhancer creates the real <iframe> and <figure><img>
 * structures programmatically — bypassing any Angular [innerHTML]
 * sanitisation that may strip iframes in some configurations.
 */
@Component({
  selector: 'app-media-enhancer',
  template: '',
  styles: `
    :host {
      display: none;
    }
  `,
})
export class MediaEnhancer implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.enhanceWithRetry();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.enhanceWithRetry());
  }

  private enhanceWithRetry(attempt = 0): void {
    if (typeof document === 'undefined' || attempt > 20) return;
    const videos = document.querySelectorAll<HTMLElement>(
      '.ngmd-video[data-video-src]:not([data-enhanced])',
    );
    const images = document.querySelectorAll<HTMLElement>(
      '.ngmd-image[data-image-src]:not([data-enhanced])',
    );
    if (videos.length === 0 && images.length === 0) {
      setTimeout(() => this.enhanceWithRetry(attempt + 1), 50);
      return;
    }
    videos.forEach((el) => this.enhanceVideo(el));
    images.forEach((el) => this.enhanceImage(el));
  }

  private enhanceVideo(el: HTMLElement): void {
    el.setAttribute('data-enhanced', 'true');
    const src = el.dataset['videoSrc'] ?? '';
    const title = el.dataset['videoTitle'] ?? 'Video player';
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.loading = 'lazy';
    el.appendChild(iframe);
  }

  private enhanceImage(el: HTMLElement): void {
    el.setAttribute('data-enhanced', 'true');
    const src = el.dataset['imageSrc'] ?? '';
    const alt = el.dataset['imageAlt'] ?? '';
    const caption = el.dataset['imageCaption'] ?? '';
    const width = el.dataset['imageWidth'] ?? '';

    // Replace the placeholder with an actual <figure>
    const figure = document.createElement('figure');
    figure.className = 'ngmd-image';
    if (width) figure.style.maxWidth = width;

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    figure.appendChild(img);

    if (caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;
      figure.appendChild(figcaption);
    }

    el.replaceWith(figure);
  }
}
