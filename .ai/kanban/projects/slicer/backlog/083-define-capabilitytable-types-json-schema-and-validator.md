---
id: 83
title: "Define `CapabilityTable` types, JSON Schema and validator"
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [7]
created: 2026-10-25
---

Per unified key: `supported | renamed(nativeKey, valueMap) | unsupported`, plus note, review state and engine version range.

**Code:** `vsslicer/modules/slicer-api/src/domain/...` (module: `slicer-api`, layer: `domain`)

## Acceptance criteria

- [ ] A table validates against its schema; invalid entries (renamed without a native key, empty value map) fail with the key named
- [ ] `valueMap` maps unified enum values to native ones and the reverse lookup exists
- [ ] Types and schema are exported and documented

## Tasks

- [ ] Types
- [ ] Schema
- [ ] Validator and tests

## Progress

Not started.
