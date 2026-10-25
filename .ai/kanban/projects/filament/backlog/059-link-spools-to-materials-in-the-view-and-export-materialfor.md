---
id: 59
title: Link spools to materials in the view and export materialFor
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US27
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [58, 52, PRF-59]
created: 2026-10-25
---

Auto-link when a spool is added, a QuickPick for ambiguous cases, the "Install VSSlicer Profiles" prompt, and `materialFor(spoolId)` in the extension's exports for SLC and PRN.

UNRESOLVED: needs profiles-extension: an exported accessor for the live `ProfileStore` lookup (PRF-57 only creates the module).

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A spool added from the OFD Bambu PLA Basic record gets `material_profile_id` of the `GFA00` material (integration test with the profiles fixtures)
- [ ] With the profiles extension disabled the prompt "Install VSSlicer Profiles" shows and nothing else breaks (catches hard coupling)
- [ ] `materialFor(spoolId)` returns the id or undefined

## Tasks

- [ ] Auto-link
- [ ] QuickPick
- [ ] Install prompt
- [ ] Export
- [ ] Integration test

## Progress

Not started.
