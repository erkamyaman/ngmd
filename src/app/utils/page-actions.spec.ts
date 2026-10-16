import {resolvePageActions} from './page-actions';

describe('resolvePageActions', () => {
  const allOn = {copyMarkdown: true, copyLink: true, github: true, chatgpt: true, claude: true};

  it('turns every action on when nothing is configured', () => {
    expect(resolvePageActions(undefined)).toEqual(allOn);
    expect(resolvePageActions({})).toEqual(allOn);
  });

  it('turns off only the actions set to false', () => {
    expect(resolvePageActions({chatgpt: false, claude: false})).toEqual({
      ...allOn,
      chatgpt: false,
      claude: false,
    });
    expect(resolvePageActions({github: true, copyLink: false}).copyLink).toBe(false);
  });

  it('turns everything off for false', () => {
    expect(Object.values(resolvePageActions(false))).toEqual([false, false, false, false, false]);
  });
});
