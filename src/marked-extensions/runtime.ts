import type {MarkedExtension} from 'marked';
import {ngmdVideoExtension} from './ngmd-video.ts';
import {ngmdImageExtension} from './ngmd-image.ts';
import {ngmdKeywordsExtension} from './ngmd-keywords.ts';

export const ngmdRuntimeExtensions: MarkedExtension[] = [
  {
    extensions: [ngmdVideoExtension, ngmdImageExtension],
  },
  ngmdKeywordsExtension,
];
