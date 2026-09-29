import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Toc} from './toc';

describe('Toc', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(): void {}
        disconnect(): void {}
      },
    );
    TestBed.configureTestingModule({providers: [provideRouter([])]});
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('gives repeated headings unique ids and lists only h2 and h3', async () => {
    document.body.innerHTML = `
      <main><analog-markdown>
        <h2>Install</h2><h3>Flags</h3><h4>Flags</h4>
        <h2>Run</h2><h3>Flags</h3>
        <h2>Setup <ngmd-badge>New</ngmd-badge></h2>
      </analog-markdown></main>`;
    const fixture = TestBed.createComponent(Toc);
    await fixture.whenStable();

    const ids = Array.from(document.querySelectorAll('h2, h3, h4')).map((h) => h.id);
    expect(ids).toEqual(['install', 'flags', 'flags-1', 'run', 'flags-2', 'setup']);
    expect(fixture.componentInstance.headings().map((h) => h.id)).toEqual([
      'install',
      'flags',
      'run',
      'flags-2',
      'setup',
    ]);
    fixture.destroy();
  });
});
