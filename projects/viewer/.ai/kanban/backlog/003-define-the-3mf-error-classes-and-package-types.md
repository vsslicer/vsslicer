---
id: 3
title: Define the 3MF error classes and Package types
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
depends_on: [2]
created: 2026-10-25
---

The typed vocabulary every later card uses: `Package`, `Part`, and one typed error class with a user-facing message for each failure.

**Code:** `vsslicer/modules/3mf/src/domain/` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [ ] Errors exist for corrupt zip, missing root model, malformed XML, unsupported required extension, size above cap, Production path to a missing part; each has a code and a user message
- [ ] `Part` carries name, content type, relationships and raw bytes
- [ ] Pure types and functions with no I/O (test imports nothing from adapters)

## Tasks

- [ ] Write error classes
- [ ] Write Package and Part types
- [ ] Unit-test messages

## Progress

Not started.
