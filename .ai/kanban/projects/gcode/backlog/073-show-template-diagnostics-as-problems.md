---
id: 73
title: Show template diagnostics as problems
type: feature
priority: P2
effort: S
model: sonnet
area: [language]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [72]
created: 2026-10-25
---

Publishes `validateTemplate` results as diagnostics with a debounce and a size guard.

**Code:** `vsslicer/modules/apps/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] A wrong-kind placeholder shows a warning with the message from the library; fixing the text clears it within one second
- [ ] Templates over 1 MB skip diagnostics with a status-bar note

## Tasks

- [ ] Diagnostics collection
- [ ] Debounce
- [ ] Tests

## Progress

Not started.
