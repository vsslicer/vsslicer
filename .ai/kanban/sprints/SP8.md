---
id: SP8
title: M2 Open
status: done
milestone: M2
start: "2026-10-26T07:20+00:00"
end: "2026-10-26T09:30+00:00"
capacity: 92
committed: 305
completed: 92
closed: "2026-10-26T09:11+00:00"
---

Planned by `board.py plan-sprints M2`: 91 points, 35 cards.

## Epics

- VSS:E11 Define the unified profile schema, settings catalogue and condition evaluator
- VSS:E9 Build @vsslicer/mesh for STL and OBJ parsing in workers with a BVH
- VSS:E12 Import vendor and installed profiles from PrusaSlicer, Orca, Bambu Studio and Cura
- VSS:E10 Ship vsslicer.project in viewer mode

## Plan at start (coordinator, 07:30)

Sized from workable cards only (estimation rules 6 and 23). Of the cards planned into SP8, the workable
ones are PRF-180, PRF-10, PRF-11, PRF-24, PRF-124 and PRF-125 (15 points); everything else in SP8 is
owner-blocked (Q7, Q8, Q12, Q14, Q15, Q16, Q19, Q20, D14, the owner's slicer exports), waits on a
pending decision (D17, D19, D20), or depends on a card that does (each carries an "SP8 start" note).
PRF-145 is on hold (Q20 and the vendored-data question); PRF-57 needs profiles releases planned for SP10.

Pulled in, all workable: PRF-35, PRF-70 (split per rule 17 into PRF-70 M and PRF-181 M), PRF-71, PRF-103,
PRF-136 from SP9 to SP11 (M2); GCP-41 (gcode-preview, M2); and from M3 the module scaffolds PRN-2, 15, 86,
95, 104, 112, 120, 130, SLC-2, 8, 15, 43, 55, 65, 100 and PLT-49.

| Lane (module) | Cards | Points |
|---|---|---|
| profile-api | PRF-180, PRF-136 (release) | 3 |
| profiles-prusa | PRF-10, PRF-24, PRF-11 | 9 |
| profiles-orca | PRF-124, PRF-103 | 5 |
| profiles-cura | PRF-125 | 2 |
| profiles | PRF-35, PRF-70, PRF-181, PRF-71 | 11 |
| gcode-preview | GCP-41 | 3 |
| 16 new modules | one scaffold card each | 32 |
| sprint cards | VSS-47 audit, VSS-82 retro | 4 |

Workable: 65 task points plus 4 for the audit and retro. Capacity at 20 points an hour per lane with
work over about 80 minutes of building (07:30 to 08:50; the audit gets 30 minutes or more after that)
exceeds the workable points, so the workable points are the plan, with PRF-33 (split) as the reserve.
Busiest lane: profiles, 11 points, about 35 minutes.

## Result

Closed 2026-10-26T09:11+00:00: 92 of 305 points, 42 of 122 cards done.

Carried over to SP9: PLT-7 Claim the vsslicer namespace on open-vsx.org and the Microsoft publisher, PLT-16 Run the integration matrix on three operating systems and VSCodium, PLT-18 Run snapshot tests on Linux in CI and add a regenerate workflow, PLT-19 Record meta-tests proving each harness turns CI red, PLT-24 Spike: trusted publishing to Open VSX and the Microsoft marketplace, PLT-25 Write the tag-driven release workflow, PLT-26 Add idempotent per-marketplace publish steps with named failures, PLT-27 Add the secret-leak scan over workflow logs, PLT-28 Rehearse a full release of the pack and record the marketplace checks, PLT-29 Test that installing the pack installs vsslicer.gcode, PLT-46 Snapshot tests for colour modes, themes and ranges, PLT-181 Reconcile the DCO requirement with the project commit convention, PLT-193 Add gcode-language to the extension pack, PLT-1 Create the public GitHub repository and protect main, PLT-9 Add the CI workflow: one job per changed module on three operating systems, PLT-10 Enforce DCO sign-off in CI, PLT-33 Spike: WebGPU probe and workers under the kit CSP, PLT-31 Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB, GCP-21 Run klipper_estimator as a black-box oracle in CI, GCP-25 Compare against PrusaSlicer M73 totals and per-layer progress, GCP-29 Measure three H2C prints against the estimates, GCP-42 Record host, worker and webview memory at 50, 200 and 500 MB, GCP-50 Define and publish the exports and commands: open, follow, stopFollow, GCP-51 Map file offsets to moves, GCP-52 Map layer and percent positions, GCP-53 Record feeds and test the API from a stub extension, GCP-54 Add the api-extractor semver check to CI, GCP-55 Add follow mode to the editor, GCP-56 Stop follow on stale feed or file mismatch, GCP-107 Add fan and temperature colour modes, GCP-79 Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material, GCP-18 Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI, VWR-10 Capture Bambu Studio and OrcaSlicer fixture projects, VWR-11 Capture PrusaSlicer 2.9 and Prusa 3.0 alpha fixture projects, VWR-12 Capture Cura workspace fixture projects, VWR-13 Detect the writer dialect from metadata and parts, VWR-18 Run the 3MF Consortium conformance suite in CI, VWR-19 Add lib3mf WASM as the CI oracle for counts, VWR-20 Implement readProject and the dialect dispatch, VWR-21 Read Bambu and Orca project config and embedded presets, VWR-22 Read Bambu and Orca objects, parts and instances, VWR-23 Read Bambu and Orca plates and slice info, VWR-24 Read Bambu and Orca layer data and cut information, VWR-25 Read PrusaSlicer 2.x config and objects, VWR-26 Read PrusaSlicer 2.x per-layer data, VWR-27 Read Cura workspace containers, VWR-28 Open Prusa 3.0 alpha projects core-only, VWR-29 Test untouched open and save for every dialect, VWR-30 Test that all dialects read into one Project shape, VWR-31 Run openPackage and readProject in a worker, VWR-32 Generate a 500 MB 3MF and measure host blocking, VWR-33 Publish the 3MF public API for other projects, VWR-45 Run admesh as the oracle in CI, VWR-49 Run mesh parsing in a Web Worker pool for the webview, VWR-50 Record parse, dedup and BVH time and memory in CI, VWR-52 Implement the ProjectModel store, VWR-53 Load files and meshes through the workers, VWR-54 Register the readonly custom editor for 3MF, STL and OBJ, VWR-55 Render meshes with three.js in the webview, VWR-56 Add orbit, pan, zoom and the view cube, VWR-57 Pick and hover objects with the BVH, VWR-59 Show plates and objects in a TreeView, VWR-60 Sync tree selection and 3D selection, VWR-61 Show plate thumbnails and sliced state, VWR-62 Add Preview sliced plate, VWR-64 Detect WebGL failure and say what to do, VWR-65 Show open and parse errors in the editor, VWR-66 Show oversized models as a box with Draw anyway, VWR-68 Restore camera and selection when the editor is shown again, VWR-69 Release GPU resources on dispose with a heap test, VWR-74 Release 3mf@0.2.0: readProject, dialect readers and the public API, VWR-75 Release mesh@0.1.0: parsers, stats, BVH and workers, VWR-76 Release mesh@0.2.0: benchmark numbers, PRF-23 Fetch the pinned vendor packs into a CI cache for golden tests, PRF-33 Read the PrusaSlicer 3.0 YAML tree behind the experimental flag, PRF-40 Download Prusa vendor bundles from upstream at a pinned commit, PRF-130 Download Cura resources from upstream when Cura is not installed, PRF-145 Release `profiles-data-orca@0.1.0`: the Orca and Bambu JSON trees, PRF-57 Create the `profiles-extension` module (vsslicer.profiles), PRF-179 State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE.
