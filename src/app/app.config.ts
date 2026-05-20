import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withShikiHighlighter } from '@analogjs/content/shiki-highlighter';
import { withInMemoryScrolling } from '@angular/router';
import { marked } from 'marked';
import { ngmdMarkedExtensions } from '../marked-extensions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'disabled',
      }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    provideContent(withMarkdownRenderer(), withShikiHighlighter()),
    // AnalogJS's runtime MarkedSetupService only registers gfm/mangle/shiki.
    // The `markedOptions` in vite.config.ts only feeds the build-time
    // MarkdownRouteComponent. Pages using `<analog-markdown [content]>` parse
    // at runtime, so register our preprocess hooks on the shared marked
    // singleton here too.
    provideAppInitializer(() => {
      marked.use(...ngmdMarkedExtensions);
    }),
  ],
};
