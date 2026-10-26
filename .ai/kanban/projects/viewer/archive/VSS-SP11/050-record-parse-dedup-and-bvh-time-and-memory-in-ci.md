---
id: 50
title: "Record parse, dedup and BVH time and memory in CI"
type: chore
priority: P0
effort: L
model: opus
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [48, 49, 36, 45, 37]
created: 2026-10-25
---

The final benchmark on the real library at 1, 5 and 20 M triangles; its numbers go to E10's budgets.

**Code:** `vsslicer/modules/mesh/test/bench/` (module: `mesh`, layer: n/a (ci))

## Acceptance criteria

- [x] Time and peak memory for parse, dedup and BVH are recorded per size and per host (Node worker and Chromium)
- [x] Results are written to a file consumed by the E10 budget card
- [x] Compared with the spike's numbers and any large gap explained

## Tasks

- [x] Harness
- [x] Run and record
- [x] Compare with spike

## Progress

Not started.

### 2026-10-26 sp11-vwr-50

- Harness in `vsslicer/modules/mesh/test/bench/` (layer: n/a, CI): `run.ts` (orchestrator, `--update`, `--sizes`,
  `--no-chromium`), `stages.ts` (parse = parseBinaryStl incl. weld, dedup = weld alone, bvh = buildBvh), `node-case.ts`
  (worker_threads; process RSS sampled 20 ms per stage; wall ms and thread cpuMs), `chromium-case.ts` + `browser-worker.ts`
  (Web Worker in Chromium; browser process-tree RSS via ps, the GCP-42 method). Fixtures from `scripts/generate-large-fixture.mjs`
  in a temp dir, removed afterwards. Memory gated (stage peak > budget fails, exit 1), time recorded only (rule 26).
- Results file for E10: `test/bench/budget.json`, per OS / size / host / stage: `budgetMB` (peak x 1.25) and `measured`
  (ms, cpuMs, startMB, peakMB, baselineMB). darwin recorded at 1, 5, 20 M on both hosts (M1 Pro, Node 26.12.1).
- CI (`.github/workflows/ci.yml`, ubuntu-latest only, when `mesh` is selected): installs test-webview's Playwright Chromium,
  runs 1,5 M on PRs and 1,5,20 M on workflow_dispatch; uploads budget.json as artifact `mesh-bench-budget`. **No linux
  budget exists yet**, so the step records one (`--update`) instead of gating until the coordinator commits the artifact's
  linux entry (same gap as GCP-42's x64 runner). Gate platform: Linux.
- Spike comparison (full table: `.reference/notes/VWR-50-bench.md`): Node CPU time within 30% of VWR-389 at every size
  (parse 4.7 s, weld 3.7 s, BVH 7.7 s at 20 M). Gaps explained: Node parse peak 2.6 GB at 20 M vs 1.42 GB because the whole
  1 GB file is held (the spike streamed chunks); bvh-stage peak 4.0 GB is the RSS high-water of freed dedup buffers + the file.
  darwin Chromium tree RSS (~1 GB at 20 M) is a lower bound: macOS ps RSS excludes compressed pages, machine under memory
  pressure (load ~120); use the Linux CI number for E10 (unverified explanation).
- Probes: budget lowered to 10 MB -> exit 1 `1M node parse: 193 MB over budget 10 MB`; size without budget -> exit 1
  `2M node: no budget`; `--sizes 0` -> throws; unchanged budget -> exit 0. budget.json restored byte-identical.
- Verify: mesh `pnpm lint` clean, `pnpm build` ok, `pnpm test` 90 passed, 1 skipped (13 files); `node scripts/run.mjs checks` exit 0.
- Release lines:
  - CHANGELOG: `- Benchmark of parse, dedup and BVH time and peak memory at 1, 5 and 20 M triangles in a Node worker and in Chromium, with per-OS memory budgets (test/bench, VWR-50).`
  - package.json script (optional, CI calls node directly): `"bench": "node --no-warnings test/bench/run.ts"`

**Review failed (sp11-rev-vwr-50)**

- Ran in `vsslicer/modules/mesh`: `pnpm install --frozen-lockfile` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test`
  90 passed, 1 skipped (13 files); `node scripts/run.mjs checks` exit 0. Bench at 1 M only (machine loaded; 20 M not rerun):
  `node --no-warnings test/bench/run.ts --sizes 1` with test-webview's Playwright -> exit 0, node peaks 193/248/397 MB,
  chromium 414/404/448 MB (baseline 244), all within the darwin budget; budget.json byte-identical afterwards.
- CI step read: Linux only, gated on `mesh` selection, records (`--update`) until a linux entry exists, artifact uploaded
  with `always()`. The `node -e` linux check returns 1 on the current file (records), as intended.
- Mutation probe (stages.ts, restored): a 600 MB allocation added inside the **bvh** stage only. The gate fires
  (`1M node bvh: 1001 MB over budget 498`, `1M chromium bvh: 859 MB over budget 622`), but also reports
  `1M chromium dedup: 875 MB over budget 584 MB`: dedup's own work did not change, yet it was charged ~470 MB of bvh memory.

Problems:

1. `test/bench/chromium-case.ts:79-82` (and the same pattern at `test/bench/node-case.ts:26-31`): stage attribution
   is asynchronous. The worker posts `dedup end` / `bvh start` and carries straight on into bvh (`stages.ts:26,32`
   call `mark` and do not wait); in Chromium the mark reaches Node through page -> CDP -> `exposeFunction`, so by the time
   `sample()` runs for `dedup end` (line 80) and the 50 ms timer runs with `current = dedup`, bvh's allocations are already
   in the RSS and land in dedup's peak. The probe above shows it. Per-stage peaks (criterion 1) and the per-stage gate are
   therefore wrong at every stage boundary, by however much the next stage allocates during the round trip, which grows
   with load (CI runners, this machine). Node is less exposed (no CDP hop) but has the same race. Expected fix (the rule):
   a stage boundary must be a handshake, not a notification: `mark` returns a promise the worker awaits, resolved when
   the host has taken its boundary sample and switched `current` (in Chromium: worker posts, page awaits `__mark(...)`,
   then replies to the worker; in Node: main thread replies after sampling). Rerun the probe: only `bvh` may fail.
   Re-record the darwin budget afterwards (at least the sizes the fix touches; 20 M when the machine allows).

Notes for the coordinator (not failures):
- The linux budget should be committed from a `workflow_dispatch` artifact (1,5,20). One taken from a PR run has only
  1M/5M, and the next manual run then fails `20M ...: no budget`.
- `budget.json` lives in `test/bench/` and package.json `files` is `dist, LICENSE, README.md`, so it is not in the
  published package; VWR-76 ("the benchmark results file the viewer reads its budgets from") must add it or move it.
- Release lines (CHANGELOG, optional `bench` script) not applied yet, as the card says.

### 2026-10-26 sp11-vwr-50-fix (rework of review problem 1)

- Stage boundaries are now a handshake. `stages.ts`: `mark` returns `Promise<void>` and `timed` awaits it at start and end.
  Node: the worker posts the mark and waits for `ack`, which the main thread sends after sampling and switching `current`
  (`node-case.ts`). Chromium: the page awaits `__mark(...)` and then posts `ack` to the Web Worker (`chromium-case.ts`,
  `browser-worker.ts`, which ignores `'ack'` as a job message).
- Mutation probe (600 MB allocation inside bvh only, restored): `1M node bvh: 994 MB over budget 498` and
  `1M chromium bvh: 877 MB over budget 622`. Dedup no longer fails (peak 428 MB on Chromium, was charged 875 MB).
- Re-recorded darwin budget at 1 M and 5 M (`--sizes 1,5 --update`); the 20 M entry is kept as it was (not rerun, machine loaded).
  Rerun at 1 M against the new budget passes. Chromium bvh peak is now 439-521 MB at 1 M (was 404-448 under the race).
- Verify: mesh `pnpm lint` clean, `pnpm build` ok earlier, `pnpm test` 91 passed (13 files); `node scripts/run.mjs checks` exit 0.

**Review passed (sp11-rev2-vwr-50)**

- Ran in `vsslicer/modules/mesh`: `pnpm install --frozen-lockfile` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok,
  `pnpm test` 90 passed, 1 skipped (13 files); `node scripts/run.mjs checks` exit 0.
- Bench at 1 M only (machine loaded): `node --no-warnings test/bench/run.ts --sizes 1` with test-webview's Playwright -> exit 0,
  node peaks 194/249/399 MB, chromium 408/423/456 MB (baseline 251), within the darwin budget; budget.json byte-identical (shasum).
- Problem 1 (stage-boundary race) is fixed: `stages.ts:25-33` awaits `mark` at both edges; Node main thread acks after
  sampling and switching `current` (`node-case.ts:27-32`, worker waits at `:54-57`); Chromium page awaits `__mark` and then
  acks the worker (`chromium-case.ts:54`, `browser-worker.ts:10-18`).
- Mutation probe (600 MB allocation inside the bvh stage only, stages.ts restored byte-identical): exit 1 with only
  `1M node bvh: 998 MB over budget 493 MB` and `1M chromium bvh: 1046 MB over budget 652 MB`; dedup peaks 248 / 456 MB, within budget.
- No wall-time asserts (time recorded only, rule 26). Input is generated fixtures, so no hostile-input surface (rule 25).
  Imports stay inside the module (`../../src/...`); no VS Code API.

Notes for the coordinator (not failures):
- The darwin 20 M entry in `budget.json` was recorded before the handshake fix, under the race: its dedup budget may be
  loose and its bvh budget slightly tight (the 1 M chromium bvh peak rose after the fix). Re-record 20 M when the machine allows.
- Earlier notes still stand: commit the linux budget from a `workflow_dispatch` artifact (1,5,20); `budget.json` is not in the
  published package (`files`), which VWR-76 must handle; the CHANGELOG line and optional `bench` script are not applied yet.
