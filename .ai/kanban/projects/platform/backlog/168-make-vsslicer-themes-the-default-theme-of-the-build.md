---
id: 168
title: Make `vsslicer.themes` the default theme of the build
type: feature
priority: P3
effort: XS
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP36"
depends_on: [148, 144]
created: 2026-10-25
---

Adds `configurationDefaults` for `workbench.colorTheme` and `workbench.iconTheme` to the overlay.

**Code:** `vsslicer/modules/vsslicer-build/src/application/defaults.ts` (module: `vsslicer-build`, layer: `application`)

## Acceptance criteria

- [ ] The build output sets the dark VSSlicer theme and the VSSlicer icon theme as defaults
- [ ] A smoke assertion reads the effective setting in a fresh profile
- [ ] Users can still change theme

## Tasks

- [ ] Add the defaults
- [ ] Add the smoke assertion

## Progress

Not started.
