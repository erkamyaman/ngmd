import {defineApi} from './src/types/api';

/**
 * API-reference scope file. The api-gen Vite plugin reads this on every
 * build, walks the listed sources via ts-morph, and emits one virtual
 * `.page.ts` route per discovered exported symbol under `basePath`.
 *
 * For NgMd's own dogfood, this points at `src/app/ui/` (the authoring
 * component library) so the rendered API pages double as a smoke test
 * of the auto-gen pipeline.
 */
export default defineApi({
  scope: ['src/app/ui/**/*.ts'],
  exclude: ['**/*.spec.ts'],
  basePath: '/api',
  groupBy: 'directory',
  badgesFromJsDoc: ['deprecated', 'experimental', 'beta'],
});
