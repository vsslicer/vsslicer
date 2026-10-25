---
id: 105
title: Show every engine error as a notification and never block the host
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [102, PLT-15, 7]
created: 2026-10-25
---

Maps `EngineError` to a notification with its remediation and logs details to an output channel; crash and timeout tests run in the extension host.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each `EngineError` variant has a notification text (table test)
- [ ] A stub engine crash (signal) and a timeout show a notification and leave the host responsive (`@vscode/test-electron`)
- [ ] Details go to the output channel, not the notification

## Tasks

- [ ] Mapping
- [ ] Output channel
- [ ] Host tests

## Progress

Not started.
