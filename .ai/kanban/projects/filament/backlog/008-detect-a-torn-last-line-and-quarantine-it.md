---
id: 8
title: Detect a torn last line and quarantine it
type: feature
priority: P1
effort: S
model: sonnet
area: [model]
story: US3
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [7]
created: 2026-10-25
---

A truncated last line (crash mid-write) must not lose earlier events or be silently dropped.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] A truncated last line is moved to `events.jsonl.corrupt`, earlier events load, and a typed `CorruptLogWarning` is returned to the caller (simulated crash test)
- [ ] A corrupt line in the middle is quarantined the same way and reported

## Tasks

- [ ] Detect and quarantine
- [ ] Return the warning
- [ ] Tests

## Progress

Not started.
