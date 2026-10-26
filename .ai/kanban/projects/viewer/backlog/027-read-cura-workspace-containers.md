---
id: 27
title: Read Cura workspace containers
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [20]
created: 2026-10-25
---

Reads the `Cura/*.cfg` files as raw INI containers beside the core model; also opens a plain Cura model 3MF.

**Code:** `vsslicer/modules/3mf/src/adapters/cura/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Containers are returned raw and byte-equal to the parts
- [ ] Objects from the core model match the golden
- [ ] A plain Cura model 3MF opens as `cura` or `core` per the detection rule

## Tasks

- [ ] INI container reader
- [ ] Golden

## Progress

Not started.

**Dependency on VWR-12 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-12.
