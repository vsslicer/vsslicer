---
id: 20
title: Map the Orca exit-code table to typed errors
type: feature
priority: P0
effort: S
model: sonnet
area: [orca, engine]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [7, 16]
created: 2026-10-25
---

Reads the exit-code table in `OrcaSlicer@09aa0114:src/libslic3r/Utils.hpp:43-95` (read, not ported) as a signed byte and maps each row to an `EngineError` with a message.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] A table-driven test covers every row of the upstream table, naming the row and its message
- [ ] A code outside the table, and a code wrapped modulo 256 (for example 252 for -4), map to `unknown exit code` with the raw value (regression)
- [ ] Exit 0 is the only success

## Tasks

- [ ] Transcribe the table with the upstream line numbers
- [ ] Map to errors
- [ ] Table-driven tests

## Progress

Not started.
