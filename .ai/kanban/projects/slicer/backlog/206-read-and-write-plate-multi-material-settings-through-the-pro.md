---
id: 206
title: Read and write plate multi-material settings through the project model and ProfileStore
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [VWR-201, VWR-170, PRF-140, 205, VWR-316]
created: 2026-10-25
---

The data path of the panel: reads tower, flush, purge, assignment and nozzle-map values with their sources and writes plate and profile settings.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] Values read from a fixture project show their source (profile, plate, object)
- [ ] A write changes only the keys of the edited section and goes through the project model's undo (stub of the project API in the test)
- [ ] An engine that lacks a key reports it through the capability table, and the data path marks the section disabled

## Tasks

- [ ] Read model
- [ ] Write commands
- [ ] Capability gating
- [ ] Tests

## Progress

Not started.
