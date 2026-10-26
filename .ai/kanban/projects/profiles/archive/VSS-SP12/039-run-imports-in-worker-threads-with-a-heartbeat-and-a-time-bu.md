---
id: 39
title: Run imports in worker_threads with a heartbeat and a time budget
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [38, 135]
created: 2026-10-25
---

A worker runner so a 14 420-file import cannot block the extension host; a crash becomes a diagnostic.

**Code:** `vsslicer/modules/profiles/src/adapters/worker/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [x] `PrusaResearch.ini` and the full Orca tree each import in under 10 s on CI, with the host-side heartbeat never missing a beat by more than 200 ms
- [x] A worker crash fixture returns a diagnostic and the next import works
- [x] Cancel stops the worker within 1 s

## Tasks

- [x] Write the runner and message types
- [x] Add the heartbeat test
- [x] Add crash and cancel tests

## Progress

Done (sp12-prf-39). Files: `src/adapters/worker/{messages,worker-entry,run-import-in-worker,index}.ts`; tests `test/adapters/worker/run-import-in-worker.test.ts` plus fixtures in `test/adapters/worker/fixtures/`.
`runImportInWorker({importerModule (file: URL of a module whose default export is an Importer or a factory), files, budgetMs, signal?, heartbeatMs?, onBeat?})` runs the import in a worker_thread. The host heartbeat is a setInterval reporting its own lag through `onBeat`. Crash, thrown error, bad result, blown budget and cancel each return an ImportResult with one error diagnostic (code `unreadable-folder`, a shortcut until profile-api has a worker code); only invalid arguments reject. Bounds: budget in (0, 600000], heartbeat in (0, 10000], importerModule must be file:, files capped at MAX_IMPORT_FILES, worker heap capped at 4096 MB.

Measured here (not asserted, rule 26): PrusaResearch.ini 6 533 entities in about 1.7 s; the full Orca+Bambu tree (18 009 files, readOrcaTree) about 1.0 s including reading the files; worst host heartbeat lag stays under the 200 ms asserted. Platform: CI gate platform not known to me; run on macOS arm64, Node 24.
Cross-module note: the Prusa/Orca tests import `profiles-prusa/dist` and `profiles-orca/dist` by relative path from fixtures and skip when the dist or the .reference clone is missing; the always-run heartbeat test uses a synthetic 400M-step CPU fixture. The Orca "import" is `readOrcaTree` (no Orca Importer exists yet).

Mutation probes (each restored): criterion 1 (heartbeat): 600 ms busy loop in the runner after Worker creation -> the cpu and Prusa heartbeat tests fail (Orca finishes before the first late beat is seen, so it did not fail). Criterion 2 (crash): rename the exit handler -> crash test fails; shape check removed -> bad-result test fails; missing module -> covered by its own test. Criterion 3 (cancel): delay the abort handler 1500 ms -> cancel test fails; pre-aborted check removed -> test fails. Others: file cap `>` to `>=` -> cap test fails; range `>` to `>=` -> validation test fails; file: prefix check removed -> fails; clearTimeout(budget) or clearInterval(beat) removed -> no-timer-left test fails.

Verification in modules/profiles: lint clean, build ok (dist worker also runs), test 9 files 81 tests pass, `node scripts/run.mjs checks` passes.

Release lines:
- CHANGELOG: Added `runImportInWorker`, which runs an import in a worker thread with a time budget, cancel and a host heartbeat; crashes become diagnostics.
- src/index.ts: `export * from './adapters/worker/index.ts';`

**Review failed (sp12-rev-prf-36)**
Ran in modules/profiles: `pnpm install` ok; `pnpm lint`, `pnpm build`, `pnpm test` fail only on `src/adapters/fs-store/fs-store.ts` (PRF-45, not this card); eslint and prettier on this card's files clean; `vitest run test/adapters/worker` 14/14 here (Prusa and Orca tests ran locally); full `vitest run` 97 tests, failed 1 of 4 runs (problem 2). `node scripts/run.mjs checks` fails only on `profiles-orca` undeclared `ajv` (another card).
Probes (each restored, diff-checked): 600 ms host busy loop -> cpu and Prusa heartbeat tests fail (criterion 1); exit handler removed -> crash test fails (criterion 2); shape check removed -> bad-result test fails; abort delayed 1500 ms -> cancel test fails (criterion 3). Hostile: a worker returning `native` with own keys `__proto__` and `constructor` keeps both keys (from src and from dist).
Problems:
1. `test/adapters/worker/fixtures/prusa.mjs:2`, `fixtures/orca.mjs:2` and `run-import-in-worker.test.ts:166-169` import `../../../../../profiles-prusa/dist` and `profiles-orca/dist` by relative path and read `profiles-data-orca/data`. Architecture rule: other modules only through declared semver ranges, never relative imports or another module's files. Fix: add `@vsslicer/profiles-prusa` and `@vsslicer/profiles-orca` as devDependencies (no cycle: neither depends on profiles) and import by package name, or move the real-tree measurement to a module that already depends on both.
2. `run-import-in-worker.test.ts:94-99` ("no timer behind") is flaky: it counts every `Timeout` in the process, so a timer from earlier work clearing during the await gives `expected +0 to be 1`; it failed in 1 of 4 full-suite runs and in 1 of 2 runs with installed.test.ts. Fix: a test of "this code clears its timers" must observe only this code's timers. Spy on `setInterval`/`setTimeout` and `clearInterval`/`clearTimeout` (`vi.spyOn(globalThis, ...)`) and assert every handle the runner made was cleared.
3. `run-import-in-worker.ts:95`: a worker result loses its null prototype. Structured clone returns `native` with `Object.prototype` (probe: `Object.getPrototypeOf(r.native) === null` is false, and `r.native['toString']` is a function for an entity `toString` with no native entry), while in-process importers return `Object.create(null)`. Fix: the runner must hand back the same shape as an in-process import. Rebuild `native` as `Object.assign(Object.create(null), r.native)` before `settle(r)`, and add a test with entities `constructor` and `toString`.
4. Criterion 1 says "on CI", but both real-tree tests skip on CI: `.reference/` is ignored and `profiles-data-orca/data` has 0 tracked files. Only the synthetic cpu fixture runs there, and "under 10 s" is measured, never asserted (rule 26). The coordinator needs to settle whether the cpu fixture plus local measurement meets criterion 1. If not, the criterion needs a CI-available fixture.

**Settled by the coordinator (sp12-coordinator, rule 28), for the rework:**
- Problem 1: no relative imports of other modules' `dist` or data. Remove the Prusa and Orca real-tree tests and
  fixtures from the module; keep the synthetic CPU fixture. The real-tree measurement (PrusaResearch.ini 6 533
  entities about 1.7 s, Orca tree 18 009 files about 1.0 s, macOS) stays in Progress as local evidence.
- Problem 4: criterion 1 is met by the synthetic CPU fixture (heartbeat lag asserted, the time not asserted, rule 26)
  plus that recorded local measurement.
- Problems 2 and 3 as the review says.

**Rework (sp12-prf-39b), per the coordinator's settlement**
- Problem 1: removed `fixtures/prusa.mjs`, `fixtures/orca.mjs` and the two real-tree tests plus their fs imports; the synthetic CPU fixture stays. The local measurement above stays as evidence. Problem 4: criterion 1 rests on the CPU fixture (lag asserted) plus that measurement.
- Problem 2: the timer test now spies `setInterval`/`setTimeout`/`clearInterval`/`clearTimeout` and asserts every handle the runner made (at least 2) was cleared.
- Problem 3: `run-import-in-worker.ts` rebuilds `native` with `Object.assign(Object.create(null), r.native)`; new fixture `native.mjs` (own keys `constructor`, `__proto__`) and a test for null prototype, both keys kept, `toString` undefined.
- Probes (restored): `clearTimeout(budget)` removed -> timer test fails; null-prototype rebuild removed -> native test fails.
- Verification in modules/profiles: lint clean, build ok, test 10 files 96 tests pass. `node scripts/run.mjs checks` exits 0.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** probe rerun by the coordinator fails its test (036: reversed sort fails the total-bytes test; 039: dropping the null-prototype rebuild fails the native test), restored. Pass.
