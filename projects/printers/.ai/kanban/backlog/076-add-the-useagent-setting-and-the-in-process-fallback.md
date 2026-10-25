---
id: 76
title: Add the useAgent setting and the in-process fallback
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US17
milestone: "VSS:M3"
depends_on: [75]
created: 2026-10-25
---

`vsslicer.printers.useAgent` (off while the epic is in progress, on after) and a visible fallback when the agent cannot start.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Off: E20/E21 suites pass with in-process sessions
- [ ] Agent start failure shows an error with the log path and falls back to in-process sessions with a warning (test)

## Tasks

- [ ] Setting
- [ ] Fallback
- [ ] Tests

## Progress

Not started.
