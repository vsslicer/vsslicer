---
id: 96
title: "Add width, flow, fan and temperature colour modes"
type: feature
priority: P1
effort: L
model: opus
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [32]
created: 2026-10-26
---

Split from GCP-32 in SP5: the colour modes that webview-kit 0.5's segment shader cannot draw yet.

## Acceptance criteria

- [ ] Width and flow modes: webview-kit's shader gains `ColorMode.Width` and `ColorMode.Flow` (width is in the 28-byte record as f16; flow from width x height x speed), released once, and the preview offers them
- [ ] Fan and temperature modes: per-move fan and temperature come from the parser's state changes into a per-move scalar texture (or a record change), chosen after D17 (move layout) is decided
- [ ] Switching to any of the four does not re-upload geometry (spyGlUploads test)

## Tasks

- [ ] webview-kit: Width and Flow shader modes (PLT card, platform board)
- [ ] Decide the per-move scalar path for fan and temperature once D17 is accepted
- [ ] gcode-preview: offer the four modes and their legends

## Progress

- Created in SP5 from GCP-32's review: GCP-32 ships feature, speed, tool and layer time (`gcp3233-worker`); webview-kit 0.5.0 has only those four `ColorMode`s and the 28-byte record has no fan or temperature.
