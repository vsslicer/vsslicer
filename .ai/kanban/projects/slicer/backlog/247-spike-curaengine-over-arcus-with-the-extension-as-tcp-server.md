---
id: 247
title: "Spike: CuraEngine over Arcus with the extension as TCP server"
type: spike
priority: P3
effort: M
model: opus
area: [embedded]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP51"
depends_on: [243, 1]
created: 2026-10-25
---

Runs CuraEngine with `connect host:port`, the extension as TCP server, `protobufjs` and `Cura.proto`, and measures what it adds: progress and `LayerOptimized` live layers.

**Code:** `vsslicer/modules/slicer/embedded/` (module: `slicer-embedded`, layer: n/a (spike))

## Acceptance criteria

- [ ] A fixture slices through Arcus end to end; time, progress granularity and layer message sizes recorded
- [ ] A sketch of the live-layer API GCP would consume is written for the report
- [ ] Cancel latency recorded

## Tasks

- [ ] Protocol client
- [ ] Run a fixture
- [ ] Measure
- [ ] Write notes

## Progress

Not started.
