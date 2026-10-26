---
id: M1
title: Preview
status: draft
start: "2026-10-25T23:30+00:00"
due: "2026-10-26T05:30+00:00"
initiatives: I1
---

`vsslicer.gcode` 0.1 on both marketplaces: preview, simulation, G-code language; the monorepo and CI.

Dates are the planner's proposal (D8), assuming two-week sprints and one coordinator with
parallel agent workers; they move with measured velocity after Sprint 1.

## State at SP5 close (2026-10-26, coordinator)

M1 is **not complete**: 113 of 160 M1 cards are done (310 of 436 points); 47 cards (126 points) remain.
Nothing has shipped to a marketplace: every release step waits on the owner (Q7, Q8).

**Delivered** (all published to the local registry, clean-registry `run.mjs ci` exit 0 at SP5 close):

- `gcode-preview` 0.3.0: custom editor for `.gcode`/`.bgcode`, worker parse and plan, WebGL2 instanced
  renderer (libvgcode port), four colour modes, orbit/pan/zoom and view presets, layer and move sliders,
  toggles, legend, timeline with play/pause/step/speed and a toolhead marker; follows the `;FLAVOR:` header.
- `gcode-language` 0.1.0 (new in SP5): the `gcode` language and TextMate grammar, flavour status bar and
  per-file override, a command catalogue (Marlin 2, Prusa Buddy, Klipper, RRF, Bambu), hover, completion,
  unknown-command warnings, the over-50 MB message.
- Parser, planners (Klipper, Marlin/Buddy, RRF, Bambu, constant speed), toolhead interpolation,
  `.bgcode`, webview-kit (transport, GL renderer, context-loss handling), the module layout and runner.

**Carried, and why:**

| Cards | Reason |
|---|---|
| PLT-1, 7, 9, 10, 16, 18, 19, 24 to 29, 46; GCP-18's CI step | Owner: Q7 (no GitHub remote) and Q8 (marketplace accounts) |
| PLT-181 | Owner: Q12 (DCO convention) |
| PLT-31, PLT-33 | Owner: Q16, Q15 (Windows and Linux runs) |
| GCP-21 | Owner: Q14 (klipper_estimator oracle) |
| GCP-29 | Owner hardware (D14, H2C prints) |
| GCP-79 criteria 1 to 4, GCP-25 behind it | Owner slicer exports |
| GCP-15, GCP-16 (SP7), and GCP-36, 39, 52, 53, 55, 56 behind GCP-16 | Dependency on the `.gcode.3mf` reader, planned behind VWR-73 |
| GCP-41, GCP-42, GCP-34, GCP-54 | Wait on GCP-18's CI step / CI (Q7) |
| GCP-40, GCP-50, GCP-51 | Lane capacity: one card per module at a time in gcode-preview; moved at SP5 start |
| GCP-96, GCP-97 | Split in SP5: four colour modes need a kit shader change and per-move data (D17); trapezoid-accurate marker |
| GCP-98 to GCP-106 | SP5 audit bug cards (GCP-98 P0: false warnings on Bambu files) |

The due date (03:30) has passed; the SP5 retro's dry run puts the remaining 52 workable points in SP6.
Proposed: move M1's due to SP6's end and treat the owner-blocked release cards as M1's last gate.

## Due date moved (SP9, 2026-10-26)

Owner answer Q18 ("Move to SP6 end"): M1's due date is SP6's end, 2026-10-26 05:30. Its remaining
remote and marketplace cards (Q7, Q8, Q13) moved to M7 (Owner setup) in SP9.
