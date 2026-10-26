// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { readContentTypes, readPackage, readRelationships, resolveTarget } from '../src/adapters/opc/opc.ts';
import { openZip } from '../src/adapters/zip/fflateZip.ts';
import { MalformedXmlError, MissingRootModelError } from '../src/index.ts';
import { startPartType, minimalEntries } from './support/minimalPackage.ts';
import { buildZip } from './support/zipBuilder.ts';

const rels = (...r: string[]): string =>
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${r.join('')}</Relationships>`;
const zipOf = (overrides: Record<string, string | null>) => openZip(buildZip(minimalEntries(overrides)));

test.each([
  ['', '/3D/a.model', '3D/a.model'],
  ['3D/3dmodel.model', 'Objects/o.model', '3D/Objects/o.model'],
  ['3D/Objects/o.model', '../Textures/t.png', '3D/Textures/t.png'],
  ['3D/3dmodel.model', './x.png', '3D/x.png'],
  ['', 'Metadata/t.png', 'Metadata/t.png'],
])('resolveTarget(%j, %j) = %j', (source, target, expected) => {
  expect(resolveTarget(source, target)).toBe(expected);
});

test('reads a minimal package', () => {
  const pkg = readPackage(zipOf({}));
  expect(pkg.rootModel).toBe('3D/3dmodel.model');
  expect(pkg.parts.map((p) => [p.name, p.contentType])).toEqual([
    ['3D/3dmodel.model', 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml'],
  ]);
});

test('overrides beat defaults, extensions and part names ignore case, unknown types stay', () => {
  const zip = openZip(
    buildZip([
      ...minimalEntries({
        '[Content_Types].xml': `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="MODEL" ContentType="m"/><Default Extension="png" ContentType="image/png"/>
 <Override PartName="/Metadata/Slic3r.CONFIG" ContentType="text/vendor-unknown"/></Types>`,
      }),
      { name: 'Metadata/thumb.PNG', data: 'p' },
      { name: 'Metadata/slic3r.config', data: 'c' },
      { name: 'Metadata/other.bin', data: 'o' },
    ]),
  );
  expect(readContentTypes(zip).overrides.get('metadata/slic3r.config')).toBe('text/vendor-unknown');
  const types = Object.fromEntries(readPackage(zip).parts.map((p) => [p.name, p.contentType]));
  expect(types).toMatchObject({
    '3D/3dmodel.model': 'm',
    'Metadata/thumb.PNG': 'image/png',
    'Metadata/slic3r.config': 'text/vendor-unknown',
    'Metadata/other.bin': 'application/octet-stream',
  });
});

test('part relationships are read with unknown types and external targets kept', () => {
  const zip = zipOf({
    '3D/_rels/3dmodel.model.rels': rels(
      '<Relationship Id="r1" Type="http://example.com/vendor/odd" Target="Objects/o.model"/>',
      '<Relationship Id="r2" Type="http://x/web" Target="https://example.com/a" TargetMode="External"/>',
    ),
  });
  const rel = readPackage(zip).parts[0]!.relationships;
  expect(rel).toEqual([
    { id: 'r1', type: 'http://example.com/vendor/odd', target: 'Objects/o.model', external: false },
    { id: 'r2', type: 'http://x/web', target: 'https://example.com/a', external: true },
  ]);
  expect(readRelationships(zip, '')[0]).toMatchObject({ type: startPartType, target: '/3D/3dmodel.model' });
});

test('relative start-part target and a model elsewhere resolve', () => {
  const zip = openZip(
    buildZip(
      minimalEntries({
        '_rels/.rels': rels(`<Relationship Id="a" Type="${startPartType}" Target="3D/./3dmodel.model"/>`),
      }),
    ),
  );
  expect(readPackage(zip).rootModel).toBe('3D/3dmodel.model');
});

test('no start-part relationship, absent model or missing content types is MissingRootModelError', () => {
  expect(() => readPackage(zipOf({ '3D/3dmodel.model': null }))).toThrow(MissingRootModelError);
  expect(() => readPackage(zipOf({ '_rels/.rels': rels() }))).toThrow(MissingRootModelError);
  expect(() => readPackage(zipOf({ '[Content_Types].xml': null }))).toThrow(MissingRootModelError);
  const fixture = new Uint8Array(readFileSync(new URL('./fixtures/broken/missing-root-model.3mf', import.meta.url)));
  expect(() => readPackage(openZip(fixture))).toThrow(MissingRootModelError);
});

test('malformed XML names the part', () => {
  const bad = (o: Record<string, string>) => () => readPackage(zipOf(o));
  expect(bad({ '[Content_Types].xml': '<Types><Default></Types>' })).toThrow(MalformedXmlError);
  expect(bad({ '_rels/.rels': '<Relationships>' })).toThrow(/_rels\/\.rels/);
  expect(bad({ '_rels/.rels': rels('<Relationship Id="a"/>') })).toThrow(MalformedXmlError);
});

// Real slicer output, when the research clones are present (they are not committed).
const dialects = [
  '../../../../.reference/repos/AnycubicSlicerNext/resources/handy_models/OrcaCube_v2.3mf',
  '../../../../.reference/repos/3mf-spec-booleans/Examples/booleans_operations.3mf',
  '../../../../.reference/repos/BambuStudio/resources/calib/pressure_advance/pa_pattern.3mf',
  '../../../../.reference/repos/BambuStudio/resources/calib/filament_flow/flowrate-test-pass1.3mf',
].map((p) => new URL(p, import.meta.url));
test.each(dialects.filter((u) => existsSync(u)).map((u) => [u.pathname.split('/').pop(), u] as const))(
  'reads %s',
  (_, url) => {
    const pkg = readPackage(openZip(new Uint8Array(readFileSync(url))));
    expect(pkg.parts.find((p) => p.name === pkg.rootModel)?.contentType).toContain('3dmodel');
  },
);

// Cura's bundled printer-bed meshes (3MF, several Prusa-named); skipped when the clone is absent.
const curaDir = new URL('../../../../.reference/repos/Cura/resources/meshes/', import.meta.url);
test.skipIf(!existsSync(curaDir))(
  'reads every Cura 3MF mesh',
  () => {
    const files = readdirSync(curaDir).filter((f) => f.endsWith('.3mf'));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const pkg = readPackage(openZip(new Uint8Array(readFileSync(new URL(f, curaDir)))));
      expect(pkg.parts.find((p) => p.name === pkg.rootModel)?.contentType, f).toContain('3dmodel');
    }
  },
  30_000,
); // hang guard: reads many meshes, slow under parallel load
