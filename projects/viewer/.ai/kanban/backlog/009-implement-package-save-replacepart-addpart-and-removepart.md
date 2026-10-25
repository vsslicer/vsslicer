---
id: 9
title: "Implement Package.save, replacePart, addPart and removePart"
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US2
milestone: "VSS:M2"
depends_on: [8]
created: 2026-10-25
---

The part API E27 needs in I5: change named parts of an otherwise untouched package and keep content types and relationships consistent.

**Code:** `vsslicer/modules/3mf/src/application/` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] `save()` on an untouched Package is byte-identical to the input
- [ ] `replacePart`, `addPart` and `removePart` leave every other part byte-identical (compare per part)
- [ ] `addPart` registers a content type when needed; `removePart` removes its relationship and override
- [ ] Verified on fixtures only (D5)

## Tasks

- [ ] Implement the three operations
- [ ] Keep content types and rels consistent
- [ ] Tests per operation

## Progress

Not started.
