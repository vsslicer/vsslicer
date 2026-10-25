// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileSource, readSummary, readSummaryFile } from '../src/index.ts';
import { fixturesDir, loadManifest, lineScannable, readGolden } from './support/golden.ts';
import { encode, pieces } from './support/run.ts';

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
    expect(s.extruders[0]).toBeUndefined();
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

describe('no move buffers, fast', () => {
  it('scans 100 MB of moves allocating almost no array buffers', async () => {
    const block = encode('G1 X10.123 Y20.456 E0.01234 F1800\n; layer comment\nG1 X11.5 E.01\n'.repeat(1000));
    async function* source(): AsyncGenerator<Uint8Array> {
      yield encode('; filament used [mm] = 7\n');
      for (let sent = 0; sent < 100 << 20; sent += block.length) yield block;
      yield encode('; filament used [g] = 3\n');
    }
    gc();
    const base = process.memoryUsage().arrayBuffers;
    const t0 = performance.now();
    const s = await readSummary(source());
    const ms = performance.now() - t0;
    gc();
    expect(s.extruders).toEqual([{ lengthMm: 7, weightG: 3 }]);
    // a parse would hold chunk buffers of tens of MB; here only line fragments
    expect(process.memoryUsage().arrayBuffers - base).toBeLessThan(2 << 20);
    expect(ms).toBeLessThan(5000);
  });

  it('readSummaryFile reads the head and tail regions of a big file and agrees with the full scan', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'summary-'));
    try {
      const path = join(dir, 'big.gcode');
      const filler = 'G1 X10.123 Y20.456 E0.01234 F1800\n'.repeat(40_000); // ~1.4 MB
      writeFileSync(
        path,
        `; model printing time: 1m 0s; total estimated time: 2m 0s\n${filler}${filler}; filament used [mm] = 12\n`,
      );
      const t0 = performance.now();
      const s = await readSummaryFile(path);
      expect(performance.now() - t0).toBeLessThan(500);
      expect(s).toEqual(await readSummary(fileSource(path)));
      expect(s).toEqual({ extruders: [{ lengthMm: 12 }], estimateSeconds: { model: 60, total: 120 } });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('readSummaryFile equals the full scan on every corpus file and is quick', async () => {
    const files = loadManifest().files.filter((f) => f.format === 'gcode');
    const t0 = performance.now();
    for (const f of files) {
      const path = join(fixturesDir, f.path);
      expect(await readSummaryFile(path), f.path).toEqual(await readSummary(fileSource(path)));
    }
    expect(performance.now() - t0).toBeLessThan(1000);
  });

  it('rejects for a missing file', async () => {
    await expect(readSummaryFile(join(fixturesDir, 'nope.gcode'))).rejects.toThrow(/ENOENT/);
  });
});

const gc = (): void => {
  if (!globalThis.gc) throw new Error('run with --expose-gc (see vitest.config.ts)');
  globalThis.gc();
};
