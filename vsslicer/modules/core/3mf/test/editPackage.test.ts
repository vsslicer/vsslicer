// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { InvalidPartEditError, openPackage, openZip } from '../src/index.ts';
import type { EditablePackage } from '../src/index.ts';
import { minimalEntries, rootRels, startPartType } from './support/minimalPackage.ts';
import { buildZip } from './support/zipBuilder.ts';

const enc = new TextEncoder();
const dec = (b: Uint8Array): string => new TextDecoder().decode(b);
const rels = (owner: string, target: string): string =>
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="${target}" Id="r1" Type="t"/>\n</Relationships>`;
const sample = (): Uint8Array =>
  buildZip([
    ...minimalEntries({
      '_rels/.rels': rootRels.replace(
        '</Relationships>',
        ` <Relationship Target="/Metadata/t.png" Id="rel1" Type="thumb"/>\n</Relationships>`,
      ),
      '[Content_Types].xml': minimalEntries()[0]!
        .data.toString()
        .replace(
          '</Types>',
          ' <Override PartName="/Metadata/t.png" ContentType="image/png"/>\n <Override PartName="/Metadata/c.config" ContentType="text/plain"/></Types>',
        ),
    }),
    { name: 'Metadata/t.png', data: 'png' },
    { name: 'Metadata/c.config', data: 'cfg' },
    { name: 'Metadata/x.txt', data: 'x' },
    { name: 'Metadata/_rels/c.config.rels', data: rels('Metadata/c.config', '../Metadata/x.txt') },
    { name: '3D/_rels/3dmodel.model.rels', data: rels('3D/3dmodel.model', '/Metadata/c.config') },
  ]);

/** Every entry of `after` other than `except` has the same raw bytes as in `before`. */
function sameRaw(before: Uint8Array, after: Uint8Array, except: string[]): void {
  const b = openZip(before);
  const a = openZip(after);
  for (const e of a.entries)
    if (!except.includes(e.name) && b.entries.some((x) => x.name === e.name))
      expect(a.raw(e.name)).toEqual(b.raw(e.name));
}

test('save on an untouched package is the input', () => {
  const zip = sample();
  expect(openPackage(zip).save()).toEqual(zip);
});

test('replacePart changes one part and leaves the rest identical', () => {
  const zip = sample();
  const pkg = openPackage(zip);
  const next = pkg.replacePart('Metadata/c.config', enc.encode('new'));
  expect(dec(pkg.parts.find((p) => p.name === 'Metadata/c.config')!.bytes)).toBe('cfg');
  const out = next.save();
  expect(dec(openZip(out).inflated('Metadata/c.config'))).toBe('new');
  expect(openZip(out).entries.map((e) => e.name)).toEqual(openZip(zip).entries.map((e) => e.name));
  sameRaw(zip, out, ['Metadata/c.config']);
  expect(dec(openPackage(out).parts.find((p) => p.name === 'Metadata/c.config')!.bytes)).toBe('new');
});

test('addPart registers a Default for a new extension and nothing for a known one', () => {
  const zip = sample();
  const out = openPackage(zip)
    .addPart('Metadata/a.gcode', 'text/x-gcode', enc.encode('G1'))
    .addPart('3D/other.model', 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml', enc.encode('<model/>'))
    .save();
  const types = dec(openZip(out).inflated('[Content_Types].xml'));
  expect(types).toContain('<Default Extension="gcode" ContentType="text/x-gcode"/>');
  expect(types.match(/Extension="model"/g)).toHaveLength(1);
  const again = openPackage(out);
  expect(again.parts.find((p) => p.name === 'Metadata/a.gcode')?.contentType).toBe('text/x-gcode');
  expect(again.parts.find((p) => p.name === '3D/other.model')).toBeDefined();
  sameRaw(zip, out, ['[Content_Types].xml']);
});

test('addPart uses an Override when the extension maps to another type', () => {
  const out = openPackage(sample()).addPart('3D/n.model', 'image/x-special', enc.encode('p')).save();
  expect(dec(openZip(out).inflated('[Content_Types].xml'))).toContain(
    '<Override PartName="/3D/n.model" ContentType="image/x-special"/>',
  );
  expect(openPackage(out).parts.find((p) => p.name === '3D/n.model')?.contentType).toBe('image/x-special');
});

test('removePart drops the part, its rels, its override and relationships pointing at it', () => {
  const zip = sample();
  const pkg = openPackage(zip).removePart('Metadata/c.config');
  const out = pkg.save();
  const z = openZip(out);
  const names = z.entries.map((e) => e.name);
  expect(names).not.toContain('Metadata/c.config');
  expect(names).not.toContain('Metadata/_rels/c.config.rels');
  expect(dec(z.inflated('[Content_Types].xml'))).not.toContain('c.config');
  expect(dec(z.inflated('3D/_rels/3dmodel.model.rels'))).not.toContain('Relationship ');
  expect(dec(z.inflated('_rels/.rels'))).toContain('Metadata/t.png');
  expect(pkg.parts.find((p) => p.name === '3D/3dmodel.model')!.relationships).toEqual([]);
  sameRaw(zip, out, ['[Content_Types].xml', '3D/_rels/3dmodel.model.rels']);
  expect(openPackage(out).parts.map((p) => p.name)).not.toContain('Metadata/c.config');
});

test('removing a thumbnail removes the root relationship and its listing', () => {
  const pkg = openPackage(sample()).removePart('Metadata/t.png');
  expect(pkg.thumbnails).toEqual([]);
  expect(dec(openZip(pkg.save()).inflated('_rels/.rels'))).not.toContain('t.png');
});

test('adding then removing a part leaves a valid package', () => {
  const out = openPackage(sample())
    .addPart('Metadata/a.bin', 'x/y', enc.encode('1'))
    .removePart('Metadata/a.bin')
    .save();
  expect(openPackage(out).parts.map((p) => p.name)).not.toContain('Metadata/a.bin');
});

test.each<[string, (p: EditablePackage) => unknown]>([
  ['replace a missing part', (p) => p.replacePart('nope', new Uint8Array())],
  ['add an existing part', (p) => p.addPart('Metadata/x.txt', 't', new Uint8Array())],
  ['add a rels part', (p) => p.addPart('_rels/.rels', 't', new Uint8Array())],
  ['add the content types', (p) => p.addPart('[Content_Types].xml', 't', new Uint8Array())],
  ['remove a missing part', (p) => p.removePart('nope')],
  ['remove the root model', (p) => p.removePart('3D/3dmodel.model')],
])('cannot %s', (_, edit) => {
  expect(() => edit(openPackage(sample()))).toThrow(InvalidPartEditError);
});

test('start part type constant is the one the fixtures use', () => {
  expect(startPartType).toContain('3dmodel');
});

// Real files from the cloned reference repos; skipped when the clones are absent.
const repos = fileURLToPath(new URL('../../../../.reference/repos/', import.meta.url));
const real = existsSync(repos)
  ? ['PrusaSlicer/tests/data/seam_test_object.3mf', 'PrusaSlicer/src/slic3r-shared/test/data/fdm_roundtrip1.3mf']
      .map((f) => join(repos, f))
      .filter(existsSync)
  : [];

test.skipIf(real.length === 0).each(real)(
  'real file %s: untouched save, and edits keep other parts identical',
  { timeout: 60_000 },
  (file) => {
    const zip = new Uint8Array(readFileSync(file));
    const pkg = openPackage(zip);
    expect(pkg.save()).toEqual(zip);
    const victim = pkg.parts.find((p) => p.name !== pkg.rootModel)?.name;
    const edited = pkg
      .addPart('Metadata/vwr9.gcode', 'text/x-gcode', enc.encode('G1'))
      .replacePart(pkg.rootModel, enc.encode('<model/>'));
    const out = (victim ? edited.removePart(victim) : edited).save();
    const reopened = new Map(openZip(out).entries.map((e) => [e.name, e.name] as const));
    sameRaw(zip, out, [
      pkg.rootModel,
      '[Content_Types].xml',
      'Metadata/vwr9.gcode',
      ...[...reopened.keys()].filter((n) => n.endsWith('.rels')),
    ]);
    for (const p of pkg.parts) {
      if (p.name === pkg.rootModel || p.name === victim) continue;
      expect(openZip(out).inflated(p.name)).toEqual(p.bytes);
    }
    expect(openZip(out).entries.some((e) => e.name === victim)).toBe(false);
  },
);
