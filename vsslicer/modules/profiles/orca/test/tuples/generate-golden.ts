// SPDX-License-Identifier: AGPL-3.0-or-later
// Maintainer tool, never run in CI: regenerates golden/<tree>.json from the OrcaSlicer CLI
// (vsslicer/fixtures/profile-research/oracle.md). Usage, from the module:
//   node test/tuples/generate-golden.ts [path to the OrcaSlicer binary]
// It runs the CLI from a scratch dir with a scratch --datadir, on the fixture trees only, and fails on any resolved
// key whose value differs from the export in a way no RULES entry explains.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  BOOKKEEPING,
  fixtureRoot,
  goldenPath,
  loadTree,
  normalise,
  resolveTuple,
  RULE_KEYS,
  RULES,
  same,
  TUPLES,
  type Golden,
  type GoldenTuple,
  type TreeId,
  type Tuple,
} from './oracle.ts';

const bin = process.argv[2] ?? '/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer';
// the CLI writes a log into its cwd, so every run gets a scratch one
const helpDir = mkdtempSync(join(tmpdir(), 'prf128-'));
const version = execFileSync(bin, ['--help'], { cwd: helpDir, encoding: 'utf8', timeout: 60_000 }).match(
  /OrcaSlicer-[\w.-]+/,
)?.[0];
rmSync(helpDir, { recursive: true, force: true });
if (!version) throw new Error(`${bin} --help printed no version`);

function fileOf(tree: TreeId, vendor: string, list: string, name: string): string {
  for (const v of [vendor, 'OrcaFilamentLibrary']) {
    let index: Record<string, { name: string; sub_path: string }[]>;
    try {
      index = JSON.parse(readFileSync(join(fixtureRoot(tree), `${v}.json`), 'utf8'));
    } catch {
      continue;
    }
    const e = index[list]?.find((x) => x.name === name);
    if (e) return join(fixtureRoot(tree), v, e.sub_path);
  }
  throw new Error(`${name} is not in the ${tree} fixture`);
}

function exportTuple(tree: TreeId, t: Tuple): Record<string, unknown> {
  const dir = mkdtempSync(join(tmpdir(), 'prf128-'));
  try {
    const out = join(dir, 'out.json');
    const settings = `${fileOf(tree, t.vendor, 'machine_list', t.machine)};${fileOf(tree, t.vendor, 'process_list', t.process)}`;
    execFileSync(
      bin,
      [
        '--datadir',
        join(dir, 'datadir'),
        '--outputdir',
        dir,
        '--load-settings',
        settings,
        '--load-filaments',
        fileOf(tree, t.vendor, 'filament_list', t.filament),
        '--export-settings',
        out,
      ],
      { cwd: dir, timeout: 120_000, stdio: 'ignore' },
    );
    return JSON.parse(readFileSync(out, 'utf8'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const unexplained: string[] = [];
for (const tree of ['orca', 'bambu'] as const) {
  const resolvedTree = await loadTree(tree);
  const tuples: GoldenTuple[] = [];
  for (const t of TUPLES[tree]) {
    const exp = exportTuple(tree, t);
    const r = resolveTuple(resolvedTree, t);
    const g: GoldenTuple = { ...t, export: { machine: {}, process: {}, filament: {} }, rules: {}, absent: [] };
    for (const type of ['machine', 'process', 'filament'] as const)
      for (const [key, raw] of Object.entries(r[type])) {
        if (BOOKKEEPING.has(key)) continue;
        const id = `${type}:${key}`;
        if (!Object.hasOwn(exp, key)) {
          g.absent.push(id);
          continue;
        }
        const v = normalise(raw);
        const e = normalise(exp[key]);
        g.export[type][key] = e;
        if (same(v, e)) continue;
        const rule = Object.keys(RULES).find(
          (n) => (RULE_KEYS[n]?.has(key) ?? true) && same(RULES[n]!(v, e, r[type]), e),
        );
        if (rule) g.rules[id] = rule;
        else
          unexplained.push(
            `${tree} ${t.machine} ${id}: ${JSON.stringify(v).slice(0, 80)} vs ${JSON.stringify(e).slice(0, 80)}`,
          );
      }
    tuples.push(g);
  }
  const golden: Golden = {
    generator: 'test/tuples/generate-golden.ts',
    orca: version,
    source: tree === 'orca' ? 'OrcaSlicer@09aa0114' : 'BambuStudio@79df7ae',
    tuples,
  };
  writeFileSync(goldenPath(tree), `${JSON.stringify(golden, null, 1)}\n`);
}
if (unexplained.length) {
  console.error(unexplained.join('\n'));
  process.exit(1);
}
