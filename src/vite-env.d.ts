/// <reference types="vite/client" />

declare module 'virtual:ngmd/page-meta' {
  export interface PageMeta {
    editUrl: string;
    lastUpdated: string;
  }
  export const pageMeta: Record<string, PageMeta>;
}
