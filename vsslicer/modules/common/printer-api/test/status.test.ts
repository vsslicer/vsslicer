// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, expectTypeOf, test } from 'vitest';
import {
  InvalidStatusError,
  PRINTER_STATES,
  STATUS_LIMITS,
  createPrinterStatus,
  mergeStatus,
  type PrinterStatus,
  type PrinterStatusInput,
  type PrintPosition,
} from '../src/domain/status.ts';

/** Bambu H2C shape: one toolhead, two extruders (left/right nozzle), one AMS of 4 trays, an HMS code (MOCK-H2C.json device.extruder.info, ams.ams[0].tray). */
const h2c = {
  state: 'printing',
  vendorState: 'RUNNING',
  heaters: [
    { id: 'nozzle0', kind: 'nozzle', current: 220, target: 220, extruder: 0 },
    { id: 'nozzle1', kind: 'nozzle', current: 40, target: 0, extruder: 1 },
    { id: 'bed', kind: 'bed', current: 60, target: 60 },
    { id: 'chamber', kind: 'chamber', current: 35 },
  ],
  toolheads: [
    {
      index: 0,
      activeExtruder: 0,
      extruders: [
        { index: 0, nozzleDiameter: 0.4, nozzleType: 'hardened_steel', tray: '0-0' },
        { index: 1, nozzleDiameter: 0.4, nozzleType: 'hardened_steel' },
      ],
    },
  ],
  job: { file: '/data/Metadata/plate_1.gcode', progress: 12, remainingSeconds: 3600 },
  position: { layer: 3, percent: 12 },
  materials: [
    { tray: '0-0', type: 'PLA', colour: 'FF0000FF', remain: 80 },
    { tray: '0-1', type: 'PETG', colour: '000000FF', remain: 100 },
    { tray: '0-2' },
    { tray: '0-3' },
  ],
  notifications: [
    {
      code: '0300_2000_0002_0001',
      severity: 'warning',
      message: 'Nozzle temperature low',
      link: 'https://wiki.bambulab.com',
    },
  ],
} satisfies PrinterStatusInput;

/** Deterministic PRNG (mulberry32) so the property test needs no dependency. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomStatus(r: () => number): PrinterStatusInput {
  const n = (max: number) => Math.floor(r() * max);
  const maybe = <T>(v: T) => (r() < 0.5 ? v : undefined);
  return {
    state: PRINTER_STATES[n(PRINTER_STATES.length)]!,
    vendorState: `S${n(100)}`,
    heaters: Array.from({ length: n(6) }, (_, i) => ({
      id: `h${i}`,
      kind: 'nozzle' as const,
      current: r() * 300,
      target: maybe(r() * 300),
    })),
    toolheads: Array.from({ length: n(3) }, (_, i) => ({
      index: i,
      activeExtruder: maybe(0),
      extruders: Array.from({ length: n(3) }, (_, k) => ({
        index: k,
        nozzleDiameter: maybe(0.4),
        tray: maybe(`t${k}`),
      })),
    })),
    job: maybe({ file: `f${n(9)}.gcode`, progress: maybe(r() * 100) }),
    position: maybe({ fileOffset: n(1e6), percent: maybe(r() * 100) }),
    materials: Array.from({ length: n(8) }, (_, i) => ({ tray: `0-${i}`, type: maybe('PLA'), remain: maybe(n(101)) })),
    notifications: Array.from({ length: n(4) }, (_, i) => ({
      code: `c${i}`,
      severity: 'error' as const,
      message: 'm',
    })),
  };
}

describe('PrinterStatus', () => {
  test('H2C fixture: one toolhead with two extruders, nozzle heaters tied to extruders', () => {
    const s = createPrinterStatus(h2c);
    expectTypeOf(s).toEqualTypeOf<PrinterStatus>();
    expectTypeOf(s.position).toEqualTypeOf<PrintPosition | undefined>();
    expectTypeOf<PrintPosition>().toEqualTypeOf<{
      readonly fileOffset?: number;
      readonly layer?: number;
      readonly z?: number;
      readonly percent?: number;
    }>(); // D20 field names
    expect(s.toolheads[0]!.extruders.map((e) => e.index)).toEqual([0, 1]);
    expect(s.heaters.filter((h) => h.kind === 'nozzle').map((h) => h.extruder)).toEqual([0, 1]);
    expect(s.truncations).toEqual([]);
    expect(Object.isFrozen(s) && Object.isFrozen(s.toolheads[0]!.extruders[1])).toBe(true);
  });

  test('property: merging a full status over itself is identity (200 seeds)', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const s = createPrinterStatus(randomStatus(rng(seed)));
      expect(mergeStatus(s, s)).toEqual(s);
      expect(mergeStatus(s, {})).toEqual(s);
      if (s.heaters.length > 0)
        expect(() => createPrinterStatus({ ...s, heaters: [...s.heaters, s.heaters[0]!] })).toThrow(
          expect.objectContaining({ reason: 'duplicate' }),
        );
    }
  });

  test('merge applies a partial push by key and leaves the base unchanged', () => {
    const base = createPrinterStatus(h2c);
    const next = mergeStatus(base, {
      heaters: [{ id: 'nozzle1', current: 230 }],
      toolheads: [{ index: 0, activeExtruder: 1, extruders: [{ index: 1, tray: '0-1' }] }],
      materials: [
        { tray: '0-0', remain: 79 },
        { tray: 'ext-0', type: 'TPU' },
      ],
      job: { progress: 13 },
      position: null,
    });
    expect(next.heaters[1]).toEqual({ id: 'nozzle1', kind: 'nozzle', current: 230, target: 0, extruder: 1 });
    expect(next.toolheads[0]!.activeExtruder).toBe(1);
    expect(next.toolheads[0]!.extruders[1]).toEqual({
      index: 1,
      nozzleDiameter: 0.4,
      nozzleType: 'hardened_steel',
      tray: '0-1',
    });
    expect(next.materials.map((m) => m.tray)).toEqual(['0-0', '0-1', '0-2', '0-3', 'ext-0']);
    expect(next.materials[0]!.remain).toBe(79);
    expect(next.job).toEqual({ file: h2c.job.file, progress: 13, remainingSeconds: 3600 });
    expect(next.position).toBeUndefined();
    expect(base.heaters[1]!.current).toBe(40);
  });

  test.each([
    ['heaters[0].current', { heaters: [{ id: 'a', kind: 'bed', current: Number.NaN }] }, 'notFinite'],
    ['heaters[0].current', { heaters: [{ id: 'a', kind: 'bed', current: 1001 }] }, 'outOfRange'],
    ['heaters[0].target', { heaters: [{ id: 'a', kind: 'bed', current: 20, target: -51 }] }, 'outOfRange'],
    ['job.progress', { job: { file: 'x', progress: 100.5 } }, 'outOfRange'],
    ['position.fileOffset', { position: { fileOffset: -1 } }, 'outOfRange'],
    ['position.fileOffset', { position: { fileOffset: 1.5 } }, 'notInteger'],
    ['position.percent', { position: { percent: Infinity } }, 'notFinite'],
    ['position', { position: {} }, 'missing'],
    ['state', { state: 'exploding' }, 'invalidValue'],
    ['heaters[1].id', { heaters: [h2c.heaters[0], h2c.heaters[0]] }, 'duplicate'],
    ['toolheads[1].index', { toolheads: [h2c.toolheads[0], h2c.toolheads[0]] }, 'duplicate'],
    [
      'toolheads[0].extruders[1].index',
      { toolheads: [{ index: 0, extruders: [{ index: 0 }, { index: 0 }] }] },
      'duplicate',
    ],
    ['materials[1].tray', { materials: [{ tray: '0-0' }, { tray: '0-0' }] }, 'duplicate'],
    ['notifications[0].severity', { notifications: [{ code: 'c', severity: 'meh', message: '' }] }, 'invalidValue'],
  ])('refuses %s (%s)', (field, over, reason) => {
    const input = { ...h2c, ...over } as unknown as PrinterStatusInput;
    const err = (() => {
      try {
        createPrinterStatus(input);
      } catch (e) {
        return e;
      }
    })();
    expect(err).toBeInstanceOf(InvalidStatusError);
    expect(err).toMatchObject({ kind: 'protocol', field, reason });
  });

  test('caps lists and strings with a named reason', () => {
    const s = createPrinterStatus({
      ...h2c,
      vendorState: 'x'.repeat(10_000),
      materials: Array.from({ length: 300 }, (_, i) => ({ tray: `t${i}` })),
      notifications: [{ code: 'c', severity: 'info', message: 'm'.repeat(5000) }],
    });
    expect(s.vendorState).toHaveLength(STATUS_LIMITS.vendorState);
    expect(s.materials).toHaveLength(256);
    expect(s.notifications[0]!.message).toHaveLength(4096);
    expect(s.truncations).toEqual([
      { field: 'materials', reason: 'tooMany' },
      { field: 'notifications[0].message', reason: 'tooLong' },
      { field: 'vendorState', reason: 'tooLong' },
    ]);
    const merged = mergeStatus(createPrinterStatus(h2c), {
      heaters: Array.from({ length: 100 }, (_, i) => ({ id: `x${i}`, kind: 'other' as const, current: 20 })),
    });
    expect(merged.heaters).toHaveLength(64);
    expect(merged.truncations).toEqual([{ field: 'heaters', reason: 'tooMany' }]);
  });

  test('merge keeps a base truncation until the patch sets its field to a new value', () => {
    const s = createPrinterStatus({ ...h2c, vendorState: 'x'.repeat(300) });
    const cut = [{ field: 'vendorState', reason: 'tooLong' }];
    expect(s.truncations).toEqual(cut);
    expect(mergeStatus(s, { state: 'busy' }).truncations).toEqual(cut);
    expect(mergeStatus(s, { vendorState: 'ok' }).truncations).toEqual([]);
    expect(mergeStatus(s, { vendorState: s.vendorState }).truncations).toEqual(cut); // equal string keeps the cut
  });

  test('merge(s, s) is identity for statuses with cuts (rule 28)', () => {
    const note = h2c.notifications[0]!;
    const seeds = {
      vendorState: { vendorState: 'x'.repeat(300) },
      jobFile: { job: { file: 'f'.repeat(5000) } },
      message: { notifications: [{ ...note, message: 'm'.repeat(5000) }] },
      manyNotes: { notifications: Array.from({ length: 300 }, (_, i) => ({ ...note, code: `c${i}` })) },
      manyHeaters: {
        heaters: Array.from({ length: 70 }, (_, i) => ({ id: `h${i}`, kind: 'other' as const, current: 20 })),
      },
      longHeaterId: { heaters: [{ id: 'i'.repeat(300), kind: 'bed' as const, current: 20 }, h2c.heaters[0]!] },
    };
    for (const [name, over] of Object.entries(seeds)) {
      const s = createPrinterStatus({ ...h2c, ...over } as PrinterStatusInput);
      expect(s.truncations, name).toHaveLength(1);
      expect(mergeStatus(s, s), name).toEqual(s);
    }
    const notes = createPrinterStatus({ ...h2c, ...seeds.manyNotes } as PrinterStatusInput);
    expect(mergeStatus(notes, { notifications: [...notes.notifications] }).truncations).toEqual([]);
    // a key-field cut survives a push to another heater
    const ids = createPrinterStatus({ ...h2c, ...seeds.longHeaterId } as PrinterStatusInput);
    expect(mergeStatus(ids, { heaters: [{ id: 'nozzle0', current: 100 }] }).truncations).toEqual([
      { field: 'heaters[0].id', reason: 'tooLong' },
    ]);
  });

  test('merge keeps list and merged-object cuts through routine pushes', () => {
    const s = createPrinterStatus({
      ...h2c,
      heaters: Array.from({ length: 70 }, (_, i) => ({ id: `h${i}`, kind: 'other' as const, current: 20 })),
      job: { file: 'f'.repeat(5000), progress: 1 },
      toolheads: [
        {
          index: 0,
          extruders: Array.from({ length: 20 }, (_, i) => ({ index: i, nozzleType: i === 1 ? 'n'.repeat(300) : 'x' })),
        },
      ],
      materials: [{ tray: '0-0', type: 't'.repeat(300) }, { tray: '0-1' }],
    });
    const extruderCut = { field: 'toolheads[0].extruders', reason: 'tooMany' };
    const nozzleCut = { field: 'toolheads[0].extruders[1].nozzleType', reason: 'tooLong' };
    const heaterCut = { field: 'heaters', reason: 'tooMany' };
    const fileCut = { field: 'job.file', reason: 'tooLong' };
    const typeCut = { field: 'materials[0].type', reason: 'tooLong' };
    expect(s.truncations).toEqual(expect.arrayContaining([heaterCut, extruderCut, nozzleCut, fileCut, typeCut]));
    expect(s.truncations).toHaveLength(5);
    const cuts = (p: Parameters<typeof mergeStatus>[1]) => mergeStatus(s, p).truncations;
    // a temperature push keeps the heater cut, once, even when it adds a heater past the cap
    expect(cuts({ heaters: [{ id: 'h0', current: 200 }] })).toContainEqual(heaterCut);
    expect(cuts({ heaters: [{ id: 'new', kind: 'bed', current: 1 }] }).filter((t) => t.field === 'heaters')).toEqual([
      heaterCut,
    ]);
    expect(cuts({ job: { progress: 50 } })).toContainEqual(fileCut);
    expect(cuts({ job: { file: 'x' } })).not.toContainEqual(fileCut);
    expect(cuts({ job: null })).not.toContainEqual(fileCut);
    // a toolhead push keeps the extruder list cut and an item cut the pushed extruder does not set
    expect(cuts({ toolheads: [{ index: 0, activeExtruder: 1, extruders: [{ index: 1, tray: 'a' }] }] })).toEqual(
      expect.arrayContaining([extruderCut, nozzleCut]),
    );
    expect(cuts({ toolheads: [{ index: 0, extruders: [{ index: 1, nozzleType: 'ok' }] }] })).not.toContainEqual(
      nozzleCut,
    );
    expect(cuts({ toolheads: [{ index: 0, extruders: [{ index: 2, nozzleType: 'ok' }] }] })).toContainEqual(nozzleCut);
    expect(cuts({ materials: [{ tray: '0-1', type: 'PLA' }] })).toContainEqual(typeCut);
    expect(cuts({ materials: [{ tray: '0-0', type: 'PLA' }] })).not.toContainEqual(typeCut);
  });

  test('a heater or tray id cut to the cap still merges when the next push sends it in full (PRN-446)', () => {
    const long = 'h'.repeat(STATUS_LIMITS.id + 44);
    const base = createPrinterStatus({
      ...h2c,
      heaters: [{ id: long, kind: 'nozzle', current: 20 }],
      materials: [{ tray: long }],
    });
    expect(base.truncations).toContainEqual({ field: 'heaters[0].id', reason: 'tooLong' });
    let s = base;
    for (const current of [200, 210])
      s = mergeStatus(s, { heaters: [{ id: long, current }], materials: [{ tray: long, remain: current / 10 }] });
    expect(s.heaters).toEqual([{ id: long.slice(0, STATUS_LIMITS.id), kind: 'nozzle', current: 210 }]);
    expect(s.materials).toEqual([{ tray: long.slice(0, STATUS_LIMITS.id), remain: 21 }]);
    expect(s.truncations).toContainEqual({ field: 'heaters[0].id', reason: 'tooLong' });
    expect(s.truncations).toContainEqual({ field: 'materials[0].tray', reason: 'tooLong' });
    // bounds: a 10^6-character key costs one cut, and the result keeps the cap
    const huge = 'h'.repeat(1_000_000);
    const h = mergeStatus(createPrinterStatus({ ...h2c, heaters: [{ id: huge, kind: 'bed', current: 20 }] }), {
      heaters: [{ id: huge, current: 30 }],
    });
    expect(h.heaters).toHaveLength(1);
    expect(h.heaters[0]?.id).toHaveLength(STATUS_LIMITS.id);
  });

  test('a null or non-object list item is refused with InvalidStatusError, in create and merge (PRN-447)', () => {
    const refused = (f: () => unknown, field: string) => {
      const err = (() => {
        try {
          f();
        } catch (e) {
          return e;
        }
      })();
      expect(err).toBeInstanceOf(InvalidStatusError);
      expect(err).toMatchObject({ field, reason: 'invalidValue' });
    };
    const base = createPrinterStatus(h2c);
    for (const bad of [null, 7, 'x']) {
      for (const list of ['heaters', 'materials', 'notifications', 'toolheads'] as const)
        refused(() => createPrinterStatus({ ...h2c, [list]: [bad] } as never), `${list}[0]`);
      refused(
        () => createPrinterStatus({ ...h2c, toolheads: [{ index: 0, extruders: [bad] }] } as never),
        'toolheads[0].extruders[0]',
      );
      for (const list of ['heaters', 'materials', 'toolheads'] as const)
        refused(() => mergeStatus(base, { [list]: [bad] } as never), `${list}[0]`);
      refused(() => mergeStatus(base, { notifications: [bad] } as never), 'notifications[0]');
      refused(
        () => mergeStatus(base, { toolheads: [{ index: 0, extruders: [{ index: 0 }, bad] }] } as never),
        'toolheads[0].extruders[1]',
      );
    }
  });

  test('hostile input: a 10^7-element array costs reads bounded by the cap', () => {
    let reads = 0;
    const huge = new Proxy(new Array<unknown>(10_000_000), {
      get(target, key, recv) {
        if (typeof key === 'string' && /^\d+$/.test(key)) {
          reads++;
          return {
            id: `h${key}`,
            kind: 'other',
            current: 20,
            code: 'c',
            severity: 'info',
            message: 'm',
            tray: key,
            index: Number(key),
          };
        }
        return Reflect.get(target, key, recv);
      },
    });
    const s = createPrinterStatus({
      ...h2c,
      heaters: huge as never,
      notifications: huge as never,
      toolheads: [{ index: 0, extruders: huge as never }],
    });
    expect(s.heaters).toHaveLength(STATUS_LIMITS.heaters);
    expect(reads).toBe(STATUS_LIMITS.heaters + STATUS_LIMITS.notifications + STATUS_LIMITS.extruders);
    reads = 0;
    mergeStatus(createPrinterStatus(h2c), { materials: huge as never });
    expect(reads).toBe(STATUS_LIMITS.materials + 1);
  });
});
