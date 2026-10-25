---
id: 50
title: "Define and publish the exports and commands: open, follow, stopFollow"
type: feature
priority: P1
effort: M
model: opus
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [49, 30]
created: 2026-10-25
---

The cross-project contract; commands too because ui-kind PRN runs in another extension host under Remote-SSH and WSL.

## Acceptance criteria

- [ ] `exports` and the commands `vsslicer.gcode.open`, `.follow`, `.stopFollow` exist with serialisable arguments
- [ ] Versioned types are exported from `@vsslicer/gcode`
- [ ] `PreviewSession.reveal(position)` and `setPlate` exist

## Tasks

- [ ] Types
- [ ] Exports
- [ ] Commands
- [ ] Session methods

## Progress

Not started.
