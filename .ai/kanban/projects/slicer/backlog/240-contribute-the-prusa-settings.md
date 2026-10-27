---
id: 240
title: Contribute the Prusa settings
type: feature
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [239, 101]
created: 2026-10-25
---

Settings `vsslicer.slicer.prusa.path` and `vsslicer.slicer.prusa.useVersion3` (default false), plus the download offer with the confirmation of the existing flow.

**Code:** `vsslicer/modules/apps/slicer/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Settings show with descriptions and defaults; the download offer names the pinned version and size
- [ ] The 3.0 setting is marked experimental in its description
- [ ] A test reads each through the config adapter

## Tasks

- [ ] package.json contributions
- [ ] Config adapter
- [ ] Download offer wiring

## Progress

Not started.
