// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import { readOrcaTree } from '../src/adapters/tree/read-tree.ts';
import { readOrcaUserPresets } from '../src/adapters/user/read-user-presets.ts';

const enc = new TextEncoder();
const files = (m: Record<string, unknown>) =>
  Object.entries(m).map(([path, v]) => ({ path, bytes: enc.encode(typeof v === 'string' ? v : JSON.stringify(v)) }));
const tree = readOrcaTree(
  files({
    'V.json': { name: 'V', version: '1', filament_list: [{ name: 'Base PLA', sub_path: 'f/b.json' }] },
    'V/f/b.json': { type: 'filament', name: 'Base PLA', instantiation: 'true', setting_id: 'GFSA00' },
  }),
);
const info = 'sync_info = update\nuser_id = 42\nsetting_id = USR1\nbase_id = GFSA00\nupdated_time = 1700000000\n';

describe('readOrcaUserPresets', () => {
  test('links the parent to the vendor entity and takes base_version from the sidecar', () => {
    const r = readOrcaUserPresets(
      files({
        'user/42/filament/Mine.json': {
          type: 'filament',
          name: 'Mine',
          inherits: 'Base PLA',
          k: ['1', 'nil'],
          s: 'nil',
        },
        'user/42/filament/Mine.info': info,
      }),
      tree,
    );
    expect(r.diagnostics).toEqual([]);
    expect(r.presets).toHaveLength(1);
    const p = r.presets[0]!;
    expect(p.parent).toEqual({ vendor: 'V', name: 'Base PLA' });
    expect(p.meta.base_version).toBe('GFSA00');
    expect(p.external_ids.setting_id).toBe('USR1');
    expect(p.settings).toEqual({ k: ['1', null], s: null });
  });

  test('a missing parent is a warning and the preset stays importable', () => {
    const r = readOrcaUserPresets(
      files({ 'user/42/filament/Orphan.json': { type: 'filament', name: 'Orphan', inherits: 'Gone', a: '1' } }),
      tree,
    );
    expect(r.presets.map((p) => p.name)).toEqual(['Orphan']);
    expect(r.presets[0]!.parent).toBeUndefined();
    expect(r.diagnostics.map((d) => [d.code, d.severity, d.file])).toEqual([
      ['unknown-parent', 'warning', 'user/42/filament/Orphan.json'],
    ]);
  });

  test('a user preset can inherit another user preset; "null" base_id means none', () => {
    const r = readOrcaUserPresets(
      files({
        'user/42/process/A.json': { name: 'A', inherits: '' },
        'user/42/process/B.json': { name: 'B', inherits: 'A' },
        'user/42/process/A.info': 'base_id = null\n',
      }),
      tree,
    );
    expect(r.diagnostics).toEqual([]);
    expect(r.presets.find((p) => p.name === 'B')!.parent).toEqual({ name: 'A' });
    expect(r.presets.find((p) => p.name === 'A')!.meta.base_version).toBeUndefined();
  });

  test('bad JSON, a wrong type and unsafe paths give diagnostics; others import', () => {
    const r = readOrcaUserPresets(
      files({
        'user/1/filament/bad.json': '{nope',
        'user/1/filament/wrong.json': { type: 'process', name: 'wrong' },
        'user/1/filament/../../x/process/e.json': {},
        'user/1/filament/ok.json': { name: 'ok' },
        'user/1/filament/OK.json': { name: 'OK' },
      }),
      tree,
    );
    expect(r.presets.map((p) => p.name)).toEqual(['ok']);
    expect(r.diagnostics.map((d) => d.code).sort()).toEqual([
      'duplicate',
      'invalid-json',
      'unknown-type',
      'unsafe-path',
    ]);
  });

  test('base/ custom roots are read first and their children link to them', () => {
    const r = readOrcaUserPresets(
      files({
        'user/42/filament/Child.json': { name: 'Child', inherits: 'My Root' },
        'user/42/filament/My Root.json': { name: 'My Root', a: 'top' },
        'user/42/filament/base/My Root.json': { name: 'My Root', a: 'base' },
        'user/42/filament/base/My Root.info': 'base_id = GFSA00\n',
      }),
      tree,
    );
    expect(r.presets.map((p) => [p.name, p.file])).toEqual([
      ['My Root', 'user/42/filament/base/My Root.json'],
      ['Child', 'user/42/filament/Child.json'],
    ]);
    expect(r.presets[0]!.meta.base_version).toBe('GFSA00');
    expect(r.presets[1]!.parent).toEqual({ name: 'My Root' });
    expect(r.diagnostics.map((d) => [d.code, d.file])).toEqual([['duplicate', 'user/42/filament/My Root.json']]);
  });

  test('unrecognised files under user/ warn; files outside user/ are not ours', () => {
    const r = readOrcaUserPresets(
      files({ 'user/42/_local/b/x.json': {}, 'user/42/notes.txt': 'x', 'other/y.json': {} }),
      tree,
    );
    expect(r.presets).toEqual([]);
    expect(r.diagnostics.map((d) => [d.code, d.severity, d.file])).toEqual([
      ['unknown-type', 'warning', 'user/42/_local/b/x.json'],
      ['unknown-type', 'warning', 'user/42/notes.txt'],
    ]);
  });

  test('a folder named like an Object.prototype key is not a type', () => {
    const r = readOrcaUserPresets(
      files({ 'user/42/constructor/X.json': {}, 'user/42/__proto__/Y.json': {}, 'user/42/toString/Z.json': {} }),
      tree,
    );
    expect(r.presets).toEqual([]);
    expect(r.diagnostics.map((d) => d.code)).toEqual(['unknown-type', 'unknown-type', 'unknown-type']);
  });

  test('the file stem names the preset; a different inner name warns', () => {
    const r = readOrcaUserPresets(
      files({
        'user/42/filament/N.json': { name: 'Different', a: '1' },
        'user/42/filament/C.json': { name: 'C', inherits: 'N' },
      }),
      tree,
    );
    expect(r.presets.map((p) => p.name)).toEqual(['N', 'C']);
    expect(r.presets[1]!.parent).toEqual({ name: 'N' });
    expect(r.diagnostics.map((d) => [d.code, d.severity, d.file])).toEqual([
      ['name-mismatch', 'warning', 'user/42/filament/N.json'],
    ]);
  });

  test('a user preset named like a vendor preset of its type is not loaded, as in Orca', () => {
    const r = readOrcaUserPresets(
      files({
        'user/42/filament/Base PLA.json': { name: 'Base PLA', a: '1' },
        'user/42/process/Base PLA.json': { name: 'Base PLA' },
      }),
      tree,
    );
    expect(r.presets.map((p) => [p.type, p.name])).toEqual([['process', 'Base PLA']]);
    expect(r.diagnostics.map((d) => [d.code, d.file])).toEqual([['duplicate', 'user/42/filament/Base PLA.json']]);
  });

  test('file count, file size and total bytes are capped', () => {
    const f = files({ 'user/1/filament/a.json': { name: 'a' }, 'user/1/filament/b.json': { name: 'b' } });
    expect(readOrcaUserPresets(f, tree, { maxFiles: 1 }).presets).toEqual([]);
    expect(readOrcaUserPresets(f, tree, { maxTotalBytes: 20 }).presets).toEqual([]);
    const r = readOrcaUserPresets(f, tree, { maxFileBytes: 10 });
    expect(r.diagnostics.map((d) => d.code)).toEqual(['limit', 'limit']);
  });
});
