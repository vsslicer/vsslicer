---
id: 127
title: "CI chain: open a plate, slice, preview and upload against the fake printer"
type: chore
priority: P0
effort: M
model: opus
area: [tasks, engine]
story: US25
milestone: "VSS:M3"
sprint: "VSS:SP26"
depends_on: [126, 120, 42, 54, 26, PRN-48]
created: 2026-10-25
---

The I5 end-to-end chain in CI with the pinned Orca: Bambu 3MF plate, imported profile, slice, `.gcode.3mf` assembly, preview opens, upload to the fake MQTT broker and FTPS fixture from PRN.

**Code:** `vsslicer/modules/apps/slicer/` (module: `slicer-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The chain passes on the Linux job with the pinned Orca and PRN's fake broker and FTPS fixture
- [ ] The uploaded file equals the `.gcode.3mf` in `.vsslicer/sliced/` byte for byte
- [ ] A failure in any step names the step

## Tasks

- [ ] Compose the chain
- [ ] Use PRN fixtures
- [ ] CI job

## Progress

Not started.
