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
sprint: "VSS:SP3"
depends_on: [6, 17]
created: 2026-10-25
---

Turns the memory budget into a CI gate.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

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
