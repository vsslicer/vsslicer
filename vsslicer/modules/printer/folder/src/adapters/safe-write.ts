// SPDX-License-Identifier: AGPL-3.0-or-later
import { randomBytes } from 'node:crypto';
import { open, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrinterError } from '@vsslicer/printer-api';
import { sanitiseName, type NameOptions } from '../domain/names.ts';

/** Largest slice handed to one write call; bigger input chunks are cut into views, never copied. */
export const WRITE_CHUNK = 64 * 1024;
const TEMP_ATTEMPTS = 4;
/** Codes a platform answers when it cannot fsync a directory (Windows, some network file systems). */
const DIR_SYNC_UNSUPPORTED = new Set(['EINVAL', 'EPERM', 'EISDIR', 'EBADF', 'ENOTSUP', 'EACCES']);

export interface OpenFile {
  /** Returns the bytes written, which may be fewer than `buf.length`. */
  write(buf: Uint8Array): Promise<number>;
  sync(): Promise<void>;
  close(): Promise<void>;
}

/** The file-system calls the writer needs; tests inject failures (a full disk) here. */
export interface FileOps {
  /** Creates a new file; must fail with EEXIST when it exists. */
  create(path: string): Promise<OpenFile>;
  rename(from: string, to: string): Promise<void>;
  unlink(path: string): Promise<void>;
  /** Flushes the directory entry, so a renamed file survives pulling the media. */
  syncDir(path: string): Promise<void>;
}

export const nodeFileOps: FileOps = {
  async create(path) {
    const h = await open(path, 'wx');
    return {
      write: async (buf) => (await h.write(buf)).bytesWritten,
      sync: () => h.sync(),
      close: () => h.close(),
    };
  },
  rename,
  unlink,
  async syncDir(path) {
    const h = await open(path, 'r');
    try {
      await h.sync();
    } finally {
      await h.close();
    }
  },
};

export interface SafeWriteOptions extends NameOptions {
  readonly signal?: AbortSignal;
  readonly ops?: FileOps;
}

const code = (e: unknown): string | undefined => {
  const c = (e as NodeJS.ErrnoException | null)?.code;
  return typeof c === 'string' ? c : undefined; // DOMException codes are numbers
};

function toPrinterError(e: unknown): unknown {
  if (e instanceof PrinterError) return e;
  const c = code(e);
  if (c === 'ENOSPC' || c === 'EDQUOT') return new PrinterError('refused', 'the target is full', e);
  if (c === 'EACCES' || c === 'EPERM' || c === 'EROFS' || c === 'EISDIR' || c === 'ENOTDIR')
    return new PrinterError('refused', 'the target refused the write', e);
  if (c !== undefined) return new PrinterError('unreachable', `the target failed: ${c}`, e);
  return e; // abort reasons and programming errors pass through
}

/** Maps errno only for errors from the target's file-system calls; source errors and abort reasons never pass here. */
const target = <T>(p: Promise<T>): Promise<T> =>
  p.catch((e: unknown) => {
    throw toPrinterError(e);
  });

/**
 * Stream `source` into `dir/<sanitised name>`: write a unique temp file in `dir`, fsync, then rename. Any failure or
 * abort removes the temp file, so the final name is never a partial file, and the directory is fsynced after the
 * rename. An existing file of the same name is replaced; use `uniqueName` first when that must not happen. A failed
 * directory fsync rejects although the complete file is already in place. Returns the final file name.
 * Only errors from the target's file-system calls become `PrinterError`; source errors and abort reasons pass through.
 */
export async function writeFileSafely(
  dir: string,
  name: string,
  source: AsyncIterable<Uint8Array>,
  options: SafeWriteOptions = {},
): Promise<string> {
  const { signal, ops = nodeFileOps } = options;
  const finalName = sanitiseName(name, options);
  let tempPath: string | undefined;
  try {
    signal?.throwIfAborted();
    let file: OpenFile | undefined;
    for (let i = 0; file === undefined; i++) {
      // 8 hex digits + ".TMP" is a valid 8.3 name, so it fits every folder's name rules.
      const path = join(dir, `${randomBytes(4).toString('hex').toUpperCase()}.TMP`);
      try {
        file = await ops.create(path);
        tempPath = path;
      } catch (e) {
        if (code(e) !== 'EEXIST' || i + 1 >= TEMP_ATTEMPTS) throw toPrinterError(e);
      }
    }
    try {
      for await (const chunk of source) {
        for (let at = 0; at < chunk.length;) {
          signal?.throwIfAborted();
          const n = await target(file.write(chunk.subarray(at, at + WRITE_CHUNK)));
          if (!(n > 0)) throw new PrinterError('refused', 'the target accepted no bytes');
          at += n;
        }
      }
      signal?.throwIfAborted();
      await target(file.sync());
    } finally {
      await file.close().catch(() => undefined);
    }
    signal?.throwIfAborted();
    await target(ops.rename(tempPath!, join(dir, finalName)));
    await target(
      ops.syncDir(dir).catch((e: unknown) => {
        if (!DIR_SYNC_UNSUPPORTED.has(code(e) ?? '')) throw e;
      }),
    );
    return finalName;
  } catch (e) {
    if (tempPath !== undefined) await ops.unlink(tempPath).catch(() => undefined);
    throw e;
  }
}
