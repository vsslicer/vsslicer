---
id: 86
title: Compute one warning per unsupported key for a resolved profile
type: feature
priority: P0
effort: S
model: sonnet
area: [engine]
story: US27
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [83, 3]
created: 2026-10-25
---

Pure function from the keys a resolved profile sets and an engine's table to `Warning` events; renamed keys are mapped, unsupported ones warn.

**Code:** `vsslicer/modules/common/slicer-api/src/application/...` (module: `slicer-api`, layer: `application`)

## Acceptance criteria

- [ ] Exactly one warning per unsupported key, with the key and the engine named
- [ ] Never throws; an unknown key warns as unmapped
- [ ] Supported and renamed keys produce no warning

## Tasks

- [ ] Function
- [ ] Tests

## Progress

Not started.
