---
id: E51
title: "Deferred P3 rows: toolpaths export"
status: draft
initiative: I10
project: GCP
order: 7
depends_on: [E3]
rows: ["§7 Toolpaths export to OBJ"]
---

The G-code preview's P3 rows, parked until an owner decision reopens one. Nothing here is
scheduled.

## Scope

- **§7 Toolpaths export to OBJ.** Export the parsed toolpaths (E3's move buffers) as an OBJ mesh,
  as PrusaSlicer's preview does. Would be written new in `@vsslicer/gcode` with the tube geometry
  generated on demand, or ported from PrusaSlicer's toolpath export (AGPL-3.0, D2).

## Feature-matrix rows

- **§7 Toolpaths export to OBJ (P3).** Waits because the matrix rates it rare (PS §4; BO §6) and
  nothing in I1 to I9 needs it; the data it needs exists after E3.

## Acceptance criteria

- [ ] An owner decision reopens a row

## Dependencies

- Would need E3 only. Related: VWR's §7 Export meshes to STL or Draco, which could share an
  OBJ/STL writer.

## Risks and spikes

- None until reopened.

## Eng review

- Deferred by priority; kept in one epic so the row stays visible on the board.
