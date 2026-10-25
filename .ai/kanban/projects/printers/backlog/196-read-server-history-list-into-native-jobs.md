---
id: 196
title: Read server/history/list into native jobs
type: feature
priority: P1
effort: S
model: sonnet
area: [moonraker]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [195, 194]
created: 2026-10-25
---

Paged `server/history/list` mapped to `NativeJob`.

**Code:** `vsslicer/modules/printer-moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] Contract tests against the recorded fixtures: paging, since filter, unknown fields kept

## Tasks

- [ ] Client
- [ ] Mapping
- [ ] Tests

## Progress

Not started.
