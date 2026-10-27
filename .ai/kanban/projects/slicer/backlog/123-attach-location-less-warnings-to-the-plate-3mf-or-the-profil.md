---
id: 123
title: Attach location-less warnings to the plate 3MF or the profile file
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks]
story: US19
milestone: "VSS:M3"
sprint: "VSS:SP26"
depends_on: [122]
created: 2026-10-25
---

Warnings without a file get a file: the profile file when the key came from a profile, else the plate's 3MF.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] A key warning maps to the profile file URI; a general warning maps to the 3MF
- [ ] Unknown origin falls back to the 3MF, never to no file

## Tasks

- [ ] Mapping rule
- [ ] Tests

## Progress

Not started.
