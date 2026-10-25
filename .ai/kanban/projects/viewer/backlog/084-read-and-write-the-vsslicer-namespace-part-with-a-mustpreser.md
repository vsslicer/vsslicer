---
id: 84
title: Read and write the VSSlicer namespace part with a MustPreserve relationship
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [78, 20, 9]
created: 2026-10-25
---

Our own data lives in `Metadata/vsslicer/*` (versioned JSON records keyed by owner: plate printer, STEP source path and similar). The part is registered with a MustPreserve relationship and read back into the `Project`. `Application` is `VSSlicer-<version>`.

**Code:** `vsslicer/modules/3mf/src/adapters/vsslicer/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] A record written is read back equal; an unknown record from a newer version is preserved on save
- [ ] The relationship and content type are registered by `addPart` and survive a save by a tool that ignores them (fixture with the part kept raw)
- [ ] `Application` equals `VSSlicer-<version>` and never another vendor's
- [ ] Schema version is stored; a newer major version opens read-only with a message

## Tasks

- [ ] Record schema
- [ ] Reader and writer
- [ ] Preservation test

## Progress

Not started.
