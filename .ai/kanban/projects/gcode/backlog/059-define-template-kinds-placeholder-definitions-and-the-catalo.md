---
id: 59
title: "Define template kinds, placeholder definitions and the catalogue schema"
type: feature
priority: P2
effort: S
model: sonnet
area: [language]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [58]
created: 2026-10-25
---

Types for a slicer id, a template kind (the slicer's native key, e.g. `layer_change_gcode`), a placeholder definition (name, value type, vector flag, label, tooltip, provenance) and the catalogue that says which kinds provide which placeholders.

**Code:** `vsslicer/modules/gcode-templates/src/domain/...` (module: `gcode-templates`, layer: `domain`)

## Acceptance criteria

- [ ] A schema test rejects a placeholder with no type or no provenance line, and a kind that lists an undefined placeholder
- [ ] The catalogue answers `providedBy(placeholder)` and `placeholdersFor(kind)` in constant time (unit tests)
- [ ] Pure domain: no I/O, no `vscode` import (lint)

## Tasks

- [ ] Types
- [ ] Schema check
- [ ] Lookups
- [ ] Tests

## Progress

Not started.
