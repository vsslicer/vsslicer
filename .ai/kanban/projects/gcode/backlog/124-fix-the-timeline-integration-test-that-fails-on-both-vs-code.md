---
id: 124
title: Fix the timeline integration test that fails on both VS Code versions
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
created: 2026-10-26
---

The gcode-preview integration test "plays, pauses, steps and changes speed" (timeline) fails or times out on VS Code stable 1.143.1 and 1.100.0, with or without GCP-53's tests (GCP-53 worker and reviewer, SP11), so `pnpm test:integration` is red.

**Code:** `vsslicer/modules/gcode-preview/test/integration/` (module: `gcode-preview`, layer: presentation tests)

## Acceptance criteria

- [ ] The cause is found and fixed (the test waits on state, not on time; rule 26)
- [ ] `pnpm test:integration` passes 3 runs in a row on both VS Code versions

## Progress

Not started.
