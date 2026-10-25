---
id: 51
title: Assemble the `.gcode.3mf` archive through the `3mf` container API
type: feature
priority: P1
effort: M
model: sonnet
area: [engine]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [50, VWR-73]
created: 2026-10-25
---

Writes the zip through the `3mf` module's container API (create container, add parts). The archive has the G-code, MD5, thumbnails and config parts and no mesh.

**Code:** `vsslicer/modules/slicer-output/src/adapters/...` (module: `slicer-output`, layer: `adapters`)

## Acceptance criteria

- [ ] Part list equals Orca's `--export-3mf` part list for the fixture plate (names and order of parts that matter)
- [ ] The archive opens with `3mf` validation without errors
- [ ] Writing is deterministic: the same input gives the same bytes

## Tasks

- [ ] Adapter for the container API
- [ ] Part naming
- [ ] Determinism test

## Progress

Not started.
