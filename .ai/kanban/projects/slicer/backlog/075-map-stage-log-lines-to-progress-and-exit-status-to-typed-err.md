---
id: 75
title: Map stage log lines to progress and exit status to typed errors
type: feature
priority: P1
effort: S
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [7, 66]
created: 2026-10-25
---

Coarse progress from 'Starting <stage>...' lines; exit 1, exit 2 and SIGFPE become typed errors; bad model and bad argument have their own messages.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] Recorded logs map to the stage order; progress never decreases
- [ ] Each exit status and signal maps to a distinct error (table-driven)
- [ ] Unknown codes map to `unknown exit code` with the raw value

## Tasks

- [ ] Stage map
- [ ] Error map
- [ ] Tests with recorded logs

## Progress

Not started.
