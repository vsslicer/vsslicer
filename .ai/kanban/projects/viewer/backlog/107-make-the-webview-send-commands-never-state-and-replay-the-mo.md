---
id: 107
title: "Make the webview send commands, never state, and replay the model after a reload"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [106, 55, PLT-36, PLT-37]
created: 2026-10-25
---

The webview posts command requests; the host executes and sends back the change. After a reload the host sends the whole model so the webview rebuilds.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The webview holds no model state that the host lacks (test: reload mid-session shows the same scene)
- [ ] A rejected command returns an error the webview shows
- [ ] Messages use the webview kit transport

## Tasks

- [ ] Message types
- [ ] Replay on reload
- [ ] Test

## Progress

Not started.
