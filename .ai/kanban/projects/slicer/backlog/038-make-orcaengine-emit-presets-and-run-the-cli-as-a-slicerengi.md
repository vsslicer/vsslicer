---
id: 38
title: Make `OrcaEngine` emit presets and run the CLI as a `SlicerEngine`
type: feature
priority: P0
effort: M
model: sonnet
area: [orca, engine]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [35, 36, 37, 24, 7]
created: 2026-10-25
---

Composes emission, the CLI driver and warnings: `slice(job)` writes presets into the staging directory, runs Orca, returns staged G-code and the removed `post_process` list.

**Code:** `vsslicer/modules/slicer/orca/src/application/...` (module: `slicer-orca`, layer: `application`)

## Acceptance criteria

- [ ] The contract suite passes against `OrcaEngine` with the stub binary
- [ ] A job with a resolved H2C profile slices the fixture plate with the installed Orca locally
- [ ] Emission errors surface as `bad input` typed errors with the key named

## Tasks

- [ ] Compose
- [ ] Contract suite
- [ ] Local smoke test

## Progress

Not started.
