---
id: 75
title: Test the template editor against fixture profiles in the extension host
type: chore
priority: P2
effort: M
model: sonnet
area: [language]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [73, 74]
created: 2026-10-25
---

Integration tests with `@vscode/test-electron` over imported Orca and Prusa fixture templates.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] Fixture templates open with no diagnostics; a deliberately wrong placeholder shows exactly one warning
- [ ] Completion and hover are checked for a sample of each template kind in both slicers

## Tasks

- [ ] Fixtures
- [ ] Scenarios

## Progress

Not started.
