---
id: 79
title: Integration-test two windows and a window reload
type: chore
priority: P1
effort: M
model: opus
area: [daemon]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP34"
depends_on: [75, PLT-15, PLT-16]
created: 2026-10-25
---

Two VS Code instances against one agent.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Both windows show the same session and the fake server counts one connection
- [ ] Reload keeps the session and a running fake job; status resumes in under 2 s

## Tasks

- [ ] Two-instance harness
- [ ] Tests

## Progress

Not started.
