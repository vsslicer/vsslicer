---
id: SP9
title: M2 Open
status: done
milestone: M2
start: "2026-10-26T09:11+00:00"
end: "2026-10-26T11:30+00:00"
capacity: 92
committed: 280
completed: 66
closed: "2026-10-26T11:08+00:00"
---

Planned by `board.py plan-sprints M2`: 92 points, 32 cards.

## Epics

- VSS:E12 Import vendor and installed profiles from PrusaSlicer, Orca, Bambu Studio and Cura
- VSS:E10 Ship vsslicer.project in viewer mode
- VSS:E13 Build ProfileStore with resolve and lossless native round-trip export
- VSS:E14 Ship the vsslicer.profiles extension with profile tree, import commands and JSON Schema editing
- VSS:E15 Generate the settings form from the schema, with search and comparison
- VSS:E16 Add printer_instance entities with connections and credentials in SecretStorage
- VSS:E18 Import and export profile bundles (.orca_*, .bbscfg, .bbsflmt, INI bundles, .curaprofile)

## Result

Closed 2026-10-26T11:08+00:00: 66 of 280 points, 29 of 105 cards done.

Carried over to SP10: GCP-29 Measure three H2C prints against the estimates, GCP-42 Record host, worker and webview memory at 50, 200 and 500 MB, GCP-51 Map file offsets to moves, GCP-52 Map layer and percent positions, GCP-53 Record feeds and test the API from a stub extension, GCP-54 Add the api-extractor semver check to CI, GCP-55 Add follow mode to the editor, GCP-56 Stop follow on stale feed or file mismatch, GCP-107 Add fan and temperature colour modes, VWR-13 Detect the writer dialect from metadata and parts, VWR-20 Implement readProject and the dialect dispatch, VWR-21 Read Bambu and Orca project config and embedded presets, VWR-22 Read Bambu and Orca objects, parts and instances, VWR-23 Read Bambu and Orca plates and slice info, VWR-24 Read Bambu and Orca layer data and cut information, VWR-25 Read PrusaSlicer 2.x config and objects, VWR-26 Read PrusaSlicer 2.x per-layer data, VWR-27 Read Cura workspace containers, VWR-28 Open Prusa 3.0 alpha projects core-only, VWR-29 Test untouched open and save for every dialect, VWR-30 Test that all dialects read into one Project shape, VWR-31 Run openPackage and readProject in a worker, VWR-32 Generate a 500 MB 3MF and measure host blocking, VWR-33 Publish the 3MF public API for other projects, VWR-45 Run admesh as the oracle in CI, VWR-50 Record parse, dedup and BVH time and memory in CI, VWR-52 Implement the ProjectModel store, VWR-53 Load files and meshes through the workers, VWR-54 Register the readonly custom editor for 3MF, STL and OBJ, VWR-55 Render meshes with three.js in the webview, VWR-56 Add orbit, pan, zoom and the view cube, VWR-57 Pick and hover objects with the BVH, VWR-58 Draw the printer bed and a wireframe toggle, VWR-59 Show plates and objects in a TreeView, VWR-60 Sync tree selection and 3D selection, VWR-61 Show plate thumbnails and sliced state, VWR-62 Add Preview sliced plate, VWR-63 Export ProjectModel and renderThumbnail, VWR-64 Detect WebGL failure and say what to do, VWR-65 Show open and parse errors in the editor, VWR-66 Show oversized models as a box with Draw anyway, VWR-67 Show mesh warnings from the statistics, VWR-68 Restore camera and selection when the editor is shown again, VWR-69 Release GPU resources on dispose with a heap test, VWR-70 Snapshot the viewer for each dialect, VWR-71 Record frame time at 1, 5 and 20 million triangles, VWR-72 Capture and check an H2C-sliced project, VWR-74 Release 3mf@0.2.0: readProject, dialect readers and the public API, VWR-75 Release mesh@0.1.0: parsers, stats, BVH and workers, VWR-76 Release mesh@0.2.0: benchmark numbers, PRF-25 Flatten Prusa sections into unified entities and golden counts, PRF-26 Import SuperSlicer INI with its 356 extra keys, PRF-27 Read Orca and Bambu JSON trees and flatten include and inherits, PRF-28 Decode extruder-variant arrays for H2D and H2C into keyed per-extruder values, PRF-29 Import Orca user presets with .info sidecars and OrcaFilamentLibrary, PRF-30 Read Cura definitions, extruders and variants, PRF-31 Read Cura quality, quality_changes and definition_changes, PRF-32 Import fdm_materials XML as material entities, PRF-34 Split per-nozzle Prusa printer presets into printer_model, nozzle and overrides, PRF-40 Download Prusa vendor bundles from upstream at a pinned commit, PRF-42 Check resolved values for 20 Prusa tuples against the oracle, PRF-58 Spike: which workspace folder holds user profiles, PRF-60 Create the fixture workspace and per-OS slicer configuration folders, PRF-67 Contribute jsonValidation and schema completion for profile files, PRF-69 Spike: usability of percent-or-absolute and Cura formula widgets, PRF-126 Split per-nozzle Orca printer presets into printer_model, nozzle and overrides, PRF-128 Check resolved values for 20 Orca and Bambu tuples against the oracle, PRF-129 Check resolved values for 20 Cura tuples against the oracle, PRF-130 Download Cura resources from upstream when Cura is not installed, PRF-145 Release `profiles-data-orca@0.1.0`: the Orca and Bambu JSON trees, PRF-57 Create the `profiles-extension` module (vsslicer.profiles), PRF-179 State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE, PRF-192 Move profile-api's catalogue data into its own AGPL-3.0-only package, PRF-89 Read PrusaSlicer 2.9 physical_printer INI and 3.0 JSON, PRN-4 Define the normalised PrinterStatus, PRN-132 Write files safely with temp file, fsync and rename.
