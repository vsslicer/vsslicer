---
id: 27
title: Write the RRF planner
type: feature
priority: P1
effort: M
model: sonnet
area: [planner]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [26, 19]
created: 2026-10-25
---

Package `@vsslicer/gcode-planner`, layer `domain` (`src/domain/rrf-planner.ts` + `limits.ts`).
Spec: `docs/research/rrf-planner.md` section "Implications for VSSlicer" (from GCP-26, RRF 3.6.3
@ aebf629). RRF is GPL-3.0: write from the spec, do not port RRF source.

## Acceptance criteria

- [ ] `FLAVOUR_DEFAULTS.reprapfirmware` holds RRF defaults (feed 100/100/20/100 mm/s, accel 1000/1000/200/500, jerk 15/15/10/5, accelPrint/accelTravel/accel 50000, minFeedrate 0.5) with the `Configuration.h` citation; `minFeedrate` added to `FLAVOUR_FIELDS.reprapfirmware`
- [ ] Per-axis instantaneous speed change from M566 (mm/min) is converted correctly (unit test: M566 X900 Y900 -> 15 mm/s; a 90 degree X->Y corner has |du_x|=|du_y|=1, so the join speed is 15 mm/s)
- [ ] M201/M203/M204 are honoured: accel = box intersection of M201 per axis, min M204 P (printing) or T (travel) on XY moves only; speed = min(max(F, minFeedrate), box intersection of M203); M204 S stands in for unset P/T (unit tests each)
- [ ] Junctions: moves join only when printing, XY-moving and non-printing-E flags match (else both sides 0); join speed limited per drive by |u_prev - u_next| * v <= jerk, E component = e/L; file starts and ends at rest (unit tests: print->travel stops; collinear moves cruise through)
- [ ] Lookahead is a backward/forward pass over a sliding window of 40 moves; trapezoid timing uses V^2 = (2a.2d.L + 2a.ve^2 + 2d.vs^2)/(2a+2d) when there is no cruise (unit test vs hand-computed triangle and trapezoid)
- [ ] Pressure advance (M572 S, `StateKind.PressureAdvance`) caps E accel at jerkE/PA on XY moves (unit test)
- [ ] Arc chords (MoveFlag.Arc, same file offset) use RRF's segment turn: segLen = clamp(min(sqrt(8 r 0.005), F/200), 0.02, 1), |du| scaled by (segLen/r)/chordTurn (unit test: r=5, F=100, jerk 15 is not capped)
- [ ] Results are labelled lower confidence (`estimate: true`): GCP-26 says keep the label until compared with RRF M37 simulation or measured Duet prints
- [ ] Module lint, test, build pass; patch/minor bump and CHANGELOG entry naming GCP-27

## Tasks

- [ ] RRF defaults and fields in limits.ts
- [ ] Per-move limits (accel, speed, PA)
- [ ] Junction + windowed lookahead + trapezoid timing
- [ ] Arc chord rescale
- [ ] Tests

## Out of scope (follow-ups noted in the spec)

Parser: M203 S1 (mm/s), M203 I (min speed), RRF M205 S/T. Input-shaping wait (M593), M566 P jerk policy 1, M595 ring size, CoreXY/delta kinematic limits.

## Progress

Not started.
