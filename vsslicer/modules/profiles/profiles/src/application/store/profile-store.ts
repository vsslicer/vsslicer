// SPDX-License-Identifier: AGPL-3.0-or-later
// The in-memory profile index (PRF-44): entities by id, kind, vendor and external id, read through a ProfileFiles port.
import type { Diagnostic, EntityByKind, EntityKind, ImportedEntity, ProfileQuery } from '@vsslicer/profile-api';
import { clip } from '../import/registry.ts';

/** Entities one load accepts; the rest are refused with a diagnostic. The vendor tree is about 14 420. */
export const MAX_STORE_ENTITIES = 200_000;
/** Longest entity id accepted. */
export const MAX_ENTITY_ID = 256;

/** `user` entities win over `bundled` ones with the same id. */
export type ProfileLayer = 'bundled' | 'user';

/** One entity as read from one file. The file path is for diagnostics only; identity is `entity.id`. */
export interface ProfileFileEntry {
  readonly path: string;
  readonly layer: ProfileLayer;
  readonly kind: EntityKind;
  readonly entity: ImportedEntity;
}

/** Where entities come from (the file system, or memory in tests). Rejects when it cannot read. */
export interface ProfileFiles {
  read(): Promise<readonly ProfileFileEntry[]>;
}

export interface IndexedStore {
  /** Replaces the index from the port; returns what was refused or shadowed. */
  load(): Promise<Diagnostic[]>;
  get<K extends EntityKind>(kind: K, id: string): Promise<EntityByKind[K] | undefined>;
  list<K extends EntityKind>(kind: K): Promise<EntityByKind[K][]>;
  query<K extends EntityKind>(kind: K, query: ProfileQuery): Promise<EntityByKind[K][]>;
}

interface Slot {
  byId: Map<string, ImportedEntity>;
  byVendor: Map<string, ImportedEntity[]>;
  byExternal: Map<string, ImportedEntity[]>;
}
const slot = (): Slot => ({ byId: new Map(), byVendor: new Map(), byExternal: new Map() });
const push = (m: Map<string, ImportedEntity[]>, key: string, e: ImportedEntity) => {
  const a = m.get(key);
  if (a) a.push(e);
  else m.set(key, [e]);
};

// shortcut: DiagnosticCode has no store code; invalid-json is the nearest until profile-api adds one
const problem = (path: string, message: string): Diagnostic => ({
  severity: 'error',
  code: 'invalid-json',
  file: clip(path),
  message: clip(message),
});

export function createProfileStore(files: ProfileFiles): IndexedStore {
  let index = new Map<EntityKind, Slot>();
  const slotOf = (kind: EntityKind) => index.get(kind);

  return {
    async load() {
      const diagnostics: Diagnostic[] = [];
      let entries: readonly ProfileFileEntry[];
      try {
        entries = await files.read();
      } catch (error) {
        return [problem('profiles', `cannot read the profile files: ${String(error)}`)];
      }
      // user layer first, then path order, so the winner of a clash never depends on the port's order
      const sorted = [...entries].sort(
        (a, b) =>
          Number(b.layer === 'user') - Number(a.layer === 'user') || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0),
      );
      const next = new Map<EntityKind, Slot>();
      const origin = new Map<string, ProfileFileEntry>(); // `${kind}\0${id}` -> winning entry
      for (const entry of sorted) {
        const id = (entry.entity as { id?: unknown } | null)?.id;
        if (typeof id !== 'string' || id === '' || id.length > MAX_ENTITY_ID) {
          diagnostics.push(problem(entry.path, 'entity id must be a non-empty string of at most 256 characters'));
          continue;
        }
        const key = `${entry.kind}\0${id}`;
        const winner = origin.get(key);
        if (winner) {
          diagnostics.push(
            problem(
              entry.path,
              `${entry.kind} "${id}" is already defined by ${winner.path} (${winner.layer} layer wins)`,
            ),
          );
          continue;
        }
        if (origin.size >= MAX_STORE_ENTITIES) {
          diagnostics.push(problem(entry.path, `more than ${MAX_STORE_ENTITIES} entities; this one is not loaded`));
          continue;
        }
        origin.set(key, entry);
        let s = next.get(entry.kind);
        if (!s) next.set(entry.kind, (s = slot()));
        const e = entry.entity;
        s.byId.set(id, e);
        const vendor = entry.kind === 'vendor' ? id : (e as { vendor?: unknown }).vendor;
        if (typeof vendor === 'string') push(s.byVendor, vendor, e);
        const ext = (e as { external_ids?: Record<string, unknown> }).external_ids;
        if (ext && typeof ext === 'object') {
          for (const v of new Set(Object.values(ext))) if (typeof v === 'string') push(s.byExternal, v, e);
        }
      }
      index = next;
      return diagnostics;
    },
    async get(kind, id) {
      return slotOf(kind)?.byId.get(id) as never;
    },
    async list(kind) {
      return [...(slotOf(kind)?.byId.values() ?? [])] as never;
    },
    async query(kind, query) {
      const s = slotOf(kind);
      if (!s) return [];
      let hits: ImportedEntity[] | undefined;
      if (query.vendor !== undefined) hits = s.byVendor.get(query.vendor) ?? [];
      if (query.external_id !== undefined) {
        const byExt = s.byExternal.get(query.external_id) ?? [];
        hits = hits ? hits.filter((e) => byExt.includes(e)) : byExt;
      }
      return [...(hits ?? s.byId.values())] as never;
    },
  };
}
