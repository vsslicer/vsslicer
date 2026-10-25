---
id: 323
title: Report print_stats filament_used per tool as a JobEnd
type: feature
priority: P1
effort: S
model: sonnet
area: [moonraker]
story: "FIL:US14"
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [320, 199]
created: 2026-10-25
---

Emits the printer-api `JobEnd` (id from `job_id`, outcome, `filamentUsed[]` per tool in millimetres) when a Moonraker job finishes, from `print_stats.filament_used` and, when present, the job's history entry per tool.

**Code:** `vsslicer/modules/printer-moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] On the recorded sessions (PRN-87) a completed, a cancelled and an errored job give one `JobEnd` each with the right outcome and filament used; a single-extruder job reports one tool
- [ ] A job with no `filament_used` yields an empty list, not zero
- [ ] Verified on recordings only (D5)

## Tasks

- [ ] Detect the end
- [ ] Map filament_used
- [ ] Fixture tests

## Progress

Not started.
