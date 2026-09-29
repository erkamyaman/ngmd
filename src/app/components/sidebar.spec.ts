import {TestBed} from '@angular/core/testing';
import config from '../../ngmd.config';
import {SidebarState} from './sidebar';

const section = config.nav[0];

describe('SidebarState', () => {
  it('starts with every section open and toggles one at a time', () => {
    const state = TestBed.inject(SidebarState);
    expect(config.nav.every((s) => state.openSections().has(s.label))).toBe(true);
    state.toggle(section.label);
    expect(state.openSections().has(section.label)).toBe(false);
    state.toggle(section.label);
    expect(state.openSections().has(section.label)).toBe(true);
  });

  it('reopens the section that holds the current page', () => {
    const state = TestBed.inject(SidebarState);
    state.toggle(section.label);
    state.reveal('/zz-not-in-nav');
    expect(state.openSections().has(section.label)).toBe(false);
    state.reveal(section.items[0].href);
    expect(state.openSections().has(section.label)).toBe(true);
  });
});
