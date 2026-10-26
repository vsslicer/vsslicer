---
id: 71
title: Install CuraEngine from the pinned release into global storage
type: feature
priority: P1
effort: S
model: sonnet
area: [cura]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [68, 69, 17]
created: 2026-10-25
---

Download with the verified downloader, extract per platform, apply the macOS decision from the Orca spike, register the install.

**Code:** `vsslicer/modules/slicer-cura/src/adapters/...` (module: `slicer-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Fixture archive installs end to end on the three runners
- [ ] Checksum failure leaves nothing
- [ ] macOS follows the recorded decision

## Tasks

- [ ] Compose download and extract
- [ ] Register
- [ ] Tests

## Progress

Not started.
