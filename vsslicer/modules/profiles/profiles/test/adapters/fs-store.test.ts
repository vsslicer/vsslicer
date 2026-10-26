// SPDX-License-Identifier: AGPL-3.0-or-later
import * as fsp from 'node:fs/promises';
import { mkdir, mkdtemp, readdir, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ImportedEntity } from '@vsslicer/profile-api';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  createFsProfileStore,
  MAX_FILE_NAME,
  ProfileConflictError,
  ProfileStoreBusyError,
  STALE_LOCK_MS,
  type FsOps,
} from '../../src/adapters/fs-store/fs-store.ts';
import { MAX_FILE_BYTES } from '../../src/adapters/installed/installed.ts';
import { createProfileStore } from '../../src/application/store/profile-store.ts';

let dir: string;
let user: string;
let bundled: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'prf45-'));
  user = join(dir, 'ws', '.vsslicer', 'profiles');
  bundled = join(dir, 'global');
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const mat = (id: string, extra: object = {}) =>
  ({ id, vendor: 'acme', name: id, type: 'PLA', diameter: 1.75, ...extra }) as unknown as ImportedEntity;
const put = async (path: string, value: unknown) => {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, typeof value === 'string' ? value : JSON.stringify(value));
};
type Loose = { id: string; name?: string; meta?: { updated?: string } };
const onDisk = async (path: string) => JSON.parse(await readFile(path, 'utf8')) as Loose;
/** fs with every write-side call counted. */
const counting = () => {
  const calls = { writeFile: 0, rename: 0 };
  const fs: FsOps = {
    ...fsp,
    writeFile: (async (...a: Parameters<typeof fsp.writeFile>) => {
      calls.writeFile++;
      return fsp.writeFile(...a);
    }) as typeof fsp.writeFile,
    rename: async (from, to) => {
      calls.rename++;
      return fsp.rename(from, to);
    },
  };
  return { fs, calls };
};

describe('file-system profile store', () => {
  test('reads one JSON file per entity under <root>/<kind>/ and indexes them by id, not file name', async () => {
    await put(join(user, 'material', 'nested', 'whatever.json'), mat('m1'));
    await put(join(user, 'printer-model', 'p.json'), { id: 'pm1', vendor: 'acme' });
    await put(join(bundled, 'vendor', 'acme.json'), { id: 'acme' });
    await put(join(bundled, 'material', 'm1.json'), mat('m1', { name: 'bundled' }));
    await put(join(user, 'material', 'broken.json'), '{ nope');
    await put(join(user, 'material', '.m1.json.1234.tmp'), mat('leftover'));
    await put(join(user, 'material', 'notes.txt'), 'x');
    await put(join(user, 'unknown-kind', 'x.json'), mat('x'));
    const files = createFsProfileStore({ user, bundled });
    const index = createProfileStore(files);
    const shadowed = await index.load();
    expect(shadowed).toHaveLength(1); // the bundled m1, shadowed by the user layer
    expect((await index.get('material', 'm1'))?.name).toBe('m1');
    expect((await index.get('printer_model', 'pm1'))?.id).toBe('pm1');
    expect((await index.get('vendor', 'acme'))?.id).toBe('acme');
    expect((await index.list('material')).map((e) => e.id)).toEqual(['m1']);
    expect(files.diagnostics.map((d) => d.file)).toEqual([join(user, 'material', 'broken.json')]);
  });

  test('a missing root is an empty layer', async () => {
    const files = createFsProfileStore({ user, bundled });
    expect(await files.read()).toEqual([]);
    expect(files.diagnostics).toEqual([]);
  });

  test('a write goes back to the file the entity was read from', async () => {
    const path = join(user, 'material', 'my-pla.json');
    await put(path, mat('m1'));
    const files = createFsProfileStore({ user });
    const [read] = await files.read();
    const { written } = await files.write('material', { ...read!.entity, name: 'edited' } as ImportedEntity);
    expect(written).toBe(true);
    expect((await onDisk(path)).name).toBe('edited');
    expect(await readdir(join(user, 'material'))).toEqual(['my-pla.json']); // no temp or lock file left
  });

  test('two windows: the second writer gets a conflict carrying both versions, and no edit is lost', async () => {
    const path = join(user, 'material', 'm1.json');
    await put(path, mat('m1', { meta: { updated: '2026-01-01T00:00:00.000Z' } }));
    const a = createFsProfileStore({ user, now: () => new Date('2026-02-01T00:00:00.000Z') });
    const b = createFsProfileStore({ user, now: () => new Date('2026-02-01T00:00:00.000Z') });
    const [ra] = await a.read();
    const [rb] = await b.read();
    const editA = { ...ra!.entity, name: 'from A' } as ImportedEntity;
    const editB = { ...rb!.entity, name: 'from B' } as ImportedEntity;

    const saved = await a.write('material', editA);
    expect((saved.entity as Loose).meta?.updated).toBe('2026-02-01T00:00:00.000Z');
    const error = await b.write('material', editB).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ProfileConflictError);
    expect((error as ProfileConflictError).mine).toEqual(editB);
    expect((error as ProfileConflictError).theirs).toEqual({ ...editA, meta: { updated: '2026-02-01T00:00:00.000Z' } });
    expect((await onDisk(path)).name).toBe('from A');

    // B merges onto theirs; its stamp is strictly newer even within the same millisecond
    const merged = { ...((error as ProfileConflictError).theirs as object), name: 'A and B' } as ImportedEntity;
    expect((await b.write('material', merged)).written).toBe(true);
    const final = await onDisk(path);
    expect(final.name).toBe('A and B');
    expect(final.meta?.updated).toBe('2026-02-01T00:00:00.001Z');
    // A's next save from its stale copy conflicts as well
    await expect(a.write('material', { ...saved.entity, name: 'A again' } as ImportedEntity)).rejects.toBeInstanceOf(
      ProfileConflictError,
    );
  });

  test('two windows saving at once: exactly one wins, the other gets an error, the file holds the winner', async () => {
    const path = join(user, 'material', 'm1.json');
    await put(path, mat('m1', { meta: { updated: '2026-01-01T00:00:00.000Z' } }));
    const a = createFsProfileStore({ user });
    const b = createFsProfileStore({ user });
    const [ra] = await a.read();
    const [rb] = await b.read();
    const results = await Promise.allSettled([
      a.write('material', { ...ra!.entity, name: 'A' } as ImportedEntity),
      b.write('material', { ...rb!.entity, name: 'B' } as ImportedEntity),
    ]);
    const ok = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');
    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(1);
    const reason = (failed[0] as PromiseRejectedResult).reason as unknown;
    expect(reason instanceof ProfileConflictError || reason instanceof ProfileStoreBusyError).toBe(true);
    expect((await onDisk(path)).name).toBe(
      (ok[0] as PromiseFulfilledResult<{ entity: { name: string } }>).value.entity.name,
    );
  });

  test('two windows creating the same new entity: the second gets a conflict', async () => {
    const a = createFsProfileStore({ user });
    const b = createFsProfileStore({ user });
    await a.write('material', mat('new', { name: 'A' }));
    const error = await b.write('material', mat('new', { name: 'B' })).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ProfileConflictError);
    expect(((error as ProfileConflictError).theirs as { name: string }).name).toBe('A');
  });

  test('a file holding a different id (a case alias) is a conflict, not an overwrite', async () => {
    await put(join(user, 'material', 'm1.json'), mat('M1'));
    const files = createFsProfileStore({ user });
    await expect(files.write('material', mat('m1'))).rejects.toBeInstanceOf(ProfileConflictError);
    expect((await onDisk(join(user, 'material', 'm1.json'))).id).toBe('M1');
  });

  test('a file that is not JSON any more is a conflict carrying its text', async () => {
    const path = join(user, 'material', 'm1.json');
    await put(path, mat('m1'));
    const files = createFsProfileStore({ user });
    const [r] = await files.read();
    await writeFile(path, '{ half typed');
    const error = await files.write('material', { ...r!.entity, name: 'x' } as ImportedEntity).catch((e: unknown) => e);
    expect((error as ProfileConflictError).theirs).toBe('{ half typed');
    expect(await readFile(path, 'utf8')).toBe('{ half typed');
  });

  test('an unchanged entity is never rewritten', async () => {
    const path = join(user, 'material', 'm1.json');
    await put(path, mat('m1', { meta: { updated: '2026-01-01T00:00:00.000Z' } }));
    const old = new Date('2020-01-01T00:00:00Z');
    await utimes(path, old, old);
    const { fs, calls } = counting();
    const files = createFsProfileStore({ user, fs });
    const [r] = await files.read();
    // same content, different key order
    const reordered = Object.fromEntries(Object.entries(r!.entity).reverse()) as unknown as ImportedEntity;
    expect(Object.keys(reordered)[0]).toBe('meta');
    expect(await files.write('material', reordered)).toEqual({ written: false, entity: reordered });
    expect((await stat(path)).mtimeMs).toBe(old.getTime());
    expect(calls).toEqual({ writeFile: 1, rename: 0 }); // the lock file only
  });

  test('a crash between temp write and rename leaves the old file intact', async () => {
    const path = join(user, 'material', 'm1.json');
    await put(path, mat('m1'));
    const before = await readFile(path, 'utf8');
    const crash: FsOps = {
      ...fsp,
      rename: async () => {
        throw Object.assign(new Error('simulated crash'), { code: 'EIO' });
      },
      rm: async () => {}, // a crashed process cleans nothing up
    };
    const files = createFsProfileStore({ user, fs: crash });
    const [r] = await files.read();
    await expect(files.write('material', { ...r!.entity, name: 'lost' } as ImportedEntity)).rejects.toThrow(
      'simulated crash',
    );
    expect(await readFile(path, 'utf8')).toBe(before);
    const names = await readdir(join(user, 'material'));
    expect(names.some((n) => n.endsWith('.tmp'))).toBe(true); // the temp file was written and left behind
    // the next session reads the old entity and ignores the leftovers (temp and lock files)
    const next = createFsProfileStore({ user, now: () => new Date(Date.now() + STALE_LOCK_MS + 1) });
    expect((await next.read()).map((e) => (e.entity as Loose).name)).toEqual(['m1']);
    expect(next.diagnostics).toEqual([]);
    // the crashed writer's lock is stale for it, so the next write goes through
    const [n] = await next.read();
    expect((await next.write('material', { ...n!.entity, name: 'saved' } as ImportedEntity)).written).toBe(true);
    expect((await onDisk(path)).name).toBe('saved');
  });

  test('a failed rename removes the temp file and the lock', async () => {
    await put(join(user, 'material', 'm1.json'), mat('m1'));
    const files = createFsProfileStore({
      user,
      fs: { ...fsp, rename: async () => Promise.reject(new Error('EIO')) },
    });
    const [r] = await files.read();
    await expect(files.write('material', { ...r!.entity, name: 'x' } as ImportedEntity)).rejects.toThrow('EIO');
    expect(await readdir(join(user, 'material'))).toEqual(['m1.json']);
  });

  test('a lock is stale after exactly STALE_LOCK_MS', async () => {
    expect(STALE_LOCK_MS).toBe(30_000);
    const path = join(user, 'material', 'm1.json');
    await put(path, mat('m1'));
    await writeFile(`${path}.lock`, '1');
    const mtime = Date.parse('2026-01-01T00:00:00.000Z'); // whole milliseconds, so the age is exact
    await utimes(`${path}.lock`, mtime / 1000, mtime / 1000);
    const at = (ms: number) => createFsProfileStore({ user, now: () => new Date(mtime + ms) });
    const fresh = at(30_000);
    const [r] = await fresh.read();
    const edit = { ...r!.entity, name: 'x' } as ImportedEntity;
    await expect(fresh.write('material', edit)).rejects.toBeInstanceOf(ProfileStoreBusyError);
    expect((await onDisk(path)).name).toBe('m1');
    const stale = at(30_001);
    await stale.read();
    expect((await stale.write('material', edit)).written).toBe(true);
  });

  test('ids are bounded and file names stay short', async () => {
    const files = createFsProfileStore({ user });
    await expect(files.write('material', mat(''))).rejects.toThrow('entity id');
    await expect(files.write('material', mat('a'.repeat(257)))).rejects.toThrow('entity id');
    expect((await files.write('material', mat('a'.repeat(256)))).written).toBe(true);
    // encoded name of exactly MAX_FILE_NAME is kept, one more gets the hash name
    expect(MAX_FILE_NAME).toBe(200);
    await files.write('material', mat('b'.repeat(200)));
    await files.write('material', mat('c'.repeat(198) + '/'));
    const names = await readdir(join(user, 'material'));
    expect(names).toContain(`${'b'.repeat(200)}.json`);
    expect(names.filter((n) => /^[0-9a-f]{64}\.json$/.test(n))).toHaveLength(2); // the 256 a's and the c's
    expect(names.every((n) => n.length <= MAX_FILE_NAME + 5)).toBe(true);
    // a path separator in an id never leaves the kind folder
    await files.write('material', mat('../../escape'));
    expect(names.length + 1).toBe((await readdir(join(user, 'material'))).length);
  });

  test('the file on disk is read for the conflict check up to MAX_FILE_BYTES', { timeout: 30_000 }, async () => {
    const path = join(user, 'material', 'm1.json');
    const files = createFsProfileStore({ user });
    await put(path, `"${'a'.repeat(MAX_FILE_BYTES - 2)}"`); // exactly the cap: read, and a conflict (not an entity)
    await expect(files.write('material', mat('m1'))).rejects.toBeInstanceOf(ProfileConflictError);
    await put(path, `"${'a'.repeat(MAX_FILE_BYTES - 1)}"`); // one byte more: refused unread
    await expect(files.write('material', mat('m1'))).rejects.toThrow(`more than the ${MAX_FILE_BYTES}`);
  });

  test('__proto__ and constructor ids round-trip', async () => {
    const files = createFsProfileStore({ user });
    await files.write('material', mat('__proto__'));
    await files.write('material', mat('constructor'));
    const index = createProfileStore(createFsProfileStore({ user }));
    expect(await index.load()).toEqual([]);
    expect((await index.get('material', '__proto__'))?.id).toBe('__proto__');
    expect((await index.get('material', 'constructor'))?.id).toBe('constructor');
  });

  test('vendor entities write to the bundled folder; an unconfigured layer is refused', async () => {
    const files = createFsProfileStore({ bundled });
    await files.write('vendor', { id: 'acme' } as unknown as ImportedEntity, 'bundled');
    expect((await onDisk(join(bundled, 'vendor', 'acme.json'))).id).toBe('acme');
    await expect(files.write('vendor', { id: 'x' } as unknown as ImportedEntity)).rejects.toThrow('user layer');
    await expect(files.write('nope' as never, mat('x'), 'bundled')).rejects.toThrow('unknown entity kind');
  });
});
