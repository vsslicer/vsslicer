---
id: 120
title: Move PrintPosition and the follow command ids into gcode-api
type: chore
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [50]
created: 2026-10-26
---

From GCP-50 review (SP9): move `PrintPosition`, `ResolvedBy`, `Revealed`, `parsePosition` and the command ids from gcode-preview to gcode-api, so printer adapters depend on the contract module, not the extension (rule 13: gcode-api minor release, then gcode-preview re-locked).

**Code:** `vsslicer/modules/gcode-api/src/domain/print-position.ts`, gcode-preview imports (domain)

## Acceptance criteria

- [ ] Types and `parsePosition` exported from `@vsslicer/gcode-api`; gcode-preview imports them; tests move with them
- [ ] **Bounds:** `parsePosition` keeps its validation and hostile tests

## Progress

Not started.
