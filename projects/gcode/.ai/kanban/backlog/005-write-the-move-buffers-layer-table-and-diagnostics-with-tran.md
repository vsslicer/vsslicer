---
id: 5
title: "Write the move buffers, layer table and diagnostics with transferable output"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [3, 4]
created: 2026-10-25
---

Fills the SoA buffers and exposes them as transferable ArrayBuffers.

## Acceptance criteria

- [ ] Buffers match the layout test from the contract card and the layer table matches golden layer counts
- [ ] Diagnostics carry file offsets; each error class available so far has a test
- [ ] Buffers transfer without copy (test that the source ArrayBuffer is detached)

## Tasks

- [ ] Buffer writer with growth policy
- [ ] Layer index table
- [ ] Diagnostics collector
- [ ] Transfer list helper

## Progress

Not started.
