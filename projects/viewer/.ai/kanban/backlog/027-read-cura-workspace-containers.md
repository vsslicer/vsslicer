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
depends_on: [20, 12]
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
