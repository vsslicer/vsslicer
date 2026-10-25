---
id: 12
title: "Define the catalogue entry type, the group list and per-setting override scope"
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US4
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [2]
created: 2026-10-25
---

Designs the shape of one catalogue entry (group, home entity, type, unit, enum, bounds, default, per-extruder flag, label, tooltip, native names per dialect, conversion, `hidden`) and records where each setting may be overridden (object, part, height range) for the VWR object-editing epic. Orca key names are canonical (D9).

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] The entry type covers every column of the epic's catalogue description plus `override_scope: [plate, object, part, height_range]`, `hidden`, `native_only`, `provenance` and a `prefix` for `prusa.`/`cura.`/`bambu.`/`superslicer.` keys
- [ ] The group list is the 14 FFF groups of the epic table (`layers ... plate`), with `sla`/`milling` reserved and rejected for now
- [ ] Conversion kinds are a closed set: identity, scale, sign flip, percent-of, enum map, split/join; each has a type and a test
- [ ] A schema test rejects an entry with no group or home entity

## Tasks

- [ ] Design the entry and conversion types
- [ ] Write the group table
- [ ] Write the validation tests

## Progress

Not started.
