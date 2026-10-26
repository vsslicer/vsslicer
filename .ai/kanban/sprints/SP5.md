---
id: SP5
title: M1 Preview
status: done
milestone: M1
start: "2026-10-26T01:06+00:00"
end: "2026-10-26T03:30+00:00"
capacity: 92
committed: 67
completed: 67
closed: "2026-10-26T02:27+00:00"
scheduled: 124
---

Planned by `board.py plan-sprints M1`: 91 points, 28 cards.

## Epics

- VSS:E5 Ship the vsslicer.gcode preview and simulation editor
- VSS:E6 Add the G-code language: grammar, hovers and completion
- VSS:E7 Expose the preview API and live print follow

## Plan at start (coordinator, 01:10)

Trimmed at start: GCP-34, 36, 39, 40, 41, 42, 48, 50, 51, 52, 53, 54, 55, 56 (43 points) moved to SP6;
each card's Progress says why (dependency-blocked, Q7, or the one-card-per-module lane and rule 5).

Workable: 60 points (bugs 20, preview 20, language 18, spike 2), plus the audit and retro cards.
One card per module at a time; every agent runs in the background and each lane gets its next card
or review as soon as its agent stops (rule 11).

| Lane (module) | Cards in order |
|---|---|
| gcode-planner | GCP-88, GCP-90 + GCP-91, GCP-92 + GCP-93, GCP-37 |
| gcode-api + gcode-parser | GCP-89 (api and parser part), GCP-95 (parser part) |
| gcode-bgcode | GCP-94 |
| webview-kit | PLT-189, PLT-190 + PLT-191 |
| gcode-preview | GCP-31, GCP-32 (with GCP-33 on its own files), GCP-35, GCP-38; GCP-89 and GCP-95 preview parts in `load-preview.ts` after gcode-api and gcode-parser are released |
| gcode-language (new module) | GCP-43, GCP-44, GCP-45, GCP-46 + GCP-47, data files only |
| research | GCP-49 |

Critical path: GCP-31, 32, 35, 38 at 14 points, about 69 minutes (rule 5: 72). Releases: each module
once, by the coordinator, after its last card passes review.

## Result

Closed 2026-10-26T02:27+00:00: 67 of 124 points, 26 of 48 cards done.

Carried over to SP6: PLT-7 Claim the vsslicer namespace on open-vsx.org and the Microsoft publisher, PLT-16 Run the integration matrix on three operating systems and VSCodium, PLT-18 Run snapshot tests on Linux in CI and add a regenerate workflow, PLT-19 Record meta-tests proving each harness turns CI red, PLT-24 Spike: trusted publishing to Open VSX and the Microsoft marketplace, PLT-25 Write the tag-driven release workflow, PLT-26 Add idempotent per-marketplace publish steps with named failures, PLT-27 Add the secret-leak scan over workflow logs, PLT-28 Rehearse a full release of the pack and record the marketplace checks, PLT-29 Test that installing the pack installs vsslicer.gcode, PLT-46 Snapshot tests for colour modes, themes and ranges, PLT-181 Reconcile the DCO requirement with the project commit convention, PLT-1 Create the public GitHub repository and protect main, PLT-9 Add the CI workflow: one job per changed module on three operating systems, PLT-10 Enforce DCO sign-off in CI, PLT-33 Spike: WebGPU probe and workers under the kit CSP, PLT-31 Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB, GCP-21 Run klipper_estimator as a black-box oracle in CI, GCP-25 Compare against PrusaSlicer M73 totals and per-layer progress, GCP-29 Measure three H2C prints against the estimates, GCP-79 Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material, GCP-18 Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI.
