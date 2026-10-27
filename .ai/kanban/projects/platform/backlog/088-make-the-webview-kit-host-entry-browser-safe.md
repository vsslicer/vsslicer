---
id: 88
title: Make the webview-kit host entry browser-safe
type: refactor
priority: P2
effort: S
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [81, 36]
created: 2026-10-25
---

The host entry must load in the web extension host: replace any Node built-in it reaches, keeping the desktop behaviour.

**Code:** `vsslicer/modules/ui/webview-kit/src/adapters/...` (module: `webview-kit`, layer: `adapters`)

## Acceptance criteria

- [ ] The Node-built-in check passes on the host entry's browser build; the existing transport tests pass unchanged
- [ ] Desktop behaviour is unchanged (existing integration tests pass)

## Tasks

- [ ] Run the check
- [ ] Replace imports
- [ ] Tests

## Progress

Not started.
