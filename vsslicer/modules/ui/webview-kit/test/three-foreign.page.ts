// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser side of three-foreign.spec.ts: three.js and the kit share one WebGL2 context (SwiftShader).
import * as THREE from 'three';
import { ColorMode, createSegmentRenderer } from '../src/gl/index.ts';
import { moves } from './segment-renderer.page.ts';

const SIZE = 64; // canvas pixels = mm, origin bottom left

const ids = new Map<object, number>();
/** A GL object as a stable id, a typed array as a plain array, anything else unchanged. */
function plain(v: unknown): unknown {
  if (ArrayBuffer.isView(v) || Array.isArray(v)) return Array.from(v as unknown as ArrayLike<unknown>);
  if (!v || typeof v !== 'object') return v;
  if (!ids.has(v)) ids.set(v, ids.size);
  return `#${ids.get(v)}`;
}

/** Every piece of GL state three.js caches, as comparable values. */
function glState(gl: WebGL2RenderingContext): unknown[] {
  const params = [
    'CURRENT_PROGRAM',
    'VERTEX_ARRAY_BINDING',
    'ARRAY_BUFFER_BINDING',
    'ELEMENT_ARRAY_BUFFER_BINDING',
    'UNIFORM_BUFFER_BINDING',
    'PIXEL_UNPACK_BUFFER_BINDING',
    'FRAMEBUFFER_BINDING',
    'RENDERBUFFER_BINDING',
    'ACTIVE_TEXTURE',
    'VIEWPORT',
    'SCISSOR_BOX',
    'COLOR_CLEAR_VALUE',
    'DEPTH_CLEAR_VALUE',
    'COLOR_WRITEMASK',
    'DEPTH_WRITEMASK',
    'DEPTH_FUNC',
    'CULL_FACE_MODE',
    'FRONT_FACE',
    'BLEND_EQUATION_RGB',
    'BLEND_SRC_RGB',
    'BLEND_DST_RGB',
    'POLYGON_OFFSET_FACTOR',
    'LINE_WIDTH',
    'UNPACK_ALIGNMENT',
    'UNPACK_ROW_LENGTH',
    'UNPACK_SKIP_ROWS',
    'UNPACK_SKIP_PIXELS',
    'UNPACK_FLIP_Y_WEBGL',
    'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
    'UNPACK_COLORSPACE_CONVERSION_WEBGL',
    'PACK_ALIGNMENT',
  ] as const;
  const caps = ['DEPTH_TEST', 'CULL_FACE', 'BLEND', 'SCISSOR_TEST', 'STENCIL_TEST', 'POLYGON_OFFSET_FILL'] as const;
  const out: unknown[] = params.map((p) => [p, plain(gl.getParameter(gl[p]))]);
  out.push(...caps.map((c) => [c, gl.isEnabled(gl[c])]));
  const active = gl.getParameter(gl.ACTIVE_TEXTURE) as number;
  for (let u = 0; u < 8; u++) {
    gl.activeTexture(gl.TEXTURE0 + u);
    out.push([`unit${u}`, plain(gl.getParameter(gl.TEXTURE_BINDING_2D)), plain(gl.getParameter(gl.SAMPLER_BINDING))]);
  }
  gl.activeTexture(active);
  return out;
}

/**
 * A textured plane at z 0.3 under the whole bed, drawn by three.js, then the move set by the kit with
 * three's camera: layer 0 (left, z 0-0.2) is under the plane, layer 1 (right, z 0.2-0.4) above it.
 */
function run(foreign = true) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no WebGL2');
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false });
  renderer.setSize(SIZE, SIZE, false);
  renderer.setClearColor(0x000000, 1);

  const map = new THREE.DataTexture(new Uint8Array([40, 160, 90, 255]), 1, 1);
  map.needsUpdate = true;
  const scene = new THREE.Scene();
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ map }));
  plane.position.set(32, 32, 0.3);
  scene.add(plane);
  const camera = new THREE.OrthographicCamera(-32, 32, 32, -32, 1, 20);
  camera.position.set(32, 32, 10);
  camera.updateMatrixWorld();

  const read = () => {
    const px = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  };
  renderer.render(scene, camera);
  const three = read();

  const before = glState(gl);
  const { buffer, layerStarts } = moves();
  const kit = createSegmentRenderer(gl, buffer, { layerStarts, foreign });
  const afterCreate = glState(gl);
  const view = {
    view: camera.matrixWorldInverse.elements,
    projection: camera.projectionMatrix.elements,
    first: 1,
    count: 1e9,
    colorMode: ColorMode.Feature,
    hiddenFlags: 1, // MoveFlag.Travel: the last travel climbs to z 1, above the plane on the left
  };
  kit.draw(view);
  const afterDraw = glState(gl);
  const both = read();

  renderer.clear();
  kit.draw(view);
  const segments = read();

  renderer.render(scene, camera);
  const threeAgain = read();
  const error = gl.getError();
  kit.dispose();
  return { three, both, segments, threeAgain, before, afterCreate, afterDraw, error };
}

Object.assign(globalThis, { run });
