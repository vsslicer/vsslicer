// SPDX-License-Identifier: AGPL-3.0-or-later
// GCP-39: flags per kind, the lazy text pane's bounds on a 500 MB-class file and a 10 MB line (rule 25), diagnostics cap.
import test from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Diagnostic, ParsedFile } from '@vsslicer/gcode-api';
import type { Timing } from '@vsslicer/gcode-planner';
import { flagsOf } from '../src/domain/flags.ts';
import { MAX_DIAGNOSTICS, summarise } from '../src/domain/summary.ts';
import { MAX_LINE_BYTES, MAX_WINDOW_BYTES, MAX_WINDOW_LINES, moveFileOffset } from '../src/domain/text-window.ts';
import { readTextWindow, type ReadAt } from '../src/application/read-text.ts';
import { fileReadAt } from '../src/adapters/file-read.ts';

const timing = (o: { assumed?: boolean; flavourAssumed?: boolean; estimate?: boolean }) =>
  ({
    planner: 'marlin',
    estimate: !!o.estimate,
    limits: { assumed: !!o.assumed, flavourAssumed: !!o.flavourAssumed },
  }) as Timing;
const codes = (p: Pick<ParsedFile, 'markers'>, t: Timing) => flagsOf(p, t).map((f) => f.code);

test('each E4 flag appears alone', () => {
  const none = { markers: [] };
  assert.deepStrictEqual(codes(none, timing({})), []);
  assert.deepStrictEqual(codes(none, timing({ assumed: true })), ['assumed-limits']);
  assert.deepStrictEqual(codes(none, timing({ flavourAssumed: true })), ['assumed-flavour']);
  assert.deepStrictEqual(codes(none, timing({ estimate: true })), ['estimate']);
  const m = (name: string, seconds?: number) => ({ name, fileOffset: 0, moveIndex: 0, seconds });
  // timed and zero-time markers are not macros; START_PRINT and M600 are
  const markers = [
    m('G4', 1),
    m('ESTIMATOR_ADD_TIME', 2),
    m('M486'),
    m('EXCLUDE_OBJECT_START'),
    m('START_PRINT'),
    m('M600'),
    m('M600'),
  ];
  const f = flagsOf({ markers }, timing({ estimate: true })).find((x) => x.code === 'invisible-macros')!;
  assert.match(f.text, /^3 commands are not timed \(M600 x2, START_PRINT x1\)/);
});

test('hostile: a million distinct macro names stay bounded', () => {
  const markers = Array.from({ length: 1_000_000 }, (_, i) => ({ name: `M${i}`, fileOffset: 0, moveIndex: 0 }));
  const f = flagsOf({ markers }, timing({})).find((x) => x.code === 'invisible-macros')!;
  assert.ok(f.text.length < 400);
});

test('hostile: 100,000 diagnostics are cut to 10,000 with the count kept, messages clipped', () => {
  const diagnostics: Diagnostic[] = Array.from({ length: 100_000 }, (_, i) => ({
    code: 'x',
    severity: 'warning',
    fileOffset: i,
    message: 'm'.repeat(1000),
  }));
  const parsed = {
    slicer: 'unknown',
    moveCount: 0,
    moves: [],
    extrusion: [],
    stateChanges: [],
    layers: [],
    markers: [],
    diagnostics,
    thumbnails: [],
    objects: [],
    config: {},
  } as ParsedFile;
  const s = summarise('gcode', parsed, { ...timing({}), totalTime: 0, layerTimes: new Float64Array() });
  assert.strictEqual(s.diagnostics.length, MAX_DIAGNOSTICS);
  assert.strictEqual(s.diagnosticCount, 100_000);
  assert.ok(s.diagnostics.every((d) => d.message.length <= 256));
});

/** A reader over a virtual file of `size` bytes whose content is made on demand: `line(n)` is line n, lines are 40 bytes. */
const virtual =
  (size: number, reads: number[]): ReadAt =>
  async (pos, len) => {
    reads.push(len);
    const end = Math.min(size, pos + len);
    const out = new Uint8Array(Math.max(0, end - pos));
    for (let i = 0; i < out.length; i++) out[i] = (pos + i) % 40 === 39 ? 10 : 65 + ((((pos + i) / 40) | 0) % 26);
    return out;
  };

test('a 500 MB-class file: one request reads at most 64 KiB and returns the line at the offset', async () => {
  const reads: number[] = [];
  const size = 500 * 1024 * 1024;
  const at = size - 40 * 7; // the 7th line from the end, aligned to a line start
  const w = (await readTextWindow(virtual(size, reads), { seq: 3, offset: at }))!;
  assert.deepStrictEqual(reads, [MAX_WINDOW_BYTES]);
  assert.strictEqual(w.seq, 3);
  assert.strictEqual(w.lines[w.focus]!.offset, at);
  assert.ok(w.lines.length <= MAX_WINDOW_LINES);
  assert.ok(w.lines.at(-1)!.offset + 40 <= size);
  const past = (await readTextWindow(virtual(size, reads), { seq: 4, offset: size + 10 }))!;
  assert.deepStrictEqual([past.focus, past.lines.length], [-1, 0]);
});

test('lines are capped at 400 around the offset, whatever the line length', async () => {
  const text = new TextEncoder().encode('\n'.repeat(60_000)); // 60,000 empty lines
  const w = (await readTextWindow(async () => text, { seq: 1, offset: 30_000 }))!;
  assert.strictEqual(w.lines.length, MAX_WINDOW_LINES);
  assert.strictEqual(w.lines[w.focus]!.offset, 30_000 - 0);
});

test('hostile: a 10 MB single line reads 64 KiB and returns one line clipped to 4 KiB', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gcp39-'));
  try {
    const path = join(dir, 'long.gcode');
    const f = await open(path, 'w');
    await f.write(Buffer.alloc(10 * 1024 * 1024, 'x'));
    await f.write('\nG1 X1\n');
    await f.close();
    const reads: number[] = [];
    const real = fileReadAt(path);
    const w = (await readTextWindow(async (p, l) => (reads.push(l), real(p, l)), { seq: 1, offset: 5 * 1024 * 1024 }))!;
    assert.deepStrictEqual(reads, [MAX_WINDOW_BYTES]);
    assert.strictEqual(w.lines.length, 1);
    assert.strictEqual(w.lines[0]!.text.length, MAX_LINE_BYTES);
    assert.ok(w.lines[0]!.clipped);
    // the last line of the file is reachable through the real reader
    const tail = (await readTextWindow(real, { seq: 2, offset: 10 * 1024 * 1024 + 1 }))!;
    assert.strictEqual(tail.lines[tail.focus]!.text, 'G1 X1');
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('invalid requests are refused; CRLF and bad UTF-8 do not break lines', async () => {
  for (const bad of [
    null,
    {},
    { seq: 1, offset: -1 },
    { seq: 1, offset: 1.5 },
    { seq: 1, offset: Infinity },
    { seq: '1', offset: 0 },
  ])
    assert.strictEqual(await readTextWindow(async () => new Uint8Array(), bad), undefined);
  const bytes = new Uint8Array([0x47, 0x31, 0x0d, 0x0a, 0xff, 0xfe, 0x0a, 0x4d]);
  const w = (await readTextWindow(async () => bytes, { seq: 1, offset: 4 }))!;
  assert.deepStrictEqual(
    w.lines.map((l) => l.text),
    ['G1', '��', 'M'],
  );
  assert.strictEqual(w.focus, 1);
});

test('moveFileOffset reads the offset of a global move across buffers', () => {
  const buf = (offsets: number[]) => {
    const b = new ArrayBuffer(offsets.length * 28);
    offsets.forEach((o, i) => new DataView(b).setUint32(i * 28 + 20, o, true));
    return b;
  };
  const bs = [buf([10, 20]), buf([30])];
  assert.deepStrictEqual(
    [0, 1, 2, 3].map((m) => moveFileOffset(bs, m, 28, 20)),
    [10, 20, 30, undefined],
  );
  assert.strictEqual(moveFileOffset([undefined], 0, 28, 20), undefined);
});
