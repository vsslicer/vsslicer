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

- [x] Writing an unmodified package from the Package yields identical bytes for the test archives (central directory and entry order included)
- [x] Entries added or replaced are stored with deflate; others are copied raw
- [x] Result is a valid zip readable by `unzip -t` and fflate

## Tasks

- [x] Local-header copier or fflate raw path as chosen by the spike
- [x] Central directory writer
- [x] Round-trip tests

## Progress

Review fix round: `parse()` in zipWriter.ts now rejects duplicate entry names and duplicate local offsets, and requires each local header (30 + name + extra from the local header) plus the central record's compressed size (ZIP64-aware) plus a minimum 12-byte data descriptor when flagged to end at or before the next entry start or the central directory (CorruptZipError otherwise). Next-start lookup is a Map (the indexOf version made 65535 entries quadratic). `null` removal from VWR-9 still works (tested). New tests in test/zipWriter.test.ts: shared offset, overlapping sizes, planted PK\3\4 offset, duplicate names, null removal. lint, build, 132 tests pass. Not done: descriptor signature/ZIP64 widths are not checked (minimum only); fflateZip.ts untouched (shared reader is a follow-up).
Changelog: 3mf: writeZip rejects overlapping entries, shared local offsets and duplicate entry names as CorruptZipError.
