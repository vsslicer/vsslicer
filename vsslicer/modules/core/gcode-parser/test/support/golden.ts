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
  format: 'gcode' | 'bgcode' | 'gcode.3mf' | '3mf';
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
/** The parser's seam: builds the golden fields from a corpus file; tests inject their own. */
export type Summariser = (bytes: Uint8Array, file: ManifestFile) => Promise<Summary>;

export const loadManifest = (): Manifest =>
  JSON.parse(readFileSync(join(fixturesDir, 'manifest.json'), 'utf8')) as Manifest;

export const goldenPath = (file: ManifestFile): string => join(goldenDir, `${file.path}.json`);

export async function summarise(summariser: Summariser, file: ManifestFile): Promise<Summary> {
  const bytes = readFileSync(join(fixturesDir, file.path));
  return {
    file: { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') },
    ...(await summariser(bytes, file)),
  };
}

export const readGolden = (file: ManifestFile): Summary =>
  JSON.parse(readFileSync(goldenPath(file), 'utf8')) as Summary;

export function writeGolden(file: ManifestFile, summary: Summary): void {
  mkdirSync(dirname(goldenPath(file)), { recursive: true });
  writeFileSync(goldenPath(file), `${JSON.stringify(summary, null, 2)}\n`);
}

/**
 * Cura (`;LAYER:`, no config block) and SuperSlicer 2.3 (old role names, ArcWelder) files are in the corpus
 * but the independent line scans of the Prusa/Orca/Bambu-style tests do not model them; those tests skip them.
 * The golden harness itself still covers them. Tracked in the manifest notes (GCP-2).
 */
export const lineScannable = (f: ManifestFile): boolean =>
  f.format === 'gcode' && f.slicer !== 'Cura' && f.slicer !== 'SuperSlicer';
