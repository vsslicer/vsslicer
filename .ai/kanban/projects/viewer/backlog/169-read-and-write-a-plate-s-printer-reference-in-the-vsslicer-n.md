---
id: 169
title: "Read and write a plate's printer reference in the VSSlicer namespace"
type: feature
priority: P1
effort: S
model: sonnet
area: [plates, 3mf]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP19"
depends_on: [166, 84]
created: 2026-10-25
---

Stores the printer instance id of a plate as a namespace record; the Orca-readable part is untouched.

**Code:** `vsslicer/modules/3mf/src/adapters/vsslicer/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] A reference round-trips; an unknown instance id is preserved
- [ ] A file with the reference still opens in the reader of a tool that ignores the part (fixture with the part kept raw)

## Tasks

- [ ] Record type
- [ ] Reader and writer
- [ ] Tests

## Progress

Not started.
