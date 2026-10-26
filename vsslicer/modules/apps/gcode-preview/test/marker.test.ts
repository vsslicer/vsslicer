// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { MOVE_STRIDE, MoveOffset } from '@vsslicer/gcode-api';
import { plannerFor, ToolheadWindow } from '@vsslicer/gcode-planner';
import {
  PROTOCOL_TAG,
  TRANSPORT_SCHEMA_VERSION,
  handshake,
  receiveBuffers,
  type Channel,
} from '@vsslicer/webview-kit/webview';
import { openPreview } from '../src/application/preview-session.ts';
import { loadPreview } from '../src/application/load-preview.ts';
import { Method, windowSeq, type WindowRequest } from '../src/domain/summary.ts';
import { spyGlUploads } from '@vsslicer/webview-kit/testing';
import { concatMoves, createPreviewRenderer } from '../src/presentation/webview/preview-renderer.ts';
import { createClock, createMarker, layerOfMove, positionAt } from '../src/presentation/webview/timeline.ts';

const pair = (): [Channel, Channel] => {
  const listeners = [new Set<(m: unknown) => void>(), new Set<(m: unknown) => void>()] as const;
  const end = (mine: 0 | 1): Channel => ({
    post: (m) => queueMicrotask(() => listeners[1 - mine]!.forEach((l) => l(m))),
    onMessage: (l) => (listeners[mine].add(l), () => listeners[mine].delete(l)),
  });
  return [end(0), end(1)];
};

// A Klipper file whose moves are short enough to accelerate and brake, with a 3 s dwell after move 100's line.
const gcode = (flavour: string) =>
  async function* () {
    yield Buffer.from(
      `;FLAVOR:${flavour}\nG28\nG1 Z0.2 F600\n` +
        Array.from(
          { length: 300 },
          (_, i) => `G1 X${(i % 2) * 20} Y${i * 0.5} E${i * 0.01} F9000${i === 100 ? '\nG4 P3000' : ''}`,
        ).join('\n'),
    );
  };

const run = async (flavour: string) => {
  const loaded = await loadPreview('gcode', gcode(flavour)());
  const { parsed, timing } = loaded;
  const reference = new ToolheadWindow(plannerFor(parsed, timing.limits), parsed, timing, 0, parsed.moveCount);
  // what the worker hands over is a structured clone
  const session = openPreview('/x/a.gcode', async () => structuredClone(loaded, { transfer: parsed.moves }));
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });
  const buffers = new Map<string, ArrayBuffer>();
  const sid = crypto.randomUUID();
  const windows: number[] = [];
  receiveBuffers(view, { onBuffer: (s, d) => buffers.set(s, d), onError: () => {} });
  await handshake(view, sid, { timeoutMs: 1000 });
  await session.state;
  while (buffers.size < 1) await new Promise((r) => setTimeout(r, 5));
  const moves = concatMoves([...buffers.values()]);
  const marker = createMarker(
    moves,
    parsed.moveCount,
    (seq, from, to) => {
      windows.push(to - from);
      view.post({
        tag: PROTOCOL_TAG,
        v: TRANSPORT_SCHEMA_VERSION,
        kind: 'notification',
        method: Method.window,
        payload: { seq, from, to } satisfies WindowRequest,
      });
    },
    64,
  );
  receiveBuffers(view, {
    onBuffer: (s, d) => {
      const seq = windowSeq(sid, s);
      if (seq !== undefined) marker.accept(seq, d);
    },
    onError: () => {},
  });
  // samples at t once the window for it has arrived
  const at = async (t: number) => {
    const xyz = [0, 0, 0];
    for (let i = 0; i < 200; i++) {
      if (marker.sample(t, xyz) !== undefined) return xyz;
      await new Promise((r) => setTimeout(r, 2));
    }
    throw new Error(`no window for ${t}`);
  };
  return { parsed, timing, reference, moves, at, windows, session };
};

test('the marker follows the planner trapezoids within 0.01 mm across windows, playing and seeking', async () => {
  const { timing, reference, at, windows, session } = await run('Klipper');
  assert.ok(reference.profiled);
  const out = { move: 0, x: 0, y: 0, z: 0, e: 0, tool: 0 };
  const times = [
    ...Array.from({ length: 400 }, (_, i) => (i / 399) * timing.totalTime), // playing forward
    ...[0.9, 0.2, 0.55, 0.01].map((f) => f * timing.totalTime), // seeking
  ];
  for (const t of times) {
    const [x, y, z] = await at(t);
    reference.positionAt(t, out);
    assert.ok(Math.hypot(x! - out.x, y! - out.y, z! - out.z) < 0.01, `t=${t}`);
  }
  assert.ok(windows.length > 3 && windows.every((n) => n <= 64), 'several small windows, never larger than asked');
  session.dispose();
});

test('a G4 holds the marker where the constant-speed fallback would crawl', async () => {
  const { parsed, moves, at, session } = await run('Klipper');
  const g4 = parsed.markers.find((m) => m.seconds === 3)!;
  const v = new DataView(moves);
  const start = (i: number) => v.getFloat32(i * MOVE_STRIDE + MoveOffset.startTime, true);
  const end = [0, 4, 8].map((o) => v.getFloat32((g4.moveIndex - 1) * MOVE_STRIDE + o, true));
  const next = start(g4.moveIndex);
  assert.ok(next - start(g4.moveIndex - 1) > 3, 'the dwell is in the move before');
  for (const t of [next - 2.9, next - 1.5, next - 0.1]) {
    const p = await at(t);
    assert.ok(Math.hypot(p[0]! - end[0]!, p[1]! - end[1]!, p[2]! - end[2]!) < 0.01, `holds at t=${t}`);
  }
  const slow = [0, 0, 0];
  positionAt(moves, next - 1.5, 1e9, slow);
  assert.ok(Math.hypot(slow[0]! - end[0]!, slow[1]! - end[1]!) > 0.01, 'the fallback moves during the dwell');
  session.dispose();
});

test('other flavours get windows too, matching the planner fallback', async () => {
  const { reference, at, timing, session } = await run('Marlin');
  assert.ok(!reference.profiled);
  const out = { move: 0, x: 0, y: 0, z: 0, e: 0, tool: 0 };
  for (const f of [0.1, 0.5, 0.9]) {
    const [x, y] = await at(f * timing.totalTime);
    reference.positionAt(f * timing.totalTime, out);
    assert.ok(Math.hypot(x! - out.x, y! - out.y) < 0.01);
  }
  session.dispose();
});

test('playing with the planner marker uploads no geometry', async () => {
  const { parsed, moves, timing, at, session } = await run('Klipper');
  const gl = new Proxy({} as Record<string, unknown>, {
    get: (_, p: string) =>
      p === 'getParameter'
        ? () => 64
        : p === 'isContextLost'
          ? () => false
          : p === 'drawingBufferWidth' || p === 'drawingBufferHeight'
            ? 100
            : /^[A-Z0-9_]+$/.test(p)
              ? 1
              : p.startsWith('create') || p === 'getUniformLocation'
                ? () => ({})
                : p.startsWith('get')
                  ? () => true
                  : () => undefined,
  }) as unknown as WebGL2RenderingContext;
  const spy = spyGlUploads(gl);
  const r = createPreviewRenderer(new EventTarget() as HTMLCanvasElement, spy.gl, moves, parsed.layers, {
    maxTextureSize: 64,
  });
  r.draw({ layer: 0 });
  const uploaded = JSON.stringify(spy.uploads);
  const clock = createClock(timing.totalTime);
  clock.play();
  clock.setSpeed(timing.totalTime / 50);
  let last = -1;
  while (clock.state.playing) {
    clock.tick(1);
    await at(clock.state.time);
    const i = positionAt(moves, clock.state.time, timing.totalTime);
    last = Math.max(last, i);
    r.draw(layerOfMove(parsed.layers, i));
  }
  assert.ok(last > parsed.moveCount / 2);
  assert.strictEqual(JSON.stringify(spy.uploads), uploaded);
  r.dispose();
  session.dispose();
});
