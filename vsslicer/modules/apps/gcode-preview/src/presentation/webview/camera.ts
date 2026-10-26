// SPDX-License-Identifier: AGPL-3.0-or-later
// Orbit camera maths for the preview, pure (no DOM, no GL): state in, matrices out. Z is up. The state is plain
// numbers so it goes through `setState` as is.

/** Camera looking at `target` from `dist` away; yaw 0 / pitch 0 is the front view (eye on -Y), pitch is up. */
export interface CameraState {
  target: [number, number, number];
  yaw: number;
  pitch: number;
  dist: number;
  /** Radius of the print's bounding sphere: scales zoom limits and the clip planes. */
  radius: number;
}

export type ViewPreset = 'top' | 'iso' | 'front';

export const FOV = Math.PI / 4;
const MAX_PITCH = Math.PI / 2 - 0.01; // keeps `up` well defined at the poles

const PRESETS: Record<ViewPreset, { yaw: number; pitch: number }> = {
  top: { yaw: 0, pitch: MAX_PITCH },
  iso: { yaw: Math.PI / 4, pitch: Math.atan(1 / Math.SQRT2) },
  front: { yaw: 0, pitch: 0 },
};

type Box = [number[], number[]];

/** Distance at which the bounding sphere fits a viewport of this aspect. */
const fitDistance = (radius: number, aspect: number) => radius / Math.sin(Math.min(FOV, FOV * aspect) / 2);

/** A preset view of the box, fitted to the viewport. */
export const presetCamera = ([lo, hi]: Box, aspect: number, preset: ViewPreset = 'iso'): CameraState => {
  const radius = Math.max(1, Math.hypot(hi[0]! - lo[0]!, hi[1]! - lo[1]!, hi[2]! - lo[2]!) / 2);
  const target = [0, 1, 2].map((i) => (lo[i]! + hi[i]!) / 2) as CameraState['target'];
  return { target, ...PRESETS[preset], dist: fitDistance(radius, aspect), radius };
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Drag of `dx`, `dy` radians: yaw follows x, pitch follows y (dragging up looks from higher up). */
export const orbit = (c: CameraState, dx: number, dy: number): CameraState => ({
  ...c,
  yaw: c.yaw - dx,
  pitch: clamp(c.pitch + dy, -MAX_PITCH, MAX_PITCH),
});

/** Direction the camera looks along, and the screen's right and up axes. */
const axes = (c: CameraState) => {
  const f = [-Math.cos(c.pitch) * Math.sin(c.yaw), Math.cos(c.pitch) * Math.cos(c.yaw), -Math.sin(c.pitch)];
  const s = [Math.cos(c.yaw), Math.sin(c.yaw), 0]; // f x z, normalised
  const u = [s[1]! * f[2]! - s[2]! * f[1]!, s[2]! * f[0]! - s[0]! * f[2]!, s[0]! * f[1]! - s[1]! * f[0]!]; // s x f
  return { f, s, u };
};

/** Drag of `dx`, `dy` pixels in a viewport `height` pixels tall: the print follows the pointer. */
export const pan = (c: CameraState, dx: number, dy: number, height: number): CameraState => {
  const k = (2 * c.dist * Math.tan(FOV / 2)) / Math.max(1, height);
  const { s, u } = axes(c);
  return { ...c, target: c.target.map((t, i) => t - s[i]! * dx * k + u[i]! * dy * k) as CameraState['target'] };
};

/** `factor` above 1 moves away. Stays between 5 % and 20 times the print's radius. */
export const zoom = (c: CameraState, factor: number): CameraState => ({
  ...c,
  dist: clamp(c.dist * factor, c.radius * 0.05, c.radius * 20),
});

/** Column-major view and perspective projection for the state. */
export const cameraMatrices = (c: CameraState, aspect: number) => {
  const { f, s, u } = axes(c);
  const eye = c.target.map((x, i) => x - c.dist * f[i]!);
  const dot = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
  const view = new Float32Array([
    s[0]!, u[0]!, -f[0]!, 0,
    s[1]!, u[1]!, -f[1]!, 0,
    s[2]!, u[2]!, -f[2]!, 0,
    -dot(s, eye), -dot(u, eye), dot(f, eye), 1,
  ]); // prettier-ignore
  const near = Math.max(0.01, c.dist - 2 * c.radius);
  const far = c.dist + 2 * c.radius;
  const t = 1 / Math.tan(FOV / 2);
  const projection = new Float32Array([
    t / aspect, 0, 0, 0,
    0, t, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ]); // prettier-ignore
  return { view, projection };
};
