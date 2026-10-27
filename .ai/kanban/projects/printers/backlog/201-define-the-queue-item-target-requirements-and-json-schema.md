---
id: 201
title: "Define the queue item, target, requirements and JSON Schema"
type: feature
priority: P2
effort: M
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [200]
created: 2026-10-25
---

`{id, plate_ref, gcode_path, target (printer|group|any), requires {nozzle, material, model}, state, added_at, history_id}` with a `v` field.

**Code:** `vsslicer/modules/printer/fleet-queue/src/domain/...` (module: `fleet-queue`, layer: `domain`)

## Acceptance criteria

- [ ] Types plus a checked-in JSON Schema; property tests reject invalid items
- [ ] `gcode_path` and `plate_ref` follow the sliced artefact reference shape of `slicer-api` as plain strings

## Tasks

- [ ] Types
- [ ] Schema
- [ ] Property tests

## Progress

Not started.
