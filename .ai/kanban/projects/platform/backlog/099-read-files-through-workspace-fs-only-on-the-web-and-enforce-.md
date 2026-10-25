---
id: 99
title: Read files through workspace.fs only on the web and enforce the size limit
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US53
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [98, 86]
created: 2026-10-25
---

On the web the custom editor reads bytes with `vscode.workspace.fs` (no Node streams) and refuses a file above the web size limit (a setting whose default comes from the spike) with a message that says the limit and what to do.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] A file above the limit shows the message and opens nothing (no worker started); a file below it opens
- [ ] The limit is a documented setting; the message names it
- [ ] On desktop the limit does not apply (existing 500 MB behaviour unchanged)

## Tasks

- [ ] Read path
- [ ] Limit and message
- [ ] Tests

## Progress

Not started.
