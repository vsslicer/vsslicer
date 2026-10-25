---
id: 189
title: Embed the job id in a .gcode.3mf through the 3mf module
type: feature
priority: P1
effort: M
model: sonnet
area: [history]
story: US51
milestone: "VSS:M4"
depends_on: [181, VWR-74, 182]
created: 2026-10-25
---

Adds the metadata entry the spike chose through `@vsslicer/3mf` and reads it back.

**Code:** `vsslicer/modules/job-history/src/application/...` (module: `job-history`, layer: `application`)

## Acceptance criteria

- [ ] Round trip: id present, every other part byte-identical (fixture `.gcode.3mf`)
- [ ] Depends on `@vsslicer/3mf` by semver range from the published release

## Tasks

- [ ] Write the entry
- [ ] Read it back
- [ ] Tests

## Progress

Not started.
