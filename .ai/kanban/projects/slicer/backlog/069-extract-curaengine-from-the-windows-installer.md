---
id: 69
title: Extract CuraEngine from the Windows installer
type: feature
priority: P1
effort: M
model: opus
area: [cura]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [14, 67]
created: 2026-10-25
---

Extracts CuraEngine without running the installer (unverified how: archive tooling over the NSIS installer or an official zip if one exists).

**Code:** `vsslicer/modules/slicer-cura/src/adapters/...` (module: `slicer-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] On the Windows runner the extracted CuraEngine reports its version without running an installer
- [ ] If no safe extraction works, the card records that and the adapter supports detection only on Windows, with the message
- [ ] Failures remove the partial directory

## Tasks

- [ ] Find an extraction route
- [ ] Implement
- [ ] Windows runner test

## Progress

Not started.
