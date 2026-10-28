// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { softwareGlArgs } from '../src/run.ts';

describe('softwareGlArgs', () => {
  it('is empty unless VSSLICER_TEST_SOFTWARE_GL=1', () => {
    expect(softwareGlArgs({})).toEqual([]);
    expect(softwareGlArgs({ VSSLICER_TEST_SOFTWARE_GL: '0' })).toEqual([]);
  });
  it('asks for SwiftShader when set', () => {
    expect(softwareGlArgs({ VSSLICER_TEST_SOFTWARE_GL: '1' })).toContain('--enable-unsafe-swiftshader');
  });
});
