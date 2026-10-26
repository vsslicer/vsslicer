---
id: 236
title: Emit the 3.0 JSON config and preset names
type: feature
priority: P3
effort: M
model: sonnet
area: [prusa]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [218, 223]
created: 2026-10-25
---

For the 3.0 setting: writes the JSON config for `--load`, places preset names in the private `--datadir`, and uses the 3.0 flags of P7.

**Code:** `vsslicer/modules/slicer-prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] Snapshot tests of the emitted JSON for the fixture profile tuples
- [ ] The datadir layout equals the one the 3.0 report recorded
- [ ] Keys the 3.0 schema lacks are reported

## Tasks

- [ ] JSON writer
- [ ] Datadir layout
- [ ] Snapshots

## Progress

Not started.
