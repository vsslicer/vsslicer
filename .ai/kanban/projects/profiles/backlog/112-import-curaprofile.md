---
id: 112
title: Import .curaprofile
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US46
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [111, 131, 31, 136]
created: 2026-10-25
---

Reads Cura profile exports into user quality entities.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/bundles/cura/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] The real fixture imports with the expected settings and parent quality
- [ ] A file from another Cura version gives a version diagnostic

## Tasks

- [ ] Write the reader
- [ ] Tests

## Progress

Not started.
