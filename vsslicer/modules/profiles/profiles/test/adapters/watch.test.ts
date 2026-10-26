// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createFsProfileStore } from '../../src/adapters/fs-store/fs-store.ts';
import {
  createWatchedProfileStore,
  DEBOUNCE_MS,
  MAX_WAIT_MS,
  type ChangeEvent,
  type WatchFn,
} from '../../src/adapters/fs-store/watch/watch.ts';

let dir: string;
let root: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'prf46-'));
  root = join(dir, 'profiles');
  await mkdir(join(root, 'material'), { recursive: true });
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const mat = (id: string, name = id) => JSON.stringify({ id, vendor: 'acme', name, type: 'PLA', diameter: 1.75 });
const put = (file: string, text: string) => writeFile(join(root, 'material', file), text);
const nextChange = (store: { onDidChange(l: (e: ChangeEvent) => void): () => void }) =>
  new Promise<ChangeEvent>((resolve) => {
    const off = store.onDidChange((e) => {
      off();
      resolve(e);
    });
  });
/** A watcher the test drives by hand. */
const manual = () => {
  let emit: (file: string | null) => void = () => {};
  const watch: WatchFn = (_root, onEvent) => {
    emit = onEvent;
    return () => {
      emit = () => {};
    };
  };
  return { watch, fire: (f: string | null) => emit(f) };
};
const names = async (s: ReturnType<typeof createWatchedProfileStore>) =>
  ((await s.list('material')) as unknown as { name: string }[]).map((m) => m.name);

/** The real file store, counting reads and able to hold the next one. */
const counting = () => {
  const fsStore = createFsProfileStore({ user: root });
  const state = { reads: 0, gate: undefined as Promise<void> | undefined };
  const files = {
    get diagnostics() {
      return fsStore.diagnostics;
    },
    async read() {
      state.reads++;
      const entries = await fsStore.read();
      await state.gate;
      return entries;
    },
  };
  return { state, files };
};

describe('profile file watcher (fake timers, default options)', () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  test('an event reloads exactly DEBOUNCE_MS later', async () => {
    const { state, files } = counting();
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch });
    await store.load();
    const base = state.reads;
    m.fire('material/a.json');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
    expect(state.reads).toBe(base);
    await vi.advanceTimersByTimeAsync(1);
    expect(state.reads).toBe(base + 1);
    store.dispose();
  });

  test('events every 20 ms reload exactly MAX_WAIT_MS after the first', async () => {
    const { state, files } = counting();
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch });
    await store.load();
    const base = state.reads;
    for (let t = 0; t <= MAX_WAIT_MS - 20; t += 20) {
      m.fire('material/a.json');
      await vi.advanceTimersByTimeAsync(20);
    }
    // the clock is at MAX_WAIT_MS here; the last event (at MAX_WAIT_MS - 20) pulled the reload to the cap
    expect(state.reads).toBe(base + 1);
    store.dispose();
  });

  test('an event during a running reload triggers a second reload with the new content', async () => {
    await put('a.json', mat('a', 'v1'));
    const { state, files } = counting();
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch });
    await store.load();
    const base = state.reads;
    let release = () => {};
    state.gate = new Promise<void>((r) => (release = r));
    m.fire('material/a.json');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(state.reads).toBe(base + 1); // held
    state.gate = undefined;
    await put('a.json', mat('a', 'v2'));
    m.fire('material/a.json');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    let events = 0;
    store.onDidChange(() => events++);
    release();
    await vi.waitFor(() => expect(events).toBe(2));
    expect(state.reads).toBe(base + 2);
    expect(await names(store)).toEqual(['v2']);
    store.dispose();
  });

  test('a throwing listener does not stop the others or reject', async () => {
    const { files } = counting();
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch });
    await store.load();
    let got = 0;
    store.onDidChange(() => {
      throw new Error('boom');
    });
    store.onDidChange(() => got++);
    m.fire('material/a.json');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    await vi.waitFor(() => expect(got).toBe(1));
    store.dispose();
  });
});

describe('profile file watcher', () => {
  test('the debounce and the max wait keep an edit well inside one second', () => {
    expect(DEBOUNCE_MS).toBeLessThanOrEqual(250);
    expect(MAX_WAIT_MS).toBeLessThanOrEqual(500);
  });

  test('a file edited on disk is re-indexed through a real file watcher', { timeout: 30_000 }, async () => {
    await put('a.json', mat('a', 'old'));
    const fsStore = createFsProfileStore({ user: root });
    const store = createWatchedProfileStore({ roots: [root], files: fsStore });
    try {
      await store.load();
      expect(await names(store)).toEqual(['old']);
      const changed = nextChange(store);
      await put('a.json', mat('a', 'new'));
      await changed;
      expect(await names(store)).toEqual(['new']);
    } finally {
      store.dispose();
    }
  });

  test('a burst of 500 file changes is one index update', async () => {
    await put('a.json', mat('a', 'old'));
    const fsStore = createFsProfileStore({ user: root });
    let reads = 0;
    const files = {
      read: () => (reads++, fsStore.read()),
      get diagnostics() {
        return fsStore.diagnostics;
      },
    };
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch, debounceMs: 20 });
    try {
      await store.load();
      const base = reads;
      let events = 0;
      store.onDidChange(() => events++);
      const changed = nextChange(store);
      await put('a.json', mat('a', 'new'));
      for (let i = 0; i < 500; i++) m.fire(`material/f${i}.json`);
      await changed;
      await new Promise((r) => setTimeout(r, 100)); // a second reload would land here
      expect(reads - base).toBe(1);
      expect(events).toBe(1);
      expect(await names(store)).toEqual(['new']);
    } finally {
      store.dispose();
    }
  });

  test('temp and lock files do not trigger a reload; an event with no name does', async () => {
    const fsStore = createFsProfileStore({ user: root });
    let reads = 0;
    const files = {
      read: () => (reads++, fsStore.read()),
      get diagnostics() {
        return fsStore.diagnostics;
      },
    };
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch, debounceMs: 10 });
    try {
      await store.load();
      m.fire('material/.a.json.123.tmp');
      m.fire('material/a.json.lock');
      await new Promise((r) => setTimeout(r, 100));
      expect(reads).toBe(1);
      const changed = nextChange(store);
      m.fire(null);
      await changed;
      expect(reads).toBe(2);
    } finally {
      store.dispose();
    }
  });

  test('events that never go quiet still reload after the max wait', async () => {
    const fsStore = createFsProfileStore({ user: root });
    const m = manual();
    const store = createWatchedProfileStore({
      roots: [root],
      files: fsStore,
      watch: m.watch,
      debounceMs: 60,
      maxWaitMs: 100,
    });
    try {
      await store.load();
      const changed = nextChange(store);
      const ticker = setInterval(() => m.fire('material/x.json'), 20);
      try {
        await changed; // with no max wait the 20 ms ticks would postpone the reload forever; the hang guard fails it
      } finally {
        clearInterval(ticker);
      }
    } finally {
      store.dispose();
    }
  });

  test('an edit that breaks the JSON emits a diagnostic and get keeps the last valid version', async () => {
    await put('a.json', mat('a', 'good'));
    const fsStore = createFsProfileStore({ user: root });
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files: fsStore, watch: m.watch, debounceMs: 10 });
    try {
      await store.load();
      let changed = nextChange(store);
      await put('a.json', '{ "id": "a", ');
      m.fire('material/a.json');
      const event = await changed;
      expect(event.diagnostics.some((d) => d.file === join(root, 'material', 'a.json'))).toBe(true);
      expect(((await store.get('material', 'a')) as unknown as { name: string }).name).toBe('good');

      // still broken after another reload: still the last valid version
      changed = nextChange(store);
      m.fire('material/a.json');
      await changed;
      expect(((await store.get('material', 'a')) as unknown as { name: string }).name).toBe('good');

      // fixed: the new version wins and the diagnostic is gone
      changed = nextChange(store);
      await put('a.json', mat('a', 'fixed'));
      m.fire('material/a.json');
      expect((await changed).diagnostics).toEqual([]);
      expect(await names(store)).toEqual(['fixed']);
    } finally {
      store.dispose();
    }
  });

  test('a deleted file leaves the index, and dispose stops further reloads', async () => {
    await put('a.json', mat('a'));
    const fsStore = createFsProfileStore({ user: root });
    let reads = 0;
    const files = {
      read: () => (reads++, fsStore.read()),
      get diagnostics() {
        return fsStore.diagnostics;
      },
    };
    const m = manual();
    const store = createWatchedProfileStore({ roots: [root], files, watch: m.watch, debounceMs: 10 });
    await store.load();
    const changed = nextChange(store);
    await rm(join(root, 'material', 'a.json'));
    m.fire('material/a.json');
    await changed;
    expect(await store.get('material', 'a')).toBeUndefined();
    m.fire('material/a.json');
    store.dispose();
    await new Promise((r) => setTimeout(r, 100));
    expect(reads).toBe(2);
  });
});
