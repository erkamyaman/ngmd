import {ApplicationRef, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {registerNgmdElements} from './register-elements';

describe('registerNgmdElements', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('boots custom elements only inside markdown hosts', async () => {
    await registerNgmdElements(TestBed.inject(Injector));

    document.body.innerHTML = `
      <analog-markdown-route><ngmd-badge variant="beta">md</ngmd-badge></analog-markdown-route>
      <div id="page"><ngmd-badge variant="beta">page</ngmd-badge></div>
    `;
    await TestBed.inject(ApplicationRef).whenStable();

    const inMarkdown = document.querySelector('analog-markdown-route ngmd-badge')!;
    const onPage = document.querySelector('#page ngmd-badge')!;
    expect(inMarkdown.querySelector('span.rounded-full')?.textContent?.trim()).toBe('md');
    expect(onPage.innerHTML).toBe('page');
  });
});
