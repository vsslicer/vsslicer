---
id: 167
title: Add the intent field to the process form model
type: feature
priority: P2
effort: S
model: sonnet
area: [form]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [166, 70]
created: 2026-10-25
---

The generated form model for a process includes an `intent` field with options from `listIntents`, hidden when only the default exists.

**Code:** `vsslicer/modules/profiles/src/application/...` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] The form model for a process with intents lists them; for one without, the field is absent (tests)
- [ ] Setting the field produces a diff-only user process with `intent` set

## Tasks

- [ ] Field
- [ ] Tests

## Progress

Not started.
