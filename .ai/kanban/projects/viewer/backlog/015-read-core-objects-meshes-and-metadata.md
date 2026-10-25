---
id: 15
title: "Read core objects, meshes and metadata"
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [7, 14, 1]
created: 2026-10-25
---

Streams the root model XML into objects with typed-array meshes and metadata.

**Code:** `vsslicer/modules/3mf/src/adapters/model/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Meshes come out as typed arrays with correct counts on the Consortium positives and the dialect fixtures
- [ ] Malformed XML and missing root model give the typed errors
- [ ] A 100 MB sub-model parses without holding the XML text in memory

## Tasks

- [ ] Streaming vertex and triangle reader
- [ ] Metadata reader
- [ ] Tests

## Progress

Not started.
