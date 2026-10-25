---
id: 119
title: Implement the `upload` and `print` tasks
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks]
story: US23
milestone: "VSS:M3"
depends_on: [118, 115]
created: 2026-10-25
---

Task provider entries that call the use cases and report to the terminal.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `upload` and `print` resolve from `tasks.json` and run against the fake gateway
- [ ] A failure names the printer and reason in the task output

## Tasks

- [ ] Provider entries
- [ ] Tests

## Progress

Not started.
