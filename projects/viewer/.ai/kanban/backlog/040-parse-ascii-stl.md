---
id: 40
title: Parse ASCII STL
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
depends_on: [38, 35]
created: 2026-10-25
---

ASCII STL parser tolerant of CRLF, tabs and odd whitespace.

**Code:** `vsslicer/modules/mesh/src/adapters/stl/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Counts and bounding boxes equal three.js on the ASCII and CRLF fixtures
- [ ] Malformed numbers give a typed error

## Tasks

- [ ] Tokenizer
- [ ] Tests

## Progress

Not started.
