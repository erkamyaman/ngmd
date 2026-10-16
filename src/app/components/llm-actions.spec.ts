import {signal} from '@angular/core';
import {TestBed, type ComponentFixture} from '@angular/core/testing';
import {RouteUrlService} from '../services/route-url/route-url.service';
import {LlmActions} from './llm-actions';

const state = vi.hoisted(() => ({pageActions: undefined as unknown}));

vi.mock('virtual:ngmd/page-meta', () => ({
  pageMeta: {
    '/guide': {editUrl: 'https://github.com/o/r/edit/main/src/content/guide.md', lastUpdated: ''},
  },
}));
vi.mock('../../ngmd.config', () => ({
  default: {
    site: {name: 'Docs'},
    get pageActions() {
      return state.pageActions;
    },
  },
}));

async function render(url = '/guide'): Promise<ComponentFixture<LlmActions>> {
  TestBed.configureTestingModule({
    providers: [{provide: RouteUrlService, useValue: {cleanUrl: signal(url)}}],
  });
  const fixture = TestBed.createComponent(LlmActions);
  await fixture.whenStable();
  return fixture;
}

async function menuLabels(fixture: ComponentFixture<LlmActions>): Promise<string[]> {
  const el: HTMLElement = fixture.nativeElement;
  el.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')?.click();
  await fixture.whenStable();
  return [...el.querySelectorAll('[role="menuitem"]')].map((i) => i.textContent!.trim());
}

describe('LlmActions page actions config', () => {
  afterEach(() => {
    state.pageActions = undefined;
  });

  it('shows every action by default', async () => {
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Copy Markdown');
    expect(await menuLabels(fixture)).toEqual([
      'Copy Markdown Link',
      'Open in GitHub',
      'Open in ChatGPT',
      'Open in Claude',
    ]);
  });

  it('hides the ChatGPT and Claude items when they are turned off', async () => {
    state.pageActions = {chatgpt: false, claude: false};
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    expect(await menuLabels(fixture)).toEqual(['Copy Markdown Link', 'Open in GitHub']);
  });

  it('hides each action on its own', async () => {
    state.pageActions = {copyLink: false, github: false};
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    expect(await menuLabels(fixture)).toEqual(['Open in ChatGPT', 'Open in Claude']);
  });

  it('drops the Copy Markdown button but keeps the menu', async () => {
    state.pageActions = {copyMarkdown: false};
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain('Copy Markdown ');
    expect(el.querySelector('[aria-label="Copy markdown to clipboard"]')).toBeNull();
    expect((await menuLabels(fixture)).length).toBe(4);
  });

  it('drops the menu but keeps the Copy Markdown button', async () => {
    state.pageActions = {copyLink: false, github: false, chatgpt: false, claude: false};
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[aria-label="Copy markdown to clipboard"]')).not.toBeNull();
    expect(el.querySelector('button[aria-haspopup="menu"]')).toBeNull();
  });

  it('renders nothing when pageActions is false or every action is off', async () => {
    state.pageActions = false;
    expect((await render()).nativeElement.querySelector('button')).toBeNull();
    TestBed.resetTestingModule();
    state.pageActions = {
      copyMarkdown: false,
      copyLink: false,
      github: false,
      chatgpt: false,
      claude: false,
    };
    expect((await render()).nativeElement.querySelector('button')).toBeNull();
  });
});
