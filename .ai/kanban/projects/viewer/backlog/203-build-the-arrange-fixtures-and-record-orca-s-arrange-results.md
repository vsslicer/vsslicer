---
id: 203
title: "Build the arrange fixtures and record Orca's arrange results"
type: chore
priority: P1
effort: M
model: sonnet
area: [arrange]
story: US62
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [202, PLT-13]
created: 2026-10-25
---

Sets of 10, 50 and 200 mixed object footprints and beds (rectangular, circular, with exclusion areas) as plain JSON, with Orca's GUI arrange result (placed count and bed utilisation) recorded once per fixture and a PROVENANCE.md.

**Code:** `vsslicer/modules/core/arrange/test/fixtures/` (module: `arrange`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Nine fixtures (three sizes by three bed kinds) with the recorded Orca result and Orca version
- [ ] PROVENANCE.md states how the Orca result was produced
- [ ] The fixtures check passes

## Tasks

- [ ] Generate footprints
- [ ] Run Orca arrange by hand
- [ ] Record results

## Progress

Not started.
