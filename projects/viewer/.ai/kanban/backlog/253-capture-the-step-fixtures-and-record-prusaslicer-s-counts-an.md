---
id: 253
title: "Capture the STEP fixtures and record PrusaSlicer's counts and volumes"
type: chore
priority: P1
effort: M
model: sonnet
area: [step, mesh]
story: US67
milestone: "VSS:M4"
depends_on: [251, PLT-13]
created: 2026-10-25
---

STEP files (single solid, assembly with several solids, AP203, AP214, curved faces, an unsupported-schema file, an empty file) with PrusaSlicer's solid count and volumes recorded per file and a PROVENANCE.md.

**Code:** `vsslicer/modules/mesh-step/test/fixtures/` (module: `mesh-step`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Seven fixtures with the PrusaSlicer release and the recorded counts and volumes
- [ ] The error fixtures exist
- [ ] The fixtures check passes (size cap and provenance)

## Tasks

- [ ] Collect or generate
- [ ] Import in PrusaSlicer
- [ ] Record

## Progress

Not started.
