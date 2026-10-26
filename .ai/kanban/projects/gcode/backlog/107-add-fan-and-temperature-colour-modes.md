---
id: 107
title: Add fan and temperature colour modes
type: feature
priority: P1
effort: L
model: opus
sprint: "VSS:SP8"
depends_on: [96]
created: 2026-10-26
---

Split from GCP-96 at SP6 start: the fan and temperature colour modes, which need per-move fan and temperature from the parser's state changes (a per-move scalar texture or a record change). The choice waits on D17 (move layout), which is proposed, not accepted.

**Code:** `vsslicer/modules/gcode-parser`, `webview-kit`, `gcode-preview` (split per module when planned, rule 13)

## Acceptance criteria

- [ ] Fan and temperature modes: per-move fan and temperature reach the shader by the path D17 decides
- [ ] Switching to either does not re-upload geometry (spyGlUploads test)

## Tasks

- [ ] Wait for D17, then choose the scalar path
- [ ] Parser, kit and preview parts

## Progress

Not started. Blocked on D17 (owner decision).
