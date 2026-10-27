---
id: 170
title: Show the intent picker in the process form
type: feature
priority: P2
effort: M
model: sonnet
area: [form]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [168, 77]
created: 2026-10-25
---

A picker next to the quality in the process form fed by the form model, showing the effective values and their source when an intent is chosen.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With a Cura-shaped fixture workspace the picker lists the intents; choosing one updates the effective values and writes `intent` to the user process (`@vscode/test-electron`)
- [ ] The picker is hidden when no intents exist and passes the axe-core check

## Tasks

- [ ] Webview field
- [ ] Host message
- [ ] Integration test

## Progress

Not started.
