---
id: 309
title: "Add the gap fill, height range and clear tools"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, painting]
story: US82
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [307, 291]
created: 2026-10-25
---

Gap fill with its area threshold, a height-range tool with two draggable planes and the state to paint, and Clear for the current kind with a confirmation.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/paint/gapHeightClear.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each tool paints or clears the expected region on the fixtures and is one undo step
- [ ] The height-range planes show their Z values and accept typed values
- [ ] Clear asks to confirm and only clears the selected kind on the selected object

## Tasks

- [ ] Gap fill
- [ ] Height range planes
- [ ] Clear
- [ ] Harness test

## Progress

Not started.
