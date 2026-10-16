import type {PageActionsConfig} from '../../ngmd.config';

export type ResolvedPageActions = Required<PageActionsConfig>;

/**
 * Fill in the defaults for `ngmd.config.ts > pageActions`: every action is on
 * unless the site turns it off, and `false` turns them all off.
 */
export function resolvePageActions(
  config: PageActionsConfig | false | undefined,
): ResolvedPageActions {
  const on = config !== false;
  const c = config || {};
  return {
    copyMarkdown: on && c.copyMarkdown !== false,
    copyLink: on && c.copyLink !== false,
    github: on && c.github !== false,
    chatgpt: on && c.chatgpt !== false,
    claude: on && c.claude !== false,
  };
}
