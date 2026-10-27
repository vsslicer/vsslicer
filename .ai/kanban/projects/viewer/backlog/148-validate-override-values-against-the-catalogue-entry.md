---
id: 148
title: Validate override values against the catalogue entry
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [147, PRF-135]
created: 2026-10-25
---

Checks a value against the entry's type, unit, enum and bounds and returns the message to show.

**Code:** `vsslicer/modules/apps/project/src/application/overrides/validate.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Int, float with unit, enum, bool and percent values accept good input and reject bad input with a message
- [ ] Bounds from the catalogue are enforced
- [ ] Unknown keys are refused

## Tasks

- [ ] Validator
- [ ] Tests

## Progress

Not started.
