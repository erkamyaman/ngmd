/**
 * Single source of truth for every badge variant used across NgMd.
 *
 * One map, two consumers:
 *   - `<ngmd-badge variant="...">` (`src/app/ui/badge.ts`): inline status pill
 *   - sidebar status chip (`src/app/components/sidebar.ts`), driven by
 *     `NavItem.status` declared in `ngmd.config.ts`
 *
 * Add a row here to define a new variant. Both the inline component and
 * the sidebar pick it up without further edits.
 */
export const BADGE_VARIANTS = {
  new: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  updated: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
  alpha: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  beta: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  stable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  deprecated: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 line-through',
} as const satisfies Record<string, string>;

export type BadgeVariant = keyof typeof BADGE_VARIANTS;
