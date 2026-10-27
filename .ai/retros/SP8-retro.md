# SP8 retro: Open 3

Card VSS-82. Written by the retro agent (`sp8-retro`, Opus), who wrote none of SP8's code. Sources:
`board.py retro SP8` (below, unedited), the start, stop, dispatch and move events in
`.ai/local/taskboard/activity.jsonl` from 2026-10-26T07:20, the review text in the cards' Progress in
`.ai/kanban/projects/{profiles,printers,slicer,platform,gcode}/`, the sprint doc
`.ai/kanban/sprints/SP8.md`, and the clean-registry ci log `/private/tmp/claude-501/sp8-ci.log`. Facts
the coordinator supplied are marked "(coordinator)" and were checked against the events where the events
show them. The audit (VSS-47) ran in parallel; its findings are not in this retro.

## SP8 Open 3: the facts

- Planned: 2026-10-26T07:20+00:00 to 2026-10-26T09:30+00:00, 305 points (140.8 points/hour)
- Actual: last card done 2026-10-26T08:49+00:00, 88 points (59.3 points/hour), -41 minutes after the planned end

| Card | Type | Effort | Points | Model | Started | Done | Minutes | Cost | Title |
|---|---|---|---|---|---|---|---|---|---|
| PRF-136 | chore | XS | 1 | sonnet | 07:57 | 08:49 | 52 | - | Release `profile-api@0.2.0`: import result types, importer/exporter/store ports, bundle structure and instance validation |
| PRF-125 | feature | S | 2 | sonnet | 07:27 | 08:09 | 42 | $4.07 | Convert Cura quality metadata and exclude_materials to unified conditions |
| PRN-131 | feature | M | 3 | sonnet | 08:10 | 08:44 | 34 | $2.18 | Sanitise file names for FAT 8.3 and long-name targets |
| PRF-35 | feature | S | 2 | sonnet | 07:27 | 07:56 | 29 | $1.36 | Locate installed slicer configuration folders on macOS, Windows and Linux |
| PRF-70 | feature | M | 3 | opus | 07:27 | 07:56 | 29 | $1.72 | Generate the form model from the catalogue |
| PRF-10 | feature | M | 3 | sonnet | 07:27 | 07:56 | 29 | $3.05 | Convert Prusa compatibility constructs to unified conditions |
| PRF-24 | feature | M | 3 | sonnet | 07:58 | 08:26 | 29 | $2.66 | Read PrusaSlicer INI bundles and user presets |
| PRF-180 | bug | S | 2 | sonnet | 07:27 | 07:55 | 28 | $1.23 | Encode bundle manifest only near the byte limit |
| SLC-5 | feature | S | 2 | sonnet | 08:27 | 08:48 | 21 | $0.80 | Define engine discovery, install and the pinned-release manifest schema |
| SLC-115 | feature | S | 2 | sonnet | 08:27 | 08:48 | 21 | $0.80 | Define the `vsslicer` task type and its definition schema |
| PRF-124 | feature | S | 2 | sonnet | 07:27 | 07:45 | 18 | $0.73 | Convert Orca and Bambu compatible_printers constructs to unified conditions |
| PLT-49 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `agent-protocol` module |
| PRN-2 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-api` module |
| PRN-86 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-moonraker` module |
| PRN-95 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-octoprint` module |
| PRN-104 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-prusalink` module |
| PRN-112 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-duet` module |
| PRN-120 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-discovery` module |
| PRN-130 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `printer-folder` module |
| PRN-5 | feature | S | 2 | opus | 08:27 | 08:44 | 17 | $0.62 | Define the capability flags with readOnly and requiresMode annotations |
| SLC-2 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `slicer-api` module |
| SLC-8 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `slicer-runtime` module |
| SLC-15 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `slicer-orca` module |
| SLC-43 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `slicer-output` module |
| SLC-55 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `cura-settings` module |
| SLC-65 | chore | S | 2 | sonnet | 07:27 | 07:45 | 17 | - | Create the `slicer-cura` module |
| PLT-51 | feature | S | 2 | sonnet | 08:10 | 08:26 | 16 | $0.96 | Define the error model and stable `data.kind` strings |
| PRF-71 | feature | M | 3 | sonnet | 08:10 | 08:26 | 16 | $1.45 | Implement settings search over keys, labels, tooltips and native names |
| SLC-9 | feature | M | 3 | sonnet | 08:10 | 08:26 | 16 | $1.42 | Run an engine process: argv without shell, line streams, timeout, exit and signal result |
| GCP-41 | chore | M | 3 | sonnet | 07:58 | 08:10 | 12 | $0.49 | Test the 50 MB-plus file through the custom editor |
| PRF-181 | feature | M | 3 | sonnet | 07:58 | 08:09 | 12 | $0.52 | Add the special widget kinds to the form model: percent-or-absolute, per-extruder, gcode and expr |
| PRF-103 | feature | M | 3 | opus | 07:58 | 08:09 | 12 | $1.92 | Add the Orca and Bambu bundle archive reader and writer with safety limits |
| PRF-11 | chore | M | 3 | opus | 08:27 | 08:38 | 12 | $2.57 | Check the evaluator against 50 hand-computed Prusa compatibility conditions |
| PRN-15 | chore | S | 2 | sonnet | 07:58 | 08:09 | 12 | $0.25 | Create the `printers-extension` module |
| SLC-100 | chore | S | 2 | sonnet | 07:58 | 08:10 | 12 | $0.25 | Create the `slicer-extension` module |
| PRF-182 | bug | XS | 1 | sonnet | 07:45 | 07:56 | 11 | $0.42 | Tidy convertCompatiblePrinters: one length diagnostic, relative .reference path, upstream rules in the doc comment |
| PRF-183 | bug | S | 2 | sonnet | 08:10 | 08:19 | 9 | $0.88 | Harden the bundle archive reader: colons, NFC duplicates, host-19 symlinks, CRC and EOCD position |
| PRN-3 | feature | S | 2 | sonnet | 08:10 | 08:19 | 9 | $0.62 | Define PrinterError kinds and the auth scheme declarations |
| SLC-4 | feature | S | 2 | sonnet | 08:10 | 08:19 | 9 | $0.26 | Define the typed engine errors and their user messages |
| SLC-101 | feature | S | 2 | sonnet | 08:10 | 08:19 | 9 | $0.26 | Contribute the engine settings |
| VSS-47 | chore | S | 2 | opus | 08:49 | - | - | - | SP8: audit review and bugfix |
| VSS-82 | chore | S | 2 | opus | 08:49 | - | - | - | SP8: retro |
| PLT-7 | chore | S | 2 | sonnet | - | - | - | - | Claim the vsslicer namespace on open-vsx.org and the Microsoft publisher |
| PLT-16 | feature | M | 3 | sonnet | - | - | - | - | Run the integration matrix on three operating systems and VSCodium |
| PLT-18 | feature | S | 2 | sonnet | - | - | - | - | Run snapshot tests on Linux in CI and add a regenerate workflow |
| PLT-19 | chore | S | 2 | sonnet | - | - | - | - | Record meta-tests proving each harness turns CI red |
| PLT-24 | spike | L | 5 | opus | - | - | - | - | Spike: trusted publishing to Open VSX and the Microsoft marketplace |
| PLT-25 | feature | L | 5 | opus | - | - | - | - | Write the tag-driven release workflow |
| PLT-26 | feature | M | 3 | sonnet | - | - | - | - | Add idempotent per-marketplace publish steps with named failures |
| PLT-27 | chore | S | 2 | sonnet | - | - | - | - | Add the secret-leak scan over workflow logs |
| PLT-28 | chore | M | 3 | opus | - | - | - | - | Rehearse a full release of the pack and record the marketplace checks |
| PLT-29 | feature | S | 2 | sonnet | - | - | - | - | Test that installing the pack installs vsslicer.gcode |
| PLT-46 | feature | M | 3 | sonnet | - | - | - | - | Snapshot tests for colour modes, themes and ranges |
| PLT-181 | bug | S | 2 | sonnet | - | - | - | - | Reconcile the DCO requirement with the project commit convention |
| PLT-193 | chore | XS | 1 | sonnet | - | - | - | - | Add gcode-language to the extension pack |
| PLT-1 | chore | S | 2 | sonnet | - | - | - | $0.16 | Create the public GitHub repository and protect main |
| PLT-9 | feature | M | 3 | sonnet | - | - | - | $0.44 | Add the CI workflow: one job per changed module on three operating systems |
| PLT-10 | feature | S | 2 | sonnet | 21:21 | - | - | $0.28 | Enforce DCO sign-off in CI |
| PLT-33 | spike | S | 2 | opus | 23:22 | - | - | $1.69 | Spike: WebGPU probe and workers under the kit CSP |
| PLT-31 | spike | S | 2 | opus | 23:22 | - | - | $5.74 | Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB |
| GCP-21 | chore | M | 3 | sonnet | - | - | - | - | Run klipper_estimator as a black-box oracle in CI |
| GCP-25 | chore | M | 3 | sonnet | - | - | - | - | Compare against PrusaSlicer M73 totals and per-layer progress |
| GCP-29 | chore | S | 2 | sonnet | - | - | - | - | Measure three H2C prints against the estimates |
| GCP-42 | chore | L | 5 | sonnet | - | - | - | - | Record host, worker and webview memory at 50, 200 and 500 MB |
| GCP-50 | feature | M | 3 | opus | - | - | - | - | Define and publish the exports and commands: open, follow, stopFollow |
| GCP-51 | feature | M | 3 | sonnet | - | - | - | - | Map file offsets to moves |
| GCP-52 | feature | S | 2 | sonnet | - | - | - | - | Map layer and percent positions |
| GCP-53 | chore | M | 3 | sonnet | - | - | - | - | Record feeds and test the API from a stub extension |
| GCP-54 | chore | S | 2 | sonnet | - | - | - | - | Add the api-extractor semver check to CI |
| GCP-55 | feature | L | 5 | sonnet | - | - | - | - | Add follow mode to the editor |
| GCP-56 | feature | S | 2 | sonnet | - | - | - | - | Stop follow on stale feed or file mismatch |
| GCP-107 | feature | L | 5 | opus | - | - | - | - | Add fan and temperature colour modes |
| GCP-79 | chore | S | 2 | sonnet | 00:09 | - | - | $0.69 | Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material |
| GCP-18 | feature | S | 2 | sonnet | 00:14 | - | - | $0.87 | Benchmark memory and throughput on synthetic 50, 200 and 500 MB files in CI |
| VWR-10 | chore | M | 3 | sonnet | - | - | - | - | Capture Bambu Studio and OrcaSlicer fixture projects |
| VWR-11 | chore | S | 2 | sonnet | - | - | - | - | Capture PrusaSlicer 2.9 and Prusa 3.0 alpha fixture projects |
| VWR-12 | chore | S | 2 | sonnet | - | - | - | - | Capture Cura workspace fixture projects |
| VWR-13 | feature | S | 2 | sonnet | - | - | - | - | Detect the writer dialect from metadata and parts |
| VWR-18 | chore | M | 3 | sonnet | - | - | - | - | Run the 3MF Consortium conformance suite in CI |
| VWR-19 | chore | M | 3 | opus | - | - | - | - | Add lib3mf WASM as the CI oracle for counts |
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
| VWR-49 | feature | M | 3 | sonnet | - | - | - | - | Run mesh parsing in a Web Worker pool for the webview |
| VWR-50 | chore | L | 5 | opus | - | - | - | - | Record parse, dedup and BVH time and memory in CI |
| VWR-52 | feature | M | 3 | sonnet | - | - | - | - | Implement the ProjectModel store |
| VWR-53 | feature | M | 3 | sonnet | - | - | - | - | Load files and meshes through the workers |
| VWR-54 | feature | M | 3 | sonnet | - | - | - | - | Register the readonly custom editor for 3MF, STL and OBJ |
| VWR-55 | feature | L | 5 | opus | - | - | - | - | Render meshes with three.js in the webview |
| VWR-56 | feature | M | 3 | sonnet | - | - | - | - | Add orbit, pan, zoom and the view cube |
| VWR-57 | feature | M | 3 | sonnet | - | - | - | - | Pick and hover objects with the BVH |
| VWR-59 | feature | M | 3 | sonnet | - | - | - | - | Show plates and objects in a TreeView |
| VWR-60 | feature | S | 2 | sonnet | - | - | - | - | Sync tree selection and 3D selection |
| VWR-61 | feature | M | 3 | sonnet | - | - | - | - | Show plate thumbnails and sliced state |
| VWR-62 | feature | M | 3 | opus | - | - | - | - | Add Preview sliced plate |
| VWR-64 | feature | S | 2 | sonnet | - | - | - | - | Detect WebGL failure and say what to do |
| VWR-65 | feature | M | 3 | sonnet | - | - | - | - | Show open and parse errors in the editor |
| VWR-66 | feature | M | 3 | sonnet | - | - | - | - | Show oversized models as a box with Draw anyway |
| VWR-68 | feature | M | 3 | sonnet | - | - | - | - | Restore camera and selection when the editor is shown again |
| VWR-69 | feature | S | 2 | sonnet | - | - | - | - | Release GPU resources on dispose with a heap test |
| VWR-74 | chore | XS | 1 | sonnet | - | - | - | - | Release 3mf@0.2.0: readProject, dialect readers and the public API |
| VWR-75 | chore | XS | 1 | sonnet | - | - | - | - | Release mesh@0.1.0: parsers, stats, BVH and workers |
| VWR-76 | chore | XS | 1 | sonnet | - | - | - | - | Release mesh@0.2.0: benchmark numbers |
| PRF-23 | chore | S | 2 | sonnet | - | - | - | - | Fetch the pinned vendor packs into a CI cache for golden tests |
| PRF-33 | feature | L | 5 | opus | - | - | - | - | Read the PrusaSlicer 3.0 YAML tree behind the experimental flag |
| PRF-40 | feature | M | 3 | sonnet | - | - | - | - | Download Prusa vendor bundles from upstream at a pinned commit |
| PRF-130 | feature | S | 2 | sonnet | - | - | - | - | Download Cura resources from upstream when Cura is not installed |
| PRF-145 | chore | XS | 1 | sonnet | - | - | - | - | Release `profiles-data-orca@0.1.0`: the Orca and Bambu JSON trees |
| PRF-57 | chore | S | 2 | sonnet | 06:03 | - | - | - | Create the `profiles-extension` module (vsslicer.profiles) |
| PRF-179 | bug | S | 2 | opus | 04:53 | - | - | $1.50 | State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE |

By effort:

| Effort | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| L | 9 | 0 | - | - | $0.00 |
| M | 41 | 10 | 16 | 6.7 | $18.42 |
| S | 65 | 28 | 17 | 8.8 | $24.02 |
| XS | 7 | 2 | 52 | 31.5 | $0.42 |

By model:

| Model | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| opus | 23 | 4 | 17 | 6.4 | $15.76 |
| sonnet | 99 | 36 | 17 | 8.9 | $27.10 |

By type:

| Type | Cards | Done | Median minutes | Minutes per point | Cost |
|---|---|---|---|---|---|
| bug | 5 | 3 | 11 | 9.6 | $4.03 |
| chore | 50 | 19 | 17 | 8.7 | $4.41 |
| feature | 64 | 18 | 18 | 8.4 | $26.98 |
| spike | 3 | 0 | - | - | $7.43 |

## Reading the facts table

The table's Done column is not when each review passed: it comes from the commit times, so PRF-136
reads 08:49 (the release's re-lock commit) although the coordinator moved it to done at 07:57:36, and
every other card reads 1 to 4 minutes after its reviewer's move. Its Started column is the
coordinator's move to doing (rule 16 held). The owner asked for done = review pass, so the table below
is the one this retro calibrates on. The 305 "planned" points are every card with `sprint: VSS:SP8`,
of which 236 were owner- or decision-blocked at the start (rule 6); the planned pace of 140.8 an hour is
not a plan anyone made. The By effort, model and type tables count those blocked cards too.

### Points: what close-sprint will record

- **Delivered: 88 points**, 40 done cards (the facts table's done rows), 07:27:37 (first dispatch) to
  08:48:17 (last review pass).
- **Committed: 305 points**, 122 cards: computed from the card files now (every card whose front matter
  says `sprint: VSS:SP8` on a project board, or `sprint: SP8` on the VSS board, at XS 1, S 2, M 3, L 5,
  XL 8): done 88; doing 13 (VSS-47 and VSS-82 4, and the carried PLT-1 2, PLT-9 3, PLT-10 2, PRF-179 2);
  review 8 (the carried partial GCP-18, GCP-79, PLT-31, PLT-33); backlog 196 (owner- or decision-blocked).
  It equals the facts table's 305.
- If VSS-47 and VSS-82 are done at close, close-sprint records **92 of 305**. No card moves out of SP8
  before the close except as the coordinator lists in an addendum (rule 24).

### Cards: dispatch to review pass

Dispatch is the coordinator's move to doing; review pass is the reviewer's `move ... done`; rounds are
the reviewer's moves from review back to doing.

| Card | Effort | Lane (module) | Dispatched | First review | Review passed | Rounds | Minutes |
|---|---|---|---|---|---|---|---|
| PRF-180 | S bug | profile-api | 07:27:37 | FAIL | 07:52:15 | 1 | 24.6 |
| PRF-10 | M | profiles-prusa | 07:27:37 | FAIL | 07:53:41 | 1 | 26.1 |
| PRF-124 | S | profiles-orca | 07:27:37 | PASS | 07:40:57 | 0 | 13.3 |
| PRF-125 | S | profiles-cura | 07:27:37 | FAIL | 08:05:36 | 2 | 38.0 |
| PRF-35 | S | profiles | 07:27:38 | FAIL | 07:52:05 | 1 | 24.4 |
| PRF-70 | M | profiles | 07:27:38 | FAIL | 07:52:05 | 1 | 24.4 |
| PRN-2, 86, 95, 104, 112, 120, 130 | S each | 7 new modules | 07:27:38 | PASS | 07:39:33 to 07:39:35 | 0 | 11.9 |
| SLC-2, 8, 15, 43, 55, 65, PLT-49 | S each | 7 new modules | 07:27:39 | PASS | 07:40:03 to 07:40:04 | 0 | 12.4 |
| PRF-182 | XS bug | profiles-orca | 07:45:33 | PASS | 07:52:15 | 0 | 6.7 |
| PRF-136 | XS release | profile-api | 07:57:36 | none (coordinator release) | 07:57:36 | 0 | 0 |
| PRF-24 | M | profiles-prusa | 07:58:00 | FAIL | 08:24:34 | 2 | 26.6 |
| PRF-181 | M | profiles | 07:58:00 | PASS | 08:05:19 | 0 | 7.3 |
| PRF-103 | M | profiles-orca | 07:58:01 | PASS | 08:07:53 | 0 | 9.9 |
| PRN-15, SLC-100 | S each | 2 new extension modules | 07:58:01 | PASS | 08:06:06 | 0 | 8.1 |
| GCP-41 | M chore | gcode-preview | 07:58:01 | PASS | 08:06:54 | 0 | 8.9 |
| PRN-3 | S | printer-api | 08:10:30 | PASS | 08:17:33 | 0 | 7.0 |
| PRN-131 | M | printer-folder | 08:10:30 | FAIL | 08:43:25 | 3 | 32.9 |
| SLC-4 | S | slicer-api | 08:10:30 | PASS | 08:16:24 | 0 | 5.9 |
| SLC-9 | M | slicer-runtime | 08:10:30 | FAIL | 08:23:30 | 1 | 13.0 |
| SLC-101 | S | slicer-extension | 08:10:31 | PASS | 08:16:25 | 0 | 5.9 |
| PLT-51 | S | agent-protocol | 08:10:31 | FAIL | 08:25:39 | 1 | 15.1 |
| PRF-183 | S bug | profiles-orca | 08:10:31 | PASS | 08:18:53 | 0 | 8.4 |
| PRF-71 | M | profiles | 08:10:31 | FAIL | 08:24:35 | 1 | 14.1 |
| PRF-11 | M chore | profiles-prusa | 08:27:08 | PASS | 08:38:18 | 0 | 11.2 |
| PRN-5 | S | printer-api | 08:27:08 | FAIL | 08:43:25 | 1 | 16.3 |
| SLC-5 | S | slicer-api | 08:27:08 | FAIL | 08:48:17 | 2 | 21.1 |
| SLC-115 | S | slicer-extension | 08:27:08 | FAIL | 08:48:17 | 2 | 21.1 |

Passing cards took a median of 11.9 minutes from dispatch to done whatever their size (S 5.9 to 13.3,
M 7.3 to 11.2); each failed round added about 10 to 12 minutes (one worker wave and one review wave).

### Agents, from the start and stop events

68 agents ran (the coordinator not counted), 164.1 agent-minutes: workers 23 agents 59.5 min (Sonnet
43.9, Opus 15.6), reviews 28 agents 83.9 min (Opus 68.1, Sonnet 15.8), fixes 17 agents 20.7 min. Reviews
and fixes are 64% of agent time (SP7 46%). **1.86 agent-minutes per done point** (SP7 3.3). Median agent
2.1 minutes.

| Wave | Start | Last stop | Kind | Agents | Minutes | Finished agents' waiting (agent-min) |
|---|---|---|---|---|---|---|
| 0 | 07:27:52 | 07:28:42 | workers | 1 | 0.8 | 0 |
| 1 | 07:29:39 | 07:35:57 | workers | 8 | 6.3 | 25.0 |
| 2 | 07:37:12 | 07:44:32 | reviews | 6 | 7.3 | 20.5 |
| 3 | 07:46:13 | 07:50:17 | fixes and PRF-182 | 6 | 4.1 | 14.8 |
| 4 | 07:50:54 | 07:55:27 | reviews | 4 | 4.5 | 7.4 |
| 5 | 07:58:53 | 08:03:09 | workers | 6 | 4.3 | 9.0 |
| 6 | 08:04:05 | 08:09:10 | reviews | 6 | 5.1 | 12.8 |
| 7 | 08:11:23 | 08:14:16 | workers | 7 | 2.9 | 9.1 |
| 8 | 08:15:00 | 08:19:15 | reviews | 5 | 4.2 | 7.2 |
| 9 | 08:20:24 | 08:21:38 | fixes | 5 | 1.2 | 1.2 |
| 10 | 08:22:02 | 08:25:55 | reviews | 3 | 3.9 | 3.2 |
| 11 | 08:27:36 | 08:35:08 | workers | 3 | 7.5 | 11.8 |
| 12 | 08:35:36 | 08:38:39 | reviews | 2 | 3.0 | 0.3 |
| 13 | 08:39:19 | 08:40:47 | fixes | 3 | 1.5 | 1.4 |
| 14 | 08:41:00 | 08:43:43 | reviews | 1 | 2.7 | 0 |
| 15 | 08:44:11 | 08:45:32 | fix | 1 | 1.4 | 0 |
| 16 | 08:45:42 | 08:48:22 | review | 1 | 2.7 | 0 |

- **Agents per wave:** 1 to 8, mean 4.0 (68 in 17 waves); peak 8 in wave 1.
- **Idle share (rule 11, target under 15%): 21.2%**, from the first wave (07:27:52) to the last review's
  stop (08:48:22): 63.5 of 80.5 minutes had an agent running. All of the idle time is the 16 gaps
  between waves (16.9 min, median 0.8, one over 2 minutes: 3.4 before wave 5). The gaps were short; there
  were many of them because every card needs a worker wave and a review wave. Missed (SP7 15.9%).
- **Finished-agent waiting (rule 17, target under 150): 123.8 agent-minutes.** Met (SP7 393, SP6 449).
- **Longest agent (rule 17, target none over 15 min): 7.5 minutes**, the PRF-11 worker (Opus). Met.
  The next were the PRF-180 and PRF-35 review (7.3) and the slicer scaffolds A worker (6.1).
- **First-review failure rate (rule 19): 13 of 39 reviewed cards, 1 in 3.0** (SP7 1 in 3.9). By kind:
  features 12 of 18; bugs 1 of 3 (PRF-180); chores and scaffolds 0 of 18. 19 fix rounds in all.
- **Resource-bound fix rounds (rule 25, target at most one): 6.** PRF-180 (the fix dropped the cheap
  `text.length > max` reject before encoding), PRF-10 (catastrophic backtracking in `tags.ts`), PRF-71
  (quadratic index build, coordinator), PRN-131 twice (quadratic collision handling, coordinator; the
  third round was a vacuous linear-probe test), SLC-9 (unvalidated `timeoutMs`, an `onLine` throw
  escaping the stream listener). Missed for the third sprint running.

### Coordinator facts (coordinator)

- Planned at 07:30 from workable cards only: the 15 workable points of the original SP8 plan (PRF-180,
  10, 11, 24, 124, 125) plus pull-ins PRF-35, PRF-70 (split into PRF-70 and PRF-181), PRF-71, PRF-103,
  PRF-136, GCP-41 and the M3 scaffolds PRN-2, 15, 86, 95, 104, 112, 120, 130, SLC-2, 8, 15, 43, 55, 65,
  100 and PLT-49: 65 points. Later pull-ins as lanes freed: PRN-3, PRN-131, SLC-4, SLC-9, SLC-101, PLT-51
  (08:10, 14 points) and PRN-5, SLC-5, SLC-115 (08:27, 6 points; PRF-11 was dispatched then but was in the
  plan). New cards: PRF-181 (split), PRF-182 and PRF-183 (review follow-ups, 3 points), PRF-184 (SP9, a
  bug PRF-11 found). 65 + 14 + 6 + 3 = 88, matching the delivered figure. Pulling stopped at 08:49 to
  give the audit 30 minutes or more.
- Waves alternated workers-only and reviews-only messages, because the harness blocks the coordinator
  per message (the events confirm: every wave above is one kind).
- `board.py note` writes only to the activity log, not the card's Progress, so several fix workers'
  notes never reached their cards; reviewers recorded them (PLT-51 and PRN-131 re-reviews say so in
  Progress).
- A coordinator script aborted mid-way and three CHANGELOG lines were committed late (`d2a3cb7`).
- profile-api's planned 0.2.0 was released as 0.1.1, because 0.1.0 already carried that increment
  (PRF-136); its four dependents were re-locked once. The card's title still says 0.2.0.
- The coordinator pre-added dependencies (profile-api to four profile modules, fflate to profiles-orca)
  so workers never touched `package.json`. The PRF-70 first review still flagged a dependency the card
  said it did not add (it was the coordinator's).
- Owner question Q22 (extension ids) asked.
- Every worker ran `node scripts/run.mjs checks` before review (rule 22, amended SP7).
- Not from the coordinator: PRN-5's card says `model: opus`, but it was built by the Sonnet "PRN-5,
  SLC-5, SLC-115 worker" and failed its first review (the event's model field).

### Clean-registry ci

The background clean-registry `node scripts/run.mjs ci` (`/private/tmp/claude-501/sp8-ci.log`) had
finished when this retro was written: `exit=0` at 08:53:49, after `check-fixtures`. Whether it passed on
its first run, and the release list, are for the coordinator's addendum.

## On time or not

**On time, and over plan.** The plan was the 65 workable task points between 07:30 and 08:50, with the
audit and retro after. The last review passed at 08:48:17, two minutes before the planned end of
building, with 88 points delivered: all 65 planned plus 23 pulled in or created. That is 65.4 points an
hour over the 80.7 minutes of building (59.3 by the facts table, which counts from 07:20), against the
plan's 49 an hour. SP7 delivered 32.6 an hour.

The lanes did not run at rule 23's 20 points an hour; the sprint was fast because it had many lanes:

| Lane | Points | First dispatch to last pass | Points an hour |
|---|---|---|---|
| profiles (PRF-35, 70, 181, 71) | 11 | 07:27 to 08:25, 57 min | 11.6 |
| profiles-prusa (PRF-10, 24, 11) | 9 | 07:27 to 08:38, 71 min | 7.6 |
| profiles-orca (PRF-124, 182, 103, 183) | 8 | 07:27 to 08:19, 51 min | 9.4 |
| profiles-cura (PRF-125) | 2 | 38 min | 3.2 |
| printer-folder (PRN-131) | 3 | 33 min | 5.5 |
| printer-api (PRN-3, PRN-5) | 4 | 08:10 to 08:43, 33 min | 7.3 |
| slicer-api (SLC-4, SLC-5) | 4 | 08:10 to 08:48, 38 min | 6.3 |
| 16 module scaffolds | 32 | 4 agents, 8 to 12 min each | 160 together |

A lane with one card at a time cycles once per worker wave plus review wave, about 10 to 12 minutes, and
again per failed review. An M that passes is 3 points in about 10 minutes (18 an hour); an M that fails
once is 3 in about 24 (7.5 an hour). Effort did not predict wall time: passing S and M cards both took 6
to 13 minutes, and the five longest cards (PRF-125 S 38, PRN-131 M 33, PRF-24 M 27, PRF-10 M 26, PRF-35 S
24) were long only by their review rounds. Scaffolds batched seven to an agent ran at 2 points a minute
of wall each.

By model: Opus workers built PRF-70 (failed once), PRF-103 (passed), PRF-11 (passed); every Opus worker
under 7.5 minutes. Sonnet built the rest, including PRN-5 against its card's `opus`. By type: features
failed first review 12 of 18 times, chores 0 of 18, bugs 1 of 3.

## Why

Cards well over their size, from the reviews in their Progress:

- **PRF-125 (S, 38 min, two rounds):** upstream semantics. `exclude_materials` is a substring match in
  Cura (`MachineNode.py`), not set membership; the second round was on the same mapping. The card did
  not quote the upstream rule.
- **PRN-131 (M, 33 min, three rounds):** resource bounds and test strength. Round 1: the long-mode suffix
  broke the 255 cap, case folding missed pairs, quadratic collisions; round 2: quadratic collisions again
  (coordinator); round 3: the linear-probe test read `mock.calls` after `mockRestore()` and could not
  fail. The card's criteria named no time bound.
- **PRF-24 (M, 27 min, two rounds):** upstream semantics. Keys under a rejected header joined the
  previous section, headers parsed unlike boost's `ini_parser`, silent duplicates; round 2 on JS `trim`
  stripping Unicode whitespace that boost keeps.
- **PRF-10 (M, 26 min, one round):** catastrophic backtracking (the criteria named no bound) and two
  mapping errors against profile-api's schema.
- **PRF-35, PRF-70, PRF-180 (24 to 25 min, one round each, in wave 1):** PRF-70 read inherited properties
  (`constructor`, `__proto__`); PRF-180's fix removed the cheap length reject. Their first wave carried
  the 6.1-minute slicer scaffold agent and their reviews a 7.3-minute review, so each round cost about 12
  minutes.
- **SLC-5 and SLC-115 (S, 21 min, two rounds):** validator and exported schema disagreed, `startsWith`
  as URL validation, missing VS Code task keys; reviewed and fixed together, so they share their rounds.

For the sprint as a whole, the time went to review rounds. 19 fix rounds at 10 to 12 minutes each were
the whole difference between a 12-minute card and a 38-minute one, and reviews and fixes were 64% of
agent time. Rule 25's bounds were not in the criteria of PRF-10, PRF-71 or PRN-131 (no bound, cap,
linear or quadratic wording before Progress); they were planned or pulled in without the SP7 amendment
applied. SLC-9 named its timeout but not the validation of it. So 4 of the 6 resource-bound rounds were
on cards that never had the bounds written, and the rule was not tested on them. Upstream-semantics
findings (PRF-125, PRF-24, PRF-10) were the other large cause; the cards cite the upstream project but
not the lines that define the behaviour.

Idle (21%) came from the number of waves, not their gaps: alternating workers-only and reviews-only
messages means 17 waves for 40 cards, and each gap costs about a minute.

The `board.py note` trap cost no wall time but made reviewers reconstruct fix notes from the activity
log. The late CHANGELOG lines (`d2a3cb7`) and the 0.2.0-as-0.1.1 release were coordinator overhead
between waves; the release was planned with a version number before the registry's state was checked.

## Change

Written into `.ai/plans/estimation.md`:

- **Rule 23 amended:** under wave dispatch a lane's capacity is counted in review cycles, not points: a
  card that passes takes about 12 minutes from dispatch to done whatever its size (S and M alike), and
  each expected fix round adds 12. Plan a lane at 5 cards an hour less 1 per expected fix round
  (rule 19's rate), and get points from many lanes. Testable: the next sprint's per-lane done count is
  within one card of this estimate.
- **Rule 19 amended:** budget fix rounds by kind: features 2 in 3 fail first review, one in four of
  those twice; chores, scaffolds and releases none; bugs 1 in 3. About 12 minutes of wall per round
  under alternating waves (SP7 25). Port and parser cards quote the upstream lines that define the
  behaviour in their criteria.
- **Rule 25 amended:** before dispatch, the coordinator checks every card that parses input, loops over
  input or copies it, pulled in or not, for a Bounds criterion, and writes one if it has none; numeric
  limits a caller passes (timeouts, sizes) are validated (finite, positive, in range). Testable
  unchanged: at most one resource-bound round.
- **Rule 11 amended:** a message may carry reviews of lane A and workers for lane B when all of them are
  short (rule 17 forbids mixing long and short, not reviews and workers); fewer waves is the remaining
  lever on idle. Testable: idle under 15% from the first wave to the last review.
- **New rule 27:** workers and fix workers record in the card file (append under Progress with an edit),
  never with `board.py note`, which writes only to the activity log; a release card names its version
  only after reading the registry's latest published version; the dispatched model is the card's
  `model`. Testable: every fix round has the fix worker's lines in the card's Progress, release cards'
  titles match the published version.
- **Current calibration:** "After SP8" entry added.

## Re-sizing

Per-lane velocity changed a lot (7.6 to 11.6 points an hour on feature lanes against rule 23's 20), but
the cause is review rounds, which effort does not predict: passing S and M cards took the same 6 to 13
minutes. Re-sizing cards would not move the plan, so no card is re-sized and no `plan-sprints` dry run
was made; the change is in how lanes are counted (rule 23). One record fix for the coordinator: PRF-136's
title says `profile-api@0.2.0`, but 0.1.1 was released.

## Addendum (coordinator, after the retro agent stopped)

- **Clean-registry ci passed on its first run** (rule 22's testable target met; SP7 needed six): `node scripts/run.mjs ci` from an empty Verdaccio storage (old storage kept in `/private/tmp/claude-501/sp8reg.8xmM`) at `59eb20a`, 08:49:23 to 08:53:49, exit 0, log `/private/tmp/claude-501/sp8-ci.log`. One module published this sprint: `profile-api@0.1.1` (PRF-136); every other changed module is still 0.0.0 or changed tests only (gcode-preview).
- **No card moved out of SP8 before close.** Carried cards stay in SP8 and close-sprint carries them, so the committed figure is the one above: 305 points, 92 recorded with VSS-47 and VSS-82 done.
- The audit (`.ai/audits/SP8-audit.md`, 09:10, about 20 minutes of probes) found 1 must-fix, 4 should-fix (one split per module into three cards) and 5 nice-to-have: 12 SP9 bug cards (VWR-394 P0; PRF-185, SLC-277, VWR-395, GCP-115, PRF-186, PRF-187 P1; PRN-443, SLC-278, PLT-195, PRF-188, PRF-189 P2), plus PRF-184 from PRF-11. Its must-fix is a pre-SP8 parser (3mf `startTags`/`scanModel`, quadratic saxes nesting), which supports rule 25's lesson that bounds must cover every parser path, not only the one a card names.
- PRF-136's card title still names 0.2.0; it shipped 0.1.1 (title fix left to SP9, noted on the card).
