---
id: 338
title: Split paint with the cut and boolean commands
type: feature
priority: P2
effort: S
model: sonnet
area: [editor, painting]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [336, 335, 300, 334]
created: 2026-10-25
---

After a cut or boolean the result volumes get the carried paint layers; undo restores the original layers.

**Code:** `vsslicer/modules/project-extension/src/application/commands/cut/paint.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A painted fixture cut in two: both parts keep their paint where it was; undo restores the single layer set
- [ ] A boolean of painted operands keeps each operand's paint on its surface
- [ ] The paint of a part with no paint stays empty

## Tasks

- [ ] Wire layers into the commands
- [ ] Tests

## Progress

Not started.
