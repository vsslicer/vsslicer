---
id: 298
title: Round-trip cut information and connector volume metadata on Orca fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [3mf]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [83, 24, 80, 275]
created: 2026-10-25
---

Closes the cut part of the persistence row: `cut_information.xml` (cut id, check sum, connectors count) and the per-volume connector metadata in `model_settings.config` read and write back. Gaps found are fixed in this card.

**Code:** `vsslicer/modules/3mf/test/roundtrip/cut/` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] The Orca cut fixture with plug, dowel, snap and dovetail connectors writes back with equal cut information and equal connector metadata (canonical XML compare)
- [ ] Cut ids and check sums are preserved across two saves
- [ ] A project with no cut writes no `cut_information.xml`

## Tasks

- [ ] Round-trip harness
- [ ] Fix gaps

## Progress

Not started.
