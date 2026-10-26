---
id: 107
title: Build a `SliceJob` from an open project plate
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP23"
depends_on: [102, 7, PRF-140, VWR-74, VWR-63]
created: 2026-10-25
---

Reads the plate with the project reader (`ProjectModel` from `3mf` `readProject`), resolves the printer, material and process triple through `profiles`, and returns the job (plate input path, resolved profile, overrides). Depends on modules not wired yet; the code uses ports with fakes until then.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] A fixture H2C project and a fake resolver give the expected job
- [ ] A missing profile or plate gives a typed bad-input error naming it
- [ ] The job never mutates the project file

## Tasks

- [ ] Plate reader port
- [ ] Resolver port
- [ ] Job builder
- [ ] Tests with fakes

## Progress

Not started.
