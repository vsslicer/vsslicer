// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadCatalogue } from '../src/adapters/catalogue.ts';
import { unknownCommands } from '../src/application/features.ts';
import { detectFlavour, HEAD_BYTES } from '../src/domain/flavour.ts';
import { buildIndex, resolveFlavour } from '../src/domain/lookup.ts';

const index = buildIndex(loadCatalogue(fileURLToPath(new URL('../catalogue', import.meta.url))));
const dir = new URL('fixtures/corpus/', import.meta.url);
const headTail = (t: string): [string, string] => [t.slice(0, HEAD_BYTES), t.slice(-HEAD_BYTES)];
const files = readdirSync(dir).filter((f) => f.endsWith('.gcode'));

test('no corpus file gets an unknown-command warning with its detected flavour', () => {
  assert.equal(files.length, 15);
  for (const f of files) {
    const text = readFileSync(new URL(f, dir), 'latin1');
    const flavour = resolveFlavour(index, detectFlavour(...headTail(text)));
    assert.deepEqual(
      unknownCommands(index, flavour, text).map((u) => u.code),
      [],
      `${f} (${flavour})`,
    );
  }
});

test('Bambu and Prusa Buddy files resolve to their own catalogues', () => {
  const flavourOf = (f: string) =>
    resolveFlavour(index, detectFlavour(...headTail(readFileSync(new URL(f, dir), 'latin1'))));
  assert.equal(flavourOf('bambu-studio--cube.gcode'), 'bambu');
  assert.equal(flavourOf('orca--cube-x1c.gcode'), 'bambu');
  assert.equal(flavourOf('orca--cube-marlin.gcode'), 'marlin'); // its config block is at the end of the file
  assert.equal(flavourOf('prusaslicer--test_vase.gcode'), 'marlin'); // MK3MMU2 runs Prusa-Firmware, not Buddy
  assert.equal(flavourOf('superslicer--superslicer-2.3.56-arcwelder.gcode'), 'klipper');
  assert.equal(flavourOf('prusaslicer--mini_cube_ps2.8.1.gcode'), 'prusa-buddy');
});
