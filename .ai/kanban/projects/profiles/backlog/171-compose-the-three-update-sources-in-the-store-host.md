---
id: 171
title: Compose the three update sources in the store host
type: feature
priority: P2
effort: S
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [169, 153, 156, 158]
created: 2026-10-25
---

Registers the Prusa, Orca/Bambu and Cura `UpdateSource`s with the update service in the worker that hosts the store.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A smoke test lists the three sources and `check` with the policy off calls none of them
- [ ] The worker bundle size budget still holds

## Tasks

- [ ] Wire sources
- [ ] Smoke test

## Progress

Not started.
