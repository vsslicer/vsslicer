---
id: SP7
title: M2 Open
status: done
milestone: M2
start: "2026-10-26T04:48+00:00"
end: "2026-10-26T07:30+00:00"
capacity: 92
committed: 235
completed: 79
closed: "2026-10-26T07:20+00:00"
---

Planned by `board.py plan-sprints M2`: 92 points, 34 cards.

## Epics

- VSS:E11 Define the unified profile schema, settings catalogue and condition evaluator
- VSS:E9 Build @vsslicer/mesh for STL and OBJ parsing in workers with a BVH

## Result

Closed 2026-10-26T07:20+00:00: 79 of 235 points, 33 of 92 cards done.

Carried over to SP8: PLT-7 Claim the vsslicer namespace on open-vsx.org and the Microsoft publisher, PLT-16 Run the integration matrix on three operating systems and VSCodium, PLT-18 Run snapshot tests on Linux in CI and add a regenerate workflow, PLT-19 Record meta-tests proving each harness turns CI red, PLT-24 Spike: trusted publishing to Open VSX and the Microsoft marketplace, PLT-25 Write the tag-driven release workflow, PLT-26 Add idempotent per-marketplace publish steps with named failures, PLT-27 Add the secret-leak scan over workflow logs, PLT-28 Rehearse a full release of the pack and record the marketplace checks, PLT-29 Test that installing the pack installs vsslicer.gcode, PLT-46 Snapshot tests for colour modes, themes and ranges, PLT-181 Reconcile the DCO requirement with the project commit convention, PLT-193 Add gcode-language to the extension pack, PLT-1 Create the public GitHub repository and protect main, PLT-9 Add the CI workflow: one job per changed module on three operating systems, PLT-10 Enforce DCO sign-off in CI, PLT-33 Spike: WebGPU probe and workers under the kit CSP, PLT-31 Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB, GCP-21 Run klipper_estimator as a black-box oracle in CI, GCP-25 Compare against PrusaSlicer M73 totals and per-layer progress, GCP-29 Measure three H2C prints against the estimates, GCP-41 Test the 50 MB-plus file through the custom editor, GCP-42 Record host, worker and webview memory at 50, 200 and 500 MB, GCP-50 Define and publish the exports and commands: open, follow, stopFollow, GCP-51 Map file offsets to moves, GCP-52 Map layer and percent positions, GCP-53 Record feeds and test the API from a stub extension, GCP-54 Add the api-extractor semver check to CI, GCP-55 Add follow mode to the editor, GCP-56 Stop follow on stale feed or file mismatch, GCP-107 Add fan and temperature colour modes, GCP-79 Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material, GCP-18 Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI, VWR-10 Capture Bambu Studio and OrcaSlicer fixture projects, VWR-11 Capture PrusaSlicer 2.9 and Prusa 3.0 alpha fixture projects, VWR-12 Capture Cura workspace fixture projects, VWR-13 Detect the writer dialect from metadata and parts, VWR-18 Run the 3MF Consortium conformance suite in CI, VWR-19 Add lib3mf WASM as the CI oracle for counts, VWR-20 Implement readProject and the dialect dispatch, VWR-21 Read Bambu and Orca project config and embedded presets, VWR-22 Read Bambu and Orca objects, parts and instances, VWR-23 Read Bambu and Orca plates and slice info, VWR-24 Read Bambu and Orca layer data and cut information, VWR-25 Read PrusaSlicer 2.x config and objects, VWR-26 Read PrusaSlicer 2.x per-layer data, VWR-27 Read Cura workspace containers, VWR-28 Open Prusa 3.0 alpha projects core-only, VWR-29 Test untouched open and save for every dialect, VWR-30 Test that all dialects read into one Project shape, VWR-31 Run openPackage and readProject in a worker, VWR-32 Generate a 500 MB 3MF and measure host blocking, VWR-33 Publish the 3MF public API for other projects, VWR-45 Run admesh as the oracle in CI, VWR-49 Run mesh parsing in a Web Worker pool for the webview, VWR-50 Record parse, dedup and BVH time and memory in CI, VWR-74 Release 3mf@0.2.0: readProject, dialect readers and the public API, VWR-75 Release mesh@0.1.0: parsers, stats, BVH and workers, PRF-179 State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE.
