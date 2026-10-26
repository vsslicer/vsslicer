---
id: 66
title: Show oversized models as a box with Draw anyway
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [55, 76]
created: 2026-10-25
---

Size policy from the benchmark: above the triangle budget an object is a bounding box until the user chooses Draw anyway. Budget constants come from the E9 benchmark file.

**Code:** `vsslicer/modules/project-extension/src/application/sizePolicy.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Policy decides box or full mesh from triangle count and budget; unit-tested at the boundaries
- [ ] The webview shows the box and the button, and the 20 M fixture follows the policy

## Tasks

- [ ] Policy
- [ ] Webview wiring
- [ ] Tests

## Progress

Not started.
