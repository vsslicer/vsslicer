// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const fixturesDir = join(root, 'test', 'fixtures');
export const goldenDir = join(root, 'test', 'golden');

export interface ManifestFile {
  path: string;
  format: 'gcode' | 'bgcode' | 'gcode.3mf';
  slicer: string;
  slicerVersion: string;
  printer: string;
  model: string;
  material: 'single' | 'multi';
  arcFitting: 'on' | 'off';
  source: 'generated' | 'upstream';
}
export interface Manifest {
  files: ManifestFile[];
  pending: { slicer: string; what: string; reason: string }[];
}

export type Summary = Record<string, unknown>;
/** The parser's seam: GCP-3/4/7/8 replace the interim summariser with one built on the real parser. */
export type Summariser = (bytes: Uint8Array, file: ManifestFile) => Summary;

export const loadManifest = (): Manifest =>
  JSON.parse(readFileSync(join(fixturesDir, 'manifest.json'), 'utf8')) as Manifest;

export const goldenPath = (file: ManifestFile): string => join(goldenDir, `${file.path}.json`);

export function summarise(summariser: Summariser, file: ManifestFile): Summary {
  const bytes = readFileSync(join(fixturesDir, file.path));
  return {
    file: { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') },
    ...summariser(bytes, file),
  };
}

export const readGolden = (file: ManifestFile): Summary =>
  JSON.parse(readFileSync(goldenPath(file), 'utf8')) as Summary;

export function writeGolden(file: ManifestFile, summary: Summary): void {
  mkdirSync(dirname(goldenPath(file)), { recursive: true });
  writeFileSync(goldenPath(file), `${JSON.stringify(summary, null, 2)}\n`);
}
