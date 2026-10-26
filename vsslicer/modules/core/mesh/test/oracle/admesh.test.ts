// SPDX-License-Identifier: AGPL-3.0-or-later
// Degenerate triangles are not compared: admesh counts only coincident-vertex facets (a collinear one is 0) and counts the
// three edges of a collinear facet as open, where MeshStats skips them.
// admesh (GPL) is run as a separate process and only its report is read; no admesh code is used (VWR-45).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, test } from 'vitest';
import { parseModel, type MeshStats } from '../../src/index.ts';

const dir = new URL('../fixtures/stl-obj/', import.meta.url);
// A URL pathname keeps %20 for a space; admesh needs a real file path.
const fixturePath = (f: string, base: URL = dir): string => fileURLToPath(new URL(f, base));

test('fixturePath decodes a space in the directory', () => {
  const base = join(tmpdir(), 'my projects');
  expect(fixturePath('a b.stl', pathToFileURL(base + sep))).toBe(join(base, 'a b.stl'));
});
const probe = spawnSync('admesh', ['--version'], { encoding: 'utf8' });
const haveAdmesh = probe.status === 0;
// CI sets VSS_REQUIRE_ADMESH so a missing admesh fails the job instead of skipping the oracle
const required = process.env.VSS_REQUIRE_ADMESH === '1';

interface Report {
  triangleCount: number;
  bounds: number[];
  volume: number;
  openEdges: number;
}

function num(text: string, re: RegExp): number {
  const m = re.exec(text);
  if (!m) throw new Error(`admesh report lacks ${re}`);
  return Number(m[1]);
}

/** Reads the numbers out of `admesh -e` output (exact edge check only, no repairs, so Original = Final). Open edges = facets with k disconnected edges, weighted by k (final column). */
function parseReport(text: string): Report {
  const final = (label: string): number => num(text, new RegExp(`${label}\\s*:\\s+-?\\d+\\s+(-?\\d+)`));
  const axis = (a: string): number[] => [
    num(text, new RegExp(`Min ${a} =\\s*(-?[\\d.]+)`)),
    num(text, new RegExp(`Max ${a} =\\s*(-?[\\d.]+)`)),
  ];
  return {
    triangleCount: final('Number of facets'),
    bounds: [...axis('X'), ...axis('Y'), ...axis('Z')],
    volume: num(text, /Volume\s*:\s*(-?[\d.]+)/),
    openEdges:
      final('Facets with 1 disconnected edge') +
      2 * final('Facets with 2 disconnected edges') +
      3 * final('Facets with 3 disconnected edges'),
  };
}

/** Empty list = agreement. Bounds are float32 values both sides print to 6 places; volume is compared relatively. */
function compare(s: MeshStats, r: Report): string[] {
  const out: string[] = [];
  if (s.triangleCount !== r.triangleCount) out.push(`triangles ${s.triangleCount} vs ${r.triangleCount}`);
  if (s.openEdges !== r.openEdges) out.push(`open edges ${s.openEdges} vs ${r.openEdges}`);
  const b = s.bounds;
  const mine = [b.min[0], b.max[0], b.min[1], b.max[1], b.min[2], b.max[2]];
  mine.forEach((v, i) => {
    if (Math.abs(v - (r.bounds[i] as number)) > 1e-5 * Math.max(1, Math.abs(v)))
      out.push(`bounds[${i}] ${v} vs ${r.bounds[i]}`);
  });
  // the volume of an open mesh depends on the reference point (admesh: its own, ours: the origin), so it is compared on closed meshes only
  if (r.openEdges === 0 && Math.abs(s.volume - r.volume) > 1e-5 * Math.max(1, Math.abs(r.volume)))
    out.push(`volume ${s.volume} vs ${r.volume}`);
  return out;
}

/** box-binary.stl with its last `drop` triangles removed. */
function brokenBox(drop: number): Uint8Array {
  const src = readFileSync(new URL('box-binary.stl', dir));
  const n = src.readUInt32LE(80) - drop;
  const out = Buffer.from(src.subarray(0, 84 + 50 * n));
  out.writeUInt32LE(n, 80);
  return out;
}

async function check(path: string): Promise<{ stats: MeshStats; report: Report }> {
  const res = spawnSync('admesh', ['-e', path], { encoding: 'utf8' });
  expect(res.status, res.stderr).toBe(0);
  const parsed = await parseModel(new Uint8Array(readFileSync(path)), { extension: 'stl' });
  if (parsed.kind !== 'parsed') throw new Error('expected parsed');
  return { stats: parsed.stats, report: parseReport(res.stdout) };
}

const run = haveAdmesh || required ? test : test.skip;
const strict = (name: string, fn: () => Promise<void>) =>
  run(name, async () => {
    expect(haveAdmesh, 'admesh is not installed').toBe(true);
    await fn();
  });

const clean = readdirSync(dir).filter((f) =>
  /^(box-(binary|ascii|ascii-crlf|binary-solid-header)|cura-BIQU_BX_PLATE)\.stl$/.test(f),
);

for (const f of clean) {
  strict(`MeshStats matches admesh on ${f}`, async () => {
    const { stats, report } = await check(fixturePath(f));
    expect(compare(stats, report)).toEqual([]);
  });
}

strict('MeshStats matches admesh on a box with missing triangles', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'mesh-admesh-'));
  try {
    for (const drop of [1, 2, 5]) {
      const p = join(tmp, `b-${drop}.stl`);
      writeFileSync(p, brokenBox(drop));
      const { stats, report } = await check(p);
      expect(report.openEdges, `${p} must be open`).toBeGreaterThan(0);
      expect(compare(stats, report)).toEqual([]);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

strict('meta-test: a mutated edge counter fails the comparison', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'mesh-admesh-'));
  try {
    const p = join(tmp, 'open.stl');
    writeFileSync(p, brokenBox(1));
    const { stats, report } = await check(p);
    expect(report.openEdges).toBeGreaterThan(0);
    expect(compare({ ...stats, openEdges: stats.openEdges + 1 }, report)).not.toEqual([]);
    expect(compare({ ...stats, openEdges: 0 }, report)).not.toEqual([]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
