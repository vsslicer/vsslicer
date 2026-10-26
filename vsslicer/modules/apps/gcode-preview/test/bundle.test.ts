// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { build } from 'esbuild';

// The webview samples positions with the planner's /window entry; the planner itself must stay in the worker.
test('the webview bundle has no gcode-planner planner code', async () => {
  const r = await build({
    entryPoints: ['src/presentation/webview/main.ts'],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'es2023',
    write: false,
    metafile: true,
  });
  const inputs = Object.keys(r.metafile.inputs).filter((p) => p.includes('gcode-planner'));
  assert.ok(
    inputs.some((p) => p.endsWith('interp.js')),
    'sampler is bundled',
  );
  const planners = inputs.filter((p) => /\/(klipper|marlin|bambu|rrf-planner|planner|arc|move-cursor)\.js$/.test(p));
  assert.deepStrictEqual(planners, [], 'no planner is bundled from gcode-planner');
});
