// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { openPackage, openZip } from '../../src/index.ts';
import { minimalEntries } from '../support/minimalPackage.ts';
import { buildZip } from '../support/zipBuilder.ts';

const real = (n: string): Uint8Array => new Uint8Array(readFileSync(new URL(`../fixtures/real/${n}`, import.meta.url)));
// No Cura project exists upstream as a file, so the cura fixture is built: Cura's writer layout (readCura.ts).
const cura = (): Uint8Array =>
  buildZip([
    ...minimalEntries(),
    { name: 'Cura/preferences.cfg', data: '[general]\nversion = 7\n' },
    { name: 'Cura/my_machine.global_stack.cfg', data: '[general]\nname = M\n' },
    { name: 'Cura/version.ini', data: '[versions]\ncura_version = 5.9\n' },
    { name: 'Metadata/thumbnail.png', data: 'png' },
  ]);

const fixtures: [string, () => Uint8Array][] = [
  ['Bambu Studio (auto_pa_line_single)', () => real('auto_pa_line_single.3mf')],
  ['Bambu Studio (pa_pattern)', () => real('pa_pattern.3mf')],
  ['OrcaSlicer (OrcaBadge)', () => real('OrcaBadge.3mf')],
  ['OrcaSlicer family (Elegoo_stringhell)', () => real('Elegoo_stringhell.3mf')],
  ['PrusaSlicer 2.9 (fdm_roundtrip1)', () => real('fdm_roundtrip1.3mf')],
  ['Prusa 3.0 alpha tree (wipe_tower)', () => real('wipe_tower.3mf')],
  ['Cura (built)', cura],
];

type Save = (input: Uint8Array) => Uint8Array;
type Replace = (input: Uint8Array, part: string, bytes: Uint8Array) => Uint8Array;
const realSave: Save = (b) => openPackage(b).save();
const realReplace: Replace = (b, part, bytes) => openPackage(b).replacePart(part, bytes).save();

/** Every part, relationship and content type, and the raw zip entry bytes, equal on both sides. */
function expectSame(before: Uint8Array, after: Uint8Array, except: string[] = []): void {
  const a = openPackage(before);
  const b = openPackage(after);
  expect(b.rootModel).toBe(a.rootModel);
  expect(b.parts.map((p) => [p.name, p.contentType, p.relationships])).toEqual(
    a.parts.map((p) => [p.name, p.contentType, p.relationships]),
  );
  const za = openZip(before);
  const zb = openZip(after);
  expect(zb.entries.map((e) => e.name)).toEqual(za.entries.map((e) => e.name));
  for (const e of za.entries) {
    if (except.includes(e.name)) continue;
    expect(Buffer.from(zb.raw(e.name)).equals(Buffer.from(za.raw(e.name))), e.name).toBe(true);
  }
  for (const p of a.parts) {
    if (!except.includes(p.name))
      expect(Buffer.from(b.parts.find((q) => q.name === p.name)!.bytes).equals(Buffer.from(p.bytes)), p.name).toBe(
        true,
      );
  }
}

const untouched = (input: Uint8Array, save: Save): void => {
  const out = save(input);
  expect(Buffer.from(out).equals(Buffer.from(input))).toBe(true);
  expectSame(input, out);
};
const replacing = (input: Uint8Array, replace: Replace): void => {
  for (const { name: part, bytes: old } of openPackage(input).parts) {
    // The old bytes plus a newline: still valid XML, JSON or text, and different.
    const bytes = new Uint8Array(old.length + 1).fill(10);
    bytes.set(old);
    const out = replace(input, part, bytes);
    expect(openPackage(out).parts.find((p) => p.name === part)!.bytes).toEqual(bytes);
    expectSame(input, out, [part]);
  }
};

describe.each(fixtures)('%s', (_n, load) => {
  test('untouched open and save is byte-identical', () => untouched(load(), realSave));
  test('replacing one part leaves every other part identical', { timeout: 60_000 }, () =>
    replacing(load(), realReplace),
  );
});

describe('meta: a mutated saver fails the comparison', () => {
  const input = real('fdm_roundtrip1.3mf');
  test('a saver that flips a byte', () => {
    const flip: Save = (b) => {
      const out = realSave(b).slice();
      out[out.length >> 1] = out[out.length >> 1]! ^ 1;
      return out;
    };
    expect(() => untouched(input, flip)).toThrow();
  });
  test('a saver that recompresses every entry (raw bytes change)', () => {
    const rewrite: Save = (b) => {
      const z = openZip(b);
      return buildZip(
        z.entries
          .filter((e) => !e.name.endsWith('/'))
          .map((e) => ({ name: e.name, data: z.inflated(e.name), method: 0 as const })),
      );
    };
    expect(() => untouched(input, rewrite)).toThrow();
  });
  test('a replace that also touches another part', () => {
    const greedy: Replace = (b, part, bytes) => {
      const other = openPackage(b).parts.find((p) => p.name !== part)!.name;
      return openPackage(b)
        .replacePart(part, bytes)
        .replacePart(other, new Uint8Array([1]))
        .save();
    };
    expect(() => replacing(input, greedy)).toThrow();
  });
});
