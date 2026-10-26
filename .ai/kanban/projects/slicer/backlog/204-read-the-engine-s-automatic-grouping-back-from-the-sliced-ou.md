---
id: 204
title: "Read the engine's automatic grouping back from the sliced output"
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [203, GCP-7]
created: 2026-10-25
---

After a slice in automatic mode, reads the `filament_map` the engine chose from the G-code's config block so the UI can show it.

**Code:** `vsslicer/modules/multimaterial/src/application/...` (module: `multimaterial`, layer: `application`)

## Acceptance criteria

- [ ] On recorded Orca output for the dual-nozzle fixture the grouping equals Orca's own (read from its project config)
- [ ] Output without a config block returns "unknown" and no guess
- [ ] A manual-mode slice returns the manual map unchanged

## Tasks

- [ ] Config block reader
- [ ] Result type
- [ ] Tests on recorded output

## Progress

Not started.
