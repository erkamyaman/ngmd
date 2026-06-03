import {Component, DestroyRef, inject} from '@angular/core';
import {Router} from '@angular/router';
import {enhanceOnNavigation} from '../utils/enhance-on-navigation';

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
export class MediaEnhancer {
  constructor() {
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    enhanceOnNavigation(
      router,
      destroyRef,
      '.ngmd-video[data-video-src]:not([data-enhanced])',
      (el) => this.enhanceVideo(el),
    );
    enhanceOnNavigation(
      router,
      destroyRef,
      '.ngmd-image[data-image-src]:not([data-enhanced])',
      (el) => this.enhanceImage(el),
    );
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
