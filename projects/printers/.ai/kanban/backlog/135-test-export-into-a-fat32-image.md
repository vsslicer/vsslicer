---
id: 135
title: Test export into a FAT32 image
type: chore
priority: P0
effort: M
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
depends_on: [134]
created: 2026-10-25
---

Export into a mounted loopback FAT image on Linux CI and read the directory back.

**Code:** `vsslicer/modules/printer-folder/test/` (module: `printer-folder`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] With long names off only 8.3 entries are present; with long names on the long name is stored
- [ ] If loopback mounting is unavailable on the runner the test uses mtools on an image and the note says so

## Tasks

- [ ] Image fixture
- [ ] Mount or mtools
- [ ] Assertions

## Progress

Not started.
