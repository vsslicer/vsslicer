---
id: 16
title: "Open .gcode.3mf plates with statistics, thumbnails and MD5 check"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US5
milestone: "VSS:M1"
depends_on: [15, 8]
created: 2026-10-25
---

Plate selection and the BBL metadata.

## Acceptance criteria

- [ ] Bambu Studio and Orca BBL files open by plate N with `slice_info.config` statistics and `plate_N.png`
- [ ] An MD5 mismatch against `plate_N.gcode.md5` raises a diagnostic (test with a doctored file)
- [ ] The H2C fixture opens (Bambu Studio version recorded)

## Tasks

- [ ] Plate enumeration
- [ ] slice_info.config reader
- [ ] MD5 check
- [ ] H2C fixture test

## Progress

Not started.
