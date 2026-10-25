// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { cachePath, defaultCacheDir, resolveVersion, resultsPath, runnerPath } from '../src/versions.ts';

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

describe('defaultCacheDir', () => {
  const home = join('/home', 'u');
  it('prefers VSCODE_TEST_CACHE', () =>
    expect(defaultCacheDir({ VSCODE_TEST_CACHE: '/x/cache', LOCALAPPDATA: 'C:\\L' }, 'win32', home)).toBe('/x/cache'));
  it('is one folder under the home cache on Linux and macOS', () => {
    const want = join(home, '.cache', 'vsslicer', 'vscode-test');
    expect(defaultCacheDir({}, 'linux', home)).toBe(want);
    expect(defaultCacheDir({ VSCODE_TEST_CACHE: '' }, 'darwin', home)).toBe(want);
  });
  it('uses LOCALAPPDATA on Windows, the home cache without it', () => {
    expect(defaultCacheDir({ LOCALAPPDATA: 'C:\\L' }, 'win32', home)).toBe(join('C:\\L', 'vsslicer', 'vscode-test'));
    expect(defaultCacheDir({}, 'win32', home)).toBe(join(home, '.cache', 'vsslicer', 'vscode-test'));
  });
});

describe('runnerPath', () => {
  it('decodes spaces', () =>
    expect(runnerPath('file:///Users/a%20b/dist/run.js', false)).toBe('/Users/a b/runner.cjs'));
  it('drops the slash before a Windows drive letter', () =>
    expect(runnerPath('file:///C:/x%20y/dist/run.js', true)).toBe('C:\\x y\\runner.cjs'));
});
