---
id: 46
title: Re-index files edited outside VSSlicer within one second
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [45, 135]
created: 2026-10-25
---

File watching so git checkouts and text edits show up; an invalid file keeps the last valid version resolvable and gives a diagnostic.

**Code:** `vsslicer/modules/profiles/src/adapters/fs-store/watch/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [x] A file edited on disk is re-indexed within 1 s (timing test)
- [x] An edit that breaks the JSON emits a diagnostic through `onDidChange` and `get` still returns the last valid version
- [x] A burst of 500 file changes (a git checkout) is coalesced into one index update

## Tasks

- [x] Write the watcher
- [x] Coalesce bursts
- [x] Tests

## Progress

Added `src/adapters/fs-store/watch/watch.ts` (createWatchedProfileStore: recursive fs.watch per root, trailing debounce 100 ms with 500 ms max wait, one reload at a time, retains the last valid entity of a file that stops parsing, onDidChange with all diagnostics) and `test/adapters/watch.test.ts` (7 tests).

Probes (each change made, test failed, restored):
- edited file re-indexed: real-watcher test; removing the watch start fails 6 tests. The 1 s bound is asserted as constants (DEBOUNCE_MS <= 250, MAX_WAIT_MS <= 500), no wall time.
- broken JSON diagnostic + last valid: disabling the retain branch fails the test.
- burst of 500 coalesced: removing clearTimeout (debounce) fails; removing the max-wait cap fails the never-quiet test; removing the .json filter fails the tmp/lock test.
- dispose: removing the timer clear fails the dispose test.
- Dropped an unprobed disposed guard in onEvent (watchers are closed instead).

Verify (profiles, darwin; CI gate runs ubuntu): pnpm lint, build ok; test 103 passed (11 files); `node scripts/run.mjs checks` exit 0.

Shortcut: a root that does not exist at start is not watched (no restart when .vsslicer/profiles appears later).

Release lines:
- CHANGELOG: Add `createWatchedProfileStore`: re-indexes profile folders on disk changes, coalesces bursts, keeps the last valid version of a file that breaks.
- src/index.ts: `export { createWatchedProfileStore, DEBOUNCE_MS, MAX_WAIT_MS, type ChangeEvent, type WatchFn, type WatchOptions, type WatchedProfileStore } from './adapters/fs-store/watch/watch.ts';`

**Review failed (sp12-rev-prf-46)**

Ran (profiles, darwin): `pnpm install --frozen-lockfile` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 103 passed (11 files), `node scripts/run.mjs checks` exit 0. Layering ok (adapter imports application only, no VS Code). Indexes are `Map`s, so `__proto__`/`constructor` paths are safe.

Mutation probes on `watch.ts` (each restored):
- no retain branch (`if (false)` at :65): fails 1. Caught.
- no `.json` filter (:107): fails 1. Caught.
- max wait removed (`firstEvent + 1e9`): fails 1 (never-quiet test). Caught.
- delay `debounceMs * 20` at :111: fails 1 (never-quiet hangs). Caught.
- max wait x5 (`firstEvent + maxWaitMs * 5 - t` at :111): **7 passed**.
- defaults x20 (`DEBOUNCE_MS * 20`, `MAX_WAIT_MS * 20` at :51-52, so 2 s and 10 s latency): **7 passed**.
- no rerun after an event that lands during a running reload (`} while (false);` at :100): **7 passed**.

Problems:
1. Criterion 1 (re-indexed within 1 s) has no test that can fail. `watch.test.ts:50-53` only checks the exported constants, and the real-watcher test (`:55`) has a 30 s timeout, so the defaults-x20 probe (2 s debounce, 10 s max wait) passes. Expected fix: a fake-timer test (`vi.useFakeTimers`, no wall time, rule 26) on the default options that fires an event, advances exactly `DEBOUNCE_MS` and asserts the reload started, and asserts it had not started at `DEBOUNCE_MS - 1`.
2. The max-wait cap is not asserted exactly (SP12: a bound's test asserts the exact cap). The never-quiet test (`:127`) only proves the reload eventually happens, so x5 survives. Expected fix: with fake timers and events every 20 ms, assert no reload at `maxWaitMs - 1` and a reload at `maxWaitMs`.
3. An edit that lands while a reload is running is not tested. The `dirty` rerun (`watch.ts:91-100`) can be deleted and every test still passes, and then that edit stays unindexed until the next event. Expected fix: a test whose `files.read` is held on a promise, fires an event during it, releases it, and asserts a second read and the new content.

Not blocking (for the coordinator): a listener that throws rejects `run()`, and `void run()` (:111) turns that into an unhandled rejection. Isolating each listener in try/catch would stop that.

**Review fix (sp12-prf-46b)**

Added a fake-timer block (default options, no wall time) to `test/adapters/watch.test.ts` and a try/catch around each listener in `watch.ts`.
1. Criterion 1: test "an event reloads exactly DEBOUNCE_MS later" (no read at DEBOUNCE_MS - 1, one at DEBOUNCE_MS). Probe defaults x20: 4 tests fail.
2. Max wait exact: events every 20 ms, reload exactly at MAX_WAIT_MS (the clock reaches the cap with one reload; the cap-1 side is the debounce test's pair). Probe max wait x5: fails 1.
3. Event during a running reload: held read, second event, release, second read and new content. Probe `while (false)` for the dirty rerun: fails 1.
4. Non-blocking: a throwing listener no longer rejects the reload nor stops other listeners; test fails 1 when the catch is removed.
Verify (profiles, darwin; CI gate ubuntu): lint, build ok; test 107 passed (11 files); `node scripts/run.mjs checks` exit 0.
Release lines: unchanged from above.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** lint and `pnpm test` 107/107 pass; probe `MAX_WAIT_MS = 501` (one over) fails 2 watcher tests, restored; the worker probed the debounce edges, the dirty rerun and the listener guard. Pass.
