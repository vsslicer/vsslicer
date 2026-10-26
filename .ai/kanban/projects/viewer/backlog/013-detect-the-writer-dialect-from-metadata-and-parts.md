---
id: 13
title: Detect the writer dialect from metadata and parts
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US4
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [3]
created: 2026-10-25
---

A pure function over core metadata and the part list that returns the dialect, mirroring the slicers' own rules.

**Code:** `vsslicer/modules/3mf/src/domain/detectDialect.ts` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [ ] Returns bambu, orca, prusa2, prusa3, cura or core for each fixture, including the Orca file with a `BambuStudio-` Application string and the Prusa 3.0 alpha
- [ ] The Prusa 2.99.1 legacy cut-off and the `Cura/` folder rule are covered by tests
- [ ] Unknown writers return `core` with the Application string kept

## Tasks

- [ ] Write the rules
- [ ] Table-driven tests from fixtures

## Progress

Not started.

**Dependency on VWR-10, VWR-11, VWR-12 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-10, VWR-11, VWR-12.
