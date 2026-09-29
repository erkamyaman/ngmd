import {fenceTracker} from './plugin-utils';

function outsideFences(markdown: string): string[] {
  const inFence = fenceTracker();
  return markdown.split('\n').filter((line) => !inFence(line));
}

describe('fenceTracker', () => {
  it('skips lines inside backtick and tilde fences', () => {
    const md = ['## Real', '```bash', '## Not a heading', '```', '~~~', '# Nope', '~~~', 'after'];
    expect(outsideFences(md.join('\n'))).toEqual(['## Real', 'after']);
  });

  it('closes only on the same character with at least the opener length', () => {
    const md = ['````md', '```ts', '## Nested', '```', '~~~~', '````', '## Out'];
    expect(outsideFences(md.join('\n'))).toEqual(['## Out']);
  });

  it('does not open a backtick fence whose info string has a backtick', () => {
    const md = ['``` not `a fence`', '## Heading', 'after'];
    expect(outsideFences(md.join('\n'))).toEqual(md);
  });

  it('does not close on a fence line with an info string', () => {
    const md = ['```', '```ts', '## Still inside', '```', '## Out'];
    expect(outsideFences(md.join('\n'))).toEqual(['## Out']);
  });
});
