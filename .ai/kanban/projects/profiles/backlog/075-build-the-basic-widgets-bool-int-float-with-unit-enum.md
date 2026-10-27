---
id: 75
title: "Build the basic widgets: bool, int, float with unit, enum"
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP21"
depends_on: [74]
created: 2026-10-25
---

The common widgets chosen by catalogue type, with labels, units, bounds and tooltips.

**Code:** `vsslicer/modules/apps/profiles/webview/widgets/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each widget kind renders from a model fixture and validates bounds (typed 'abc' into an int is rejected with a message)
- [ ] Every control has a label; units show beside the value
- [ ] Snapshot tests per widget in Playwright

## Tasks

- [ ] Write the four widgets
- [ ] Validation
- [ ] Snapshots

## Progress

Not started.
