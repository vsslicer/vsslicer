// SPDX-License-Identifier: AGPL-3.0-or-later
// Re-indexes the profile folders when files change on disk (PRF-46): events are coalesced into one reload, and a file
// that stops parsing keeps its last valid entity in the index while a diagnostic goes out through `onDidChange`.
import { watch as nodeWatch } from 'node:fs';
import type { Diagnostic } from '@vsslicer/profile-api';
import {
  createProfileStore,
  type IndexedStore,
  type ProfileFileEntry,
  type ProfileFiles,
} from '../../../application/store/profile-store.ts';

/** Quiet time after the last file event before the reload; the first reload follows an edit within this plus the read. */
export const DEBOUNCE_MS = 100;
/** A burst that never goes quiet still reloads this long after its first event. */
export const MAX_WAIT_MS = 500;

export interface ChangeEvent {
  /** Everything wrong after this reload: unreadable or invalid files, shadowed ids. */
  readonly diagnostics: readonly Diagnostic[];
}

/** Starts watching `root` recursively; calls `onEvent` for each file event and returns a stop function. */
export type WatchFn = (root: string, onEvent: (file: string | null) => void) => () => void;

const watchRecursive: WatchFn = (root, onEvent) => {
  const w = nodeWatch(root, { recursive: true }, (_type, file) => onEvent(file === null ? null : String(file)));
  w.on('error', () => {}); // a vanished root stops the events; the next successful reload is unaffected
  return () => w.close();
};

export interface WatchOptions {
  /** The folders to watch; roots that do not exist when watching starts are skipped. */
  roots: readonly string[];
  /** Reads the files, like `FsProfileStore`; its `diagnostics` are read after each `read`. */
  files: ProfileFiles & { readonly diagnostics: readonly Diagnostic[] };
  watch?: WatchFn;
  debounceMs?: number;
  maxWaitMs?: number;
}

export interface WatchedProfileStore extends IndexedStore {
  onDidChange(listener: (event: ChangeEvent) => void): () => void;
  /** Stops the watchers and any pending reload. */
  dispose(): void;
}

export function createWatchedProfileStore(options: WatchOptions): WatchedProfileStore {
  const { files } = options;
  const watchFn = options.watch ?? watchRecursive;
  const debounceMs = options.debounceMs ?? DEBOUNCE_MS;
  const maxWaitMs = options.maxWaitMs ?? MAX_WAIT_MS;
  let previous = new Map<string, ProfileFileEntry>();
  let fileDiagnostics: readonly Diagnostic[] = [];

  // A file that now fails to parse is reported by `files.diagnostics` under its path: keep the entry it had.
  const retaining: ProfileFiles = {
    async read() {
      const entries = await files.read();
      fileDiagnostics = files.diagnostics;
      const next = new Map(entries.map((e) => [e.path, e]));
      const out = [...entries];
      for (const d of fileDiagnostics) {
        const old = d.file === undefined ? undefined : previous.get(d.file);
        if (old && !next.has(old.path)) {
          next.set(old.path, old);
          out.push(old);
        }
      }
      previous = next;
      return out;
    },
  };
  const index = createProfileStore(retaining);

  const listeners = new Set<(event: ChangeEvent) => void>();
  const reload = async () => {
    const diagnostics = [...(await index.load())];
    // load() reports a failed read itself; the file-level problems of a successful read come from the port
    const event = { diagnostics: [...fileDiagnostics, ...diagnostics] };
    for (const l of [...listeners]) {
      try {
        l(event);
      } catch {
        // a throwing listener must not stop the others or reject the reload
      }
    }
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  let firstEvent = 0;
  let running = false;
  let dirty = false;
  let disposed = false;
  const run = async () => {
    timer = undefined;
    if (running) {
      dirty = true;
      return;
    }
    running = true;
    try {
      do {
        dirty = false;
        await reload();
      } while (dirty && !disposed);
    } finally {
      running = false;
    }
  };
  const onEvent = (file: string | null) => {
    // temp and lock files of a write in progress are not profiles; a null name means "anything may have changed"
    if (file !== null && !file.endsWith('.json')) return;
    const t = Date.now();
    if (timer === undefined) firstEvent = t;
    else clearTimeout(timer);
    timer = setTimeout(() => void run(), Math.max(0, Math.min(debounceMs, firstEvent + maxWaitMs - t)));
  };

  const stops: (() => void)[] = [];
  for (const root of options.roots) {
    try {
      stops.push(watchFn(root, onEvent));
    } catch {
      // shortcut: a root missing at start is not watched, upgrade to watching its parent when `.vsslicer/profiles` appears later
    }
  }

  return {
    ...index,
    onDidChange(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    dispose() {
      disposed = true;
      if (timer !== undefined) clearTimeout(timer);
      for (const stop of stops) stop();
    },
  };
}
