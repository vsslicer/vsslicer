---
id: 85
title: Generate the Markdown capability report and the drift check
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US33
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [83]
created: 2026-10-25
---

Deterministic Markdown from a table and the engine version, and a check that compares the committed report with a fresh one.

**Code:** `vsslicer/modules/common/slicer-api/src/application/...` (module: `slicer-api`, layer: `application`)

## Acceptance criteria

- [ ] Same input gives the same bytes
- [ ] The check fails with a readable diff when the committed report differs
- [ ] The report groups keys by category and shows renamed keys with their native names

## Tasks

- [ ] Renderer
- [ ] Drift check
- [ ] Tests

## Progress

Not started.
