# SP9 retro: M2 Open

Card VSS-83. Written by the retro agent (`sp9-retro`, Opus), who wrote none of SP9's code. Sources:
`board.py retro SP9` (below, unedited), the start, stop, dispatch and move events in
`.ai/local/taskboard/activity.jsonl` from 2026-10-26T09:11, `git log 8174765e..HEAD`, the review text in
the cards' Progress in `.ai/kanban/projects/{profiles,printers,slicer,platform,gcode,viewer}/`, and the sprint
doc `.ai/kanban/sprints/SP9.md`. Facts the coordinator (`sp9-coordinator`) supplied are marked
"(coordinator)" and were checked against the events where the events show them. The audit (VSS-48) ran
in parallel; its findings are not in this retro.

## SP9 M2 Open: the facts

- Planned: 2026-10-26T09:11+00:00 to 2026-10-26T11:30+00:00, 280 points (120.9 points/hour)
- Actual: last card done 2026-10-26T10:44+00:00, 62 points (40.0 points/hour), -46 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PLT-31 | spike | S | 2 | opus | 23:22 | 10:44 | 682 | $5.74 | Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB |
| PLT-33 | spike | S | 2 | opus | 23:22 | 10:44 | 682 | $1.69 | Spike: WebGPU probe and workers under the kit CSP |
| GCP-115 | bug | S | 2 | sonnet | 09:19 | 10:24 | 65 | $3.74 | Replace wall-clock asserts in gcode-bgcode and gcode-parser tests |
| PRF-191 | feature | M | 3 | opus | 09:30 | 10:24 | 54 | $2.18 | Read the PrusaSlicer 3.0 preset trees and variants behind the experimental flag |
| VWR-395 | bug | S | 2 | sonnet | 09:19 | 10:05 | 46 | $1.22 | Replace wall-clock asserts in 3mf tests |
| PRF-186 | bug | S | 2 | sonnet | 09:20 | 10:05 | 46 | $1.24 | Replace the wall-clock assert in profile-api catalogue-prusa test |
| GCP-50 | feature | M | 3 | opus | 09:30 | 10:14 | 44 | $3.26 | Define and publish the exports and commands: open, follow, stopFollow |
| VWR-49 | feature | M | 3 | sonnet | 09:30 | 10:14 | 44 | $2.28 | Run mesh parsing in a Web Worker pool for the webview |
| PRF-33 | feature | L | 5 | opus | 09:30 | 10:14 | 44 | $4.33 | Read the PrusaSlicer 3.0 YAML tree behind the experimental flag |
| GCP-21 | chore | M | 3 | sonnet | 09:30 | 10:07 | 37 | $2.46 | Run klipper_estimator as a black-box oracle in CI |
| PRF-190 | feature | M | 3 | sonnet | 09:45 | 10:20 | 35 | $1.69 | Generate profiles-data-orca's data at publish time from the pinned upstream commit |
| PLT-181 | bug | S | 2 | sonnet | 09:30 | 10:00 | 30 | $0.52 | Reconcile the DCO requirement with the project commit convention |
| PLT-196 | feature | S | 2 | sonnet | 09:30 | 10:00 | 30 | $0.56 | Add an extension-id override to the tooling VSIX packager |
| SLC-13 | feature | S | 2 | opus | 10:09 | 10:36 | 27 | $4.38 | Extract zip and tar.gz archives with a path-traversal guard |
| PLT-195 | bug | S | 2 | sonnet | 09:17 | 09:43 | 26 | $0.70 | Copy NOTICE and PROVENANCE of bundled vsslicer packages into third-party notices |
| VWR-394 | bug | S | 2 | sonnet | 09:17 | 09:43 | 26 | $0.68 | Cap XML nesting depth in 3mf startTags and scanModel |
| PRF-189 | bug | S | 2 | sonnet | 09:17 | 09:43 | 26 | $0.60 | Delete the dead host check in the Orca bundle reader |
| PRF-185 | bug | S | 2 | sonnet | 09:17 | 09:43 | 26 | $0.50 | Cap total entries in the Prusa INI reader |
| PRN-443 | bug | S | 2 | sonnet | 09:17 | 09:43 | 26 | $0.74 | Keep the extension when cutting names over 1024 characters in printer-folder |
| PRF-184 | bug | XS | 1 | sonnet | 09:18 | 09:43 | 25 | $0.50 | Stop rewriting PRINTER_VENDOR_PRUSA3D to printer.vendor as exact |
| SLC-277 | bug | S | 2 | sonnet | 09:18 | 09:43 | 25 | $0.46 | Make the runProcess kill tests independent of node start-up time |
| PLT-197 | feature | S | 2 | sonnet | 10:16 | 10:40 | 24 | $2.10 | Allow AGPL-3.0-only for data packages that ship PROVENANCE.md in the licence check |
| SLC-278 | bug | S | 2 | sonnet | 09:19 | 09:43 | 24 | $0.46 | Bound the slicer timeout setting to what runProcess accepts |
| PRF-188 | bug | S | 2 | sonnet | 09:24 | 09:43 | 19 | $0.65 | Check exporter output paths in the profile-api port contract |
| PRF-187 | bug | S | 2 | sonnet | 09:25 | 09:43 | 18 | $0.65 | Ship PROVENANCE.md in the profile-api package |
| PRF-131 | feature | S | 2 | opus | 10:09 | 10:20 | 11 | $1.70 | Read and write .curaprofile archives with safety limits |
| GCP-116 | bug | M | 3 | opus | 10:09 | 10:15 | 6 | $1.00 | Close the 7.3 s Klipper planner gap on zig-zag infill against klipper_estimator |
| VSS-48 | chore | S | 2 | opus | - | - | - | $0.33 | SP9: audit review and bugfix |
| VSS-83 | chore | S | 2 | opus | - | - | - | $0.47 | SP9: retro |
| GCP-29 | chore | S | 2 | sonnet | - | - | - | - | Measure three H2C prints against the estimates |
| GCP-42 | chore | L | 5 | sonnet | - | - | - | - | Record host, worker and webview memory at 50, 200 and 500 MB |
| GCP-51 | feature | M | 3 | sonnet | - | - | - | - | Map file offsets to moves |
| GCP-52 | feature | S | 2 | sonnet | - | - | - | - | Map layer and percent positions |
| GCP-53 | chore | M | 3 | sonnet | - | - | - | - | Record feeds and test the API from a stub extension |
| GCP-54 | chore | S | 2 | sonnet | - | - | - | - | Add the api-extractor semver check to CI |
| GCP-55 | feature | L | 5 | sonnet | - | - | - | - | Add follow mode to the editor |
| GCP-56 | feature | S | 2 | sonnet | - | - | - | - | Stop follow on stale feed or file mismatch |
| GCP-107 | feature | L | 5 | opus | - | - | - | - | Add fan and temperature colour modes |
| VWR-13 | feature | S | 2 | sonnet | - | - | - | - | Detect the writer dialect from metadata and parts |
| VWR-20 | feature | S | 2 | sonnet | - | - | - | - | Implement readProject and the dialect dispatch |
| VWR-21 | feature | M | 3 | opus | - | - | - | - | Read Bambu and Orca project config and embedded presets |
| VWR-22 | feature | M | 3 | opus | - | - | - | - | Read Bambu and Orca objects, parts and instances |
| VWR-23 | feature | M | 3 | sonnet | - | - | - | - | Read Bambu and Orca plates and slice info |
| VWR-24 | feature | S | 2 | sonnet | - | - | - | - | Read Bambu and Orca layer data and cut information |
| VWR-25 | feature | M | 3 | opus | - | - | - | - | Read PrusaSlicer 2.x config and objects |
| VWR-26 | feature | S | 2 | sonnet | - | - | - | - | Read PrusaSlicer 2.x per-layer data |
| VWR-27 | feature | S | 2 | sonnet | - | - | - | - | Read Cura workspace containers |
| VWR-28 | feature | S | 2 | sonnet | - | - | - | - | Open Prusa 3.0 alpha projects core-only |
| VWR-29 | chore | S | 2 | sonnet | - | - | - | - | Test untouched open and save for every dialect |
| VWR-30 | chore | S | 2 | sonnet | - | - | - | - | Test that all dialects read into one Project shape |
| VWR-31 | feature | M | 3 | sonnet | - | - | - | - | Run openPackage and readProject in a worker |
| VWR-32 | chore | L | 5 | opus | - | - | - | - | Generate a 500 MB 3MF and measure host blocking |
| VWR-33 | feature | S | 2 | sonnet | - | - | - | - | Publish the 3MF public API for other projects |
| VWR-45 | chore | S | 2 | sonnet | - | - | - | - | Run admesh as the oracle in CI |
| VWR-50 | chore | L | 5 | opus | - | - | - | - | Record parse, dedup and BVH time and memory in CI |
| VWR-52 | feature | M | 3 | sonnet | - | - | - | - | Implement the ProjectModel store |
| VWR-53 | feature | M | 3 | sonnet | - | - | - | - | Load files and meshes through the workers |
| VWR-54 | feature | M | 3 | sonnet | - | - | - | - | Register the readonly custom editor for 3MF, STL and OBJ |
| VWR-55 | feature | L | 5 | opus | - | - | - | - | Render meshes with three.js in the webview |
| VWR-56 | feature | M | 3 | sonnet | - | - | - | - | Add orbit, pan, zoom and the view cube |
| VWR-57 | feature | M | 3 | sonnet | - | - | - | - | Pick and hover objects with the BVH |
| VWR-58 | feature | S | 2 | sonnet | - | - | - | - | Draw the printer bed and a wireframe toggle |
| VWR-59 | feature | M | 3 | sonnet | - | - | - | - | Show plates and objects in a TreeView |
| VWR-60 | feature | S | 2 | sonnet | - | - | - | - | Sync tree selection and 3D selection |
| VWR-61 | feature | M | 3 | sonnet | - | - | - | - | Show plate thumbnails and sliced state |
| VWR-62 | feature | M | 3 | opus | - | - | - | - | Add Preview sliced plate |
| VWR-63 | feature | M | 3 | sonnet | - | - | - | - | Export ProjectModel and renderThumbnail |
| VWR-64 | feature | S | 2 | sonnet | - | - | - | - | Detect WebGL failure and say what to do |
| VWR-65 | feature | M | 3 | sonnet | - | - | - | - | Show open and parse errors in the editor |
| VWR-66 | feature | M | 3 | sonnet | - | - | - | - | Show oversized models as a box with Draw anyway |
| VWR-67 | feature | S | 2 | sonnet | - | - | - | - | Show mesh warnings from the statistics |
| VWR-68 | feature | M | 3 | sonnet | - | - | - | - | Restore camera and selection when the editor is shown again |
| VWR-69 | feature | S | 2 | sonnet | - | - | - | - | Release GPU resources on dispose with a heap test |
| VWR-70 | chore | M | 3 | sonnet | - | - | - | - | Snapshot the viewer for each dialect |
| VWR-71 | chore | M | 3 | opus | - | - | - | - | Record frame time at 1, 5 and 20 million triangles |
| VWR-72 | chore | S | 2 | sonnet | - | - | - | - | Capture and check an H2C-sliced project |
| VWR-74 | chore | XS | 1 | sonnet | - | - | - | - | Release 3mf@0.2.0: readProject, dialect readers and the public API |
| VWR-75 | chore | XS | 1 | sonnet | - | - | - | - | Release mesh@0.1.0: parsers, stats, BVH and workers |
| VWR-76 | chore | XS | 1 | sonnet | - | - | - | - | Release mesh@0.2.0: benchmark numbers |
| PRF-25 | feature | L | 5 | opus | - | - | - | - | Flatten Prusa sections into unified entities and golden counts |
| PRF-26 | feature | S | 2 | sonnet | - | - | - | - | Import SuperSlicer INI with its 356 extra keys |
| PRF-27 | feature | L | 5 | opus | - | - | - | - | Read Orca and Bambu JSON trees and flatten include and inherits |
| PRF-28 | feature | M | 3 | opus | - | - | - | - | Decode extruder-variant arrays for H2D and H2C into keyed per-extruder values |
| PRF-29 | feature | M | 3 | sonnet | - | - | - | - | Import Orca user presets with .info sidecars and OrcaFilamentLibrary |
| PRF-30 | feature | L | 5 | opus | - | - | - | - | Read Cura definitions, extruders and variants |
| PRF-31 | feature | M | 3 | sonnet | - | - | - | - | Read Cura quality, quality_changes and definition_changes |
| PRF-32 | feature | M | 3 | sonnet | - | - | - | - | Import fdm_materials XML as material entities |
| PRF-34 | feature | M | 3 | opus | - | - | - | - | Split per-nozzle Prusa printer presets into printer_model, nozzle and overrides |
| PRF-40 | feature | M | 3 | sonnet | - | - | - | - | Download Prusa vendor bundles from upstream at a pinned commit |
| PRF-42 | feature | L | 5 | opus | - | - | - | - | Check resolved values for 20 Prusa tuples against the oracle |
| PRF-58 | spike | S | 2 | opus | - | - | - | - | Spike: which workspace folder holds user profiles |
| PRF-60 | chore | M | 3 | sonnet | - | - | - | - | Create the fixture workspace and per-OS slicer configuration folders |
| PRF-67 | feature | S | 2 | sonnet | - | - | - | - | Contribute jsonValidation and schema completion for profile files |
| PRF-69 | spike | S | 2 | opus | - | - | - | - | Spike: usability of percent-or-absolute and Cura formula widgets |
| PRF-126 | feature | M | 3 | opus | - | - | - | - | Split per-nozzle Orca printer presets into printer_model, nozzle and overrides |
| PRF-128 | feature | M | 3 | opus | - | - | - | - | Check resolved values for 20 Orca and Bambu tuples against the oracle |
| PRF-129 | feature | M | 3 | opus | - | - | - | - | Check resolved values for 20 Cura tuples against the oracle |
| PRF-130 | feature | S | 2 | sonnet | - | - | - | - | Download Cura resources from upstream when Cura is not installed |
| PRF-145 | chore | XS | 1 | sonnet | - | - | - | - | Release `profiles-data-orca@0.1.0`: the Orca and Bambu JSON trees |
| PRF-57 | chore | S | 2 | sonnet | 06:03 | - | - | - | Create the `profiles-extension` module (vsslicer.profiles) |
| PRF-179 | bug | S | 2 | opus | 04:53 | - | - | $1.50 | State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE |
| PRF-192 | feature | L | 5 | opus | 10:09 | - | - | $2.02 | Move profile-api's catalogue data into its own AGPL-3.0-only package |
| PRF-89 | feature | M | 3 | sonnet | 10:25 | - | - | $2.29 | Read PrusaSlicer 2.9 physical_printer INI and 3.0 JSON |
| PRN-4 | feature | M | 3 | opus | 10:09 | - | - | $4.06 | Define the normalised PrinterStatus |
| PRN-132 | feature | S | 2 | sonnet | 10:25 | - | - | $0.31 | Write files safely with temp file, fsync and rename |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 12 | 1 | 44 | 8.8 | $6.35 |
| M | 39 | 6 | 44 | 12.2 | $19.22 |
| S | 49 | 19 | 26 | 48.9 | $30.94 |
| XS | 5 | 1 | 25 | 25.0 | $0.50 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 33 | 8 | 44 | 70.5 | $32.65 |
| sonnet | 72 | 19 | 26 | 14.9 | $24.34 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 16 | 15 | 26 | 14.5 | $15.15 |
| chore | 21 | 1 | 37 | 12.3 | $3.26 |
| feature | 64 | 9 | 35 | 12.5 | $31.15 |
| spike | 4 | 2 | 682 | 341.0 | $7.43 |

## Reading the facts table

The Done column comes from commit times; every reviewed card was committed 0 to 2 minutes after its
reviewer's move to done (rule 20 held), except the first wave's 13 bug cards, committed together at
09:43:32 to 09:43:34, 9 to 12 minutes after their reviews passed (09:31 to 09:42), and GCP-21 (coordinator,
10:07:33). The Started column is the worker's own move to doing in its first minute (rule 16 asks for the
coordinator's move at dispatch; the difference is under a minute).

PLT-31 and PLT-33 read 682 minutes: SP4 spikes that sat in review, closed by the coordinator at 10:44:03 on
the owner's Q16 answer (the macOS part is the result, the other OSes go to PLT-16 in M7), with no agent work
in SP9. GCP-116 had no reviewer: the coordinator chose option (a) on the worker's analysis (no planner
change, the divergence documented) and moved it to done at 10:15:00.

The 280 "planned" points are every card with `sprint: VSS:SP9` (or `SP9` on the VSS board), of which 203
are in backlog, mostly the viewer (VWR) and profile import cards that the owner gated or that wait on
fixtures. The plan the coordinator ran was the sprint doc's capacity of 92 points.

### Points: what close-sprint will record (rule 24)

- **Delivered, to the last card done: 62 points**, 27 done cards (the facts table's done rows), last card
  done 10:44 (PLT-31 and PLT-33's close). Of these, **58 points (25 cards) were built and reviewed in SP9**,
  first dispatch 09:17:00 to last review pass 10:38:05 (PLT-197): 81.1 minutes, **42.9 points an hour**.
  This retro calibrates on the 58.
- **Committed: 280 points**, 105 cards, computed from the card files now: done 62 (27 cards); doing 13
  (PRN-4 3, PRF-89 3, PRF-192 5, PRF-179 2); review 2 (PRN-132); backlog 203 (73 cards, including VSS-48
  and VSS-83). It equals the facts table's 280.
- If VSS-48 and VSS-83 are done at close, close-sprint records **66 of 280**. Carried cards stay in SP9 and
  close-sprint carries them; any card moved out before the close changes the 280, and is the coordinator's
  addendum.

### Cards: dispatch to review pass

Dispatch is the first move to doing; review pass is the reviewer's `move ... done`; rounds are the
reviewer's moves from review back to doing.

| Card | Effort | Lane (module) | Dispatched | First review | Review passed | Rounds | Minutes |
|---|---|---|---|---|---|---|---|
| PLT-195 | S bug | tooling | 09:17:36 | PASS | 09:32:26 | 0 | 14.8 |
| PRF-189 | S bug | profiles-orca | 09:17:24 | PASS | 09:31:34 | 0 | 14.2 |
| PRF-185, PRF-184 | S, XS bug | profiles-prusa | 09:17:19 | PASS | 09:33:02 | 0 | 15.7 |
| PRN-443 | S bug | printer-folder | 09:17:27 | PASS | 09:33:19 | 0 | 15.9 |
| VWR-394 | S bug | 3mf | 09:17:26 | PASS | 09:33:59 | 0 | 16.6 |
| SLC-277, SLC-278 | S bug | slicer-runtime, slicer-extension | 09:18:41 | PASS | 09:35:54 | 0 | 17.2 |
| PRF-188, PRF-187 | S bug | profile-api | 09:24:24 | PASS | 09:42:28 | 0 | 18.1 |
| PRF-186 | S bug | profile-api | 09:20:06 | FAIL | 10:02:42 | 1 | 42.6 |
| VWR-395 | S bug | 3mf | 09:19:25 | FAIL | 10:05:22 | 1 | 46.0 |
| GCP-115 | S bug | gcode-bgcode, gcode-parser | 09:17:06 | FAIL | 10:22:55 | 2 | 65.8 |
| PLT-181 | S bug | docs | 09:30:31 | PASS | 09:46:06 | 0 | 15.6 |
| PLT-196 | S | tooling | 09:30:19 | PASS | 09:46:44 | 0 | 16.4 |
| GCP-21 | M chore | gcode-planner | 09:30:31 | FAIL | 10:07:33 (coordinator) | 1 | 37.0 |
| GCP-50 | M, Opus | gcode-preview | 09:30:24 | FAIL | 10:11:39 | 1 | 41.3 |
| VWR-49 | M | mesh | 09:30:24 | FAIL | 10:12:18 | 1 | 41.9 |
| PRF-33 | L, Opus | profiles-prusa | 09:30:20 | FAIL | 10:13:43 | 1 | 43.4 |
| PRF-190 | M | profiles-data-orca | 09:45:31 | FAIL | 10:17:45 | 1 | 32.2 |
| GCP-116 | M bug, Opus | gcode-planner | 10:09:10 | none (coordinator) | 10:15:00 | 0 | 5.8 |
| PRF-131 | S, Opus | profiles-cura | 10:09:11 | PASS | 10:19:31 | 0 | 10.3 |
| PRF-191 | M, Opus | profiles-prusa | 10:16:06 | PASS | 10:23:56 | 0 | 7.8 |
| SLC-13 | S, Opus | slicer-runtime | 10:09:12 | FAIL | 10:34:50 | 2 | 25.6 |
| PLT-197 | S | tooling | 10:16:01 | FAIL | 10:38:05 | 2 | 22.1 |
| PRN-4 | M, Opus | printer-api | 10:09:15 | FAIL | carried (FAIL 10:35:45) | 3 | - |
| PRF-192 | L, Opus | profile-catalogue-data | 10:09:07 | FAIL | carried (FAIL 10:23:41) | 1 | - |
| PRF-89 | M | profiles-prusa | 10:25:39 | FAIL | carried (FAIL 10:39:26) | 2 | - |
| PRN-132 | S | printer-folder | 10:25:39 | not reviewed | carried | 0 | - |

Passing cards took a median of **15.8 minutes** from dispatch to done (SP8 11.9): 14 to 18 in the first
two waves, 7.8 to 10.3 in the late small waves. A failed round added about 26 minutes in the early waves
(cards with one round: 32 to 46 minutes, the 10.3-minute coordinator restart inside) and 5 to 8 minutes in
the late ones (SLC-13 and PLT-197: two rounds each in 22 to 26 minutes).

### Agents, from the start and stop events

77 agents ran (the coordinator and the two unnamed starts at 09:45:00 and 10:44 not counted), **245.2
agent-minutes**: workers 24 agents 81.7 min (Opus 39.2), reviews 37 agents 126.3 min (all Opus), fixes 16
agents 37.1 min (Opus 12.9). Reviews and fixes are 66.7% of agent time (SP8 64%). **4.2 agent-minutes per
built point** (58; SP8 1.86). Median agent 2.7 minutes.

| Wave | Start | Last stop | Kind | Agents | Minutes | Finished agents' waiting (agent-min) |
|---|---|---|---|---|---|---|
| 1 | 09:17:00 | 09:26:13 | 7 workers, 1 multi-card worker | 8 | 9.2 | 47.2 |
| 2 | 09:29:53 | 09:42:45 | 8 reviews + 7 workers | 15 | 12.9 | 116.4 |
| 3 | 09:44:56 | 09:51:07 | 2 fixes + 6 reviews + 1 worker | 9 | 6.2 | 26.0 |
| 4 | 10:01:24 | 10:05:33 | 4 fixes + 3 reviews | 7 | 4.2 | 9.0 |
| 5 | 10:08:47 | 10:14:31 | 4 reviews + 1 fix + 5 workers | 10 | 5.7 | 16.4 |
| 6 | 10:15:54 | 10:20:04 | 2 workers + 1 fix + 4 reviews | 7 | 4.2 | 11.4 |
| 7 | 10:21:15 | 10:24:10 | 2 fixes + 4 reviews | 6 | 2.9 | 4.7 |
| 8 | 10:25:12 | 10:28:12 | 1 fix + 2 reviews + 2 workers | 5 | 3.0 | 3.6 |
| 9 | 10:29:01 | 10:32:15 | 2 fixes + 2 reviews | 4 | 3.2 | 2.8 |
| 10 | 10:32:55 | 10:36:02 | 2 fixes + 2 reviews | 4 | 3.1 | 4.4 |
| 11 | 10:37:30 | 10:39:38 | 2 reviews | 2 | 2.1 | 1.4 |

The events show the same 11 messages the coordinator lists, with the first at 09:17:00, not 09:20.

- **Agents per wave:** 2 to 15, mean 7.0 (SP8 4.0). 11 waves for 25 built cards and 19 failed reviews
  (SP8 17 waves for 40 cards and 19 rounds).
- **Idle share (rule 11, target under 15%): 31.4%**, from the first wave (09:17:00) to the last review's
  stop (10:39:38): 56.7 of 82.6 minutes had an agent running. The ten gaps total 26.0 minutes (median
  1.45): 10.3 at 09:51 (the coordinator restart, coordinator), 3.7 at 09:26 (the re-plan from the owner's
  answers, coordinator), 3.2 at 10:05, 2.2 at 09:42, the other six 0.7 to 1.5. Without the restart gap,
  **21.7%** (15.7 of 72.3). Missed (SP8 21.2%).
- **Finished-agent waiting (rule 17, target under 150): 243.4 agent-minutes.** Missed (SP8 123.8): 116.4
  in wave 2, where 7 workers and short reviews waited behind the 12.7-minute profile-api review and the
  11.8-minute GCP-21 worker.
- **Longest agent (rule 17, target none over 15 min): 12.7 minutes**, the review of PRF-186, 188 and 187
  (three cards in one review), then the GCP-21 worker (11.8, including a Rust build of klipper_estimator)
  and the profile-api multi-card worker (9.1). Met. The coordinator's "PRF-33 7 min" matches (7.0).
- **First-review failure rate (rule 19): 13 of 27 reviewed cards, 1 in 2.1** (SP8 1 in 3.0). By kind:
  features 9 of 12 (PRF-33, GCP-50, VWR-49, PRF-190, SLC-13, PLT-197, PRN-4, PRF-192, PRF-89; passes PLT-196,
  PRF-131, PRF-191); bugs 3 of 14, all three the "replace wall-clock asserts" cards (VWR-395, PRF-186,
  GCP-115); chores 1 of 1 (GCP-21). 19 failed reviews in all, 16 fix agents.
- **Resource-bound fix rounds (rule 25, target at most one): 4** (coordinator; the reviews agree): SLC-13
  twice (a symlink chain escaping the destination, with an overlapping-entry bomb; then a Unicode alias of a
  parent component), PRF-190 once (caps per tree but not across trees, and a symlinked root), PRF-89 once
  (size and depth tests that could not fail). Bounds criteria were in every card before dispatch
  (coordinator). Missed for the fourth sprint, down from 6.
- **Rule 27 (records in the card): held.** Every fix round has the fix worker's lines in the card's
  Progress (GCP-115 3, SLC-13 2, PLT-197 2, PRN-4 3, the others 1).

### Coordinator facts (coordinator)

- Sprint 09:11 to 11:30; first dispatch 09:20 (the events say 09:17:00), last review stop about 10:40
  (10:39:38). 11 dispatch messages, each mixing one wave's reviews with new workers and fixes: rule 11's SP8
  amendment, tried for the first time.
- About 09:22 the brief's blocked list proved wrong: the owner had answered Q1 to Q22 and D14, D16 to D20
  were accepted. The coordinator re-planned: milestone M7 (Owner setup) for the remote, CI, marketplace and
  owner-fixture cards; D21 removed owner-gated edges from 12 M2 cards; Q12 to Q22 resolved.
- The main session restarted the coordinator once, about 09:47 to 10:00; one wave's reports were lost and
  read back from the cards' Progress.
- GCP-115's first fix was left out of the 09:47 message and sent at 10:01.
- PRF-190 and PRF-191 were created in one order and dispatched in the other; the worker noticed and stopped
  (the 09:30:13 "PRF-191" agent, 24 seconds; the events show its move to doing and back to backlog).
- Carried to SP10 at close for capacity, not owner-blocked: PRN-4 (3 review rounds; the reviewers'
  truncation specs conflicted across rounds), PRF-89 (2 rounds), PRF-192 (needs tooling 0.8.4), PRN-132
  (needs printer-api published), PRF-179 (closes with PRF-193). Still owner-gated: GCP-29 (D14, H2C
  sessions). Unreviewed work parked under `.ai/local/wip/SP9/`.
- No module was released: publishing tooling, profile-api and 3mf needs a re-lock of every dependent before a
  clean-registry ci; left for an SP10 release card.
- Integration suites: slicer-extension and printers-extension passed at 09:44 after their last fixes.
- Bounds criteria were written into every card before dispatch (rule 25's SP8 amendment).

### Clean-registry ci

The clean-registry `node scripts/run.mjs ci` (`/private/tmp/claude-501/sp9-ci.log`) started about 10:47
(coordinator) and was still running at 10:47 when this retro read it (at printer-folder's lint, every step
passed so far). The result is for the coordinator's addendum.

## On time or not

**Under plan, and stopped early by design.** The sprint doc planned 92 points (32 cards). Building ran
09:17:00 to 10:38:05 and delivered 58 built points (62 with the two closed spikes): 63% of the plan, at
42.9 points an hour (SP8 65.4). Building stopped 52 minutes before the 11:30 end to leave room for the
audit, the retro and the clean-registry ci (SP8 stopped 41 minutes early for the same reason); five
workable cards were carried for capacity.

By lane (first dispatch to last pass):

| Lane | Done cards | Points | Window | Points an hour | Rounds |
|---|---|---|---|---|---|
| profiles-prusa (PRF-185, 184, 33, 191; PRF-89 carried) | 4 | 11 | 09:17 to 10:24, 67 min | 9.9 | 1 (+2 on PRF-89) |
| profile-api (PRF-186, 188, 187; PRF-192 carried) | 3 | 6 | 09:20 to 10:03, 42 min | 8.5 | 1 (+1 on PRF-192) |
| tooling (PLT-195, 196, 197) | 3 | 6 | 09:17 to 10:38, 81 min | 4.4 | 2 |
| slicer (SLC-277, 278, 13) | 3 | 6 | 09:18 to 10:35, 76 min | 4.7 | 2 |
| gcode-planner (GCP-21, 116) | 2 | 6 | 09:30 to 10:15, 45 min | 8.0 | 1 |
| 3mf (VWR-394, 395) | 2 | 4 | 09:17 to 10:05, 48 min | 5.0 | 1 |
| gcode-bgcode, gcode-parser (GCP-115) | 1 | 2 | 66 min | 1.8 | 2 |
| gcode-preview (GCP-50), mesh (VWR-49) | 1 each | 3 each | 41, 42 min | 4.4 | 1 each |
| profiles-data-orca (PRF-190) | 1 | 3 | 32 min | 5.6 | 1 |
| profiles-cura (PRF-131), printer-folder (PRN-443) | 1 each | 2 each | 10, 16 min | - | 0 |
| printer-api (PRN-4) | 0 | 0 | 10:09 to close | 0 | 3 |

**Rule 23 (SP8: 5 cards an hour per lane less one per expected round):** in the one lane that had work all
sprint, profiles-prusa, it predicts 5.6 cards in 67 minutes less about 2 for PRF-33's and PRF-89's rounds,
so 3 to 4; 4 were done. Held. The other lanes ran out of cards, were pulled in late (slicer and tooling at
10:09 and 10:16 after an idle hour) or were held by rounds (GCP-115 two, PRN-4 three), so they do not test
it. The cycle is not a constant 12 minutes: it was 13 to 16 minutes in waves of 9 to 15 agents and 3 to 6 in
waves of 2 to 6, because a wave lasts as long as its longest agent.

By model: Opus built 8 cards (PRF-33, GCP-50, GCP-116, PRF-131, SLC-13, PRN-4, PRF-191, PRF-192); 5 of
the 7 reviewed failed first review. Sonnet built the 14 bug cards (3 failed) and
5 features (VWR-49, PRF-190, PLT-197, PRF-89 failed; PLT-196 passed). By type: bugs passed first time 11 of
14, features 3 of 12.

## Why

Cards well over their size, from the reviews in their Progress:

- **GCP-115, VWR-395, PRF-186 (S bugs, 43 to 66 minutes):** the three "replace wall-clock asserts" cards,
  from rule 26. Each failed on what the replacement should be: VWR-395 put the hang guard on the wrong
  test, PRF-186 set vitest timeouts below the guard, GCP-115 replaced asserts with hang guards rather than
  counts, then counted a path the test did not prove was used. Rule 26 names the target (counts, step
  budget or a size ratio) but the cards did not say which per test. Their early rounds also carried the
  restart gap (10.3 minutes).
- **PRN-4 (M, Opus, carried after three rounds):** review-spec churn. Round 1 asked that merged truncations
  keep "every base truncation whose top-level field the patch did not set"; the fix did that; round 2 found
  the rule wrong for keyed lists and merged objects (`heaters`, `job`) that adapters push every second and
  specified a structural `replaces()` rule; the fix did that, and round 3 failed on the truncation rule
  again (coordinator: the specs conflicted). Each reviewer was fresh and re-derived the merge semantics; the
  card's criteria said truncations are recomputed on merge, without saying which cuts survive which patch.
- **SLC-13 (S, Opus, 26 minutes, two rounds), PRF-190 (M, 32, one), PRF-89 (M, carried, two):** resource
  and path bounds. The Bounds criteria named the caps, but not the hostile cases the reviewers then built
  (a symlink chain, a Unicode alias of a parent component, a cap across trees), and PRF-89's bound tests
  passed with the bound removed.
- **PRF-33, GCP-50, VWR-49 (41 to 43 minutes, one round each):** test strength and edge cases (PRF-33 literal
  block edges and a ratio test; GCP-50 a URI length test and a follower throw; VWR-49 a transfer test and a
  streaming cap test). Dispatched in wave 2, their fixes waited for wave 3's reviews and the restart, so a
  4-minute fix cost about 25 minutes.
- **GCP-21 (M chore, 37 minutes):** the review's blocking point needed a second klipper_estimator build,
  which the owner's Q14 ("build once") did not allow; the coordinator kept the override documented and split
  the 7.3 s gap into GCP-116, which closed in 6 minutes without a planner change.

For the sprint as a whole:

- **Fix rounds again set the pace.** 19 failed reviews in 27 reviewed cards (features 9 of 12, against
  rule 19's target of at most 1 in 2). Most findings were tests that could not fail when the behaviour they
  name was removed (PRF-89, GCP-115, PLT-197 twice, VWR-49, PRF-33): the reviewers' mutation probes found
  what the workers did not run.
- **Mixed messages cut waves per agent but not idle.** 7.0 agents a wave against SP8's 4.0, so 11 waves did
  the work of about 19. But idle was 31.4% (21.7% without the restart), because the gaps did not shrink
  (median 1.45 minutes against 0.8: each gap now carried commits for one wave and prompts for the next) and
  two gaps were coordinator events (re-plan 3.7, restart 10.3). And finished agents waited 243 agent-minutes:
  a mixed wave lasts as long as its longest review, and three-card reviews ran 7 to 13 minutes while the
  workers beside them ran 0.4 to 6.
- **The sprint started on a wrong brief.** The re-plan at 09:22 and the pull-ins it allowed (slicer and
  tooling's second cards at 10:09 and 10:16) explain why several lanes idled between 09:46 and 10:09.
- **Coordination slips cost one dispatch each:** the PRF-190 and PRF-191 swap, GCP-115's fix left out of a
  message.
- **Agent time per point doubled** (4.2 against 1.86): reviews were 51.5% of agent time and all Opus;
  fourteen of the 25 cards were 2-point bugs, each with a full Opus review.

## Change

Written into `.ai/plans/estimation.md`:

- **Rule 11 amended (SP9):** mixing reviews and workers in one message was tried and kept (agents per wave
  rose from 4.0 to 7.0) but did not bring idle under 15%; idle is now set by the coordinator's own events and
  each wave's longest agent. Keep a wave under about 8 agents, give a review at most two cards, and keep the
  coordinator's gap work (commits, prompts) for the next wave prepared during the current one. Testable:
  idle under 15% from the first wave to the last review, excluding a restart the main session causes.
- **Rule 17 amended (SP9):** a review of three cards counts as long (it ran 12.7 minutes); a message that
  mixes reviews and workers is long if any agent in it is. Testable: finished agents wait under 150
  agent-minutes.
- **Rule 19 amended (SP9):** a feature's first review failed 3 in 4. Workers run, before review, the
  reviewer's mutation probe for each new test (remove the behaviour or bound it names, the test must fail)
  and record it in Progress. Testable: features fail first review at most 1 in 2.
- **Rule 23 amended (SP9):** confirmed in the one lane that had work all sprint (profiles-prusa 4 cards
  against 3 to 4); a cycle is about 15 minutes in waves of 9 or more agents and about 5 in waves of 6 or
  fewer, so plan 4 cards an hour per lane at sprint start and expect faster cycles once waves thin.
- **Rule 25 amended (SP9):** written bounds cut resource-bound rounds from 6 to 4, not to one. A Bounds
  criterion names the hostile cases the review will build, not only the caps: for archives and file trees,
  symlink chains, Unicode and case aliases of a path component, and caps that hold across every input of a
  call; and each bound's test is shown to fail with the bound removed (rule 19).
- **Rule 26 amended (SP9):** a card that replaces wall-clock asserts names, per test, what replaces each
  one (operation count, step budget or size ratio) and where the hang guard goes. Evidence: all three such
  SP9 cards failed review.
- **New rule 28:** a review that fails a contract card writes the rule it expects as a criterion in the card
  (the semantics, not only the fix), and a re-review checks the card against that criterion instead of
  re-deriving it; a contract card's second failed round on the same rule goes to the coordinator, who
  settles the rule in the card before the next fix. Testable: no card fails three rounds on one rule.
  Evidence: PRN-4's truncation rule, three rounds, carried.
- **Current calibration:** "After SP9" entry added.

## Re-sizing

Per-lane velocity did not change in a way effort predicts: passing S and M cards both took 8 to 18
minutes, and the long cards were long by review rounds and wave size, as in SP8. No card is re-sized and no
`plan-sprints` dry run was made. The carried cards keep their efforts: PRN-4 (M) needs its rule settled
(rule 28), not more points; PRF-192 (L) waits on tooling 0.8.4.

## Addendum (coordinator, after the retro agent stopped)

- **Releases, late and in three runs.** The coordinator planned no releases, to keep the clean-registry ci green; the first clean ci (10:44 to 10:50) failed lockfile integrity in 43 modules because tooling, profile-api and 3mf had changed since their last release. The coordinator then released `tooling@0.8.4`, `profile-api@0.1.2` and `3mf@0.1.2` and re-locked 37 dependents (`6932c534`); the second ci (10:58 to 11:03) failed only on gcode-preview's transitive `@vsslicer/3mf@0.1.1` pin, which the re-lock loop skipped because the dependency is indirect (`e4f1f0c6`). Lesson for rule 13 and 21: changing a published module's `src` or package content means it must be released before the clean ci, whatever the plan says, and the re-lock covers transitive pins (`grep -l '<name>@<old>' */pnpm-lock.yaml`). Third clean-registry ci (11:03:30 to 11:07:45, at `e4f1f0c6`, log `/private/tmp/claude-501/sp9-ci.log`): exit 0.
- **Audit** (`.ai/audits/SP9-audit.md`, 10:47 to 10:58): no must-fix, 4 should-fix, 7 nice-to-have; all ten SP8 fixes hold; the catalogue tools and the 3mf suite without `.reference` (153 pass, 3 skip) were covered as briefed. SP10 bug cards: PRF-194, GCP-118, PRF-195, GCP-119, VWR-396 (P1); PLT-198, VWR-397, SLC-279, SLC-280, PRF-196, PRF-197, PRF-198 (P2). Finding 4 (two wall-time asserts the SP8 grep missed, gcode-planner and mesh) again supports rule 26's grep across every module.
- **Follow-up cards created at close for SP10:** PLT-199 (short extension ids with the PLT-196 override, Q22), GCP-120 (move PrintPosition into gcode-api, from GCP-50's review), GCP-117 (extruder limiter re-record, re-scoped by GCP-116).
- **Integration suites:** slicer-extension and printers-extension passed at 09:44 after their last fixes (SP8 slip 4).
