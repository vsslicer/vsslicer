---
id: 82
title: "Surface transport errors, host restart and save errors in the form"
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US33
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [77, PLT-40]
created: 2026-10-25
---

A banner on transport loss, stale version or save failure, then reload; no edit is dropped silently.

**Code:** `vsslicer/modules/profiles-extension/webview/shell/errors/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A forced host restart shows a banner and the form reloads with the edit preserved or the user told it was not saved
- [ ] A save error (disk full stub) shows on the field and keeps the typed value

## Tasks

- [ ] Banner component
- [ ] Retry/reload logic
- [ ] Forced-restart test

## Progress

Not started.
