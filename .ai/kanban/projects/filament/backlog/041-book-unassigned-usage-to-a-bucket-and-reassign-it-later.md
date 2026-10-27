---
id: 41
title: Book unassigned usage to a bucket and reassign it later
type: feature
priority: P1
effort: M
model: sonnet
area: [consumption]
story: US19
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [40]
created: 2026-10-25
---

Usage for a tool with no spool goes to the printer's bucket and emits one warning signal per job; reassigning moves the event to the chosen spool.

**Code:** `vsslicer/modules/filament/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Unassigned usage lands in the bucket and one warning signal per job is emitted (not one per tool)
- [ ] Reassigning moves the event, using correction events so the log stays append-only
- [ ] Missing source data books nothing and returns a `NoUsageData` warning, tested per adapter kind

## Tasks

- [ ] Write the bucket
- [ ] Write the reassign
- [ ] Tests

## Progress

Not started.
