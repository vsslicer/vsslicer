---
id: 357
title: "Clamp profiles to the plate printer's layer height limits"
type: feature
priority: P2
effort: S
model: sonnet
area: [editor, plates]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [356, 183, 179]
created: 2026-10-25
---

Reads the minimum, maximum and first layer height from the settings resolved for the object's plate and printer, and clamps edits and computed profiles to them.

**Code:** `vsslicer/modules/project-extension/src/application/layerheight/limits.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] An edit that goes below the printer's minimum is clamped and reports it
- [ ] Changing the plate printer to one with other limits flags profiles that now violate them
- [ ] The limits shown are those of the plate's own printer

## Tasks

- [ ] Limits from resolved settings
- [ ] Clamp and flag
- [ ] Tests

## Progress

Not started.
