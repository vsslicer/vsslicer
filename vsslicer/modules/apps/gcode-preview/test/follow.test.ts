// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MOVE_STRIDE, MoveRole, writeMove, type ParsedFile } from '@vsslicer/gcode-api';
import { parsePosition, resolvePosition, type PrintPosition } from '../src/domain/print-position.ts';
import { createFollower, createWatchdog } from '../src/application/follow.ts';
import { openPreview, type PreviewSession } from '../src/application/preview-session.ts';
import { Command, registerCommands, type CommandsApi } from '../src/presentation/commands.ts';
import type { PreviewProbe } from '../src/presentation/provider.ts';
import type { Timing } from '@vsslicer/gcode-planner';
import { handshake, parseEnvelope, receiveBuffers, type Channel } from '@vsslicer/webview-kit/webview';
import { Method } from '../src/domain/summary.ts';

/** `n` moves split into `chunks` buffers; move i at file offset 10*i, starting at second i. */
const track = (n: number, chunks = 1) => {
  const per = Math.ceil(n / chunks);
  const moves: ArrayBuffer[] = [];
  for (let c = 0; c * per < n; c++) {
    const count = Math.min(per, n - c * per);
    const b = new ArrayBuffer(count * MOVE_STRIDE);
    const v = new DataView(b);
    for (let i = 0; i < count; i++) {
      const g = c * per + i;
      writeMove(v, i, {
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0,
        role: MoveRole.Unknown,
        tool: 0,
        flags: 0,
        fileOffset: 10 * g,
        startTime: g,
      });
    }
    moves.push(b);
  }
  return {
    moves,
    moveCount: n,
    layers: [
      { z: 0.2, firstMove: 5 },
      { z: 0.4, firstMove: 50 },
    ],
    totalTime: n,
  };
};

test('a position: known fields only, at least one, each in range', () => {
  assert.deepStrictEqual(parsePosition({ layer: 3, percent: 12.5 }), { layer: 3, percent: 12.5 });
  assert.deepStrictEqual(parsePosition({ z: -0.1, fileOffset: 0xffffffff }), { z: -0.1, fileOffset: 0xffffffff });
  assert.deepStrictEqual(parsePosition({ layer: undefined, z: 1 }), { z: 1 });
  for (const bad of [
    null,
    [],
    'x',
    3,
    {},
    { layer: undefined },
    { line: 4 },
    { layer: 1, extra: true },
    { ['__proto__']: 1 },
    { fileOffset: -1 },
    { fileOffset: 1.5 },
    { fileOffset: 2 ** 32 },
    { fileOffset: '10' },
    { fileOffset: NaN },
    { layer: -1 },
    { layer: 0.5 },
    { layer: Infinity },
    { z: Infinity },
    { z: NaN },
    { z: '1' },
    { percent: -0.01 },
    { percent: 100.01 },
    { percent: NaN },
    { percent: '50' },
  ])
    assert.throws(() => parsePosition(bad), TypeError, JSON.stringify(bad));
});

test('resolves fileOffset > layer > z > percent, and refuses a layer past the last', () => {
  const t = track(100);
  assert.deepStrictEqual(resolvePosition(t, { fileOffset: 255, layer: 1, percent: 90 }), {
    by: 'fileOffset',
    move: 25,
  });
  assert.strictEqual(resolvePosition(t, { fileOffset: 99_999 }).move, 99);
  assert.deepStrictEqual(resolvePosition(t, { layer: 2, z: 0.2 }), { by: 'layer', move: 50 });
  assert.deepStrictEqual(resolvePosition(t, { layer: 0 }), { by: 'layer', move: 0 });
  assert.deepStrictEqual(resolvePosition(t, { z: 0.3, percent: 1 }), { by: 'z', move: 5 });
  assert.deepStrictEqual(resolvePosition(t, { z: 0.1 }), { by: 'z', move: 0 });
  assert.deepStrictEqual(resolvePosition(t, { percent: 42 }), { by: 'percent', move: 42 });
  assert.deepStrictEqual(resolvePosition(t, { percent: 100 }), { by: 'percent', move: 99 });
  assert.throws(() => resolvePosition(t, { layer: 3 }), RangeError);
  assert.throws(() => resolvePosition({ ...t, moveCount: 0, moves: [] }, { percent: 1 }), RangeError);
});

test('a large file resolves in log2(moves) buffer reads', () => {
  const n = 1 << 17;
  const t = track(n, 4);
  let reads = 0;
  const counted = { [Symbol.iterator]: () => (reads++, t.moves[Symbol.iterator]()) } as unknown as ArrayBuffer[];
  assert.deepStrictEqual(resolvePosition({ ...t, moves: counted }, { fileOffset: 10 * 123_456 + 3 }), {
    by: 'fileOffset',
    move: 123_456,
  });
  assert.ok(reads <= 18, `${reads} reads`);
});

test('a follow feed runs one reveal at a time and keeps only the newest pending position', async () => {
  const shown: PrintPosition[] = [];
  const gates: (() => void)[] = [];
  const f = createFollower((p) => (shown.push(p), new Promise<void>((r) => gates.push(r))));
  for (let i = 0; i < 1000; i++) f.push({ layer: i });
  assert.deepStrictEqual(shown, [{ layer: 0 }]);
  gates.shift()!();
  await new Promise((r) => setTimeout(r, 0));
  assert.deepStrictEqual(shown, [{ layer: 0 }, { layer: 999 }]);
  f.push({ layer: 1000 });
  f.stop();
  gates.shift()!();
  await new Promise((r) => setTimeout(r, 0));
  f.push({ layer: 1001 });
  assert.strictEqual(shown.length, 2, 'stop drops the pending position and ignores later ones');
});

test('a failed reveal is reported and the feed goes on', async () => {
  const errors: unknown[] = [];
  let calls = 0;
  const f = createFollower(
    () => (++calls === 1 ? Promise.reject(new Error('x')) : Promise.resolve()),
    (e) => errors.push(e),
  );
  f.push({ layer: 1 });
  f.push({ layer: 2 });
  await new Promise((r) => setTimeout(r, 0));
  assert.strictEqual(calls, 2);
  assert.strictEqual(errors.length, 1);
});

test('a reveal or onError that throws synchronously does not stop the feed', async () => {
  let calls = 0;
  const f = createFollower(
    () => {
      if (++calls === 1) throw new Error('sync');
      return Promise.resolve();
    },
    () => {
      throw new Error('onError');
    },
  );
  f.push({ layer: 1 });
  f.push({ layer: 2 });
  await new Promise((r) => setTimeout(r, 0));
  f.push({ layer: 3 });
  await new Promise((r) => setTimeout(r, 0));
  assert.strictEqual(calls, 3);
});

const loadedTrack = (n: number) => {
  const t = track(n);
  return {
    parsed: {
      ...t,
      slicer: 'orcaslicer',
      extrusion: [],
      stateChanges: [],
      markers: [],
      diagnostics: [],
      thumbnails: [],
      objects: [],
      config: {},
    } satisfies ParsedFile,
    timing: {
      totalTime: n,
      layerTimes: new Float64Array(2),
      roleTimes: new Float64Array(),
      travelTime: 0,
      checkpoints: [],
      checkpointInterval: 4096,
      planner: 'marlin',
      estimate: false,
      limits: {} as Timing['limits'],
    } satisfies Timing,
  };
};

test('PreviewSession.reveal seeks every served webview to the resolved move', async () => {
  const session = openPreview('/x/a.gcode', async () => loadedTrack(100));
  const posts: unknown[] = [];
  const channel = { post: (m: unknown) => void posts.push(m), onMessage: () => () => {} };
  const stop = session.serve(channel, { onMismatch() {} });
  assert.deepStrictEqual(await session.reveal({ percent: 50 }), { by: 'percent', move: 50 });
  assert.deepStrictEqual((posts.at(-1) as { payload: unknown }).payload, { action: 'seek', move: 50 });
  stop();
  await session.reveal({ layer: 1 });
  assert.strictEqual(posts.length, 1, 'an unserved channel gets nothing');
  await assert.rejects(session.reveal({ layer: 9 }), RangeError);
  const failed = openPreview('/x/a.gcode', () => Promise.reject(new Error('boom')));
  await assert.rejects(failed.reveal({ layer: 1 }), /error/);
});

/** Two ends of an in-memory channel; delivery is async, like postMessage. */
const pair = (): [Channel, Channel] => {
  const listeners = [new Set<(m: unknown) => void>(), new Set<(m: unknown) => void>()] as const;
  const end = (mine: 0 | 1): Channel => ({
    post: (m) => queueMicrotask(() => listeners[1 - mine]!.forEach((l) => l(m))),
    onMessage: (l) => (listeners[mine].add(l), () => listeners[mine].delete(l)),
  });
  return [end(0), end(1)];
};

/** A fake webview load: records, in arrival order, each complete move buffer and each seek. */
const webview = (channel: Channel) => {
  const events: string[] = [];
  channel.onMessage((m) => {
    const r = parseEnvelope(m);
    if (r.ok && r.envelope.kind === 'notification' && r.envelope.method === Method.command)
      events.push(`seek:${(r.envelope.payload as { move: number }).move}`);
  });
  const stop = receiveBuffers(channel, { onBuffer: () => void events.push('buffer'), onError: () => {} });
  return { events, stop, ready: handshake(channel, crypto.randomUUID(), { timeoutMs: 1000 }) };
};

const settle = async (ok: () => boolean) => {
  for (let i = 0; i < 200 && !ok(); i++) await new Promise((r) => setTimeout(r, 5));
  assert.ok(ok(), 'condition not met in time');
};

test('a reveal that lands before the move buffers is posted again after the last one (SP9 audit 2)', async () => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const l = loadedTrack(100);
  l.parsed.moves = track(100, 3).moves; // three buffers, so the first seek can land between them
  const session = openPreview('/x/a.gcode', async () => (await gate, l));
  const [host, view] = pair();
  session.serve(host, { onMismatch() {} });
  const w = webview(view);
  await w.ready;
  const revealed = session.reveal({ percent: 50 }); // the first follow push opens the preview and reveals at once
  release();
  await revealed;
  await settle(() => w.events.filter((e) => e === 'buffer').length === 3 && w.events.at(-1) === 'seek:50');
  assert.ok(w.events.indexOf('seek:50') < w.events.lastIndexOf('buffer'), 'the first seek beat the buffers');
  w.stop();

  // a hostile reveal (a layer past the last) rejects and leaves the last good position for the next load
  await assert.rejects(session.reveal({ layer: 9 }), RangeError);
  const again = webview(view);
  await again.ready;
  await settle(() => again.events.at(-1) === 'seek:50');
  assert.deepStrictEqual(again.events, ['buffer', 'buffer', 'buffer', 'seek:50'], 'one seek, after the buffers');
  again.stop();
});

test('a revealed move is forgotten when another plate loads', async () => {
  const load = async (_p: string, _k: string, _s: AbortSignal, plate?: number) => ({
    ...loadedTrack(100),
    plates: { numbers: [1, 2], plate: plate ?? 1 },
  });
  const session = openPreview('/x/a.gcode.3mf', load);
  const [host, view] = pair();
  session.serve(host, { onMismatch() {} });
  await session.reveal({ percent: 50 });
  await session.setPlate(2);
  const w = webview(view);
  await w.ready;
  await settle(() => w.events.length === 1);
  await new Promise((r) => setTimeout(r, 20)); // room for a stray seek to arrive
  assert.deepStrictEqual(w.events, ['buffer'], 'no seek to a move of plate 1');
  w.stop();
});

class FakeUri {
  readonly scheme: string;
  readonly path: string;
  constructor(scheme: string, path: string) {
    this.scheme = scheme;
    this.path = path;
  }
  static parse(s: string, strict?: boolean) {
    const m = /^([a-z][a-z0-9+.-]*):\/\/[^/]*(\/.*)?$/i.exec(s);
    if (!m && strict) throw new Error('no scheme');
    return new FakeUri(m?.[1] ?? 'file', m?.[2] ?? s);
  }
  toString() {
    return `${this.scheme}://${this.path}`;
  }
}

const setup = (
  local: { size: number; bytes?: Uint8Array; revealError?: Error; hold?: Promise<void> } = { size: 0 },
) => {
  const messages: string[] = [];
  const timers: { fn: () => void; ms: number; live: boolean }[] = [];
  const handlers = new Map<string, (...a: unknown[]) => unknown>();
  const opened: unknown[][] = [];
  const sessions = new Map<string, PreviewSession>();
  const reveals: PrintPosition[] = [];
  const plates: number[] = [];
  const fake = (): PreviewSession =>
    ({
      state: Promise.resolve({ status: 'ready' }),
      setPlate: async (p: number) => (plates.push(p), { status: 'ready' }),
      reveal: async (p: PrintPosition) => {
        if (local.revealError) throw local.revealError;
        reveals.push(p);
        return p.fileOffset ? { by: 'fileOffset', move: 0, warning: 'past the last move' } : { by: 'layer', move: 0 };
      },
    }) as unknown as PreviewSession;
  const api = {
    Uri: FakeUri,
    window: { showWarningMessage: async (m: string) => void messages.push(m) },
    workspace: {
      fs: {
        stat: async () => (await local.hold, { size: local.size }),
        readFile: async () => local.bytes ?? new Uint8Array(),
      },
    },
    commands: {
      registerCommand: (id: string, h: (...a: unknown[]) => unknown) => (handlers.set(id, h), { dispose() {} }),
      executeCommand: async (...a: unknown[]) => {
        opened.push(a);
        sessions.set(String(a[1]), fake());
      },
    },
  } as unknown as CommandsApi;
  const probe = { session: (k: string) => sessions.get(k) } as PreviewProbe;
  const context = { subscriptions: [] as { dispose(): void }[] };
  const clock = {
    set: (fn: () => void, ms: number) => {
      const t = { fn, ms, live: true };
      timers.push(t);
      return () => void (t.live = false);
    },
  };
  const exported = registerCommands(context, api, probe, { staleMs: 5000, timers: clock });
  const fire = () => {
    const t = timers.filter((t) => t.live).at(-1)!;
    t.live = false;
    t.fn();
  };
  const live = () => timers.filter((t) => t.live).length;
  return { exported, handlers, opened, sessions, reveals, plates, context, messages, fire, live, timers };
};

test('the commands exist, match the manifest, and are the exports', () => {
  const { handlers, exported } = setup();
  assert.deepStrictEqual([...handlers.keys()], [Command.open, Command.follow, Command.stopFollow]);
  assert.strictEqual(handlers.get(Command.follow), exported.follow);
  assert.strictEqual(exported.version, 1);
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const declared = ((pkg.contributes.commands ?? []) as { command: string }[]).map((c) => c.command);
  // the coordinator adds contributes.commands (GCP-50 Progress); until then only check what is declared is ours
  for (const c of declared.filter((c) => c.startsWith('vsslicer.gcode.') && !c.startsWith('vsslicer.gcode.preview')))
    assert.ok(Object.values(Command).includes(c as never), c);
});

test('open: a Uri or URI string, the right editor, and the plate once loaded; bad arguments are refused', async () => {
  const { exported, opened, plates } = setup();
  await exported.open('file:///p/a.gcode.3mf', { plate: 2 });
  await exported.open(new FakeUri('file', '/p/b.gcode') as never);
  assert.deepStrictEqual(
    opened.map((a) => [String(a[1]), a[2]]),
    [
      ['file:///p/a.gcode.3mf', 'vsslicer.gcode.preview'],
      ['file:///p/b.gcode', 'vsslicer.gcode.preview.gcode'],
    ],
  );
  assert.deepStrictEqual(plates, [2]);
  for (const [uri, options] of [
    [{ scheme: 'file', path: '/a.gcode' }, undefined], // UriComponents, not a Uri
    ['', undefined],
    [`file:///${'x'.repeat(8179)}.gcode`, undefined], // 8193 characters: one over the limit
    ['no-scheme.gcode', undefined],
    ['file:///a.stl', undefined],
    [42, undefined],
    ['file:///a.gcode.3mf', { plate: 0 }],
    ['file:///a.gcode.3mf', { plate: 1001 }],
    ['file:///a.gcode.3mf', { plate: 1.5 }],
    ['file:///a.gcode.3mf', { plate: '1' }],
    ['file:///a.gcode.3mf', { plate: 1, force: true }],
    ['file:///a.gcode.3mf', null],
  ] as const)
    await assert.rejects(exported.open(uri as never, options as never), Error, JSON.stringify([uri, options]));
  assert.strictEqual(opened.length, 2, 'nothing opened for a refused call');
  const longest = `file:///${'x'.repeat(8178)}.gcode`;
  assert.strictEqual(longest.length, 8192);
  await exported.open(longest);
  assert.strictEqual(opened.length, 3, 'a URI of exactly the limit opens');
});

test('follow opens once, coalesces, validates before anything; stopFollow ends it', async () => {
  const { exported, opened, reveals } = setup();
  assert.throws(() => exported.follow('file:///a.gcode', { line: 3 } as never), TypeError);
  assert.throws(() => exported.follow('nope', { layer: 1 }), Error);
  assert.strictEqual(opened.length, 0);
  for (let i = 1; i <= 50; i++) exported.follow('file:///a.gcode', { layer: i });
  await new Promise((r) => setTimeout(r, 10));
  assert.strictEqual(opened.length, 1);
  assert.deepStrictEqual(reveals, [{ layer: 1 }, { layer: 50 }]);
  exported.stopFollow('file:///a.gcode');
  exported.follow('file:///a.gcode', { percent: 10 }); // a new follow of an open preview does not open it again
  await new Promise((r) => setTimeout(r, 10));
  assert.strictEqual(opened.length, 1);
  assert.deepStrictEqual(reveals.at(-1), { percent: 10 });
});

const tick = () => new Promise((r) => setTimeout(r, 10));

test('no update for the stale time stops the follow with a message; every update restarts the timer', async () => {
  const { exported, reveals, messages, fire, live, timers } = setup();
  exported.follow('file:///a.gcode', { layer: 1 });
  exported.follow('file:///a.gcode', { layer: 2 });
  await tick();
  assert.strictEqual(live(), 1, 'one timer runs, each update replaced the last');
  assert.strictEqual(timers[0]!.ms, 5000);
  fire();
  assert.match(messages[0]!, /no position for 5 s/);
  exported.follow('file:///a.gcode', { layer: 3 }); // a stopped follow starts afresh
  await tick();
  assert.strictEqual(reveals.at(-1)?.layer, 3);
  exported.stopFollow('file:///a.gcode');
  assert.strictEqual(live(), 0, 'stopFollow cancels the timer');
  assert.strictEqual(messages.length, 1);
});

test('a size or MD5 mismatch with the printer file stops the follow with a message; a match goes on', async () => {
  const bytes = new TextEncoder().encode('G1 X1\n');
  const md5 = '5cf9e32d54f4a1e0a1b6a0c0b2d8bb0d'; // md5 of nothing in particular: only the wrong case needs a fixed value
  const good = createHash('md5').update(bytes).digest('hex');
  const run = async (file: { size?: number; md5?: string }) => {
    const t = setup({ size: bytes.length, bytes });
    t.exported.follow('file:///a.gcode', { layer: 1 }, file);
    t.exported.follow('file:///a.gcode', { layer: 2 }, file);
    await tick();
    return t;
  };
  let t = await run({ size: bytes.length + 1 });
  assert.deepStrictEqual(t.reveals, []);
  assert.match(t.messages[0]!, /is 6 bytes but the printer's is 7/);
  assert.strictEqual(t.live(), 0, 'the stopped follow has no timer');
  t = await run({ md5 });
  assert.deepStrictEqual(t.reveals, []);
  assert.match(t.messages[0]!, new RegExp(`MD5 ${good}`));
  t = await run({ size: bytes.length, md5: good.toUpperCase() });
  assert.deepStrictEqual(t.reveals, [{ layer: 1 }, { layer: 2 }], 'a match follows, checked once');
  assert.deepStrictEqual(t.messages, []);
  const edge = setup({ size: 256 * 1024 * 1024, bytes: new Uint8Array(0) }); // the cap itself is hashed
  edge.exported.follow('file:///a.gcode', { layer: 1 }, { md5: good });
  await tick();
  assert.match(edge.messages[0]!, /has MD5/);
  const big = setup({ size: 256 * 1024 * 1024 + 1 });
  big.exported.follow('file:///a.gcode', { layer: 1 }, { md5: good });
  await tick();
  assert.match(big.messages[0]!, /too large/);
  for (const bad of [
    {},
    { size: -1 },
    { size: 1.5 },
    { md5: 'xyz' },
    { md5: good.slice(1) },
    { md5: good + '0' },
    { md5: good, extra: 1 },
    [],
    null,
  ])
    assert.throws(() => setup().exported.follow('file:///a.gcode', { layer: 1 }, bad as never), TypeError);
});

test('a mismatch found after the follow was stopped stays quiet and leaves the new follow alone', async () => {
  let release!: () => void;
  const t = setup({ size: 1, hold: new Promise<void>((r) => (release = r)) });
  t.exported.follow('file:///a.gcode', { layer: 1 }, { size: 2 });
  await tick();
  t.exported.stopFollow('file:///a.gcode');
  t.exported.follow('file:///a.gcode', { layer: 2 });
  release();
  await tick();
  assert.deepStrictEqual(t.messages, []);
  assert.strictEqual(t.live(), 1, 'the new follow keeps its timer');
});

test('a position out of range shows a message and the feed goes on', async () => {
  const t = setup({ size: 0, revealError: new RangeError('layer 99 is past the last layer (2)') });
  t.exported.follow('file:///a.gcode', { layer: 99 });
  await tick();
  assert.deepStrictEqual(t.messages, ['Cannot follow: layer 99 is past the last layer (2)']);
  assert.strictEqual(t.live(), 1, 'still following');
  t.exported.follow('file:///a.gcode', { layer: 100 });
  await tick();
  assert.strictEqual(t.messages.length, 1, 'one notification per follow');
  const c = setup();
  c.exported.follow('file:///a.gcode', { fileOffset: 10 ** 9 }); // clamped: shown, with a warning
  await tick();
  assert.deepStrictEqual(c.messages, ['past the last move']);
});

test('the watchdog fires once after the time and refuses a bad time', () => {
  const fns: (() => void)[] = [];
  let n = 0;
  const w = createWatchdog(1000, () => n++, { set: (fn) => (fns.push(fn), () => {}) });
  w.kick();
  fns[0]!();
  assert.strictEqual(n, 1);
  for (const bad of [0, -1, NaN, Infinity]) assert.throws(() => createWatchdog(bad, () => {}), RangeError);
});
