/// <reference types="vite/client" />

declare module 'virtual:ngmd/page-meta' {
  export interface PageMeta {
    editUrl: string;
    lastUpdated: string;
  }
  export const pageMeta: Record<string, PageMeta>;
}

declare module 'virtual:ngmd/search-index' {
  import type {IndexDoc} from './types/search';
  export const searchIndex: IndexDoc[];
}
