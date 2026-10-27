---
id: 259
title: Test each STEP error class with its fixture and message
type: feature
priority: P1
effort: M
model: sonnet
area: [step, mesh]
story: US69
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [258, 253]
created: 2026-10-25
---

One test per error class: unsupported schema, empty file, WASM load failure (missing file and a blocked-load simulation), out of memory.

**Code:** `vsslicer/modules/core/mesh-step/test/errors/` (module: `mesh-step`, layer: n/a (tests))

## Acceptance criteria

- [ ] Each class is produced by its fixture or injection and carries its message
- [ ] The module still answers the next import after an error

## Tasks

- [ ] Four cases
- [ ] Injection helpers

## Progress

Not started.
