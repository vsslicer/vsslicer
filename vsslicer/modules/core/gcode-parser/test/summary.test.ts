// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fileSource, readSummary, readSummaryFile } from '../src/index.ts';
import { fixturesDir, loadManifest, lineScannable, readGolden } from './support/golden.ts';
import { encode, pieces } from './support/run.ts';

/** Runs `readSummaryFile` and returns its result with the bytes read through `FileHandle.read`. */
async function readCounted(path: string) {
  const probe = await open(path);
  const proto = Object.getPrototypeOf(probe) as { read: (...a: unknown[]) => Promise<{ bytesRead: number }> };
  await probe.close();
  const orig = proto.read;
  let bytes = 0;
  const spy = vi.spyOn(proto, 'read').mockImplementation(async function (this: unknown, ...a: unknown[]) {
    const r = await orig.apply(this, a);
    bytes += r.bytesRead;
    return r;
  });
  try {
    return { summary: await readSummaryFile(path), bytes };
  } finally {
    spy.mockRestore();
  }
}

const sum = (text: string, size = 1 << 20) => readSummary(pieces(encode(text), size));
const numbers = (v: string | undefined): number[] => (v ?? '').split(',').map(Number);

describe('corpus: summary equals the slicer comments', () => {
  const files = loadManifest().files.filter(lineScannable);
  it.each(files)('$path', async (file) => {
    const lines = readFileSync(join(fixturesDir, file.path), 'utf8').split(/\r?\n/);
    // an independent read of the raw lines: the last line starting with `prefix`
    const raw = (prefix: string): string | undefined =>
      lines.findLast((l) => l.startsWith(prefix))?.slice(prefix.length);
    const got = await readSummary(fileSource(join(fixturesDir, file.path), 4096));
    expect(got).toEqual(readGolden(file)['summary']);

    const prusaLike = raw('; filament used [mm] = ') !== undefined;
    const length = numbers(prusaLike ? raw('; filament used [mm] = ') : raw('; total filament length [mm] : '));
    expect(got.extruders.map((e) => e.lengthMm)).toEqual(length);
    expect(length.every((n) => n > 0 || prusaLike)).toBe(true);
    if (prusaLike) {
      expect(got.extruders.map((e) => e.volumeCm3)).toEqual(numbers(raw('; filament used [cm3] = ')));
      expect(got.extruders.map((e) => e.weightG)).toEqual(numbers(raw('; filament used [g] = ')));
      expect(got.extruders.map((e) => e.cost)).toEqual(numbers(raw('; filament cost = ')));
    } else {
      // Bambu Studio: weight is 0.00 (density 0), so absent; volume is written in mm3
      expect(got.extruders[0]?.weightG).toBeUndefined();
      expect(got.extruders[0]?.cost).toBeUndefined();
      expect(got.extruders[0]?.volumeCm3).toBeCloseTo(Number(raw('; total filament volume [cm^3] : ')) / 1000, 6);
    }
    const t = got.estimateSeconds;
    const secs = (s: string | undefined): number | undefined => {
      const m = /^(?:(\d+)h )?(?:(\d+)m )?(\d+)s/.exec(s ?? '');
      return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3]) : undefined;
    };
    const model = /^; model printing time: ([^;]+); total estimated time: (.+)$/.exec(
      lines.find((l) => l.startsWith('; model printing time: ')) ?? '',
    );
    expect(t?.normal).toBe(secs(raw('; estimated printing time (normal mode) = ')));
    expect(t?.silent).toBe(secs(raw('; estimated printing time (silent mode) = ')));
    expect(t?.model).toBe(secs(model?.[1]));
    expect(t?.total).toBe(secs(model?.[2]));
    expect(Object.keys(t ?? {}).length).toBeGreaterThan(0);
  });

  it('keeps one entry per extruder: two-material has 2, a Prusa 5-extruder vase has 5 with unused ones at 0', async () => {
    const two = await readSummary(fileSource(join(fixturesDir, 'orca/two-material-x1c.gcode')));
    expect(two.extruders).toHaveLength(2);
    const vase = await readSummary(fileSource(join(fixturesDir, 'prusaslicer/test_vase.gcode')));
    expect(vase.extruders.map((e) => e.lengthMm)).toEqual([676.57, 0, 0, 0, 0]);
    expect(vase.extruders[1]).toEqual({ lengthMm: 0, volumeCm3: 0, weightG: 0, cost: 0 });
  });
});

describe('missing statistics are absent, never zero', () => {
  it('a file without summary comments has an empty summary', async () => {
    expect(await sum('G1 X1 E1\n; just a comment\nG1 X2 E1\n')).toEqual({ extruders: [] });
    expect(await sum('')).toEqual({ extruders: [] });
  });
  it('only the stated statistics appear', async () => {
    expect(await sum('; filament used [mm] = 10.5\n')).toEqual({ extruders: [{ lengthMm: 10.5 }] });
    expect(await sum('; estimated printing time (normal mode) = 1d 2h 3m 4s\n')).toEqual({
      extruders: [],
      estimateSeconds: { normal: 93784 },
    });
  });
  it('a weight, volume or cost of 0 for a filament that was fed means unknown and is dropped', async () => {
    const s = await sum('; filament used [mm] = 100\n; filament used [g] = 0.00\n; filament cost = 0.00\n');
    expect(s.extruders).toEqual([{ lengthMm: 100 }]);
  });
  it('an unparseable value is absent, not NaN or 0', async () => {
    const s = await sum('; filament used [mm] = abc, 5\n; estimated printing time (normal mode) = soon\n');
    expect(s.extruders[1]).toEqual({ lengthMm: 5 });
    expect(s.extruders[0]).toEqual({});
    expect(s.estimateSeconds).toBeUndefined();
  });
});

describe('other formats', () => {
  it('Cura: metres and TIME', async () => {
    expect(await sum(';TIME:3723\n;Filament used: 1.5m, 0.25m\n')).toEqual({
      extruders: [{ lengthMm: 1500 }, { lengthMm: 250 }],
      estimateSeconds: { total: 3723 },
    });
  });
  it('Orca header time line and PrusaSlicer modes', async () => {
    expect(
      (await sum('; model printing time: 1h 16m 52s; total estimated time: 1h 17m 12s\n')).estimateSeconds,
    ).toEqual({
      model: 4612,
      total: 4632,
    });
  });
  it('lines split across any piece size, and CRLF, give the same result', async () => {
    const text =
      '; filament used [mm] = 1, 2\r\n; filament cost = 0.5, 0.25\r\nG1 X1\r\n; estimated printing time (normal mode) = 5s';
    const whole = await sum(text);
    for (const size of [1, 3, 17]) expect(await sum(text, size)).toEqual(whole);
    expect(whole.extruders).toEqual([
      { lengthMm: 1, cost: 0.5 },
      { lengthMm: 2, cost: 0.25 },
    ]);
    expect(whole.estimateSeconds).toEqual({ normal: 5 });
  });
});

describe('unknown extruder slots are empty objects, never holes', () => {
  it.each([
    ['; filament used [mm] = nan, 120.5\n', [{}, { lengthMm: 120.5 }]],
    ['; filament used [mm] = 1,,3\n', [{ lengthMm: 1 }, {}, { lengthMm: 3 }]],
  ])('%j', async (text, expected) => {
    const s = await sum(text);
    expect(s.extruders).toEqual(expected);
    expect(0 in s.extruders && 1 in s.extruders).toBe(true);
    for (const e of s.extruders) expect(e.lengthMm ?? 0).toBeGreaterThanOrEqual(0);
  });
  it('for...of works over every corpus summary', async () => {
    for (const file of loadManifest().files.filter(lineScannable)) {
      const got = await readSummary(fileSource(join(fixturesDir, file.path), 4096));
      for (const e of got.extruders) expect(typeof e).toBe('object');
      expect(Object.keys(got.extruders)).toHaveLength(got.extruders.length);
    }
  }, 60_000);
});

describe('no move buffers', () => {
  it('scans 100 MB of moves allocating almost no array buffers', async () => {
    const block = encode('G1 X10.123 Y20.456 E0.01234 F1800\n; layer comment\nG1 X11.5 E.01\n'.repeat(1000));
    async function* source(): AsyncGenerator<Uint8Array> {
      yield encode('; filament used [mm] = 7\n');
      for (let sent = 0; sent < 100 << 20; sent += block.length) yield block;
      yield encode('; filament used [g] = 3\n');
    }
    gc();
    const base = process.memoryUsage().arrayBuffers;
    const s = await readSummary(source());
    gc();
    expect(s.extruders).toEqual([{ lengthMm: 7, weightG: 3 }]);
    // a parse would hold chunk buffers of tens of MB; here only line fragments
    expect(process.memoryUsage().arrayBuffers - base).toBeLessThan(2 << 20);
    // no wall-time assertion: the 60 s test timeout is only a hang guard
  }, 60_000);

  it(
    'readSummaryFile reads the head and tail regions of a big file and agrees with the full scan',
    { timeout: 60_000 },
    async () => {
      const dir = mkdtempSync(join(tmpdir(), 'summary-'));
      try {
        const path = join(dir, 'big.gcode');
        const filler = 'G1 X10.123 Y20.456 E0.01234 F1800\n'.repeat(40_000); // ~1.4 MB
        writeFileSync(
          path,
          `; model printing time: 1m 0s; total estimated time: 2m 0s\n${filler}${filler}; filament used [mm] = 12\n`,
        );
        const { summary: s, bytes } = await readCounted(path);
        expect(bytes).toBe(2 * 512 * 1024); // the counted path ran, head and tail only, not the 2.8 MB file
        expect(s).toEqual(await readSummary(fileSource(path)));
        expect(s).toEqual({ extruders: [{ lengthMm: 12 }], estimateSeconds: { model: 60, total: 120 } });
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it('readSummaryFile equals the full scan on every corpus file', async () => {
    const files = loadManifest().files.filter((f) => f.format === 'gcode');
    for (const f of files) {
      const path = join(fixturesDir, f.path);
      const { summary, bytes } = await readCounted(path);
      expect(bytes, f.path).toBeGreaterThan(0); // the counted read path was used
      expect(bytes, f.path).toBeLessThanOrEqual(Math.min(statSync(path).size, 1024 * 1024));
      expect(summary, f.path).toEqual(await readSummary(fileSource(path)));
    }
  }, 60_000);

  it('rejects for a missing file', async () => {
    await expect(readSummaryFile(join(fixturesDir, 'nope.gcode'))).rejects.toThrow(/ENOENT/);
  });
});

const gc = (): void => {
  if (!globalThis.gc) throw new Error('run with --expose-gc (see vitest.config.ts)');
  globalThis.gc();
};
