---
id: 70
title: Detect installed CuraEngine and probe its version
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP25"
depends_on: [7, 67]
created: 2026-10-25
---

Looks inside installed Cura apps on each OS and at `vsslicer.slicer.cura.path`; unsupported versions warn naming the pinned one.

**Code:** `vsslicer/modules/slicer/cura/src/adapters/...` (module: `slicer-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Stub installs per OS layout are found and the setting wins
- [ ] Version mismatch gives a warning naming the pinned version
- [ ] Missing gives `not installed`

## Tasks

- [ ] Paths per OS
- [ ] Version probe
- [ ] Tests

## Progress

Not started.
