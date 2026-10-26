---
id: 263
title: Contribute `vsslicer.slicer.embeddedEngine`
type: feature
priority: P2
effort: XS
model: sonnet
area: [embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [262, 101]
created: 2026-10-25
---

The setting that enables the fallback, default off until the decision says otherwise, with its description.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The setting appears with a description that names the speed trade-off
- [ ] A test reads it through the config adapter
- [ ] Invalid values are reported once

## Tasks

- [ ] package.json contribution
- [ ] Config adapter
- [ ] Test

## Progress

Not started.
