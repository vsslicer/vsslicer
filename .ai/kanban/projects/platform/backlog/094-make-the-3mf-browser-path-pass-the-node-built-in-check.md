---
id: 94
title: Make the 3mf browser path pass the Node-built-in check
type: refactor
priority: P2
effort: S
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [81, VWR-31]
created: 2026-10-25
---

Runs the check on the library's browser entry and replaces what it finds; the Web Worker adapter already exists.

**Code:** `vsslicer/modules/3mf/src/adapters/...` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The check passes on the browser entry; `readProject` results on the fixtures are identical in Node and in Chromium
- [ ] No desktop behaviour changes (existing tests pass)

## Tasks

- [ ] Run the check
- [ ] Replace imports
- [ ] Cross-runtime test

## Progress

Not started.
