---
id: 64
title: Detect WebGL failure and say what to do
type: feature
priority: P0
effort: S
model: sonnet
area: [viewer]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [55, PLT-41]
created: 2026-10-25
---

Shows the kit's structured failure cause as a message in the editor, including the hardware acceleration hint.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/errors/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Forced context failure shows the message in the editor (test)
- [ ] Context loss and restore rebuild the scene

## Tasks

- [ ] Mapping
- [ ] Test

## Progress

Not started.
