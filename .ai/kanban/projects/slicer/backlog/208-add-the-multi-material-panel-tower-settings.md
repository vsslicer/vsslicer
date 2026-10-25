---
id: 208
title: "Add the multi-material panel: tower settings"
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [206, PLT-30, PLT-37]
created: 2026-10-25
---

A webview panel (webview kit) for the selected plate with the tower section: type, position, size and ramming.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Editing a field posts one command to the host and the panel renders from the host's state only
- [ ] Numeric placement works without the plate overlay (US52)
- [ ] Invalid values are marked with the reason from MM6

## Tasks

- [ ] Panel shell
- [ ] Tower section
- [ ] Host messages
- [ ] Tests

## Progress

Not started.
