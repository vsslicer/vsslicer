---
id: 79
title: Write the core model and Production split models
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [78, 16, 17, 18]
created: 2026-10-25
---

Serialises a `Project` to `3D/3dmodel.model` and `3D/Objects/object_N.model` with build items, components, transforms and UUIDs, as the Production extension lays them out.

**Code:** `vsslicer/modules/3mf/src/adapters/core/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Written fixtures read back through `readProject` to an equal `Project`
- [ ] The written files pass the Consortium conformance harness (the CI suite of the reader)
- [ ] Two saves of an unchanged project keep every UUID
- [ ] Verified on fixtures only (D5)

## Tasks

- [ ] Core model XML writer
- [ ] Production split models and component references
- [ ] Round-trip tests

## Progress

Not started.
