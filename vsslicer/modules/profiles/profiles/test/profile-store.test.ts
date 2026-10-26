// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ImportedEntity } from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import {
  createProfileStore,
  MAX_ENTITY_ID,
  MAX_STORE_ENTITIES,
  type ProfileFileEntry,
} from '../src/application/store/profile-store.ts';

const mat = (id: string, vendor: string, ext: Record<string, string> = {}) =>
  ({ id, vendor, name: id, type: 'PLA', diameter: 1.75, external_ids: ext }) as unknown as ImportedEntity;
const entry = (
  path: string,
  entity: ImportedEntity,
  layer: 'bundled' | 'user' = 'bundled',
  kind = 'material' as const,
): ProfileFileEntry => ({
  path,
  layer,
  kind,
  entity,
});
const store = (entries: ProfileFileEntry[]) => createProfileStore({ read: async () => entries });

describe('profile store', () => {
  test('get, list and query over a 14 420 entity vendor tree', async () => {
    const entries: ProfileFileEntry[] = [];
    for (let i = 0; i < 14_420; i++)
      entries.push(entry(`m/${i}.json`, mat(`m${i}`, `v${i % 20}`, i === 7 ? { orca_filament_id: 'GFA00' } : {})));
    const s = store(entries);
    expect(await s.load()).toEqual([]);
    expect((await s.get('material', 'm9'))?.id).toBe('m9');
    expect(await s.get('material', 'nope')).toBeUndefined();
    expect(await s.get('nozzle', 'm9')).toBeUndefined();
    expect(await s.list('material')).toHaveLength(14_420);
    expect(await s.list('nozzle')).toEqual([]);
    expect(await s.query('material', { vendor: 'v3' })).toHaveLength(721);
    expect((await s.query('material', { external_id: 'GFA00' })).map((e) => e.id)).toEqual(['m7']);
    expect(await s.query('material', { vendor: 'v3', external_id: 'GFA00' })).toEqual([]);
    expect((await s.query('material', { vendor: 'v7', external_id: 'GFA00' })).map((e) => e.id)).toEqual(['m7']);
    expect(await s.query('material', {})).toHaveLength(14_420);
  });

  test('a vendor entity is indexed under its own id', async () => {
    const s = store([entry('v.json', { id: 'prusa' } as ImportedEntity, 'bundled', 'vendor' as never)]);
    await s.load();
    expect((await s.query('vendor', { vendor: 'prusa' })).map((e) => e.id)).toEqual(['prusa']);
  });

  test('same id twice: diagnostic, and the user layer wins whatever the order', async () => {
    const a = entry('bundled/a.json', mat('x', 'v1'));
    const b = entry('user/x.json', mat('x', 'v2'), 'user');
    for (const order of [
      [a, b],
      [b, a],
    ]) {
      const s = store(order);
      const d = await s.load();
      expect(d).toHaveLength(1);
      expect(d[0]!.file).toBe('bundled/a.json');
      expect(d[0]!.message).toContain('user/x.json');
      expect(((await s.get('material', 'x')) as unknown as { vendor: string }).vendor).toBe('v2');
      expect(await s.list('material')).toHaveLength(1);
    }
  });

  test('renaming a file does not change identity', async () => {
    const e = mat('stable', 'v');
    const s1 = store([entry('old-name.json', e)]);
    const s2 = store([entry('deep/new-name.json', e)]);
    await s1.load();
    await s2.load();
    expect(await s2.get('material', 'stable')).toBe(await s1.get('material', 'stable'));
    expect(await s2.get('material', 'new-name')).toBeUndefined();
  });

  test('bad ids are refused; the id cap is exact', async () => {
    const ok = 'a'.repeat(MAX_ENTITY_ID);
    const s = store([
      entry('ok.json', mat(ok, 'v')),
      entry('long.json', mat(ok + 'a', 'v')),
      entry('empty.json', mat('', 'v')),
      entry('num.json', { id: 5 } as unknown as ImportedEntity),
    ]);
    const d = await s.load();
    expect(d.map((x) => x.file).sort()).toEqual(['empty.json', 'long.json', 'num.json']);
    expect(await s.list('material')).toHaveLength(1);
  });

  test('the entity cap is exact', async () => {
    const entries: ProfileFileEntry[] = [];
    for (let i = 0; i < MAX_STORE_ENTITIES + 1; i++)
      entries.push({ path: `p${i}`, layer: 'bundled', kind: 'nozzle', entity: { id: `n${i}` } as ImportedEntity });
    const s = store(entries);
    const d = await s.load();
    expect(d).toHaveLength(1);
    expect(await s.list('nozzle')).toHaveLength(MAX_STORE_ENTITIES);
  });

  test('__proto__ and constructor are plain ids and vendors', async () => {
    const s = store([entry('a', mat('__proto__', 'constructor')), entry('b', mat('constructor', '__proto__'))]);
    expect(await s.load()).toEqual([]);
    expect((await s.get('material', '__proto__'))?.id).toBe('__proto__');
    expect(await s.query('material', { vendor: 'constructor' })).toHaveLength(1);
    expect(await s.get('material', 'toString')).toBeUndefined();
  });

  test('an unreadable port gives a diagnostic and keeps the old index', async () => {
    let fail = false;
    const s = createProfileStore({
      read: async () => {
        if (fail) throw new Error('disk gone');
        return [entry('a', mat('a', 'v'))];
      },
    });
    await s.load();
    fail = true;
    const d = await s.load();
    expect(d[0]!.message).toContain('disk gone');
    expect(await s.list('material')).toHaveLength(1);
  });
});
