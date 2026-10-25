---
id: 18
title: "Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP4"
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

- [ ] A generator produces synthetic 50, 200 and 500 MB files deterministically
- [ ] Move buffers are at or under 28 bytes per move and peak worker RSS is recorded in CI
- [ ] Throughput per size is recorded; a regression beyond the recorded budget fails the run

## Tasks

- [ ] Synthetic generator
- [ ] RSS and throughput measurement
- [ ] CI job and budget file

## Progress

Not started.
