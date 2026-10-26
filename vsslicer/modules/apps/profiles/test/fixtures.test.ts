// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { existsSync, readdirSync } from 'node:fs';

const root = new URL('./fixtures/', import.meta.url);
// One user-preset folder per slicer, relative to the per-OS home folder.
const bases = { macos: 'Library/Application Support', windows: 'AppData/Roaming', linux: '.config' };
const cura = { macos: 'Library/Application Support/cura', windows: 'AppData/Roaming/cura', linux: '.local/share/cura' };

for (const os of ['macos', 'windows', 'linux'] as const) {
  test(`slicer-config-${os} holds user presets for all five slicers`, () => {
    const home = new URL(`slicer-config-${os}/`, root);
    const dirs = [
      `${bases[os]}/OrcaSlicer/user/default/process`,
      `${bases[os]}/BambuStudio/user/default/process`,
      `${bases[os]}/PrusaSlicer/print`,
      `${bases[os]}/SuperSlicer/print`,
      `${cura[os]}/5.8/quality_changes`,
    ];
    for (const d of dirs) {
      const p = new URL(`${d}/`, home);
      assert.ok(existsSync(p) && readdirSync(p).length > 0, `${d} has a preset`);
    }
  });
}
