// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { writeZip } from '@vsslicer/3mf';
import { describe, expect, it, vi } from 'vitest';
import { collect, parse } from '../src/index.ts';
import { gcode3mfPlates, gcode3mfSource, readGcode3mfPlate } from '../src/gcode-3mf.ts';

const inflatedNames: string[] = [];
vi.mock('@vsslicer/3mf', async (orig) => {
  const m = await orig<typeof import('@vsslicer/3mf')>();
  return {
    ...m,
    openZip: (...a: Parameters<typeof m.openZip>) => {
      const z = m.openZip(...a);
      return { ...z, inflated: (n: string) => (inflatedNames.push(n), z.inflated(n)) };
    },
  };
});

const h2c = new Uint8Array(readFileSync(new URL('./fixtures/bambu-studio/h2c-cube.gcode.3mf', import.meta.url)));
const enc = (s: string): Uint8Array => new TextEncoder().encode(s);

describe('gcode.3mf plates (H2C fixture, Bambu Studio 02.08.02.61)', () => {
  it('lists the plate and reads version, statistics and thumbnail', () => {
    expect(gcode3mfPlates(h2c)).toEqual([1]);
    const p = readGcode3mfPlate(h2c, 1);
    expect(p.slicerVersion).toBe('02.08.02.61');
    expect(p.diagnostics).toEqual([]);
    expect(p.statistics).toMatchObject({
      index: 1,
      predictionSeconds: 1446,
      weightGrams: 14.5,
      printerModelId: 'O1C2',
      nozzleDiameters: [0.6, 0.6],
      objects: ['Cube'],
    });
    expect(p.statistics?.filaments).toEqual([
      { id: 1, type: 'PLA', color: '#161616', usedMetres: 4.86, usedGrams: 14.5 },
    ]);
    expect([...p.thumbnail!.subarray(1, 4)]).toEqual([0x50, 0x4e, 0x47]);
  });

  it('opens and parses the plate', async () => {
    const parsed = await collect(parse(gcode3mfSource(h2c, 'Metadata/plate_1.gcode')));
    expect(parsed.moveCount).toBeGreaterThan(1000);
    expect(parsed.layers.length).toBeGreaterThan(10);
  });

  it('raises a diagnostic when the G-code no longer matches its MD5', () => {
    const doctored = writeZip(h2c, new Map([['Metadata/plate_1.gcode', enc('G28\n')]]));
    const p = readGcode3mfPlate(doctored, 1);
    expect(p.diagnostics).toHaveLength(1);
    expect(p.diagnostics[0]).toMatchObject({ code: 'gcode-3mf-md5', severity: 'error' });
  });

  it('tolerates missing md5, png and slice_info, and rejects an absent plate', () => {
    const bare = writeZip(
      h2c,
      new Map([
        ['Metadata/plate_1.gcode.md5', null],
        ['Metadata/plate_1.png', null],
        ['Metadata/slice_info.config', null],
      ]),
    );
    const p = readGcode3mfPlate(bare, 1);
    expect(p).toMatchObject({ statistics: undefined, thumbnail: undefined, slicerVersion: undefined, diagnostics: [] });
    expect(() => readGcode3mfPlate(h2c, 2)).toThrow(/plate_2/);
  });

  it('picks the plate by number from a multi-plate slice_info.config', () => {
    const xml = `<config><header><header_item key="X-BBL-Client-Version" value="01.10"/></header>
<plate><metadata key="index" value="1"/><metadata key="prediction" value="10"/></plate>
<plate><metadata key="index" value="2"/><metadata key="prediction" value="20"/><object name="A &amp; B"/></plate></config>`;
    const two = writeZip(
      h2c,
      new Map([
        ['Metadata/slice_info.config', enc(xml)],
        ['Metadata/plate_2.gcode', enc('G28\n')],
        ['Metadata/plate_2.gcode.md5', null],
      ]),
    );
    expect(gcode3mfPlates(two)).toEqual([1, 2]);
    const p = readGcode3mfPlate(two, 2);
    expect(p.statistics).toMatchObject({ predictionSeconds: 20, objects: ['A & B'] });
    expect(p.slicerVersion).toBe('01.10');
  });

  it('reads a quoted > in an attribute, survives 100000 unclosed <plate> and caps a huge config', () => {
    const cfg = (xml: string) => writeZip(h2c, new Map([['Metadata/slice_info.config', enc(xml)]]));
    const gt = readGcode3mfPlate(cfg('<plate><metadata key="index" value="1"/><object name="a>b"/></plate>'), 1);
    expect(gt.statistics?.objects).toEqual(['a>b']);
    const bad = readGcode3mfPlate(cfg('<plate>'.repeat(100000)), 1);
    expect(bad.statistics).toBeUndefined();
    const big = readGcode3mfPlate(cfg(`<!--${'x'.repeat(5 * 1024 * 1024)}-->`), 1);
    expect(big.diagnostics.map((d) => d.code)).toContain('gcode-3mf-slice-info-size');
    // hang guard only; the linearity of the 100000-<plate> case is counted in the scanner matrix below
  }, 60_000);
});

describe('slice_info.config declared size', () => {
  it('is checked before inflating: an entry declaring more than 4 MiB is never inflated', () => {
    const big = writeZip(h2c, new Map([['Metadata/slice_info.config', enc(`<!--${'x'.repeat(5 * 1024 * 1024)}-->`)]]));
    inflatedNames.length = 0;
    const p = readGcode3mfPlate(big, 1);
    expect(inflatedNames).not.toContain('Metadata/slice_info.config');
    expect(p.statistics).toBeUndefined();
    expect(p.diagnostics.map((d) => d.code)).toContain('gcode-3mf-slice-info-size');
  });
});

describe('plate thumbnails', () => {
  it('never inflates a thumbnail declaring over 4 MiB and says so', () => {
    const big = writeZip(h2c, new Map([['Metadata/plate_1.png', new Uint8Array(300 * 1024 * 1024)]]));
    inflatedNames.length = 0;
    const p = readGcode3mfPlate(big, 1);
    expect(inflatedNames).not.toContain('Metadata/plate_1.png');
    expect(p.thumbnail).toBeUndefined();
    expect(p.diagnostics.map((d) => d.code)).toContain('gcode-3mf-thumbnail-size');
  }, 30000);

  it('reads at most 16 of 100 thumbnails with one diagnostic', () => {
    const many = writeZip(
      h2c,
      new Map(Array.from({ length: 100 }, (_, i) => [`Metadata/plate_1_t${i}.png`, enc('x')])),
    );
    const p = readGcode3mfPlate(many, 1);
    expect(p.thumbnails.size).toBe(16);
    expect(p.diagnostics.filter((d) => d.code === 'gcode-3mf-thumbnail-count')).toHaveLength(1);
    expect(p.thumbnail).toBeDefined();
  });
});

describe('slice_info.config scanner is linear on hostile input', () => {
  const cfg = (xml: string) => writeZip(h2c, new Map([['Metadata/slice_info.config', enc(xml)]]));
  const P = (b: string) => `<plate><metadata key="index" value="1"/>${b}</plate>`;
  const shapes: [string, (n: number) => string][] = [
    ['unclosed <object name=', (n) => P('<object name='.repeat(n / 13))],
    ['unclosed quotes', (n) => P('<object name="'.repeat(n / 14))],
    ['unclosed <plate>', (n) => '<plate>'.repeat(n / 7)],
    ['nested tags', (n) => `${'<plate><filament id="1"/>'.repeat(n / 25)}</plate>`],
  ];
  /** Work of one read: native string searches (calls plus characters they scan), the only non-constant step of the scanner. */
  function work(zip: Uint8Array): number {
    const orig = String.prototype.indexOf;
    let n = 0;
    const spy = vi.spyOn(String.prototype, 'indexOf').mockImplementation(function (
      this: string,
      s: string,
      from?: number,
    ) {
      const r = orig.call(this, s, from);
      n += 1 + (r >= 0 ? r : this.length) - (from ?? 0);
      // step budget: a quadratic scan aborts here instead of running for minutes (linear needs about 1e8)
      if (n > 1e9) throw new Error('scanner work budget exceeded');
      return r;
    });
    try {
      expect(readGcode3mfPlate(zip, 1).diagnostics).toEqual([]);
    } finally {
      spy.mockRestore();
    }
    return n;
  }
  const small = 64 * 1024;
  const large = 4 * 1024 * 1024 - 64;
  for (const [name, make] of shapes) {
    // 64x the input: linear work grows about 64x, a quadratic scan (a search per tag) about 4096x.
    // The timeout is a hang guard only.
    it(`${name}: work grows linearly from ${small} to ${large} bytes`, { timeout: 60_000 }, () => {
      const ratio = work(cfg(make(large))) / work(cfg(make(small)));
      expect(ratio).toBeLessThan(200);
    });
  }
});
