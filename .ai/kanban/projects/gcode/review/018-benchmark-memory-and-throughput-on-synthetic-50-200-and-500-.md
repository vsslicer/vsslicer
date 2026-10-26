---
id: 18
title: "Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI"
type: feature
priority: P0
effort: S
model: sonnet
area: [parser]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-18-worker
depends_on: [6, 17]
created: 2026-10-25
---

Turns the memory budget into a CI gate.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Input from GCP-17 (D17)

- Generate two profiles, measured on the corpus with `@vsslicer/gcode-parser@0.8.5` at default arc settings:
  - **straight**: about 33k moves per MB, the corpus mean, at about 30 B per move.
  - **arc-heavy**: about 57k moves per MB, modelled on `bambu-studio/cylinder-arcs-on.gcode`. Of its
    moves, 72% are arc chords, at about 5.5 chords per G2/G3. The arc sizes are not measured; under 82° keeps 15° chords.
- Expected moves at 50 / 200 / 500 MB: 1.67M / 6.7M / 16.7M (straight) and 2.86M / 11.4M / 28.6M (arc-heavy).
- Bytes per move: `moves` is 28 B (`MOVE_STRIDE`), and the `extrusion` column adds 4 B, 32 B in total.
  Gate on the 28 B move record and report the 32 B total. The arc-heavy 500 MB case is 800 / 914 MB:
  if its peak RSS goes over budget, D17 schedules the far-zoom merge in E5.
- Use a seeded PRNG so the output is the same on every run, and use MB = 10^6 bytes as GCP-17 does.

## Acceptance criteria

- [x] A generator produces synthetic 50, 200 and 500 MB files deterministically
- [ ] Move buffers are at or under 28 bytes per move and peak worker RSS is recorded in CI
- [x] Throughput per size is recorded; a regression beyond the recorded budget fails the run

## Tasks

- [x] Synthetic generator
- [x] RSS and throughput measurement
- [ ] CI job and budget file

## Progress

Done locally; the CI part is not (so two criteria stay unticked: "peak worker RSS is recorded in CI" and "CI job").

- `bench/generate.ts`: seeded (mulberry32) generator, `straight` (34.1k moves/MB) and `arc-heavy` (57.8k moves/MB, 73% chords, 5.8 chords per arc, no arc-invalid diagnostics). Test `test/bench-generator.test.ts` checks determinism, exact size, density and arc validity.
- `bench/case.ts` parses one file in its own process (collect, keeps all buffers) and prints moves, buffer bytes, seconds, maxRSS. `bench/run.ts` (`pnpm bench [--update] [--sizes 50,200,500]`) writes files to a mktemp dir, runs the cases, fails on over 28 B per move record, RSS over budget or MB/s under budget.
- `bench/budget.json`: budget (RSS x1.25, speed x0.6 of measured) plus measurements and the machine (Apple M1 Pro, 8 cores, 16 GB, Node 26.12.1).
- Measured (peak RSS MB / MB/s): straight 140/104, 299/117, 611/109 at 50/200/500 MB; arc-heavy 179/80, 446/87, 990/86. 28 B per move record, 32 B with extrusion everywhere. Arc-heavy 500 MB peaks at 990 MB RSS (its buffers are 915 MB), against D17's 914 MB estimate; the 500 MB case was run once.
- RSS is the whole child process (main-thread parse, not `parseInWorker`), the same parser code.
- Verified: `pnpm lint`, `pnpm test`, `pnpm build` pass; `pnpm bench --sizes 50,200` passes against the budget; an edited budget (999 MB/s, 10 MB) makes it exit 1 with both messages.
- Not done: CI. `.github/workflows/ci.yml` runs a generic changed-module matrix (`run.mjs ci`), no per-module jobs, and there is no remote (Q7), so the bench is not wired; `pnpm bench` needs about 1 GB and 35 s. The coordinator can add it as a dedicated step if wanted.
- Files: vsslicer/modules/gcode-parser/{bench/generate.ts,bench/case.ts,bench/run.ts,bench/budget.json,test/bench-generator.test.ts,package.json (bench script),tsconfig.test.json (bench included),CHANGELOG.md (Unreleased)}; .reference/notes/GCP-18-benchmark.md.

Review passed; CI step waits on Q7
