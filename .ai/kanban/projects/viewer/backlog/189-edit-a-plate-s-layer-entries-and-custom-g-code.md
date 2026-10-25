---
id: 189
title: "Edit a plate's layer entries and custom G-code"
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US53
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [178, 186]
created: 2026-10-25
---

A list of entries for the active plate with add, edit and remove, a height field that shows the snapped layer, and a plate custom G-code editor.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/plates/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Adding a pause at 0.37 mm shows the snapped height
- [ ] Edits send the commands and undo
- [ ] The G-code editor accepts multi-line text

## Tasks

- [ ] Entry list
- [ ] Snap hint
- [ ] G-code field

## Progress

Not started.
