---
id: 78
title: Reset the toolhead position on G28
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `gcode-parser`, domain layer. `G1 X50`, `G28`, `G91`, `G1 X10` puts the head at X60 instead of X10 (finding 3). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [ ] `G28` sets position and origin to 0 for each named axis, or X, Y and Z when none is named
- [ ] A test for the sequence above expects X10

## Tasks

- [ ] Handle G28 in `Machine.handle`
- [ ] Test
- [ ] Release a patch version

## Progress

Not started.
