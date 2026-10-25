---
id: 22
title: "Add start, pause, resume and cancel commands gated by capability"
type: feature
priority: P1
effort: S
model: sonnet
area: [api]
story: US5
milestone: "VSS:M3"
depends_on: [20]
created: 2026-10-25
---

Job commands in the tree item menu, visible only when the capability allows.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `when` clauses derive from the capability flags: a command for a missing capability is hidden, not failing (test with the fake adapter)
- [ ] Cancel asks for confirmation

## Tasks

- [ ] Contribute commands
- [ ] Context values from capabilities
- [ ] Tests

## Progress

Not started.
