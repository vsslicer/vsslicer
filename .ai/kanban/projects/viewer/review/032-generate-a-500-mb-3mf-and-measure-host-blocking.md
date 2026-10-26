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
