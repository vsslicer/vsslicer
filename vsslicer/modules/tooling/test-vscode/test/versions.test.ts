// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { cachePath, resolveVersion, resultsPath } from '../src/versions.ts';

describe('resolveVersion', () => {
  it.each([
    ['^1.100.0', '1.100.0'],
    ['~1.90.2', '1.90.2'],
    ['>=1.85.0', '1.85.0'],
    ['1.80.1', '1.80.1'],
  ])('min from engines %s is %s', (range, want) => expect(resolveVersion('min', range)).toBe(want));

  it('passes other specs through', () => {
    expect(resolveVersion('stable', '^1.100.0')).toBe('stable');
    expect(resolveVersion('1.101.2', '^1.100.0')).toBe('1.101.2');
  });

  it('rejects ranges it cannot read', () => {
    expect(() => resolveVersion('min', '*')).toThrow(/engines\.vscode/);
    expect(() => resolveVersion('min', '^1.100.0 || ^2.0.0')).toThrow();
  });
});

describe('paths', () => {
  it('keys cache and results by version', () => {
    expect(cachePath('.vscode-test', '1.100.0')).toBe('.vscode-test/1.100.0');
    expect(resultsPath('test-results/integration', 'stable')).toBe('test-results/integration/stable');
  });
});
