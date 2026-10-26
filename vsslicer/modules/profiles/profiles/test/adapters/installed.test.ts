// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, readdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Importer, SourceFile } from '@vsslicer/profile-api';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  importInstalledFolder,
  MAX_FILE_BYTES,
  MAX_FOLDER_DEPTH,
  readInstalledFolder,
} from '../../src/adapters/installed/installed.ts';

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'prf36-'));
});
afterEach(async () => {
  await chmod(join(root, 'locked'), 0o755).catch(() => {});
  await rm(root, { recursive: true, force: true });
});

const put = async (rel: string, text: string) => {
  const p = join(root, rel);
  await mkdir(join(p, '..'), { recursive: true });
  await writeFile(p, text);
};
/** Hash of every path, mode, mtime and content under root. */
async function checksum(dir: string, rel = ''): Promise<string> {
  const h = createHash('sha256');
  for (const name of (await readdir(join(dir, rel))).sort()) {
    const r = rel ? `${rel}/${name}` : name;
    const s = await stat(join(dir, r));
    h.update(`${r}|${s.mode}|${s.mtimeMs}|`);
    h.update(s.isDirectory() ? await checksum(dir, r) : await readFile(join(dir, r)));
  }
  return h.digest('hex');
}
/** Fake importer: one entity per file, named by its path and text. */
const fake: Importer = {
  formats: ['prusa-ini'] as never,
  canHandle: () => true,
  async import(files: readonly SourceFile[]) {
    return {
      entities: files.map((f) => ({ id: `${f.path}=${new TextDecoder().decode(f.bytes)}` })) as never,
      native: Object.create(null),
      diagnostics: [],
    };
  },
};

describe('installed folder', () => {
  test('a fixture folder yields the importers entities, with relative paths', async () => {
    await put('a.ini', 'A');
    await put('sub/deep/b.ini', 'B');
    const r = await importInstalledFolder(root, fake);
    expect(r.entities.map((e) => e.id).sort()).toEqual(['a.ini=A', 'sub/deep/b.ini=B']);
    expect(r.diagnostics).toEqual([]);
  });

  test('the source tree is byte-identical before and after', async () => {
    await put('a.ini', 'A');
    await put('sub/b.ini', 'B');
    const before = await checksum(root);
    await importInstalledFolder(root, fake);
    expect(await checksum(root)).toBe(before);
  });

  test.skipIf(process.platform === 'win32' || process.getuid?.() === 0)(
    'an unreadable subfolder gives a diagnostic and the rest import',
    async () => {
      await put('a.ini', 'A');
      await put('locked/x.ini', 'X');
      await put('z.ini', 'Z');
      await chmod(join(root, 'locked'), 0o000);
      const r = await importInstalledFolder(root, fake);
      expect(r.entities.map((e) => e.id).sort()).toEqual(['a.ini=A', 'z.ini=Z']);
      expect(r.diagnostics).toMatchObject([{ severity: 'error', code: 'unreadable-folder', file: 'locked' }]);
    },
  );

  test('links are skipped, not followed', async () => {
    await put('a.ini', 'A');
    await symlink(root, join(root, 'loop'));
    const r = await readInstalledFolder(root);
    expect(r.files.map((f) => f.path)).toEqual(['a.ini']);
    expect(r.diagnostics).toMatchObject([{ severity: 'info', file: 'loop' }]);
  });

  test('a folder at the depth cap is read, one deeper is skipped', async () => {
    const at = Array.from({ length: MAX_FOLDER_DEPTH }, () => 'd').join('/');
    await put(`${at}/in.ini`, 'I');
    await put(`${at}/d/out.ini`, 'O');
    const r = await readInstalledFolder(root);
    expect(r.files.map((f) => f.path)).toEqual([`${at}/in.ini`]);
    expect(r.diagnostics).toHaveLength(1);
  });

  test('a file of the size cap is read, one byte more is skipped', { timeout: 30_000 }, async () => {
    await writeFile(join(root, 'ok.bin'), Buffer.alloc(MAX_FILE_BYTES));
    await writeFile(join(root, 'big.bin'), Buffer.alloc(MAX_FILE_BYTES + 1));
    const r = await readInstalledFolder(root);
    expect(r.files.map((f) => f.path)).toEqual(['ok.bin']);
    expect(r.diagnostics).toMatchObject([{ severity: 'warning', file: 'big.bin' }]);
  });

  describe('whole-call caps (injected small limits)', () => {
    const big = { maxEntries: 1000, maxTotalBytes: 1e9, maxFiles: 1000 };
    const names = (r: { files: SourceFile[] }) => r.files.map((f) => f.path).sort();

    test('entries: the cap is read, one more stops with an error', async () => {
      await put('a', '1');
      await put('b', '1');
      await put('d/c', '1'); // d and c count too: 4 entries
      const ok = await readInstalledFolder(root, { ...big, maxEntries: 4 });
      expect(names(ok)).toEqual(['a', 'b', 'd/c']);
      expect(ok.diagnostics).toEqual([]);
      const over = await readInstalledFolder(root, { ...big, maxEntries: 3 });
      expect(over.files.length).toBeLessThan(3);
      expect(over.diagnostics).toMatchObject([{ severity: 'error', message: expect.stringContaining('3 entries') }]);
    });

    test('total bytes: the cap is read, one byte more stops with an error', async () => {
      await put('a', 'xxxx');
      await put('b', 'xxxx');
      const ok = await readInstalledFolder(root, { ...big, maxTotalBytes: 8 });
      expect(names(ok)).toEqual(['a', 'b']);
      expect(ok.diagnostics).toEqual([]);
      const over = await readInstalledFolder(root, { ...big, maxTotalBytes: 7 });
      expect(names(over)).toEqual(['a']);
      expect(over.diagnostics).toMatchObject([
        { severity: 'error', file: 'b', message: expect.stringContaining('7 bytes') },
      ]);
    });

    test('files: the cap is read, one more stops with an error', async () => {
      await put('a', '1');
      await put('b', '1');
      const ok = await readInstalledFolder(root, { ...big, maxFiles: 2 });
      expect(names(ok)).toEqual(['a', 'b']);
      expect(ok.diagnostics).toEqual([]);
      const over = await readInstalledFolder(root, { ...big, maxFiles: 1 });
      expect(over.files).toHaveLength(1);
      expect(over.diagnostics).toMatchObject([{ severity: 'error', message: expect.stringContaining('1 files') }]);
    });
  });

  test('a missing root gives a diagnostic, not a rejection', async () => {
    const r = await readInstalledFolder(join(root, 'nope'));
    expect(r.files).toEqual([]);
    expect(r.diagnostics).toHaveLength(1);
  });
});
