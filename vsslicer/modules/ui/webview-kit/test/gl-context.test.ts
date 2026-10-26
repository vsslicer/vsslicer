// SPDX-License-Identifier: AGPL-3.0-or-later
// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createGl2Context, GlContextError, showGlFailure } from '../src/gl/index.ts';

afterEach(() => vi.unstubAllGlobals());

const canvasWith = (getContext: (type: string, attrs: WebGLContextAttributes) => unknown) => {
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getContext').mockImplementation(getContext as never);
  return canvas;
};
const gl = {} as WebGL2RenderingContext;

test('no WebGL2 in the browser', () => {
  const r = createGl2Context(document.createElement('canvas'));
  expect(r).toMatchObject({ ok: false, error: { cause: 'no-webgl2' } });
  expect(!r.ok && r.error.message).toContain('disable-hardware-acceleration');
});

test('only a software context available: acceleration disabled, with argv.json hint', () => {
  vi.stubGlobal('WebGL2RenderingContext', class {});
  const r = createGl2Context(canvasWith((_, a) => (a.failIfMajorPerformanceCaveat ? null : gl)));
  expect(r).toMatchObject({ ok: false, error: { cause: 'hardware-acceleration-disabled' } });
  expect(!r.ok && r.error.message).toContain('argv.json');
  expect(!r.ok && r.error.message).toContain('software rendering');
});

test('creation refused (null or throwing), with argv.json hint', () => {
  vi.stubGlobal('WebGL2RenderingContext', class {});
  for (const fn of [
    () => null,
    () => {
      throw new Error('boom');
    },
  ]) {
    const r = createGl2Context(canvasWith(fn));
    expect(r).toMatchObject({ ok: false, error: { cause: 'creation-refused' } });
    expect(!r.ok && r.error.message).toContain('disable-hardware-acceleration');
    expect(!r.ok && r.error.message).toContain('software rendering');
  }
});

test('hardware context is returned', () => {
  vi.stubGlobal('WebGL2RenderingContext', class {});
  expect(createGl2Context(canvasWith(() => gl))).toEqual({ ok: true, gl });
});

test('showGlFailure replaces the canvas with an alert naming the cause', () => {
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  const r = createGl2Context(canvas);
  if (r.ok) throw new Error('expected failure');
  const el = showGlFailure(canvas, r.error);
  expect(document.body.contains(canvas)).toBe(false);
  expect(el.getAttribute('role')).toBe('alert');
  expect(el.dataset['cause']).toBe('no-webgl2');
  expect(el.textContent).toBe(r.error.message);
});

test('restore failure has its own message and shows through showGlFailure', () => {
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  const error = new GlContextError('restore');
  const el = showGlFailure(canvas, error);
  expect(el.dataset['cause']).toBe('restore');
  expect(el.textContent).toContain('could not be restored');
});
