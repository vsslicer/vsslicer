// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrinterError } from '@vsslicer/printer-api';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { nodeFileOps, WRITE_CHUNK, writeFileSafely, type FileOps } from '../src/adapters/safe-write.ts';

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'safe-write-'));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

async function* chunks(...parts: Uint8Array[]) {
  for (const p of parts) yield p;
}
const enospc = () => Object.assign(new Error('no space'), { code: 'ENOSPC' });

test('writes the file under its sanitised name and leaves no temp file', async () => {
  const name = await writeFileSafely(dir, 'my part.gcode', chunks(Buffer.from('G28\n'), Buffer.from('G1\n')));
  expect(name).toBe('MY_PART.GCO');
  expect(await readFile(join(dir, name), 'utf8')).toBe('G28\nG1\n');
  expect(await readdir(dir)).toEqual([name]);
});

test('temp name is in the target directory and a valid 8.3 name', async () => {
  const made: string[] = [];
  const ops: FileOps = { ...nodeFileOps, create: (p) => (made.push(p), nodeFileOps.create(p)) };
  await writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), { ops });
  expect(made).toHaveLength(1);
  expect(made[0]).toMatch(new RegExp(`^${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\\\/][0-9A-F]{8}\\.TMP$`));
});

test('retries a temp name collision a bounded number of times', async () => {
  let calls = 0;
  const ops: FileOps = {
    ...nodeFileOps,
    create: (p) =>
      ++calls < 3 ? Promise.reject(Object.assign(new Error('x'), { code: 'EEXIST' })) : nodeFileOps.create(p),
  };
  await writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), { ops });
  expect(calls).toBe(3);
  calls = 0;
  await expect(
    writeFileSafely(dir, 'b.gcode', chunks(), {
      ops: { ...ops, create: () => (calls++, Promise.reject(Object.assign(new Error('x'), { code: 'EEXIST' }))) },
    }),
  ).rejects.toMatchObject({ kind: 'unreachable' });
  expect(calls).toBe(4);
});

test('a full disk gives PrinterError refused, removes the temp file and keeps the old target', async () => {
  await writeFile(join(dir, 'A.GCO'), 'old');
  let written = 0;
  const ops: FileOps = {
    ...nodeFileOps,
    async create(p) {
      const f = await nodeFileOps.create(p);
      return {
        ...f,
        write: async (buf) => {
          if (written + buf.length > 100) throw enospc();
          written += buf.length;
          return f.write(buf);
        },
      };
    },
  };
  const err = await writeFileSafely(dir, 'a.gcode', chunks(Buffer.alloc(60), Buffer.alloc(60)), { ops }).catch(
    (e) => e,
  );
  expect(err).toBeInstanceOf(PrinterError);
  expect(err.kind).toBe('refused');
  expect(written).toBe(60);
  expect(await readdir(dir)).toEqual(['A.GCO']);
  expect(await readFile(join(dir, 'A.GCO'), 'utf8')).toBe('old');
});

test('abort mid-stream leaves no file under the final name and no temp file', async () => {
  const ac = new AbortController();
  async function* src() {
    yield Buffer.alloc(10);
    ac.abort();
    yield Buffer.alloc(10);
  }
  await expect(writeFileSafely(dir, 'a.gcode', src(), { signal: ac.signal })).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(await readdir(dir)).toEqual([]);
});

test('an already aborted signal creates nothing', async () => {
  let creates = 0;
  const ops: FileOps = { ...nodeFileOps, create: (p) => (creates++, nodeFileOps.create(p)) };
  await expect(writeFileSafely(dir, 'a.gcode', chunks(), { signal: AbortSignal.abort(), ops })).rejects.toBeDefined();
  expect(creates).toBe(0);
});

test('large chunks are cut into views of at most WRITE_CHUNK, and partial writes continue', async () => {
  const sizes: number[] = [];
  const bufs: Uint8Array[] = [];
  const big = Buffer.alloc(WRITE_CHUNK * 2 + 5, 1);
  const ops: FileOps = {
    ...nodeFileOps,
    async create(p) {
      const f = await nodeFileOps.create(p);
      return {
        ...f,
        write: async (buf) => {
          const n = Math.min(buf.length, 1000); // short write
          sizes.push(n);
          bufs.push(buf);
          return f.write(buf.subarray(0, n));
        },
      };
    },
  };
  const name = await writeFileSafely(dir, 'a.gcode', chunks(big), { ops });
  expect((await readFile(join(dir, name))).length).toBe(big.length);
  expect(sizes.reduce((a, b) => a + b, 0)).toBe(big.length);
  expect(bufs.every((b) => b.length <= WRITE_CHUNK && b.buffer === big.buffer)).toBe(true);
});

test('a failed rename removes the temp file', async () => {
  const ops: FileOps = { ...nodeFileOps, rename: () => Promise.reject(Object.assign(new Error('x'), { code: 'EIO' })) };
  await expect(writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), { ops })).rejects.toMatchObject({
    kind: 'unreachable',
  });
  expect(await readdir(dir)).toEqual([]);
});

test('a name with path parts cannot leave the directory', async () => {
  const name = await writeFileSafely(dir, '../../evil.gcode', chunks(Buffer.from('x')));
  expect(name).not.toMatch(/[/\\]/);
  expect(await readdir(dir)).toEqual([name]);
});

/** Ops that record every call in order and write through to the real file system. */
function recording(log: string[], over: Partial<FileOps> = {}): FileOps {
  return {
    create: async (p) => {
      log.push('create');
      const f = await nodeFileOps.create(p);
      return {
        write: (b) => (log.push('write'), f.write(b)),
        sync: () => (log.push('sync'), f.sync()),
        close: () => (log.push('close'), f.close()),
      };
    },
    rename: (a, b) => (log.push('rename'), nodeFileOps.rename(a, b)),
    unlink: (p) => (log.push('unlink'), nodeFileOps.unlink(p)),
    syncDir: (p) => (log.push('syncDir'), nodeFileOps.syncDir(p)),
    ...over,
  };
}

test('fsyncs the file before the rename and the directory after it', async () => {
  const log: string[] = [];
  await writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), { ops: recording(log) });
  expect(log).toEqual(['create', 'write', 'sync', 'close', 'rename', 'syncDir']);
});

test('a failing fsync removes the temp file and creates no final name', async () => {
  const log: string[] = [];
  const ops = recording(log, {
    create: async (p) => {
      const f = await nodeFileOps.create(p);
      return { ...f, sync: () => (log.push('sync'), Promise.reject(Object.assign(new Error('x'), { code: 'EIO' }))) };
    },
    rename: () => (log.push('rename'), Promise.resolve()),
  });
  await expect(writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), { ops })).rejects.toMatchObject({
    kind: 'unreachable',
  });
  expect(log).not.toContain('rename');
  expect(await readdir(dir)).toEqual([]);
});

test('a directory that cannot be fsynced is tolerated, other directory errors are not', async () => {
  const fail = (code: string) => () => Promise.reject(Object.assign(new Error('x'), { code }));
  const name = await writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), {
    ops: { ...nodeFileOps, syncDir: fail('EPERM') },
  });
  expect(name).toBe('A.GCO');
  await expect(
    writeFileSafely(dir, 'b.gcode', chunks(Buffer.from('x')), { ops: { ...nodeFileOps, syncDir: fail('EIO') } }),
  ).rejects.toMatchObject({ kind: 'unreachable' });
});

test('no write happens after the signal aborts', async () => {
  const ac = new AbortController();
  let writes = 0;
  const ops: FileOps = {
    ...nodeFileOps,
    async create(p) {
      const f = await nodeFileOps.create(p);
      return { ...f, write: (b) => (writes++, ac.abort(), f.write(b)) };
    },
  };
  await expect(
    writeFileSafely(dir, 'a.gcode', chunks(Buffer.alloc(WRITE_CHUNK * 3)), { signal: ac.signal, ops }),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(writes).toBe(1);
  expect(await readdir(dir)).toEqual([]);
});

test('errors from the source and abort reasons pass through unmapped', async () => {
  const boom = Object.assign(new Error('read failed'), { code: 'EACCES' });
  async function* bad() {
    yield Buffer.alloc(1);
    throw boom;
  }
  await expect(writeFileSafely(dir, 'a.gcode', bad())).rejects.toBe(boom);
  const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError', code: 'ABORT_ERR' });
  async function* aborting() {
    throw abortErr;
    yield Buffer.alloc(0);
  }
  await expect(writeFileSafely(dir, 'a.gcode', aborting())).rejects.toBe(abortErr);
  const reason = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
  await expect(writeFileSafely(dir, 'a.gcode', chunks(), { signal: AbortSignal.abort(reason) })).rejects.toBe(reason);
  expect(await readdir(dir)).toEqual([]);
});

test('EISDIR at the final name is refused', async () => {
  const ops: FileOps = {
    ...nodeFileOps,
    rename: () => Promise.reject(Object.assign(new Error('x'), { code: 'EISDIR' })),
  };
  await expect(writeFileSafely(dir, 'a.gcode', chunks(Buffer.from('x')), { ops })).rejects.toMatchObject({
    kind: 'refused',
  });
});

test('nodeFileOps.create refuses an existing path and a planted symlink (exclusive create)', async () => {
  await writeFile(join(dir, 'X.TMP'), 'keep');
  await expect(nodeFileOps.create(join(dir, 'X.TMP'))).rejects.toMatchObject({ code: 'EEXIST' });
  await symlink(join(dir, 'X.TMP'), join(dir, 'L.TMP'));
  await expect(nodeFileOps.create(join(dir, 'L.TMP'))).rejects.toMatchObject({ code: 'EEXIST' });
  expect(await readFile(join(dir, 'X.TMP'), 'utf8')).toBe('keep');
});
