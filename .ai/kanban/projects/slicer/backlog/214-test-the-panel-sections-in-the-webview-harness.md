---
id: 214
title: Test the panel sections in the webview harness
type: chore
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US56
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [209, 210, 211, 212, PLT-17]
created: 2026-10-25
---

Playwright tests of every panel section with the webview stub: render, edit, disabled states.

**Code:** `vsslicer/modules/slicer-extension/test/` (module: `slicer-extension`, layer: n/a (webview tests))

## Acceptance criteria

- [ ] Each section has a render and an edit test in the harness
- [ ] Disabled sections show their reason
- [ ] Turning the panel off returns to imported values (test)

## Tasks

- [ ] Harness setup
- [ ] Section tests
- [ ] Disable test

## Progress

Not started.
