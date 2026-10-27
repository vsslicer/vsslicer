---
id: 100
title: Add the quick-pick driver for the same wizard steps
type: feature
priority: P0
effort: M
model: sonnet
area: [wizard]
story: US40
milestone: "VSS:M2"
sprint: "VSS:SP18"
depends_on: [144, 88]
created: 2026-10-25
---

A second driver over the same step model, for keyboard-first and web hosts.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/wizard/quickpick/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The same test as the webview path runs with the quick-pick driver and reaches the same instance for each ecosystem fixture
- [ ] Escape at any step cancels without leaving entities

## Tasks

- [ ] Write the driver
- [ ] Run the shared test

## Progress

Not started.
