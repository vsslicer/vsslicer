---
id: 242
title: "CI chain: slice with Prusa and preview the `.bgcode`"
type: chore
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [241, 126, 238]
created: 2026-10-25
---

In the test host: slice a fixture with the Prusa engine to `.bgcode` and open it in the preview.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The preview opens the committed `.bgcode` (stub or real preview API in the host)
- [ ] The layer count equals `expected.json`
- [ ] Fixtures only (D5)

## Tasks

- [ ] Scenario
- [ ] Assertions

## Progress

Not started.
