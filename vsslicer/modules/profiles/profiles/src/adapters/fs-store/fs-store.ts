// SPDX-License-Identifier: AGPL-3.0-or-later
// The file-system profile store (PRF-45): one JSON file per entity under `<root>/<kind>/`, written through a temp
// file and a rename, guarded by a lock file and a `meta.updated` compare so two windows never lose an edit.
import { createHash, randomUUID } from 'node:crypto';
import * as nodeFs from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { entitySchemas, type Diagnostic, type EntityKind, type ImportedEntity } from '@vsslicer/profile-api';
import { clip, errorText } from '../../application/import/registry.ts';
import {
  MAX_ENTITY_ID,
  type ProfileFileEntry,
  type ProfileFiles,
  type ProfileLayer,
} from '../../application/store/profile-store.ts';
import { MAX_FILE_BYTES, readInstalledFolder } from '../installed/installed.ts';

/** Longest file name made from an id; longer encoded ids get a hash name instead (NAME_MAX is 255 bytes). */
export const MAX_FILE_NAME = 200;
/** A lock file older than this is left over from a crashed writer and is broken. */
export const STALE_LOCK_MS = 30_000;

const KINDS = Object.keys(entitySchemas) as EntityKind[];
/** `printer_model` lives in `printer-model/`, as the extension's jsonValidation globs expect. */
const folderOf = (kind: EntityKind) => kind.replace('_', '-');

/** The second writer's error: its entity (`mine`) and what is on disk now (`theirs`, raw text when not JSON). */
export class ProfileConflictError extends Error {
  override name = 'ProfileConflictError';
  readonly path: string;
  readonly mine: ImportedEntity;
  readonly theirs: unknown;
  constructor(path: string, mine: ImportedEntity, theirs: unknown) {
    super(`${path} changed on disk since it was read`);
    this.path = path;
    this.mine = mine;
    this.theirs = theirs;
  }
}

/** Another writer holds the file's lock; nothing was written, retry later. */
export class ProfileStoreBusyError extends Error {
  override name = 'ProfileStoreBusyError';
  readonly path: string;
  constructor(path: string) {
    super(`${path} is being written by another window`);
    this.path = path;
  }
}

export type FsOps = Pick<typeof nodeFs, 'mkdir' | 'readFile' | 'rename' | 'rm' | 'stat' | 'writeFile'>;

export interface FsStoreOptions {
  /** `<workspace>/.vsslicer/profiles`; the `user` layer. */
  user?: string;
  /** The global folder of vendor entities; the `bundled` layer. */
  bundled?: string;
  /** Tests inject faults here. */
  fs?: FsOps;
  now?: () => Date;
}

export interface WriteResult {
  /** False when the entity equals the file on disk, which is then left untouched. */
  written: boolean;
  /** The entity as stored, with the new `meta.updated` when written. */
  entity: ImportedEntity;
}

export interface FsProfileStore extends ProfileFiles {
  /** Problems found by the last `read` (unreadable folders, invalid JSON). */
  readonly diagnostics: readonly Diagnostic[];
  /**
   * Writes `entity` if the file on disk still has the `meta.updated` the entity carries (the version it was read
   * at), stamping a newer one. Throws ProfileConflictError when it does not, ProfileStoreBusyError when locked.
   */
  write(kind: EntityKind, entity: ImportedEntity, layer?: ProfileLayer): Promise<WriteResult>;
}

const diag = (file: string, message: string): Diagnostic => ({
  severity: 'error',
  code: 'invalid-json',
  file: clip(file),
  message: clip(message),
});

const fileName = (id: string) => {
  const encoded = encodeURIComponent(id);
  return `${encoded.length <= MAX_FILE_NAME ? encoded : createHash('sha256').update(id).digest('hex')}.json`;
};

const updatedOf = (e: unknown) => (e as { meta?: { updated?: unknown } } | null)?.meta?.updated;

export function createFsProfileStore(options: FsStoreOptions): FsProfileStore {
  const fs = options.fs ?? nodeFs;
  const now = options.now ?? (() => new Date());
  const roots: [ProfileLayer, string][] = [];
  if (options.user !== undefined) roots.push(['user', options.user]);
  if (options.bundled !== undefined) roots.push(['bundled', options.bundled]);
  /** `${layer}\0${kind}\0${id}` -> the file it was read from, so a write goes back to the same file. */
  const known = new Map<string, string>();
  let diagnostics: Diagnostic[] = [];

  /** The newer stamp; strictly after `previous` so a same-millisecond write still changes `meta.updated`. */
  const stamp = (previous: unknown) => {
    const t = now().getTime();
    const p = typeof previous === 'string' ? Date.parse(previous) : NaN;
    return new Date(Number.isFinite(p) && p >= t ? p + 1 : t).toISOString();
  };

  async function lock(path: string): Promise<string> {
    const lockPath = `${path}.lock`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await fs.writeFile(lockPath, String(process.pid), { flag: 'wx' });
        return lockPath;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        // a lock gone since the failed create counts as stale, so the second attempt takes it
        const age = now().getTime() - (await fs.stat(lockPath).catch(() => ({ mtimeMs: -Infinity }))).mtimeMs;
        if (attempt > 0 || !(age > STALE_LOCK_MS)) throw new ProfileStoreBusyError(path);
        await fs.rm(lockPath, { force: true });
      }
    }
    throw new ProfileStoreBusyError(path);
  }

  /** The file's current content: undefined when absent, parsed JSON, or the raw text when it is not JSON. */
  async function current(path: string): Promise<{ value: unknown } | undefined> {
    let size;
    try {
      size = (await fs.stat(path)).size;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw error;
    }
    if (size > MAX_FILE_BYTES)
      throw new Error(`${path} is ${size} bytes, more than the ${MAX_FILE_BYTES} one file reads`);
    const text = await fs.readFile(path, 'utf8');
    try {
      return { value: JSON.parse(text) as unknown };
    } catch {
      return { value: text };
    }
  }

  return {
    get diagnostics() {
      return diagnostics;
    },

    async read() {
      const entries: ProfileFileEntry[] = [];
      const found: Diagnostic[] = [];
      known.clear();
      for (const [layer, root] of roots) {
        // a missing root is an empty layer (no `.vsslicer/profiles/` yet), not an error
        const isDir = await fs.stat(root).then(
          (s) => s.isDirectory(),
          () => false,
        );
        if (!isDir) continue;
        // shortcut: the walk's caps apply per root, so one read takes at most twice them (two roots)
        const folder = await readInstalledFolder(root);
        found.push(...folder.diagnostics);
        for (const file of folder.files) {
          const [top, ...rest] = file.path.split('/');
          const kind = KINDS.find((k) => folderOf(k) === top);
          const name = rest.at(-1) ?? '';
          if (!kind || !name.endsWith('.json')) continue; // skips temp (`.tmp`) and lock (`.lock`) files
          const path = join(root, file.path);
          let entity: ImportedEntity;
          try {
            entity = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(file.bytes)) as ImportedEntity;
          } catch (error) {
            found.push(diag(path, `not valid JSON: ${errorText(error)}`));
            continue;
          }
          const id = (entity as { id?: unknown } | null)?.id;
          if (typeof id === 'string' && !known.has(`${layer}\0${kind}\0${id}`))
            known.set(`${layer}\0${kind}\0${id}`, path);
          entries.push({ path, layer, kind, entity });
        }
      }
      diagnostics = found;
      return entries;
    },

    async write(kind, entity, layer = 'user') {
      const id = (entity as { id?: unknown } | null)?.id;
      if (typeof id !== 'string' || id === '' || id.length > MAX_ENTITY_ID)
        throw new Error(`entity id must be a non-empty string of at most ${MAX_ENTITY_ID} characters`);
      if (!KINDS.includes(kind)) throw new Error(`unknown entity kind "${String(kind)}"`);
      const root = roots.find(([l]) => l === layer)?.[1];
      if (root === undefined) throw new Error(`no folder is configured for the ${layer} layer`);
      const key = `${layer}\0${kind}\0${id}`;
      const path = known.get(key) ?? join(root, folderOf(kind), fileName(id));

      await fs.mkdir(dirname(path), { recursive: true });
      const lockPath = await lock(path);
      try {
        const disk = await current(path);
        if (disk) {
          if (isDeepStrictEqual(disk.value, entity)) {
            known.set(key, path);
            return { written: false, entity };
          }
          // a different id at this path (a case-insensitive alias, or another entity's file) is a conflict too
          const sameId = (disk.value as { id?: unknown } | null)?.id === id;
          if (!sameId || updatedOf(disk.value) !== updatedOf(entity))
            throw new ProfileConflictError(path, entity, disk.value);
        }
        const meta = (entity as { meta?: object }).meta;
        const next = { ...entity, meta: { ...meta, updated: stamp(updatedOf(entity)) } } as ImportedEntity;
        const tmp = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
        try {
          await fs.writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, { flag: 'wx', flush: true });
          await fs.rename(tmp, path);
        } catch (error) {
          await fs.rm(tmp, { force: true }).catch(() => {});
          throw error;
        }
        known.set(key, path);
        return { written: true, entity: next };
      } finally {
        await fs.rm(lockPath, { force: true }).catch(() => {});
      }
    },
  };
}
