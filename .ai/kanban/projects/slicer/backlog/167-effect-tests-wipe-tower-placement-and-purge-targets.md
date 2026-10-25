---
id: 167
title: "Effect tests: wipe tower placement and purge targets"
type: chore
priority: P2
effort: M
model: sonnet
area: [engine, multimaterial]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [87, 160, GCP-4]
created: 2026-10-25
---

Effect tests for `wipe_tower_x`, `wipe_tower_y`, tower type and `flush_into_infill/objects/support`: the tower role's bounding box and the purge moves' roles in the parsed G-code.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] The tower role's bounding box is within 1 mm of the placed position for three placements
- [ ] With each purge target on, purge moves appear in the chosen role and not in the others
- [ ] An engine without a key asserts its `unsupported` entry

## Tasks

- [ ] Tower bounding-box helper
- [ ] Define the tests
- [ ] Canned G-code tests

## Progress

Not started.
