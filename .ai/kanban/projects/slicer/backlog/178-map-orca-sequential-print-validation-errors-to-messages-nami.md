---
id: 178
title: Map Orca sequential-print validation errors to messages naming the objects
type: feature
priority: P2
effort: S
model: sonnet
area: [orca]
story: US58
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [20, 159]
created: 2026-10-25
---

Maps `CLI_VALIDATE_ERROR` text for collisions and height in one-at-a-time mode to a typed error that names the objects involved.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] The colliding fixture ends in a typed error whose message names both objects; the test uses recorded Orca output
- [ ] A height error names the tallest object and the limit
- [ ] An unrecognised validation text keeps the original text and the generic error

## Tasks

- [ ] Record the error texts
- [ ] Parse object names
- [ ] Tests

## Progress

Not started.
