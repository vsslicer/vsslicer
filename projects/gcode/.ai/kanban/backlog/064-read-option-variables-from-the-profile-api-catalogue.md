---
id: 64
title: Read option variables from the profile-api catalogue
type: feature
priority: P2
effort: S
model: sonnet
area: [language]
story: US43
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [59, PRF-135]
created: 2026-10-25
---

Adapter from `@vsslicer/profile-api`'s catalogue (canonical keys, native names per dialect, type, label, tooltip, per-extruder flag) to the library's option-variable type, and from a canonical G-code profile key to the template kind in each dialect.

**Code:** `vsslicer/modules/gcode-templates/src/adapters/...` (module: `gcode-templates`, layer: `adapters`)

## Acceptance criteria

- [ ] Every catalogue entry of type G-code maps to a template kind or is listed as having none; a test fails on an unmapped one
- [ ] A per-extruder option is marked as a vector; an option missing in a dialect has no native name there
- [ ] Depends on `@vsslicer/profile-api` through a semver range only

## Tasks

- [ ] Adapter
- [ ] Kind lookup
- [ ] Tests over the catalogue

## Progress

Not started.
