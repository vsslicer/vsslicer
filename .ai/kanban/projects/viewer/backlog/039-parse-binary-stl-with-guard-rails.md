---
id: 39
title: Parse binary STL with guard rails
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [38, 35]
created: 2026-10-25
---

Binary STL parser that checks the declared count against the file length and tells binary from ASCII by length, not the `solid` header.

**Code:** `vsslicer/modules/mesh/src/adapters/stl/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Triangle counts and bounding boxes equal the three.js STLLoader on the binary and `solid`-header fixtures
- [ ] Truncated file, count larger than the file and NaN or infinite coordinates raise the typed errors
- [ ] Parsing is streaming over chunks

## Tasks

- [ ] Parser
- [ ] Guard rails
- [ ] Oracle comparison test

## Progress

Not started.
