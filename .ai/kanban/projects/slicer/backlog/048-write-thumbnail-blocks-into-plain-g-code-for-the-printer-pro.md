---
id: 48
title: "Write thumbnail blocks into plain G-code for the printer profile's formats"
type: feature
priority: P1
effort: M
model: sonnet
area: [engine]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [44, 46, 47, GCP-7]
created: 2026-10-25
---

Pure text transform: takes G-code and rendered images and inserts the comment blocks for each format named by `thumbnails_format`, with sizes and counts from the profile.

**Code:** `vsslicer/modules/slicer-output/src/domain/...` (module: `slicer-output`, layer: `domain`)

## Acceptance criteria

- [ ] Each of PNG, JPG, QOI, BTT TFT and ColPic blocks is inserted and read back by `@vsslicer/gcode`'s thumbnail extraction (or the documented marker for formats it cannot decode)
- [ ] No format named means one 300x300 PNG and a warning
- [ ] Original G-code bytes outside the insertion are unchanged (test by diff)
- [ ] A file that already has thumbnails is not given duplicates

## Tasks

- [ ] Block writers per format
- [ ] Insertion point rules
- [ ] Read-back tests

## Progress

Not started.
