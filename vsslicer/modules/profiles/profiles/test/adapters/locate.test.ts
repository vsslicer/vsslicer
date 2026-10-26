// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import type { DirectoryLister } from '../../src/application/file-system-port.ts';
import { locateInstalledSlicers, MAX_CURA_ENTRIES, type LocateInput } from '../../src/adapters/locate/locate.ts';

/** Fake file system: a map from directory path to entry names; `unreadable` paths reject with EACCES. */
function fakeFs(dirs: Record<string, string[]>, unreadable: string[] = []): DirectoryLister & { calls: number } {
  const fs = {
    calls: 0,
    async listDirectory(path: string) {
      fs.calls++;
      if (unreadable.includes(path)) throw Object.assign(new Error('denied'), { code: 'EACCES' });
      const d = dirs[path];
      if (!d) throw Object.assign(new Error('nope'), { code: 'ENOENT' });
      return d;
    },
  };
  return fs;
}
const paths = async (i: LocateInput) => (await locateInstalledSlicers(i)).found.map((f) => f.path);

const table: { name: string; input: Omit<LocateInput, 'fs'>; dirs: Record<string, string[]>; expected: string[] }[] = [
  {
    name: 'macOS',
    input: { platform: 'darwin', home: '/Users/a', env: {} },
    dirs: {
      '/Users/a/Library/Application Support/PrusaSlicer': [],
      '/Users/a/Library/Application Support/BambuStudio': [],
      '/Users/a/Library/Application Support/cura': ['5.6', '5.10', 'junk'],
    },
    expected: [
      '/Users/a/Library/Application Support/PrusaSlicer',
      '/Users/a/Library/Application Support/BambuStudio',
      '/Users/a/Library/Application Support/cura/5.10',
      '/Users/a/Library/Application Support/cura/5.6',
    ],
  },
  {
    name: 'Windows with APPDATA',
    input: { platform: 'win32', home: 'C:\\Users\\a', env: { APPDATA: 'D:\\Roam' } },
    dirs: { 'D:\\Roam\\OrcaSlicer': [], 'D:\\Roam\\SuperSlicer': [], 'D:\\Roam\\cura': ['5.7'] },
    expected: ['D:\\Roam\\SuperSlicer', 'D:\\Roam\\OrcaSlicer', 'D:\\Roam\\cura\\5.7'],
  },
  {
    name: 'Windows without APPDATA',
    input: { platform: 'win32', home: 'C:\\Users\\a', env: {} },
    dirs: { 'C:\\Users\\a\\AppData\\Roaming\\PrusaSlicer': [] },
    expected: ['C:\\Users\\a\\AppData\\Roaming\\PrusaSlicer'],
  },
  {
    name: 'Linux native with XDG_CONFIG_HOME',
    input: { platform: 'linux', home: '/home/a', env: { XDG_CONFIG_HOME: '/x' } },
    dirs: { '/x/OrcaSlicer': [], '/x/cura': ['5.7'] },
    expected: ['/x/OrcaSlicer', '/x/cura/5.7'],
  },
  {
    name: 'Linux native Cura reports config and XDG_DATA_HOME data folders',
    input: { platform: 'linux', home: '/home/a', env: { XDG_DATA_HOME: '/d' } },
    dirs: { '/home/a/.config/cura': ['5.7'], '/d/cura': ['5.7'] },
    expected: ['/home/a/.config/cura/5.7', '/d/cura/5.7'],
  },
  {
    name: 'Linux Flatpak and Snap',
    input: { platform: 'linux', home: '/home/a', env: {} },
    dirs: {
      '/home/a/.var/app/com.prusa3d.PrusaSlicer/config/PrusaSlicer': [],
      '/home/a/.var/app/com.orcaslicer.OrcaSlicer/config/OrcaSlicer': [],
      '/home/a/.var/app/io.github.softfever.OrcaSlicer/config/OrcaSlicer': [],
      '/home/a/.var/app/com.ultimaker.cura/data/cura': ['5.7'],
      '/home/a/snap/cura-slicer/current/.local/share/cura': ['5.6'],
      '/home/a/.config/PrusaSlicer3-dev': [],
      '/home/a/snap/prusa-slicer/current/.config/PrusaSlicer': [],
      '/home/a/.var/app/com.ultimaker.cura/config/cura': ['5.7'],
    },
    expected: [
      '/home/a/.config/PrusaSlicer3-dev',
      '/home/a/.var/app/com.prusa3d.PrusaSlicer/config/PrusaSlicer',
      '/home/a/snap/prusa-slicer/current/.config/PrusaSlicer',
      '/home/a/.var/app/com.orcaslicer.OrcaSlicer/config/OrcaSlicer',
      '/home/a/.var/app/io.github.softfever.OrcaSlicer/config/OrcaSlicer',
      '/home/a/.var/app/com.ultimaker.cura/config/cura/5.7',
      '/home/a/.var/app/com.ultimaker.cura/data/cura/5.7',
      '/home/a/snap/cura-slicer/current/.local/share/cura/5.6',
    ],
  },
];

describe('locateInstalledSlicers', () => {
  test.each(table)('$name', async ({ input, dirs, expected }) => {
    expect(await paths({ ...input, fs: fakeFs(dirs) })).toEqual(expected);
  });

  test('missing and unreadable folders become diagnostics, nothing throws', async () => {
    const dir = '/Users/a/Library/Application Support/PrusaSlicer';
    const r = await locateInstalledSlicers({
      platform: 'darwin',
      home: '/Users/a',
      env: {},
      fs: fakeFs({}, [dir]),
    });
    expect(r.found).toEqual([]);
    expect(r.diagnostics.find((d) => d.path === dir)?.code).toBe('unreadable');
    expect(r.diagnostics.filter((d) => d.code === 'missing')).toHaveLength(6);
  });

  test('hostile input: huge Cura directory is capped', async () => {
    const root = '/Users/a/Library/Application Support/cura';
    const entries = Array.from({ length: 100_000 }, (_, i) => `1.${i}`);
    const r = await locateInstalledSlicers({
      platform: 'darwin',
      home: '/Users/a',
      env: {},
      fs: fakeFs({ [root]: entries }),
    });
    expect(r.found).toHaveLength(MAX_CURA_ENTRIES);
    expect(r.diagnostics.some((d) => d.code === 'truncated')).toBe(true);
  });

  test('Cura Linux results say whether the folder is config or data', async () => {
    const r = await locateInstalledSlicers({
      platform: 'linux',
      home: '/h',
      env: {},
      fs: fakeFs({ '/h/.config/cura': ['5.7'], '/h/.local/share/cura': ['5.7'] }),
    });
    expect(r.found.map((f) => f.kind)).toEqual(['config', 'data']);
  });

  test('lookups are bounded by the candidate table, not by input', async () => {
    const fs = fakeFs({});
    await locateInstalledSlicers({ platform: 'linux', home: '/h', env: {}, fs });
    expect(fs.calls).toBe(8 + 9 + 5);
  });
});
