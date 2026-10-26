// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of gl-upload-spy.spec.ts: bundled by esbuild and run in Chromium on SwiftShader.
import { ColorMode, createSegmentRenderer } from '../src/gl/index.ts';
import { spyGlUploads } from '../src/testing/gl-spy.ts';
import { syntheticMoves } from './synthetic-moves.ts';

const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/** Builds a renderer on a spied context, then switches colour modes and sweeps the range; returns the upload counts. */
function run() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('no WebGL2');
  const { buffer, layerStarts } = syntheticMoves(2000);
  const spy = spyGlUploads(gl);
  const r = createSegmentRenderer(spy.gl, buffer, { layerStarts });
  const atCreate = { ...spy.uploads };
  spy.reset();
  const modes = [ColorMode.Feature, ColorMode.Speed, ColorMode.Tool, ColorMode.LayerTime];
  let draws = 0;
  for (const colorMode of modes)
    for (let count = 1; count <= 2000; count += 97) {
      r.draw({ view: I, projection: I, first: 1 + (count % 7), count, colorMode, colorRange: [0, count] });
      draws++;
    }
  const error = gl.getError();
  r.dispose();
  return { atCreate, afterCreate: { ...spy.uploads }, draws, error };
}

Object.assign(globalThis, { run });
