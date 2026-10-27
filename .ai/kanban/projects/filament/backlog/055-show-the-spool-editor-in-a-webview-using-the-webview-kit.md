---
id: 55
title: Show the spool editor in a webview using the webview kit
type: feature
priority: P1
effort: L
model: sonnet
area: [ui]
story: US24
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [54, PLT-32, PLT-37, PLT-17]
created: 2026-10-25
---

A single accessible form webview using the CSP helper (`createWebviewHtml`) and message transport of `@vsslicer/webview-kit`; writes go through `Inventory`. Fallback if the kit is late: a sequence of InputBox prompts behind the same command.

UNRESOLVED: needs webview-kit: a release card; PLT-32 and PLT-37 are depended on directly.

**Code:** `vsslicer/modules/apps/filament/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The webview passes the CSP helper's policy test and an axe check in the Playwright harness; labels and keyboard navigation work
- [ ] Invalid input is rejected with a message; an unsaved form is kept as a draft in webview state across hide and show
- [ ] Saving writes through `Inventory` and the tree updates (integration test)

## Tasks

- [ ] Webview HTML and CSP
- [ ] Form and messages
- [ ] Axe and keyboard tests
- [ ] Integration test

## Progress

Not started.
