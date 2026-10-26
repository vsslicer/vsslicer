---
id: 53
title: Add a spool from the catalogue or blank
type: feature
priority: P1
effort: S
model: sonnet
area: [ui]
story: US23
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [52, 21]
created: 2026-10-25
---

QuickPick over the catalogue (search brand, name, EAN) or a blank spool; archive and restore commands.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Add from catalogue creates a spool with the filament's weights, diameter and ids (integration test on the fixture catalogue)
- [ ] A blank spool can be added; archive and restore round trip

## Tasks

- [ ] QuickPick
- [ ] Create flow
- [ ] Archive and restore
- [ ] Integration test

## Progress

Not started.
