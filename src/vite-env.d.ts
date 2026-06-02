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

declare module 'virtual:ngmd/api-index' {
  import type {SymbolRecord} from './types/api';
  /** Every exported symbol discovered by the api-gen plugin from sources
   *  matched by `ngmd.api.ts`. Empty array when `ngmd.api.ts` is absent. */
  export const apiIndex: SymbolRecord[];
}
