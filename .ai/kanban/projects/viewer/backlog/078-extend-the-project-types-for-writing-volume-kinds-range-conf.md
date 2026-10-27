---
id: 78
title: "Extend the Project types for writing: volume kinds, range config, namespace records, conversion report"
type: feature
priority: P1
effort: S
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [14]
created: 2026-10-25
---

Additive domain types the writer needs: the volume kind of a part (part, negative, modifier, support enforcer, support blocker), layer-range config entries, VSSlicer namespace records, a stable UUID per object and part, and the `ConversionReport` and `SaveNotice` types. No behaviour change for readers.

**Code:** `vsslicer/modules/core/3mf/src/domain/project/` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [ ] Every new field is optional or defaulted, so the existing reader goldens do not change
- [ ] A stable-UUID function returns the same value for the same seed and a new valid UUID for a new object
- [ ] `ConversionReport` lists converted data and preserved-only data by name; `SaveNotice` lists removed artefacts
- [ ] No I/O in the folder (lint)

## Tasks

- [ ] Add the types
- [ ] UUID helper
- [ ] Type tests

## Progress

Not started.
