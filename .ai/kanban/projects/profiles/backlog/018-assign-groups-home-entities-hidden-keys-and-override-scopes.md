---
id: 18
title: "Assign groups, home entities, hidden keys and override scopes"
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US8
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [15, 16, 17]
created: 2026-10-25
---

The judgement pass: every catalogue key gets one of the 14 groups and a home entity per the epic's table, hidden keys are flagged, and the override scope of each setting is recorded.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/data/groups.json` and `vsslicer/modules/profile-api/tools/catalogue/` (module: `profile-api`, layer: n/a (generated data))

## Acceptance criteria

- [ ] No key lacks a group or home entity; retraction keys live in `machine` with a material override
- [ ] Group sums match the epic table within the documented `hidden` keys; a report lists the hidden keys with reasons
- [ ] Each key has an `override_scope`; P1 groups (`multi_material`, `special`, `plate`) are present as schema and pass-through

## Tasks

- [ ] Apply the group table
- [ ] Review each hidden key against the VSS-3 dump
- [ ] Record override scopes
- [ ] Generate the group-count report

## Progress

Not started.
