import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {
  ApplicationConfig,
  Injector,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideFileRouter, requestContextInterceptor} from '@analogjs/router';
import {provideContent, withMarkdownRenderer} from '@analogjs/content';
import {withShikiHighlighter} from '@analogjs/content/shiki-highlighter';
import {withInMemoryScrolling, withViewTransitions, TitleStrategy} from '@angular/router';
import {ViewportScroller} from '@angular/common';
import {marked} from 'marked';
import {ngmdRuntimeExtensions} from '../marked-extensions';
import {NgmdTitleStrategy} from './title-strategy';
import {registerNgmdElements} from './register-elements';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'disabled',
      }),
      // Native browser View Transitions API: takes a snapshot of the old
      // route, renders the new one, then crossfades. Hides the markdown
      // resolution gap that caused the "flash of stale content" bug
      // without needing a manual isNavigating signal or opacity hacks.
      // Falls back to default behaviour on older browsers (Chrome <111).
      withViewTransitions(),
    ),
    provideHttpClient(withFetch(), withInterceptors([requestContextInterceptor])),
    provideClientHydration(withEventReplay()),
    provideContent(withMarkdownRenderer(), withShikiHighlighter()),
    {provide: TitleStrategy, useClass: NgmdTitleStrategy},
    // AnalogJS's runtime MarkedSetupService only registers gfm/mangle/shiki.
    // The `markedOptions` in vite.config.ts only feeds the build-time
    // MarkdownRouteComponent. Pages using `<analog-markdown [content]>` parse
    // at runtime, so register our preprocess hooks on the shared marked
    // singleton here too.
    provideAppInitializer(() => {
      marked.use(...ngmdRuntimeExtensions);
      // Sticky header is ~57px tall; offset anchor scroll so headings land
      // below it with breathing room. Without this, Angular's anchor scroll
      // ignores CSS scroll-margin-top and pins headings flush against the
      // header, where backdrop-blur visually destroys them.
      const scroller = inject(ViewportScroller);
      scroller.setOffset([0, 88]);
      // Register NgmdUi components as Custom Elements so they upgrade even
      // when emitted via `bypassSecurityTrustHtml` inside `<analog-markdown
      // [content]>`. Without this, `<ngmd-callout>` tags in `.md` files
      // render as empty unknown HTML — the Angular compiler does not walk
      // `[innerHTML]`. See `register-elements.ts` for the full mapping.
      registerNgmdElements(inject(Injector));
    }),
  ],
};
