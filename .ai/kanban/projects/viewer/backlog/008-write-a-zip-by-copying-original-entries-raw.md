---
id: 8
title: Write a zip by copying original entries raw
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US2
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [7]
created: 2026-10-25
---

The save path: assembles a zip from original compressed entries (copied untouched) plus any new or replaced entries, in original order, so an unchanged package is identical byte for byte.

**Code:** `vsslicer/modules/3mf/src/adapters/zip/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Writing an unmodified package from the Package yields identical bytes for the test archives (central directory and entry order included)
- [ ] Entries added or replaced are stored with deflate; others are copied raw
- [ ] Result is a valid zip readable by `unzip -t` and fflate

## Tasks

- [ ] Local-header copier or fflate raw path as chosen by the spike
- [ ] Central directory writer
- [ ] Round-trip tests

## Progress

Not started.
