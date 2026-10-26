---
id: 41
title: Enable object labels and exclude-object per firmware flavour
type: feature
priority: P1
effort: M
model: sonnet
area: [orca]
story: US12
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [38, 26, GCP-7]
created: 2026-10-25
---

Sets `gcode_label_objects` and `exclude_object` in the emitted process preset when the flavour supports them, and proves the labelled output with the parser's label reader.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] Klipper output has `EXCLUDE_OBJECT_DEFINE` and one label per object instance (two-object fixture), read by `@vsslicer/gcode`
- [ ] Marlin and RRF fixtures carry their label form and match the objects
- [ ] A flavour without support leaves the keys alone and returns a note

## Tasks

- [ ] Flavour rule table
- [ ] Preset keys
- [ ] Slice fixtures and read labels

## Progress

Not started.
