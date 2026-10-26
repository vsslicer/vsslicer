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
sprint: "VSS:SP4"
owner: GCP-27-worker
depends_on: [26, 19]
created: 2026-10-25
---

Package `@vsslicer/gcode-planner`, layer `domain` (`src/domain/rrf-planner.ts` + `limits.ts`).
Spec: `docs/research/rrf-planner.md` section "Implications for VSSlicer" (from GCP-26, RRF 3.6.3
@ aebf629). RRF is GPL-3.0: write from the spec, do not port RRF source.

## Acceptance criteria

- [x] `FLAVOUR_DEFAULTS.reprapfirmware` holds RRF defaults (feed 100/100/20/100 mm/s, accel 1000/1000/200/500, jerk 15/15/10/5, accelPrint/accelTravel/accel 50000, minFeedrate 0.5) with the `Configuration.h` citation; `minFeedrate` added to `FLAVOUR_FIELDS.reprapfirmware`
- [x] Per-axis instantaneous speed change from M566 (mm/min) is converted correctly (unit test: M566 X900 Y900 -> 15 mm/s; a 90 degree X->Y corner has |du_x|=|du_y|=1, so the join speed is 15 mm/s)
- [x] M201/M203/M204 are honoured: accel = box intersection of M201 per axis, min M204 P (printing) or T (travel) on XY moves only; speed = min(max(F, minFeedrate), box intersection of M203); M204 S stands in for unset P/T (unit tests each)
- [x] Junctions: moves join only when printing, XY-moving and non-printing-E flags match (else both sides 0); join speed limited per drive by |u_prev - u_next| * v <= jerk, E component = e/L; file starts and ends at rest (unit tests: print->travel stops; collinear moves cruise through)
- [x] Lookahead is a backward/forward pass over a sliding window of 40 moves; trapezoid timing uses V^2 = (2a.2d.L + 2a.ve^2 + 2d.vs^2)/(2a+2d) when there is no cruise (unit test vs hand-computed triangle and trapezoid)
- [x] Pressure advance (M572 S, `StateKind.PressureAdvance`) caps E accel at jerkE/PA on XY moves (unit test)
- [x] Arc chords (MoveFlag.Arc, same file offset) use RRF's segment turn: segLen = clamp(min(sqrt(8 r 0.005), F/200), 0.02, 1), |du| scaled by (segLen/r)/chordTurn (unit test: r=5, F=100, jerk 15 is not capped)
- [x] Results are labelled lower confidence (`estimate: true`): GCP-26 says keep the label until compared with RRF M37 simulation or measured Duet prints
- [x] Module lint, test, build pass; patch/minor bump and CHANGELOG entry naming GCP-27

## Tasks

- [x] RRF defaults and fields in limits.ts
- [x] Per-move limits (accel, speed, PA)
- [x] Junction + windowed lookahead + trapezoid timing
- [x] Arc chord rescale
- [x] Tests

## Out of scope (follow-ups noted in the spec)

Parser: M203 S1 (mm/s), M203 I (min speed), RRF M205 S/T. Input-shaping wait (M593), M566 P jerk policy 1, M595 ring size, CoreXY/delta kinematic limits.

## Progress

Done. `src/domain/rrf-planner.ts` (new), RRF defaults and `minFeedrate` field in `limits.ts`, `plannerFor` routes `reprapfirmware` to `rrfPlanner` (small edit in GCP-28's `bambu.ts`), exports in `index.ts`, CHANGELOG under Unreleased (no version bump: PUBLISH no, coordinator releases).

Verified: `pnpm lint && pnpm test && pnpm build` in gcode-planner (64 tests). `test/rrf.test.ts` has hand-computed trapezoid and triangle, M201/M203/M204 P/T/S, minFeedrate, print->travel stop, collinear cruise, 90 degree corner at 15 mm/s, PA cap, 100-move run through the 40-move window, arc chord scaling (r=5, F=100 not jerk-capped), plus the harness `checkPlanner`, `checkDwell` and `checkLimitPrecedence`.

Notes: join speed is min(vreq prev, vreq next) then per-drive jerk; the sqrt(2aL) bound of the spec's step 4 comes from the lookahead passes (applying it statically to the join would wrongly cap short collinear moves). Each pass recomputes from per-move join caps. A G4 flushes the window (moves end at rest) before the dwell. Zero-length moves keep their place and the neighbours still join. Fallback feedrate before the first F is 25 mm/s (unverified). `estimate` stays true. Not done: out-of-scope items on the card.

Files: vsslicer/modules/gcode-planner/src/domain/rrf-planner.ts, src/domain/limits.ts, src/domain/bambu.ts, src/index.ts, test/rrf.test.ts, CHANGELOG.md.

Review (GCP-27-reviewer): PASS. Fallback feedrate changed 25 -> 50 mm/s, RRF DefaultFeedRate 3000 mm/min (RepRapFirmware@aebf629:src/Config/Configuration.h:214). Dropping the static sqrt(2aL) join bound matches RRF: DDA.cpp:547 sets it only as the provisional bound while the new move is last, and DoLookahead re-raises it as later moves arrive (DDA.cpp:744-767); the windowed backward pass from ve=0 does the same.
