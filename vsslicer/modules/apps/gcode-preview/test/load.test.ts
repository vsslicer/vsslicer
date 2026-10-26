// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { createReadStream, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MOVE_STRIDE, MoveOffset } from '@vsslicer/gcode-api';
import { resolveLimits } from '@vsslicer/gcode-planner';
import { loadPreview } from '../src/application/load-preview.ts';
import { workerLoader } from '../src/adapters/worker-loader.ts';

export const fixture = (p: string) => fileURLToPath(new URL(`fixtures/${p}`, import.meta.url));
export const FIVE_SLICERS = [
  'prusaslicer/mini_cube_ps2.8.1.gcode',
  'superslicer/superslicer-2.3.56-arcwelder.gcode',
  'orca/cube-marlin.gcode',
  'bambu-studio/cube.gcode',
  'cura/cube-cylinder-4.10.0.gcode',
];
const lastStartTime = (moves: ArrayBuffer[]) => {
  const last = moves.at(-1)!;
  return new DataView(last).getFloat32(last.byteLength - MOVE_STRIDE + MoveOffset.startTime, true);
};

for (const f of FIVE_SLICERS)
  test(`parses and plans ${f}`, async () => {
    const { parsed, timing } = await loadPreview('gcode', createReadStream(fixture(f)));
    assert.ok(parsed.moveCount > 100);
    assert.ok(parsed.layers.length > 1);
    assert.ok(Number.isFinite(timing.totalTime) && timing.totalTime > 0);
    assert.strictEqual(timing.layerTimes.length, parsed.layers.length);
    assert.ok(lastStartTime(parsed.moves) > 0, 'start times are written into the move buffers');
  });

test('a .bgcode decodes to the same moves as its .gcode twin', async () => {
  const text = await loadPreview('gcode', createReadStream(fixture('prusaslicer/mini_cube_ps2.8.1.gcode')));
  const bin = await loadPreview('bgcode', createReadStream(fixture('prusaslicer/mini_cube_ps2.8.1.bgcode')));
  assert.strictEqual(bin.parsed.slicer, 'prusaslicer');
  assert.strictEqual(bin.parsed.moveCount, text.parsed.moveCount);
  assert.strictEqual(bin.parsed.layers.length, text.parsed.layers.length);
  assert.deepStrictEqual(
    bin.parsed.diagnostics.filter((d) => d.code.startsWith('bgcode-')),
    [],
  );
});

test('bgcode container problems become diagnostics', async () => {
  const whole = readFileSync(fixture('prusaslicer/mini_cube_ps2.8.1.bgcode'));
  const broken = async function* () {
    yield whole.subarray(0, 100); // cut inside the first block
  };
  const { parsed } = await loadPreview('bgcode', broken());
  assert.ok(parsed.diagnostics.some((d) => d.code.startsWith('bgcode-')));
});

const entry = new URL('../src/adapters/worker-entry.ts', import.meta.url);

test('the worker parses and plans off the calling thread and moves the buffers back', async () => {
  const { parsed, timing } = await workerLoader(entry)(
    fixture('bambu-studio/cube.gcode'),
    'gcode',
    new AbortController().signal,
  );
  assert.ok(parsed.moves.every((b) => b instanceof ArrayBuffer && b.byteLength > 0));
  assert.strictEqual(
    parsed.moves.reduce((n, b) => n + b.byteLength, 0),
    parsed.moveCount * MOVE_STRIDE,
  );
  assert.ok(timing.totalTime > 0);
});

test('a missing file rejects with a coded error', async () => {
  await assert.rejects(workerLoader(entry)('/nonexistent/x.gcode', 'gcode', new AbortController().signal), {
    code: 'ENOENT',
  });
});

test('abort terminates the worker and rejects with the reason', async () => {
  const ctl = new AbortController();
  const p = workerLoader(entry)(fixture('cura/cube-cylinder-4.10.0.gcode'), 'gcode', ctl.signal);
  ctl.abort(new Error('closed'));
  await assert.rejects(p, /closed/);
});

const inline = (flavour: string) =>
  async function* () {
    yield Buffer.from(
      `; x_config = begin\n; gcode_flavor = ${flavour}\n; x_config = end\nG28\nG1 Z0.2 F600\n` +
        Array.from({ length: 200 }, (_, i) => `G1 X${(i % 2) * 0.3} Y${i * 0.2} E${i * 0.01} F9000`).join('\n'),
    );
  };

test('planner choice goes through plannerFor: Bambu files get their planner, RRF differs from Marlin', async () => {
  const bambu = await loadPreview('gcode', createReadStream(fixture('bambu-studio/cube.gcode')));
  assert.ok('conditionalBlocks' in bambu.timing, 'Bambu planner output');
  const marlin = await loadPreview('gcode', inline('marlin')());
  const rrf = await loadPreview('gcode', inline('reprapfirmware')());
  assert.ok(!('conditionalBlocks' in marlin.timing));
  assert.notStrictEqual(rrf.timing.totalTime, marlin.timing.totalTime);
});

const header = (name: string) =>
  async function* () {
    yield Buffer.from(
      `;FLAVOR:${name}\nG28\nG1 Z0.2 F600\n` +
        Array.from({ length: 200 }, (_, i) => `G1 X${(i % 2) * 0.3} Y${i * 0.2} E${i * 0.01} F9000`).join('\n'),
    );
  };

test("the file's ;FLAVOR: header picks the planner when there is no config block", async () => {
  const klipper = await loadPreview('gcode', header('Klipper')());
  const marlin = await loadPreview('gcode', header('Marlin')());
  assert.strictEqual(klipper.parsed.flavourName, 'Klipper');
  assert.strictEqual(marlin.parsed.flavourName, 'Marlin');
  assert.strictEqual(resolveLimits({ flavour: marlin.parsed.flavourName }).flavourAssumed, false);
  assert.notStrictEqual(klipper.timing.totalTime, marlin.timing.totalTime);
});

test('a worker that dies without a reply rejects with worker-crashed; the calling thread carries on', async () => {
  const crash = new URL('./fixtures/crash-worker.mjs', import.meta.url);
  await assert.rejects(workerLoader(crash)('/x/a.gcode', 'gcode', new AbortController().signal), {
    code: 'worker-crashed',
  });
});
