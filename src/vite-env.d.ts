/// <reference types="vite/client" />

declare module 'virtual:ngmd/page-meta' {
  import type {PageStatus} from './types/badge';
  export type {PageStatus};
  export interface PageMeta {
    editUrl: string;
    lastUpdated: string;
    /** Optional lifecycle status from frontmatter (`status: beta` etc.).
     * Rendered as a chip next to the sidebar entry. */
    status?: PageStatus;
  }
  export const pageMeta: Record<string, PageMeta>;
}
