---
id: 6
title: Read content types and relationships
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [5]
created: 2026-10-25
---

Parses `[Content_Types].xml`, `_rels/.rels` and per-part relationships into the Package, preserving anything unknown verbatim.

**Code:** `vsslicer/modules/3mf/src/adapters/opc/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Defaults, overrides and relationships (including targets with relative paths) resolve on fixtures from Bambu, Orca, Prusa and Cura
- [ ] Unknown relationship types and content types are kept, not dropped
- [ ] Malformed XML gives the typed error

## Tasks

- [ ] Parse content types
- [ ] Parse relationships
- [ ] Resolve targets
- [ ] Tests on all four dialect fixtures when present, synthetic otherwise

## Progress

Not started.
