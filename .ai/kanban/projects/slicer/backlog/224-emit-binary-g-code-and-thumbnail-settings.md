---
id: 224
title: Emit binary G-code and thumbnail settings
type: feature
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [223, 217]
created: 2026-10-25
---

Sets `binary_gcode` from the unified key and the thumbnail sizes from the printer profile so the `.bgcode` carries the engine's own thumbnail blocks.

**Code:** `vsslicer/modules/slicer/prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] With `binary_gcode` on, the INI has the key and the thumbnail list of the printer profile
- [ ] With it off, thumbnails are not requested from the engine (our assembler adds them to text G-code)
- [ ] The decision on engine thumbnails versus injecting before conversion is stated in a comment citing the report

## Tasks

- [ ] Key mapping
- [ ] Thumbnail sizes
- [ ] Tests

## Progress

Not started.
