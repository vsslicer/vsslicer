// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { openPackage } from '../src/index.ts';
import { coreNs, minimalEntries, triangleModel } from './support/minimalPackage.ts';
import { buildZip } from './support/zipBuilder.ts';

const broken = (name: string): Uint8Array =>
  new Uint8Array(readFileSync(new URL(`./fixtures/broken/${name}`, import.meta.url)));
const open = (overrides: Record<string, string | null>, extra: { name: string; data: string }[] = []) =>
  openPackage(buildZip([...minimalEntries(overrides), ...extra]));

test('returns parts with content type, an unknown part with raw bytes, and thumbnails', () => {
  const pkg = open({}, [
    { name: 'Metadata/thumbnail.png', data: 'png' },
    { name: 'Metadata/vendor.bin', data: 'xyz' },
  ]);
  expect(pkg.rootModel).toBe('3D/3dmodel.model');
  expect(pkg.thumbnails).toEqual([]); // no png Default in the minimal content types
  const bin = pkg.parts.find((p) => p.name === 'Metadata/vendor.bin');
  expect(bin?.contentType).toBe('application/octet-stream');
  expect(new TextDecoder().decode(bin?.bytes)).toBe('xyz');
});

test('lists image parts under Metadata as thumbnails', () => {
  const pkg = open(
    {
      '[Content_Types].xml': `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="model" ContentType="m"/><Default Extension="png" ContentType="image/png"/></Types>`,
    },
    [
      { name: 'Metadata/plate_1.png', data: 'p' },
      { name: '3D/Textures/t.png', data: 'p' },
    ],
  );
  expect(pkg.thumbnails).toEqual(['Metadata/plate_1.png']);
});

test('required extensions: supported passes, unsupported names its namespace', () => {
  const withReq = (ns: string) =>
    triangleModel.replace(`xmlns="${coreNs}"`, `xmlns="${coreNs}" xmlns:z="${ns}" requiredextensions="z"`);
  expect(() =>
    open({ '3D/3dmodel.model': withReq('http://schemas.microsoft.com/3dmanufacturing/production/2015/06') }),
  ).not.toThrow();
  expect(() => open({ '3D/3dmodel.model': withReq('urn:x:beam') })).toThrow(
    expect.objectContaining({ code: 'unsupported-required-extension', extension: 'urn:x:beam' }),
  );
});

test.each([
  ['corrupt-zip.3mf', 'corrupt-zip'],
  ['missing-root-model.3mf', 'missing-root-model'],
  ['malformed-xml.3mf', 'malformed-xml'],
  ['unsupported-required-extension.3mf', 'unsupported-required-extension'],
  ['zip-bomb.3mf', 'size-cap-exceeded'],
  ['missing-production-part.3mf', 'missing-production-part'],
])('%s gives %s', (file, code) => {
  expect(() => openPackage(broken(file))).toThrow(expect.objectContaining({ code }));
});
