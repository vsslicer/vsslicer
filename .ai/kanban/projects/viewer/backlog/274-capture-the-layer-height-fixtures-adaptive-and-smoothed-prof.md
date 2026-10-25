---
id: 274
title: "Capture the layer-height fixtures: adaptive and smoothed profiles and height ranges from Orca and PrusaSlicer 2.x"
type: chore
priority: P2
effort: S
model: sonnet
area: [mesh, 3mf]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP32"
created: 2026-10-25
---

The oracle for the layer-height port: Orca saves a project after adaptive and smooth runs, and the profile is recorded once per fixture. Shared by `mesh`, `3mf` and `project-extension`.

**Code:** `vsslicer/fixtures/layer-height/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] Three meshes (a sphere, a stepped cone, a vase) each with Orca's adaptive profile at two quality values and its smoothed profile at two radii, taken from the saved `layer_heights_profile.txt`
- [ ] One Orca project with a layer height range plus override, one PrusaSlicer 2.x project with a profile and a range
- [ ] Printer limits (min and max layer height, first layer height) used are recorded beside each profile
- [ ] App versions and steps are in a README

## Tasks

- [ ] Make the projects
- [ ] Extract the profiles
- [ ] README

## Progress

Not started.
