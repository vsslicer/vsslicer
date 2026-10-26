---
id: 32
title: Generate a 500 MB 3MF and measure host blocking
type: chore
priority: P0
effort: L
model: opus
area: [3mf]
story: US8
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [31, PLT-13]
created: 2026-10-25
---

A generator (via `tools/generate-large-fixture`, cached by CI) for a 500 MB 3MF, and a test that proves the extension-host thread is never blocked more than 50 ms while it opens.

**Code:** `vsslicer/modules/3mf/test/large/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [x] The generated 500 MB fixture opens through the worker
- [x] Event-loop delay on the host thread stays under 50 ms (measured)
  - **Settled by the coordinator (SP12, rule 28):** measured as host-thread CPU time between event-loop turns, under 50 ms, counted through the turn after the worker returns. Elapsed time is not gated (rule 26). The measure cannot see the host blocked while waiting (`Atomics.wait`); `budget.json`'s comment and the CHANGELOG line say so.
- [x] Peak memory recorded and a cap is documented

## Tasks

- [x] Implement the generator
- [x] Measure delay
- [x] Record numbers

## Progress

Not started.

### sp11-vwr-32, 2026-10-26

Files (all in `vsslicer/modules/3mf/test/large/`; `tools/generate-large-fixture` reads as a module-local generator, as mesh did, since `vsslicer/scripts/generate-large-fixture.mjs` is the G-code stub outside this module):
- `generate.ts`: deterministic 3MF of grid meshes (seeded LCG heights, 1000-column rows, 1000 rows per object), stored model part; CLI `--size <MB> --seed --out`. `--size 500 --seed 1` gives 524,380,614 bytes, 7,644,348 triangles, byte-identical across runs (cmp), ~7 s. Bounds: size 1..510 MB (the 512 MiB entry cap), seed an integer. It is stored because mesh XML deflates ~3x, so a 500 MB deflated file is ~1.5 GB of parts, past the 1 GiB package cap (`fflateZip.ts:10`). 500 MB stored is the largest file the caps accept.
- `case.ts`: one open in a fresh process, done the way the host does it: async `readFile`, a view (no copy), `readInNodeWorker`. Records wall event-loop delay (perf_hooks histogram), setImmediate turns, the most host-thread CPU (`process.threadCpuUsage`) spent between two turns, and peak RSS every 20 ms.
- `run.ts` (`node --no-warnings test/large/run.ts [--update] [--fixture f]`): generates into `modules/3mf/.cache/large-fixtures/` (git-ignored) when missing, runs case.ts, exits 1 unless every triangle came back (`budget.json triangles`), host CPU between turns < 50 ms, and peak RSS <= `capMB`. `--update` records this OS's numbers.
- `budget.json`: cap documented, **capMB 1536** (whole process: host, worker heap, off-heap file and result buffers), every OS; darwin measured.
- `large.test.ts` (in `pnpm test`, 8 MB in memory): generator determinism, size bound and arg checks; host event loop turns > 100 while the worker reads, with every triangle back.

Numbers (macOS, M1 Pro 8 cores 16 GB, Node 26.12.1, load average 20-36 from the other agents). Six runs: host CPU between turns **2.7-3.9 ms**, peak RSS **1139-1381 MB**, read 40-58 s in the worker. The wall event-loop max was 34-200 ms (p99 12-27 ms): the gaps were spread over the whole read while the host thread itself stayed under 4 ms of CPU, so they are OS preemption on an overloaded machine, not host work. The criterion is therefore measured, and gated, as host CPU without yielding (CPU time, not wall time: rule 26). Wall delay is recorded, never gated. The one quieter run had a 33.8 ms wall max. Coordinator judgment: if "event-loop delay" has to mean wall delay, it needs an idle machine to measure. Notes: `.reference/notes/VWR-32-large-3mf-host-blocking.md`.

Found and fixed in my own code: copying the file on the host (`new Uint8Array(buffer)`) cost 237 ms of host CPU and 1.6 GB RSS. It is probe G2 below.

Mutation probes (each restored, diff clean):
- P1 read on the host (`handle()` instead of `readInNodeWorker`): the turns test fails.
- P2 `Math.random` heights: the determinism test fails.
- P3 no row stop: the size bound test fails.
- P4 no size range check, P5 no seed check: the refusal test fails.
- G1 capMB 1000: run.ts exits 1, "peak RSS 1209 MB over the 1000 MB cap".
- G2 host copy of the file: exits 1 on host CPU 236.71 ms and RSS 1612 MB.
- G3 triangles 1: exits 1, "opened 7644348 of 1 triangles".

Verification (macOS; the CI gate would run on ubuntu-latest): `pnpm install` up to date; `pnpm lint` passes (eslint, prettier, tsc); `pnpm build` passes; `pnpm test` 292/293 passed. The one failure is `readBambuObjects.test.ts` "nested components compose...", another card's in-progress untracked file, not touched here. My files: 3/3 passed, plus worker.test.ts 16/16. `node scripts/run.mjs checks` exits 0.

Left open (not changed, worker only): the root model is parsed three times in the worker (scanModel decodes the whole part into one string at `modelScan.ts:34`; readMetadata parses it again just for `<metadata>`; then readCore). That costs time and peak memory, not host blocking.

Release lines:
- CHANGELOG (Unreleased, test-only, no version bump needed): `- VWR-32: 500 MB 3MF generator (test/large/generate.ts) and run.ts gate: opened through readInNodeWorker with host-thread CPU between event-loop turns under 50 ms and peak RSS under 1536 MB (test/large/budget.json).`
- package.json script (optional): `"bench:large": "node --no-warnings test/large/run.ts"`
- No src/index.ts exports.
- ci.yml (coordinator; after the mesh bench step). Linux has no measured entry yet; capMB applies to every OS, so add `--update` plus an upload-artifact step to record one:
```yaml
      # VWR-32: open the 500 MB 3MF through the worker; host CPU between turns < 50 ms, peak RSS <= test/large/budget.json capMB
      - if: runner.os == 'Linux' && contains(needs.select.outputs.modules, '3mf')
        uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0
        with:
          path: vsslicer/modules/3mf/.cache/large-fixtures
          key: 3mf-large-${{ hashFiles('vsslicer/modules/3mf/test/large/generate.ts', 'vsslicer/modules/3mf/test/support/zipBuilder.ts', 'vsslicer/modules/3mf/test/support/minimalPackage.ts') }}
      - if: runner.os == 'Linux' && contains(needs.select.outputs.modules, '3mf')
        working-directory: vsslicer/modules/3mf
        run: node --no-warnings test/large/run.ts
```


**Carried to SP12 (sp11-coordinator, 14:26):** built and in review, but no reviewer could be dispatched (the permission classifier refused the review dispatches, Q29). The unreviewed work is parked, untracked, under `.ai/local/wip/SP11/` at the same paths; copy it back before the review. Its release lines above still apply. Nothing of it is committed.

**Review failed (sp12-rev-vwr-32)**, 2026-10-26

The files in `vsslicer/modules/3mf/test/large/` are byte-identical to the parked copy in `.ai/local/wip/SP11/`. I ran everything on macOS with Node 26.12.1, at load averages between 14 and 200. `pnpm install`: up to date. `pnpm lint`: passes (eslint, prettier, tsc). `pnpm build`: passes. `pnpm test`: 20 files, 309/309. `node scripts/run.mjs checks`: exits 0. `node --no-warnings test/large/run.ts`: exit 0 in 53 s, with triangles 7644348, maxTurnCpuMs 4.23, peakRssMB 1159, wall maxDelayMs 98.57 and p99 14.73. budget.json was not changed. I regenerated `--size 500 --seed 1` into a temp dir: 524,380,614 bytes, `cmp`-identical to the cached fixture. The CLI exits 2 on `--size 0`, `--size 511`, `--seed -1`, a missing `--out`, `--size 1e2` and an unknown flag. Layering: test-only code that imports only this module's own `src`, with SPDX headers on every file. No `__proto__`-style keyed input (`platforms[platform()]` is keyed by the OS name, not by input).

My probes (each one restored, `cmp`-clean):
- M1: `targetBytes > MAX_SIZE_MB * MB` changed to `>=` (`generate.ts:22`). All 3 tests pass.
- M2: `MAX_SIZE_MB = 2000` (`generate.ts:18`), past the 512 MiB entry cap. All 3 tests pass.
- M3: lower bound removed. The refusal test fails (correct).
- H1: a 200 ms busy loop placed right after `await readInNodeWorker` (20 MB fixture): maxTurnCpuMs 3.4, wall max 72.9 ms. The gap is never measured.
- H2: a 200 ms busy loop on the host during the read (via `setTimeout`): maxTurnCpuMs 35.86 at load 80 (preempted), wall max 220.7 ms.
- H3: the host blocked off-CPU for 200 ms during the read (`Atomics.wait`): maxTurnCpuMs 1.85, so the gate passes, while wall max is 212.6 ms.
- H4: 500 MB with the last gap measured (fix 2 applied temporarily): maxTurnCpuMs 3.63. Receiving the result is cheap today.

Problems:
1. The size-bound test (`test/large/large.test.ts:25-29`) does not pin the exact cap, and it takes its expected value from the code under test. M1 and M2 both pass. A generator whose cap drifts past `DEFAULT_MAX_ENTRY_BYTES` would make files the reader refuses, and no test would notice. Rule: a bound's test asserts the exact cap as a literal and shows both sides of it. Fix: assert `MAX_SIZE_MB === 510`, and assert that `510 * MB` plus one row plus the zip records fit under `DEFAULT_MAX_ENTRY_BYTES` (import it from `src/index.ts`). Then test `510 * MB` accepted and `510 * MB + 1` refused, cheaply, by moving the range check into an exported function that `largeModel` and the CLI both call.
2. The measurement window ends one turn early (`test/large/case.ts:41-42`). `spinning = false` and the JSON print run in the same macrotask as the promise continuation, so the gap holding the receipt of the worker's result and the resolve is never counted (H1). Receiving the result is part of opening the file. Rule: the measured window covers everything up to the moment the open has finished on the host. Fix: `await new Promise((r) => setImmediate(r));` after line 41 and before `spinning = false`. With that change, H4 measures 3.63 ms, so the gate still passes.
3. Criterion 2 is ticked but is not met as written. "Event-loop delay ... under 50 ms (measured)" reads as wall delay, and the wall max was 34-200 ms in sp11-vwr-32's runs and 98.6 ms and 170 ms in mine. The card swaps in a different metric, host CPU between turns, and leaves the choice open ("Coordinator judgment: ..."). It was not settled, so I did not derive a rule myself. The CPU gate catches CPU-bound host work (G2, H2) but misses off-CPU blocking such as sync I/O, `Atomics.wait` and lock waits (H3: 200 ms blocked, gate passes). Rule 26 forbids gating wall time. So the coordinator either amends criterion 2 to the CPU metric and documents the off-CPU blind spot in `budget.json`'s comment and the CHANGELOG line, or rejects the substitution. The criterion box stays as the coordinator decides.

Fixed in place: nothing.

### sp12-vwr-32 (rework), 2026-10-26

Fixes for the three review problems, all in `vsslicer/modules/3mf/test/large/`:
1. `generate.ts`: the range check moved into exported `checkArgs(targetBytes, seed)`, called by `largeModel` and by the CLI (which keeps its integer-form checks). `large.test.ts` new test: `MAX_SIZE_MB` is the literal 510, `checkArgs(510 * MB)` accepted, `510 * MB + 1` refused, 1 byte accepted, and `510 * MB + ROW_BYTES` (one grid row over) `<= DEFAULT_MAX_ENTRY_BYTES` imported from `src/index.ts`.
2. `case.ts`: `await new Promise((r) => setImmediate(r))` after `readInNodeWorker` and before `spinning = false`, so the turn that receives the result and resolves is measured.
3. Criterion 2 per the coordinator's settlement: `budget.json` comment now says the CPU gate counts through the turn after the worker returns and names the off-CPU blind spot (Atomics.wait, sync I/O, lock waits; only wall delay shows it). The CHANGELOG line below says so too.

Probes, criterion by criterion (each restored, `cmp`-clean):
- Criterion 1 (opens through the worker): unchanged from SP11 probes P1 and G3; re-run: 500 MB `run.ts` exit 0, triangles 7644348.
- Criterion 2 (host CPU between turns, through the turn after the worker): H1 with a 200 ms CPU-time busy loop (threadCpuUsage-based, so load cannot hide it) after `await readInNodeWorker`, 20 MB fixture: maxTurnCpuMs 201.24 with the fix; with the fix removed, 1.68 (the gap was missed). So the new await is what makes the gate see it.
- Criterion 3 (peak memory and cap): unchanged, SP11 probe G1; 500 MB run peakRssMB 1122 <= capMB 1536.
- Review fix 1, the exact cap: M1 `>` to `>=`: new test fails. M2 `MAX_SIZE_MB = 2000`: new test fails. M3 cap loosened by one byte (`> MAX_SIZE_MB * MB + 1`): new test fails. CLI: `--size 0` exit 2, `--size 510` exit 0, `--size 511` exit 2.

Verification (macOS, Node 26.12.1, load average 68-104; the CI gate runs on ubuntu-latest): `pnpm install` up to date; `pnpm lint` passes; `pnpm build` passes; `pnpm test` 20 files, 314/314; `node scripts/run.mjs checks` exits 0. `node --no-warnings test/large/run.ts` exit 0: maxTurnCpuMs 2.89, peakRssMB 1122, wall max 271.06 ms (p99 27.02, recorded, not gated). budget.json `measured` not updated (not `--update`).

Release lines (replace the SP11 CHANGELOG line; the package.json script and ci.yml steps above still apply, no exports):
- CHANGELOG (Unreleased, test-only): `- VWR-32: 500 MB 3MF generator (test/large/generate.ts) and run.ts gate: opened through readInNodeWorker with host-thread CPU between event-loop turns under 50 ms, counted through the turn after the worker returns, and peak RSS under 1536 MB (test/large/budget.json). Elapsed time is not gated, so the gate cannot see the host blocked while waiting off-CPU (Atomics.wait, sync I/O).`

**Review passed (sp12-rev2-vwr-32)**, 2026-10-26

Checked the rework against the three problems of sp12-rev-vwr-32 and the settled criterion 2. macOS, Node 26.12.1, load average 94-136. `pnpm install`: up to date. `pnpm lint`: passes (eslint, prettier, tsc). `pnpm build`: passes. `pnpm test`: 21 files, 324/324 (the module also holds another card's uncommitted readModelOnce work). `node scripts/run.mjs checks`: exits 0. `node --no-warnings test/large/run.ts`: exit 0 in 57 s, with triangles 7644348, maxTurnCpuMs 3.34, peakRssMB 1117 (cap 1536), wall max 85.46 ms and p99 28.03 (recorded, not gated). No files changed by the run.

Problem 1, the exact cap. The new test asserts the literal 510, accepts `510 * MB`, refuses `510 * MB + 1`, and checks that one row over still fits `DEFAULT_MAX_ENTRY_BYTES`. My probes, each one restored and `cmp`-clean: M1 `>` to `>=`, M2 `MAX_SIZE_MB = 2000`, M3 `> MAX_SIZE_MB * MB + 1` and M4 `MAX_SIZE_MB = 509` each fail the new test. M5 removes the `checkArgs` call from `largeModel`, and the refusal test fails. Edge check: `largeModel(510 * MB, 1)` gives 534,853,002 bytes, 79,242 over the target, so it is under the 536,870,912 entry cap.

Problem 2, the window. `case.ts:42` awaits one `setImmediate`. H1: a 200 ms busy loop measured in thread CPU time, placed right after `await readInNodeWorker`, on a 20 MB fixture. With the fix, maxTurnCpuMs is 201.12. With the fix line removed, it is 1.89, so the gap was missed before. Baseline without the busy loop: 1.64.

Problem 3, criterion 2 as settled (CPU time between turns, counted through the turn after the worker returns, elapsed time not gated). This matches the code (case.ts and run.ts) and the 500 MB run above. The off-CPU blind spot is named in `budget.json`'s comment and in the rework's CHANGELOG release line. Layering: test-only code that imports only this module's `src`, with SPDX headers on every file. No input-keyed objects.

Fixed in place: nothing.
