---
id: 96
title: Make the mesh browser path pass the Node-built-in check
type: refactor
priority: P2
effort: S
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [81, VWR-49]
created: 2026-10-25
---

Runs the check on the library's browser entry and replaces what it finds; the Web Worker pool already exists.

**Code:** `vsslicer/modules/mesh/src/adapters/...` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] The check passes on the browser entry; STL and OBJ fixtures parse to identical statistics in Node and in Chromium
- [ ] No desktop behaviour changes (existing tests pass)

## Tasks

- [ ] Run the check
- [ ] Replace imports
- [ ] Cross-runtime test

## Progress

Not started.
