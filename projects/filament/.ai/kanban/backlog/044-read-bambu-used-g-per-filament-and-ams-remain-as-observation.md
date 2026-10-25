---
id: 44
title: Read Bambu used_g per filament and AMS remain as observations
type: feature
priority: P1
effort: M
model: opus
area: [consumption]
story: US15
milestone: "VSS:M4"
depends_on: [39, PRN-48, PRN-148, VWR-74, PRN-320, PRN-334]
created: 2026-10-25
---

Read the job's `.gcode.3mf` `slice_info.config` `used_g` per filament with `@vsslicer/3mf` readProject (file fetched through the printer session's file operations), map it through the AMS mapping recorded at send, and store `remain`, `remain_g`, `tag_uid` and `tray_uuid` per tray as observations compared with the booking.

UNRESOLVED: needs printer-bambu: the AMS mapping recorded at send attached to the job record and the extra tray fields (`remain_g`, `tag_uid`, `tray_uuid`) exposed to consumers.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] On `.gcode.3mf` fixtures with recorded AMS mappings, `used_g` books to the right spool; the observations match the expected `remain` values
- [ ] A job started outside VSSlicer (no recorded mapping) books nothing, keeps observations and returns a manual-entry prompt result
- [ ] Verified on fixtures here; the H2C check is a separate card

## Tasks

- [ ] Write the reader call
- [ ] Map through the AMS mapping
- [ ] Observation storage
- [ ] Fixture tests

## Progress

Not started.
