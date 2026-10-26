// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import {
  TRANSPORT_SCHEMA_VERSION,
  handshake,
  parseEnvelope,
  receiveBuffers,
  type Channel,
} from '@vsslicer/webview-kit/webview';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { Timing } from '@vsslicer/gcode-planner';
import { openPreview, UNSUPPORTED_3MF, type LoadPort } from '../src/application/preview-session.ts';
import { Method, moveStream, type ViewState } from '../src/domain/summary.ts';
import { nextAssociations, GCODE_VIEW_TYPE } from '../src/domain/associations.ts';
import { fileKind } from '../src/domain/file-kind.ts';

/** Two ends of an in-memory channel; delivery is async, like postMessage. */
const pair = (): [Channel, Channel] => {
  const listeners = [new Set<(m: unknown) => void>(), new Set<(m: unknown) => void>()] as const;
  const end = (mine: 0 | 1): Channel => ({
    post: (m) => queueMicrotask(() => listeners[1 - mine]!.forEach((l) => l(m))),
    onMessage: (l) => (listeners[mine].add(l), () => listeners[mine].delete(l)),
  });
  return [end(0), end(1)];
};

const buffer = (n: number, fill: number) => new Uint8Array(n).fill(fill).buffer;
const loaded = (moves: ArrayBuffer[]) => ({
  parsed: {
    slicer: 'orcaslicer',
    moveCount: moves.reduce((n, b) => n + b.byteLength / 28, 0),
    moves,
    extrusion: [],
    stateChanges: [],
    layers: [{ z: 0.2, firstMove: 0 }],
    markers: [],
    diagnostics: [],
    thumbnails: [],
    objects: [{ name: 'cube', ranges: [] }],
    config: {},
  } satisfies ParsedFile,
  timing: {
    planner: 'marlin',
    estimate: false,
    limits: { flavour: 'marlin', flavourAssumed: true } as Timing['limits'],
    totalTime: 60,
    layerTimes: new Float64Array([60]),
    roleTimes: new Float64Array(),
    travelTime: 0,
    checkpoints: [],
    checkpointInterval: 4096,
  } satisfies Timing,
});

/** A fake webview load: handshakes, collects states and the move buffers of its session. */
const webview = (channel: Channel, session = crypto.randomUUID()) => {
  const states: ViewState[] = [];
  const buffers = new Map<string, ArrayBuffer>();
  channel.onMessage((m) => {
    const r = parseEnvelope(m);
    if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.state)
      states.push(r.envelope.payload as ViewState);
  });
  const stop = receiveBuffers(channel, { onBuffer: (s, d) => buffers.set(s, d), onError: () => {} });
  return { session, states, buffers, stop, ready: handshake(channel, session, { timeoutMs: 1000 }) };
};

const until = async (ok: () => boolean) => {
  for (let i = 0; i < 200 && !ok(); i++) await new Promise((r) => setTimeout(r, 5));
  assert.ok(ok(), 'condition not met in time');
};

test('serves the state, then every move buffer as an ArrayBuffer, on each webview load', async () => {
  const moves = [buffer(28 * 3, 1), buffer(28 * 40000, 2)]; // the second spans two 1 MiB transfer chunks
  const calls: string[] = [];
  const load: LoadPort = async (path, kind) => (calls.push(`${kind}:${path}`), loaded(moves));
  const session = openPreview('/x/cube.bgcode', load);
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });

  for (let load = 0; load < 2; load++) {
    // load 1 is a reload: the same panel gets everything again under its new session
    const w = webview(view);
    await w.ready;
    await until(() => w.buffers.size === 2);
    w.stop();
    assert.deepStrictEqual(
      w.states.map((s) => s.status),
      ['loading', 'ready'],
    );
    const ready = w.states[1] as Extract<ViewState, { status: 'ready' }>;
    assert.deepStrictEqual(ready.summary.moveBuffers, [84, 1120000]);
    assert.strictEqual(ready.summary.kind, 'bgcode');
    assert.deepStrictEqual(ready.summary.objects, ['cube']);
    for (const [i, b] of moves.entries()) {
      const got = w.buffers.get(moveStream(w.session, i));
      assert.ok(got instanceof ArrayBuffer);
      assert.deepStrictEqual(new Uint8Array(got), new Uint8Array(b));
    }
  }
  assert.deepStrictEqual(calls, ['bgcode:/x/cube.bgcode'], 'loaded once, served twice');
});

test('a .gcode.3mf opens with the "not supported yet" state and is never loaded', async () => {
  const session = openPreview('/x/plate.gcode.3mf', () => assert.fail('must not load'));
  assert.deepStrictEqual(await session.state, { status: 'unsupported', message: UNSUPPORTED_3MF });
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });
  const w = webview(view);
  await w.ready;
  await until(() => w.states.length === 2);
  assert.strictEqual(w.states[1]!.status, 'unsupported');
});

test('a failed load becomes an error state with its code', async () => {
  const session = openPreview('/x/a.gcode', () =>
    Promise.reject(Object.assign(new Error('heap'), { code: 'memory-cap' })),
  );
  assert.deepStrictEqual(await session.state, { status: 'error', code: 'memory-cap', message: 'heap' });
});

test('dispose aborts the running load', async () => {
  let signal: AbortSignal | undefined;
  const session = openPreview('/x/a.gcode', (_p, _k, s) => {
    signal = s;
    return new Promise((_r, reject) => s.addEventListener('abort', () => reject(s.reason)));
  });
  session.dispose();
  assert.ok(signal?.aborted);
  assert.strictEqual((await session.state).status, 'error');
});

test('the received report reaches the host', async () => {
  const session = openPreview('/x/a.gcode', async () => loaded([]));
  const [host, view] = pair();
  const reports: unknown[] = [];
  session.serve(host, { onMismatch: () => {}, onReceived: (r) => reports.push(r) });
  view.post({
    tag: 'vsslicer/webview-kit',
    v: TRANSPORT_SCHEMA_VERSION,
    kind: 'notification',
    method: Method.received,
    payload: { buffers: [], stateSaved: true },
  });
  await until(() => reports.length === 1);
});

test('file kinds', () => {
  assert.strictEqual(fileKind('/a/B.GCODE'), 'gcode');
  assert.strictEqual(fileKind('a.bgcode'), 'bgcode');
  assert.strictEqual(fileKind('a.gcode.3mf'), 'gcode.3mf');
  assert.strictEqual(fileKind('a.3mf'), undefined);
});

test('the setting adds and removes only our *.gcode association', () => {
  assert.deepStrictEqual(nextAssociations({ '*.md': 'x' }, true), { '*.md': 'x', '*.gcode': GCODE_VIEW_TYPE });
  assert.strictEqual(nextAssociations({ '*.gcode': GCODE_VIEW_TYPE }, true), undefined);
  assert.deepStrictEqual(nextAssociations({ '*.gcode': GCODE_VIEW_TYPE, '*.md': 'x' }, false), { '*.md': 'x' });
  assert.strictEqual(nextAssociations({ '*.gcode': 'default' }, false), undefined, "the user's own choice stays");
});

test('a crashed worker becomes an error state, and Retry loads again and serves the result', async () => {
  let calls = 0;
  const session = openPreview('/x/a.gcode', async () => {
    if (++calls === 1) throw Object.assign(new Error('preview worker exited with code 3'), { code: 'worker-crashed' });
    return loaded([buffer(28, 1)]);
  });
  assert.deepStrictEqual(await session.state, {
    status: 'error',
    code: 'worker-crashed',
    message: 'preview worker exited with code 3',
  });
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });
  const w = webview(view);
  await w.ready;
  await until(() => w.states.length === 2);
  assert.strictEqual(w.states[1]!.status, 'error');
  view.post({ tag: 'vsslicer/webview-kit', v: TRANSPORT_SCHEMA_VERSION, kind: 'notification', method: Method.retry });
  await until(() => w.buffers.size === 1);
  assert.deepStrictEqual(
    w.states.map((s) => s.status),
    ['loading', 'error', 'loading', 'ready'],
  );
  assert.strictEqual((await session.state).status, 'ready');
  assert.strictEqual(calls, 2);
});

test('Retry does nothing once the load succeeded', async () => {
  let calls = 0;
  const session = openPreview('/x/a.gcode', async () => (calls++, loaded([])));
  await session.state;
  assert.strictEqual((await session.retry()).status, 'ready');
  assert.strictEqual(calls, 1);
});
