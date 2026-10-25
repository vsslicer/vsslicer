---
id: 70
title: "Match, create and assign from a tray report"
type: feature
priority: P2
effort: L
model: opus
area: [tags]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [69, 36, 20, PRN-14]
created: 2026-10-25
---

On each tray report: match a spool by `tag_uid` then `tray_uuid`; otherwise, per the setting ask, always or never, create a spool linked to the catalogue filament whose `slicer_ids.bambu` equals `tray_info_idx` (falling back to the tray fields) and assign it to the slot; a tray swap reassigns the slot.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Recorded tray fixtures: a tagged tray matches an existing spool by `tag_uid`; an unknown tag creates a spool linked to the `GFA00` catalogue filament; an all-zero `tag_uid` creates nothing
- [ ] A tray swap reassigns the slot (catches stale slots); the same report twice changes nothing
- [ ] A tag already on another spool is flagged, not merged; the setting `never` creates nothing and `ask` returns a pending decision

## Tasks

- [ ] Write the handler
- [ ] Create from catalogue or tray fields
- [ ] Swap and clone cases
- [ ] Fixture tests

## Progress

Not started.
