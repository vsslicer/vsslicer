---
id: 23
title: Create the vsslicer extension pack skeleton
type: feature
priority: P0
effort: S
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [21]
created: 2026-10-25
---

`extensions/pack` with `extensionPack` listing shipped extensions (empty until `vsslicer.gcode`, E68) and the README that markets the suite.

## Acceptance criteria

- [ ] `extensions/pack` packages to a VSIX through the common `package` task
- [ ] `extensionPack` is generated from a list of shipped extension ids; adding `vsslicer.gcode` is a one-line change
- [ ] Pack passes the licence and content checks

## Tasks

- [ ] Create the package
- [ ] Add generation of `extensionPack`
- [ ] Write the README

## Progress

Not started.
