---
id: 219
title: Write the pinned PrusaSlicer release manifest
type: feature
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [7, 217]
created: 2026-10-25
---

The pinned 2.9.x release per platform (URL, SHA-256, executable path) in the manifest schema of `slicer-api`; a 3.0 entry exists but is gated.

**Code:** `vsslicer/modules/slicer-prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] The manifest validates against the schema in `slicer-api` and holds three platform entries for 2.9.x
- [ ] A test fails when a hash is missing
- [ ] The 3.0 entry is marked experimental and not chosen by default

## Tasks

- [ ] Write manifest
- [ ] Validate
- [ ] Tests

## Progress

Not started.
