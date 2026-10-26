// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import {
  PROTOCOL_TAG,
  TRANSPORT_SCHEMA_VERSION,
  handshake,
  parseEnvelope,
  receiveBuffers,
  type Channel,
} from '@vsslicer/webview-kit/webview';
import type { ParsedFile } from '@vsslicer/gcode-api';
import type { Timing } from '@vsslicer/gcode-planner';
import { openPreview, type LoadPort } from '../src/application/preview-session.ts';
import { Method, moveStream, type PreviewSummary, type ViewState } from '../src/domain/summary.ts';
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
    assert.deepStrictEqual(
      ready.summary.panel.labels.map((l) => l.text),
      ['cube'],
    );
    for (const [i, b] of moves.entries()) {
      const got = w.buffers.get(moveStream(w.session, i));
      assert.ok(got instanceof ArrayBuffer);
      assert.deepStrictEqual(new Uint8Array(got), new Uint8Array(b));
    }
  }
  assert.deepStrictEqual(calls, ['bgcode:/x/cube.bgcode'], 'loaded once, served twice');
});

test('a .gcode.3mf loads its first plate, then the plate the picker asks for', async () => {
  const calls: (number | undefined)[] = [];
  const plates = (plate: number) => ({ numbers: [1, 2, 3], plate });
  const load: LoadPort = async (_p, kind, _s, plate) => {
    assert.strictEqual(kind, 'gcode.3mf');
    calls.push(plate);
    return { ...loaded([buffer(28 * 3, 1)]), plates: plates(plate ?? 1) };
  };
  const session = openPreview('/x/plate.gcode.3mf', load);
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });
  const w = webview(view);
  await w.ready;
  await until(() => w.buffers.size === 1);
  const first = w.states.at(-1) as Extract<ViewState, { status: 'ready' }>;
  assert.deepStrictEqual([first.summary.panel.plates, first.summary.panel.plate], [[1, 2, 3], 1]);

  const request = (plate: number) =>
    view.post({
      tag: PROTOCOL_TAG,
      v: TRANSPORT_SCHEMA_VERSION,
      kind: 'notification',
      method: Method.plate,
      payload: { plate },
    });
  request(9); // not a plate of the file: ignored
  request(2);
  await until(() => calls.length === 2);
  await until(() => (w.states.at(-1) as { summary?: PreviewSummary }).summary?.panel.plate === 2);
  assert.deepStrictEqual(calls, [undefined, 2]);
  w.stop();
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

test('rapid plate switching aborts the superseded loads; only the last plate is shown; Retry reloads the chosen plate', async () => {
  const calls: { plate?: number; signal: AbortSignal }[] = [];
  let failPlate3 = true;
  const load: LoadPort = (_p, _k, signal, plate) => {
    calls.push({ plate, signal });
    if (plate === 3 && failPlate3) return Promise.reject(Object.assign(new Error('boom'), { code: 'parse-failed' }));
    if (plate === undefined)
      return Promise.resolve({ ...loaded([buffer(28, 1)]), plates: { numbers: [1, 2, 3, 4], plate: 1 } });
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
      if (plate >= 3)
        setTimeout(() => resolve({ ...loaded([buffer(28, 4)]), plates: { numbers: [1, 2, 3, 4], plate } }), 20);
    });
  };
  const session = openPreview('/x/plate.gcode.3mf', load);
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });
  const w = webview(view);
  await w.ready;
  await until(() => w.buffers.size === 1);
  const request = (plate: number) =>
    view.post({
      tag: PROTOCOL_TAG,
      v: TRANSPORT_SCHEMA_VERSION,
      kind: 'notification',
      method: Method.plate,
      payload: { plate },
    });
  request(2);
  request(4);
  await until(() => calls.length === 3);
  assert.ok(calls[1]!.signal.aborted, 'plate 2 was superseded');
  assert.ok(!calls[2]!.signal.aborted, 'one load runs');
  await until(() => (w.states.at(-1) as { summary?: PreviewSummary }).summary?.panel.plate === 4);
  assert.deepStrictEqual(
    w.states.map((s) => s.status),
    ['loading', 'ready', 'loading', 'loading', 'loading', 'ready'],
    'loading is posted at once; the superseded load delivers nothing',
  );
  // a failed switch, then Retry: plate 3 again, not the first
  request(3);
  await until(() => w.states.at(-1)?.status === 'error');
  failPlate3 = false;
  assert.strictEqual(calls.at(-1)!.plate, 3);
  assert.strictEqual((await session.retry()).status, 'ready');
  assert.strictEqual(calls.at(-1)!.plate, 3);
  assert.strictEqual(calls.length, 5);
  w.stop();
  session.dispose();
});

test('a flood of text requests keeps one read in flight and answers the last', async () => {
  let reads = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const readAt = async () => (reads++, await gate, new TextEncoder().encode('G1 X1\n'));
  const session = openPreview('/x/a.gcode', async () => loaded([buffer(28, 1)]), readAt);
  const [host, view] = pair();
  session.serve(host, { onMismatch: () => {} });
  const w = webview(view);
  await w.ready;
  const answered: number[] = [];
  view.onMessage((m) => {
    const r = parseEnvelope(m);
    if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.textWindow)
      answered.push((r.envelope.payload as { seq: number }).seq);
  });
  const N = 100_000;
  for (let seq = 1; seq <= N; seq++)
    view.post({
      tag: PROTOCOL_TAG,
      v: TRANSPORT_SCHEMA_VERSION,
      kind: 'notification',
      method: Method.text,
      payload: { seq, offset: 0 },
    });
  await new Promise((r) => setTimeout(r, 20));
  release();
  await until(() => answered.includes(N));
  assert.ok(reads <= 2, `reads: ${reads}`);
  w.stop();
});
