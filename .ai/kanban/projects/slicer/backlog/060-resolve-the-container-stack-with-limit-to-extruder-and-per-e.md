---
id: 60
title: Resolve the container stack with `limit_to_extruder` and per-extruder values
type: feature
priority: P1
effort: L
model: opus
area: [cura]
story: US14
milestone: "VSS:M3"
sprint: "VSS:SP24"
depends_on: [59]
created: 2026-10-25
---

Applies the stack order definition, variant, material, quality, intent, user for the global stack and each extruder stack, then `limit_to_extruder` routing so support and adhesion settings come from the right extruder. Input types are defined here structurally; PRF's stack satisfies them.

**Code:** `vsslicer/modules/core/cura-settings/src/domain/...` (module: `cura-settings`, layer: `domain`)

## Acceptance criteria

- [ ] Order is tested with one setting present in every container (the user value wins, then intent, quality, and so on)
- [ ] `limit_to_extruder` routes a support setting to the limited extruder's value on a two-extruder fixture (regression: the other extruder's temperature)
- [ ] Formulas are evaluated lazily in dependency order with a cycle error naming the keys

## Tasks

- [ ] Stack model
- [ ] Order and routing
- [ ] Dependency order and cycles

## Progress

Not started.
