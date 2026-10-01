import {tmpdir} from 'node:os';
import {Marked, type MarkedExtension} from 'marked';
import {getBuildExtensions} from './src/marked-extensions/index';
import {ngmdCodeGroupExtension} from './src/marked-extensions/ngmd-code-group';
import {ngmdCodeHighlightExtension} from './src/marked-extensions/ngmd-code-highlight';
import {ngmdCodeImportExtension} from './src/marked-extensions/ngmd-code-import';

function preprocess(extension: MarkedExtension, markdown: string): Promise<string> {
  return (extension.hooks!.preprocess as (markdown: string) => Promise<string>)(markdown);
}

async function renderBuild(markdown: string, extension: MarkedExtension): Promise<string> {
  return new Marked({async: true}, extension).parse(markdown);
}

describe('build-time fence extensions', () => {
  it('leaves examples nested in a longer fence alone', async () => {
    const md = '````md\n```bash group="a"\none\n```\n\n```bash group="a"\ntwo\n```\n````\n';
    expect(await preprocess(ngmdCodeGroupExtension, md)).toBe(md);
    const hl = '````md\n```ts {1}\na\n```\n````\n';
    expect(await preprocess(ngmdCodeHighlightExtension, hl)).toBe(hl);
  });

  it('merges adjacent same-group fences, escapes labels and keeps lone fences', async () => {
    const html = await renderBuild(
      '```bash group="g" name="<b>&" active\r\none\r\n```\r\n\r\n```bash group="g" name="active tab"\r\ntwo\r\n```\r\n\r\ntext\r\n\r\n```bash group="g"\r\nlone\r\n```\r\n',
      ngmdCodeGroupExtension,
    );
    expect(html.match(/class="ngmd-code-group"/g)).toHaveLength(1);
    expect(html).toContain('data-active="true">&lt;b&gt;&amp;</button>');
    expect(html).toContain('data-active="false">active tab</button>');
    expect(html).toContain('<code class="language-bash">lone');
  });

  it('highlights clamped, reversed and out-of-range lines without blowing up', async () => {
    const html = await preprocess(
      ngmdCodeHighlightExtension,
      '```typescript title="x" {3-2,1-999999999}\nconst a = 1;\nb\n```\n',
    );
    expect(html.match(/class="line highlighted"/g)).toHaveLength(2);
    expect(html).not.toContain('class="line"');
    expect(html).toContain('--shiki-light:#CF222E');
  });

  it('imports ranges, and warns and keeps the fence when the range does not fit', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const ok = await preprocess(
      ngmdCodeImportExtension,
      '```ts title="t" file="src/marked-extensions/escape-html.ts#L1"\n```\n',
    );
    expect(ok).toContain('escape-html.ts#L1</a>');
    expect(ok).toContain('escapeHtml');
    for (const range of ['#L5-L99', '#L3-L1', '#foo']) {
      const md = `\`\`\`ts file="src/marked-extensions/escape-html.ts${range}"\n\`\`\`\n`;
      expect(await preprocess(ngmdCodeImportExtension, md)).toBe(md);
    }
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });

  it('resolves imported files from the site root, not the working directory', async () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(tmpdir());
    const html = await preprocess(
      ngmdCodeImportExtension,
      '```ts file="src/marked-extensions/escape-html.ts#L1"\n```\n',
    );
    expect(html).toContain('escapeHtml');
    cwd.mockRestore();
  });

  it('substitutes vars before the fence extensions run', async () => {
    const extensions = await getBuildExtensions();
    const html = await new Marked({async: true}, ...extensions).parse(
      '```bash group="i"\nnpm i x@{{ngmd-version}}\n```\n\n```bash group="i"\npnpm add x@{{ ngmd-version }}\n```\n\n{{unknown}}',
    );
    expect(html).not.toContain('ngmd-version');
    expect(html).toMatch(/x@\d+\.\d+\.\d+/);
    expect(html).toContain('{{unknown}}');
  });
});
