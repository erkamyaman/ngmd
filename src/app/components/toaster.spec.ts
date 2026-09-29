import {TestBed} from '@angular/core/testing';
import {ToastService} from '../services/toast/toast.service';
import {Toaster} from './toaster';

describe('Toaster', () => {
  it('keeps its live region mounted so the first toast is announced', async () => {
    TestBed.configureTestingModule({imports: [Toaster]});
    const fixture = TestBed.createComponent(Toaster);
    await fixture.whenStable();
    const region = fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();
    expect(region.textContent.trim()).toBe('');

    TestBed.inject(ToastService).success('Copied.');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-live="polite"]')).toBe(region);
    expect(region.textContent).toContain('Copied.');
  });
});
