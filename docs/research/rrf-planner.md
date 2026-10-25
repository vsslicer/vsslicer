# RepRapFirmware 3.6 motion planner: lookahead, junctions, arcs

Scope: how RepRapFirmware (RRF) 3.6 plans moves, so `@vsslicer/gcode-planner` can estimate print
times for `reprapfirmware` G-code (GCP-27). Source: Duet3D/RepRapFirmware tag `3.6.3`, commit
`aebf629` (aebf62958757609553aab34384a6fc39fc54eed4), cloned to `.reference/repos/RepRapFirmware`.
Researched 2026-10-25 (GCP-26). Raw notes: `.reference/notes/GCP-26-rrf-planner.md`.
Citations are `RepRapFirmware@aebf629:<path>:<line>`, paths under `src/`.

## Findings

### Lookahead: the DDA ring

- Each move is a DDA in a ring: 60 on SAME70 boards (Duet 3 MB6HC/6XD), 40 on SAM4E/SAM4S/SAME5x
  (Duet 2, Duet 3 Mini 5+), 20 otherwise (`src/Movement/Move.h:47-64`). `M595 P` resizes it and
  `R` sets the grace period (`src/Movement/DDARing.cpp:114-115`).
- A move stays `provisional`, so lookahead can still change it, until it is prepared. Moves are
  prepared just in time: once the already-prepared moves have less than `prepareAdvanceTime`
  left, about 50 ms (`src/Movement/MoveTiming.h:36`; `src/Movement/DDARing.cpp:266-283,364-378`).
  When the file feeds faster than the printer prints, the window is the ring length less those
  50 ms.
- Each new move runs `DDA::InitStandardMove` (`src/Movement/DDA.cpp:232-563`), which sets its
  limits and then runs `DoLookahead` on the move before it (`src/Movement/DDA.cpp:723-841`):
  1. The previous move's target end speed is `min(sqrt(2·d·L), v_req)` of the new move, which is
     assumed to end at rest (`DDA.cpp:547`).
  2. Walking backwards, each target is capped at that move's own requested speed (`:735-738`).
     The walk stops at a move that already reaches its requested speed (`:739-743`). It goes
     back one more move only when this move is deceleration-only, the earlier one has a
     deceleration phase, is still provisional, and the two may be joined. The earlier move's
     target becomes `min(sqrt(target² + 2·d·L), v_req)` (`:744-767`). Otherwise the target is
     capped at the reachable `sqrt(v_start² + 2·a·L)` (`:777-784`).
  3. Walking forwards again, each move takes `endSpeed = target`, gets its trapezoid
     recalculated, and passes its end speed on as the next move's start speed (`:789-840`).
- Joining (melding) two moves: with jerk policy 0, the default (`src/Movement/Move.cpp:357`; set
  with `M566 P`, `src/GCodes/GCodes2.cpp:3727-3731`), two moves are joined only when they match on
  three flags: printing, XY moving, and non-printing extruder (`DDA.cpp:536-544,750-757`). A
  printing move has XY motion and forward extrusion (`DDA.cpp:435`). A non-printing extruder move
  has E motion but is not printing (`:436`). A move that is not joined starts from rest
  (`:553-556`). So every print→travel, travel→retract and Z-hop boundary comes to a full stop.

### Junction / jerk model

- `DDA::MatchSpeeds` (`DDA.cpp:1006-1021`) uses one speed `v` on both sides of a junction. For
  every drive that moves in either move, `|u_i − w_i|·v ≤ jerk_i` (u, w are the two direction
  vectors), else `v = jerk_i/|u_i − w_i|`. The jerk used is the printing jerk (`M205`/`M566`).
- Direction vectors are unit length over the linear axes XYZ, and the E component is `e/L`
  (`DDA.cpp:1357+`, `NormaliseLinearMotion`). An E-only move is normalised by `Σ|E|`
  (`DDA.cpp:470-482`).
- A move cannot start from rest at the jerk speed: it starts at 0, unlike Marlin classic jerk.
- Acceleration: `a = boxIntersect(|u|, M201 per drive)` (`DDA.cpp:485-488`). For XY moves,
  `a = min(a, M204 P)` when printing and `M204 T` otherwise (`:489-492`). Deceleration equals
  acceleration (`:493`). `boxIntersect(v, box) = min over drives with v_i > 0 of box_i / v_i`
  (`DDA.cpp:1302-1320`).
- Pressure advance: on XY moves with PA > 0, the extruder's acceleration is capped at
  `maxJerk_E / PA` (`DDA.cpp:381-389`). PA is in seconds (`M572 S`).
- Speed: `v_req = min(max(F, minSpeed), boxIntersect(|u|, M203 per drive))` (`DDA.cpp:518-521`),
  where `minSpeed` is `M203 I`. CoreXY and the other kinematics can cut it further in motor space
  (`src/Movement/Kinematics/CoreKinematics.cpp:385-421`).
- Trapezoid (`DDA::RecalculateMove`, `DDA.cpp:888-1001`): accel and decel distances are
  `(v² − u²)/2a`. With no cruise phase, `V² = (2a·2d·L + 2a·ve² + 2d·vs²)/(2a + 2d)`. A move that
  only accelerates or only decelerates gets an acceleration that makes it fit (`:942-978`).
  `t = (V − vs)/a + (V − ve)/d + cruise/V` (`:996-999`). Accel or decel segments shorter than 10
  step clocks are dropped (`DDA.h:171`, 750 kHz clock, `src/RepRapFirmware.h:651`). The effect is
  negligible.

### G-code units and defaults

| Setting | RRF 3.6 | Source |
|---|---|---|
| M201 X Y Z E | mm/s², max accel per drive | `GCodes2.cpp:2444-2496` |
| M203 X Y Z E | mm/min, or mm/s with `S1`; `I` = minimum speed | `GCodes2.cpp:2498-2554` |
| M204 | `P` printing, `T` travel, `S` sets both; no `R` | `GCodes/GCodes5.cpp:337-366` |
| M205 X Y Z E | mm/s, printing jerk only, capped at the M566 max | `GCodes2.cpp:3699-3731`, `Movement/Move2.cpp:80-91` |
| M566 X Y Z E | mm/min, sets the max and the printing jerk; `P` jerk policy | same |
| Defaults: max feed | X/Y 100, Z 20, E 100 mm/s | `Config/Configuration.h:33-35` |
| Defaults: max accel | X/Y 1000, Z 200, E 500 mm/s² | `Configuration.h:37-39` |
| Defaults: jerk | X/Y 15, Z 10, E 5 mm/s (floor 0.1) | `Configuration.h:47-49,55` |
| Defaults: min speed | 0.5 mm/s | `Configuration.h:51` |
| Defaults: M204 P/T | 50000 mm/s² (M201 governs) | `Configuration.h:57-58` |

### Arc segmentation (G2/G3)

- `DoArcMove` (`src/GCodes/GCodes.cpp:3050-3080`):
  `segLen = clamp(min(sqrt(8·r·0.005), F/200), 0.02, 1.0)` mm, with F in mm/s, and
  `N = max(1, floor(r·sweep/segLen + 0.8))`. The constants are a deviation of 0.005 mm, 0.02 to
  1.0 mm per segment, and 200 segments/s (`Config/Configuration.h:220-223`).
- Arcs do not use `M669 S/T`. `M669 S` (segments/s) and `T` (min segment length), defaults 100
  and 0.2 mm (`Kinematics.h:235-236`, `Kinematics.cpp:87-100`), split linear moves on segmented
  kinematics: delta, SCARA, polar, and Cartesian/Core when set (`CoreKinematics.cpp:304`,
  `GCodes.cpp:2614`). This corrects the unverified row in `docs/research/gcode-viewer-simulation.md`
  (line 143).
- Each segment is its own DDA, so its joins pass through `MatchSpeeds`. The turn per segment is
  θ = sweep/N.

### Input shaping

- `M593` shaping does not change the planned trapezoid. The prepared parameters come from the
  DDA's accel, decel and top speed (`DDA.cpp:126-146`), and the total clocks are
  accel + steady + decel (`DDA.h:42`). Its only timing effect: a non-printing move after a
  printing move waits for the shaper's last impulse delay (`DDA.cpp:1059-1064`,
  `AxisShaper.cpp:272`). Shaping is off by default (`AxisShaper.cpp:65`).

## Implications for VSSlicer (spec for GCP-27)

Package `@vsslicer/gcode-planner`, layer `domain`: a new `rrfPlanner: Planner` next to
`constantSpeedPlanner` (`vsslicer/modules/gcode-planner/src/domain/planner.ts`).

1. **Limits** (`limits.ts`). Replace `FLAVOUR_DEFAULTS.reprapfirmware` (now the Marlin
   placeholder) with RRF's values: maxFeedrate X/Y/Z/E 100/100/20/100, maxAccel 1000/1000/200/500,
   jerk 15/15/10/5, `accelPrint` and `accelTravel` 50000, `accel` 50000, and `minFeedrate` 0.5.
   Keep Marlin's values for the fields RRF never reads. Add `minFeedrate` to
   `FLAVOUR_FIELDS.reprapfirmware`. `accelRetract`, `junctionDeviation`, `minTravelFeedrate` and
   the Klipper fields do not apply.
2. **Stream state wins over limits**, as in the other planners. `MoveCursor.state(kind, axis,
   limit)` for `MaxAccel`, `MaxFeedrate`, `Jerk` (the parser already turns M566 mm/min into mm/s),
   `AccelPrint`, `AccelTravel`, `PressureAdvance` and `Feedrate`. `Accel` (M204 S) stands in for
   whichever of P or T is unset. Shortcut: an `M204 S` after a `P` or `T` is wrong, because the
   cursor folds by kind and loses the order.
3. **Per move**: u = (dx, dy, dz, e)/L with L = |xyz|. For an E-only move use L = |e| and u_E = ±1.
   Set `xy = dx‖dy ≠ 0` and `printing = xy && e > 0`. Then `a = boxIntersect(|u|, maxAccel')`,
   where `maxAccel'_E = min(maxAccelE, jerkE/PA)` if `xy && PA > 0`. If `xy`, take
   `a = min(a, printing ? accelPrint : accelTravel)`. Finally
   `v_req = min(max(F, minFeedrate), boxIntersect(|u|, maxFeedrate))`.
4. **Junction**: two moves join only if `printing`, `xy` and `nonPrintingE` (E moves, not printing) all match
   (jerk policy 0). Otherwise both sides are 0. The join speed is
   `v = min(v_req_prev, v_req_next, sqrt(2·a_next·L_next))`, reduced per drive until
   `|u_prev_i − u_next_i|·v ≤ jerk_i`. The file starts and ends at rest.
5. **Lookahead**: a classic backward/forward pass (end ≤ `sqrt(next_end² + 2aL)`, start ≤
   reachable), limited to a sliding window of the last **40** moves (the Duet 3 Mini/Duet 2 ring).
   Moves older than that are committed and their end speeds frozen. Make the window a constant,
   not a `MachineLimits` field. Times come from the trapezoid formulas above.
6. **Arcs**: the parser has already cut G2/G3 into chords with a 0.05 mm tolerance and at most
   15° each (`gcode-parser/src/domain/machine.ts:32-33`). Each chord keeps `MoveFlag.Arc` and the
   arc's file offset (`machine.ts:180`). RRF's segments are finer, so between two chords of the
   same arc (both Arc, same file offset) compute:
   - the chord turn θc from the two directions, and `r = c/(2·sin(θc/2))`;
   - RRF's `segLen` from the formula above with the current F, and `θrrf = segLen/r`;
   - the junction with every `|Δu_i|` scaled by `θrrf/θc`, also used to cap the chord's `v_req`.

   Example: r = 5 mm, F = 100 mm/s, XY jerk 15 mm/s. Unscaled chords cap the speed at about
   53 mm/s. RRF's segments do not cap it (about 168 mm/s).

## Licence notes

RepRapFirmware is **GPL-3.0** ("licensed under GPLv3", `README.md`; `LICENCE` is GPL v3, with no
"or later" stated). Our module is AGPL-3.0-or-later, and GPLv3 §13 allows combining with AGPLv3.
Still, write GCP-27 from this description (the algorithm and constants), not by porting RRF's
source text. If code is ever ported, keep RRF's copyright notice and mark that file
GPL-3.0-only-compatible.

## Open questions

- **Keep the lower-confidence label** (`estimate: true`). The window depends on the board (20,
  40 or 60 moves, or `M595`) and on time-based commits. Input-shaping waits are ignored.
  Kinematic limits (CoreXY, delta) are not modelled. The arc rescale is approximate. Drop the
  label only after matching RRF's own `M37` simulation (`GCodes2.cpp:1438`, which runs this
  planner) or measured Duet prints within a stated tolerance.
- Parser gaps for RRF (gcode-parser, not GCP-27): `M203 S1` (mm/s) is always divided by 60
  (`machine.ts:252-253`); `M203 I` is not read as the minimum speed; `M205 S/T` are read as
  Marlin's minimum feedrates, which RRF's M205 does not have.
- Input-shaping wait: `M593` is not in `StateKind`. With shaping on, every print→non-print
  boundary is under-estimated by about one shaper period (unverified size).
