// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { cameraMatrices, orbit, pan, presetCamera, zoom } from '../src/presentation/webview/camera.ts';

const box: [number[], number[]] = [
  [0, 0, 0],
  [100, 60, 20],
];
const near = (a: number, b: number, eps = 1e-4) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);
/** Where a world point lands in eye space. */
const eye = (view: Float32Array, p: number[]) =>
  [0, 1, 2].map((i) => view[i]! * p[0]! + view[4 + i]! * p[1]! + view[8 + i]! * p[2]! + view[12 + i]!);

test('every preset keeps the print centre on the optical axis in front of the camera', () => {
  for (const preset of ['top', 'iso', 'front'] as const) {
    const c = presetCamera(box, 1.5, preset);
    const e = eye(cameraMatrices(c, 1.5).view, c.target);
    near(e[0]!, 0);
    near(e[1]!, 0);
    near(e[2]!, -c.dist);
  }
});

test('top looks straight down, front horizontally along +Y, iso from the front-right above', () => {
  const dir = (p: 'top' | 'iso' | 'front') => {
    const v = cameraMatrices(presetCamera(box, 1, p), 1).view;
    return [-v[2]!, -v[6]!, -v[10]!]; // forward = -(third row)
  };
  const top = dir('top');
  assert.ok(top[2]! < -0.999);
  const front = dir('front');
  near(front[0]!, 0);
  near(front[1]!, 1);
  near(front[2]!, 0);
  const iso = dir('iso');
  assert.ok(iso[0]! < 0 && iso[1]! > 0 && iso[2]! < 0);
  near(Math.hypot(...iso), 1);
});

test('top keeps a defined screen-up (+Y) instead of degenerating', () => {
  const v = cameraMatrices(presetCamera(box, 1, 'top'), 1).view;
  near(v[5]!, 1, 0.01); // screen up (row 2) is +Y in the top view
});

test('orbit turns about the target and clamps the pitch short of the poles', () => {
  const c = presetCamera(box, 1, 'front');
  const o = orbit(c, 0.5, 0);
  near(o.yaw, -0.5);
  assert.deepStrictEqual(o.target, c.target);
  near(o.dist, c.dist);
  assert.ok(orbit(c, 0, 100).pitch < Math.PI / 2);
  assert.ok(orbit(c, 0, -100).pitch > -Math.PI / 2);
});

test('pan moves the target by the pixel drag at the target depth, along the screen axes', () => {
  const c = presetCamera(box, 1, 'front');
  const p = pan(c, 10, 0, 600);
  const world = ((2 * c.dist * Math.tan(Math.PI / 8)) / 600) * 10;
  near(p.target[0], c.target[0] - world); // dragging right moves the print right, the camera left
  near(p.target[1], c.target[1]);
  const up = pan(c, 0, 10, 600);
  near(up.target[2], c.target[2] + world);
});

test('zoom scales the distance within limits', () => {
  const c = presetCamera(box, 1);
  near(zoom(c, 0.5).dist, c.dist / 2);
  near(zoom(c, 1e-9).dist, c.radius * 0.05);
  near(zoom(c, 1e9).dist, c.radius * 20);
});
