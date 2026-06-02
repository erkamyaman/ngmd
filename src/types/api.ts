/**
 * Public shape of the API-reference scope file (`ngmd.api.ts` at repo root).
 * Authors `import {defineApi} from 'ngmd/api'` and export the result as
 * default so the api-gen plugin can pick it up via Vite's module loader.
 */

export type SymbolKind =
  | 'class'
  | 'interface'
  | 'function'
  | 'const'
  | 'type'
  | 'enum'
  | 'signal-input'
  | 'standalone-component';

export interface ApiConfig {
  /** Glob patterns (Vite-style) for source files to parse. */
  scope: string[];
  /** Glob patterns to exclude (matched against the same set as `scope`). */
  exclude?: string[];
  /** Base URL path under which symbol pages render. Default: `/api`. */
  basePath?: string;
  /** Sidebar grouping strategy. `'package'` reads `package.json` boundaries;
   *  `'directory'` groups by source folder; `'kind'` groups by symbol kind. */
  groupBy?: 'package' | 'directory' | 'kind';
  /** JSDoc tag names that translate to status badges on the rendered page. */
  badgesFromJsDoc?: readonly string[];
}

/**
 * Identity wrapper. Exists so users can declare the config with type
 * inference and IDE autocomplete without manually importing the type.
 */
export function defineApi(config: ApiConfig): ApiConfig {
  return config;
}

/**
 * Internal record emitted by the parser, one per discovered exported symbol.
 * Consumed by the page-template renderer; not part of the user-facing API.
 */
export interface SymbolRecord {
  kind: SymbolKind;
  name: string;
  filePath: string;
  line: number;
  signature: string;
  description: string;
  badges: string[];
  group: string;
}
