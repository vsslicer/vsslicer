---
id: 30
title: "Read Cura definitions, extruders and variants"
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [135, 136, 121]
created: 2026-10-25
---

Reads Cura `definitions`, `extruders` and `variants` with the Cura inheritance and stack order, keeping `=expr` values verbatim as `{expr}`.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/definitions/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Golden counts at Cura@5bea2f8: 706 definitions, 544 extruders, 1 741 variants
- [ ] Cura stack order (definition, extruder, variant, quality, user) resolved on a hand-built fixture
- [ ] `=expr` values are stored as `{expr: ".."}` and never evaluated (E11 Risks)

## Tasks

- [ ] Read definitions and inherits
- [ ] Read extruders and variants
- [ ] Keep `{expr}` verbatim
- [ ] Golden-count tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.
