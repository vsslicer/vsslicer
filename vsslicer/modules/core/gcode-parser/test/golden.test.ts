// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fixturesDir, loadManifest, readGolden, summarise, type Summary } from './support/golden.ts';
import { parserSummary } from './support/parser-summary.ts';

const manifest = loadManifest();

describe('golden corpus', () => {
  it.each(manifest.files)('$path matches its golden JSON', async (file) => {
    expect(existsSync(join(fixturesDir, file.path)), 'fixture file is missing').toBe(true);
    // a difference fails; regenerate deliberately with `pnpm golden:update`
    expect(await summarise(parserSummary, file)).toEqual(readGolden(file));
  });

  it('manifest and fixture folders list the same files', () => {
    const onDisk = readdirSync(fixturesDir, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile() && e.name !== 'manifest.json' && e.name !== 'PROVENANCE.md')
      .map((e) => join(e.parentPath, e.name).slice(fixturesDir.length + 1))
      .sort();
    expect(onDisk).toEqual(manifest.files.map((f) => f.path).sort());
  });

  it('every fixture folder has a PROVENANCE.md', () => {
    for (const dir of new Set(manifest.files.map((f) => f.path.split('/')[0] ?? ''))) {
      expect(existsSync(join(fixturesDir, dir, 'PROVENANCE.md')), dir).toBe(true);
    }
  });

  it('records generator and version for every file, and a reason for every gap', () => {
    for (const f of manifest.files) expect(f.slicerVersion, f.path).not.toBe('');
    for (const p of manifest.pending) expect(p.reason, p.what).not.toBe('');
  });
});

describe('harness', () => {
  it('detects a changed summary', async () => {
    const file = manifest.files.find((f) => f.format === 'gcode');
    if (!file) throw new Error('no text file in the corpus');
    const golden: Summary = readGolden(file);
    const changed = await summarise(async (bytes, f) => {
      const s = await parserSummary(bytes, f);
      return { ...s, moveCount: -1 };
    }, file);
    expect(changed).not.toEqual(golden);
  });
});

// A second opinion on the move count that does not use the parser: count the lines that command
// a move. G0-G3 with an X, Y, Z or E word (a lone `G1 F3000` is a feedrate change, not a move) and
// G10/G11 without P or L (firmware retract; with them it is an RRF tool-offset command).
const MOVE_LINE = /^G0?[0-3](?=[\s;]|$)(?=[^;]*\b[XYZE]\s*-?[\d.])/i;
const FIRMWARE_RETRACT = /^G1[01](?=[\s;]|$)(?![^;]*\b[PL]\s*-?[\d.])/i;

describe('move counts', () => {
  const text = manifest.files.filter((f) => f.format === 'gcode');
  it.each(text)('$path: parser move count equals an independent line count', async (file) => {
    const lines = readFileSync(join(fixturesDir, file.path), 'utf8')
      .split('\n')
      .map((l) => l.trim());
    // a G2/G3 line is several moves (tessellated); the golden says how many
    const isArc = (l: string): boolean => /^G0?[23](?=[\s;]|$)/i.test(l);
    const arcs = readGolden(file)['arcs'] as { commands: number; segments: number };
    const straight = lines.filter((l) => !isArc(l) && (MOVE_LINE.test(l) || FIRMWARE_RETRACT.test(l))).length;
    expect(straight + arcs.segments).toBeGreaterThan(1000);
    expect(lines.filter((l) => isArc(l) && MOVE_LINE.test(l)).length).toBe(arcs.commands);
    expect(readGolden(file)['moveCount']).toBe(straight + arcs.segments);
  });
});
