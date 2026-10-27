---
id: 102
title: Add the engine registry and engine choice
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [100, 7, 30]
created: 2026-10-25
---

Registers adapters, detects all of them, resolves the one named by `vsslicer.slicer.engine`, and reports installs and versions.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] With the fake and the Orca adapter registered the registry lists both with detection results
- [ ] An unknown engine id gives a typed error naming the setting
- [ ] Registry runs in plain Node tests

## Tasks

- [ ] Registry
- [ ] Detection fan-out
- [ ] Tests

## Progress

Not started.
