import {stripUrl} from './route-url.service';

describe('stripUrl', () => {
  it('drops query, fragment and trailing slash', () => {
    expect(stripUrl('/concepts/theming?x=1#tokens')).toBe('/concepts/theming');
    expect(stripUrl('/concepts/theming/')).toBe('/concepts/theming');
    expect(stripUrl('/concepts/theming//#a')).toBe('/concepts/theming');
  });

  it('keeps the root path', () => {
    expect(stripUrl('/')).toBe('/');
    expect(stripUrl('/?q=1')).toBe('/');
  });
});
