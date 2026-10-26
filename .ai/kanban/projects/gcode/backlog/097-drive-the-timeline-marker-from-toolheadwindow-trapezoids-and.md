---
id: 97
title: Drive the timeline marker from ToolheadWindow trapezoids and dwells
type: feature
priority: P2
effort: M
model: sonnet
area: [renderer]
story: US12
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [38]
created: 2026-10-26
---

Follow-up from GCP-38 (SP5): the timeline's toolhead marker moves at constant speed between move start times (the `ToolheadWindow` fallback), computed in the webview from the move records. Klipper files should follow their `trapezoidsFor` trapezoids and hold through G4 dwells, as `ToolheadWindow` in gcode-planner 0.4.0 does.

## Acceptance criteria

- [ ] For Klipper files the marker position comes from `ToolheadWindow` trapezoids (window per visible span, from the worker or by sending trapezoids with the moves), within 0.01 mm of the planner in a test
- [ ] G4 dwells hold the marker still instead of slow motion
- [ ] No geometry re-upload while playing (spyGlUploads)

## Tasks

- [ ] Choose where windows are built (worker on demand or sent with the moves) and its memory per move
- [ ] Wire it into `timeline.ts`

## Progress

- Created in SP5 from GCP-38's review.
