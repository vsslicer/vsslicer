# VSSlicer roadmap

Written 2026-10-25 for VSS-17 from the sixteen R1 reports in `docs/research/`. The capability-level comparison behind this plan is `docs/research/feature-matrix.md`. Raw notes: `.reference/notes/VSS-17-feature-matrix-and-roadmap.md`.

The product, as the owner defined it: VSSlicer turns VS Code (and later a custom VSCodium build with its own Open VSX-style marketplace) into a complete 3D printing environment. That covers:
- 3MF and project management, a 3D viewer and a slicer;
- a sliced-output viewer with precise toolhead simulation;
- printer management through official and unofficial APIs, plus export to storage;
- remote cameras;
- printer, nozzle and material profiles;
- filament management: a database, a spool inventory, and consumption taken from printer feedback;
- themes, last.

## How the phases are ordered

1. **Testability first.** The earliest phases build libraries whose behaviour can be checked against deterministic fixtures and external oracles: G-code, 3MF, profiles, printer protocols, engine output.
2. **Usability next.** Once those foundations are proven, the editing and day-to-day workflows go on top: the project editor, cameras, Bambu, filament, fleet.
3. **Functionality last.** Then breadth: advanced model preparation, calibration, more printer families, optional engines, and finally the fork and themes.

Every phase ships at least one extension that is useful on its own, published to the marketplaces, with an automated test suite that gates the release.

**Test tooling.** These are our choices; the R1 reports did not evaluate them:
- vitest for the pure TypeScript libraries;
- `@vscode/test-electron` for extension integration tests;
- Playwright with Chromium for webview rendering snapshots.

Each phase's test strategy names the oracle the tests compare against.

## Decisions

### Fork or extension

**Decision: extensions on stock VS Code and VSCodium first. The VSSlicer-branded VSCodium build is an optional packaging step in phase 11.** Reason: every product capability can be built on the public extension API. A fork adds only:
- branding;
- a default gallery;
- built-in extensions;
- proposed-API allowlisting.

It also costs a monthly rebase over about 41 patches, signing certificates, and CI across 6 to 9 targets (`docs/research/vscode-platform.md` bottom line, §4, Decision table, Implications 1 and 6).

| Capability | Where | Reason (source) |
|---|---|---|
| 3MF and STL editing, 3D viewer | Extension (`CustomEditorProvider` + WebGL2 webview) | Custom editors give dirty state, undo, save and backup (`vscode-platform.md` §2, Decision table; `3d-viewer.md` §5, §6) |
| G-code preview and simulation (50–500 MB) | Extension (read-only custom editor, streamed with `fs`) | TextDocument sync stops at 50 MB (`vscode-platform.md` §1 "Large files") |
| Slicing | Extension spawning an external engine | Process boundary for crash containment and the licence (`slicing-engine-embedding.md` §4, §6; `licensing.md` Implications 2) |
| Printer connections, camera proxy | Extension plus a local daemon | The extension host lives per window, so connections would be duplicated; a daemon survives reloads (`vscode-platform.md` §1 "Long-running processes", Implications 3) |
| USB serial | Optional extension with `serialport` (N-API), platform-specific VSIX | No WebSerial in webviews (`vscode-platform.md` §1 "Serial ports"; `printer-connectivity.md` §3) |
| Branding, default gallery, built-in extensions, proposed APIs, Electron switches (WebGPU, codecs) | Fork only | `product.json` fields (`vscode-platform.md` §4; `3d-viewer.md` Implications; `remote-camera.md` Implications 5) |
| Extension-signature enforcement for our registry | Fork, plus our own verifier | VSCodium disables verification; VS Code checks only Microsoft signatures (`vscode-platform.md` §5 "Signing") |

### Extension boundaries

All extensions and libraries below are VSSlicer code under Apache-2.0, except `vsslicer.engine-cura-wasm`. The extensions keep `extensionKind` and capabilities as stated, because hardware and LAN access must stay on the user's machine under Remote-SSH and WSL (`vscode-platform.md` §1 "Extension kinds", Implications 5).

**Shared libraries.** These are npm packages bundled into each extension that uses them. They are not extensions.

| Library | Owns | Rests on |
|---|---|---|
| `@vsslicer/gcode` | Streaming parser (text, `.bgcode`, `.gcode.3mf`), structure-of-arrays move buffers (position, width, height, role, tool, flags, file offset, start time), thumbnails, object labels, per-firmware planners (Klipper, Marlin/Buddy, RRF, Bambu estimate) | `gcode-viewer-simulation.md` §1–§4, §7, Implications |
| `@vsslicer/3mf` | OPC container that preserves unknown parts; model, build and Production reader/writer; dialect detection and readers for Bambu/Orca, Prusa 2.x and later 3.0, and Cura; writer with our own `Metadata/` namespace and a MustPreserve relationship | `3mf.md` §1–§5, Implications |
| `@vsslicer/mesh` | STL/OBJ parse in workers, vertex dedup, BVH, later the painting model (TriangleSelector-compatible) and booleans through manifold-3d | `3d-viewer.md` §3, §6, Implications |
| `@vsslicer/profiles` | Unified JSON schema (vendor, printer_model, nozzle, surface, feeder, material, process, printer_instance), importers (Prusa INI and YAML, Orca/Bambu JSON, `.orca_*`/`.bbscfg`, Cura definitions and fdm_materials), condition evaluator, native round-trip export | `profiles.md` §1–§6, Implications |
| `@vsslicer/printer-api` | `PrinterAdapter`/`Session`/`Discoverer` capability interfaces, normalised status, `CameraSource` interface | `printer-connectivity.md` §6; `remote-camera.md` Implications 1 |
| `@vsslicer/webview-kit` | WebGL2 renderer core (instanced segments, data textures), message transport with ArrayBuffer transfer, CSP helper | `gcode-viewer-simulation.md` §6, §7; `3d-viewer.md` §6; `vscode-platform.md` §2 |
| `@vsslicer/agent-protocol` | JSON-RPC schema between extensions and the daemon | `vscode-platform.md` Implications 3 |

**Extensions and processes.**

| Extension | Owns | Exports (shared API) | Kind | Phase |
|---|---|---|---|---|
| `vsslicer.gcode` | G-code language (grammar, hovers), preview and simulation editor for `*.gcode`, `*.bgcode`, `*.gcode.3mf` | `GcodePreview.open(uri, {plate?})`, `follow(uri, fileOffset)` for live prints | workspace, plus a `web` build | 1 |
| `vsslicer.project` | Custom editor for `.3mf`/`.stl`/`.obj` (later `.step`), plates tree, `.vsslicer/` project folder layout, undo and backup | `ProjectModel` (plates, objects, per-plate sliced artefacts, events), `renderThumbnail(plate)` | workspace | 2 (viewer), 6 (editor) |
| `vsslicer.profiles` | Profile store in the workspace and `globalStorageUri`, importers, profile tree view, settings form webview, JSON Schema contributions | `ProfileStore.resolve(printerInstance, material[], process) → {unified, native(format)}` | workspace | 3 |
| `vsslicer.printers` | Open-ecosystem adapters (Moonraker, OctoPrint, PrusaLink, Duet, then SDCP, Repetier), discovery, `printer://` FileSystemProvider, export to storage, job control | `PrinterRegistry` (list, status events, `upload(uri, opts)`, `job`, `files`, `cameras()`) | **ui** | 4 |
| `vsslicer-agent` (daemon, not an extension) | Long-lived printer sessions, camera loopback proxy (127.0.0.1 with a per-session token), job monitoring across windows | JSON-RPC over a local socket (`@vsslicer/agent-protocol`) | local process | 4 |
| `vsslicer.slicer` | `SlicerEngine` interface, engine detection and upstream download, Orca CLI adapter, CuraEngine CLI adapter, then the PrusaSlicer CLI adapter; tasks and problem matchers | `Slicer.slice(job): AsyncIterable<Progress\|Warning\|Layer>` resolving to output paths, `cancel()` | workspace | 5 |
| `vsslicer.camera` | Webview player (MJPEG `<img>`, JPEG frames `<canvas>`, WebRTC/MSE `<video>`), snapshot and timelapse providers, optional go2rtc sidecar | `CameraView.open(source)` | **ui** | 7 |
| `vsslicer.bambu` | Bambu Developer Mode LAN adapter (MQTT/TLS, FTPS, `.gcode.3mf` send, AMS mapping), read-only mode F, Bambu Connect hand-off | registers a `PrinterAdapter` with `vsslicer.printers` | **ui** | 7 |
| `vsslicer.filament` | Inventory store (Brand, Material, Filament, Spool, ConsumptionEvent, Tag), OFD import, Spoolman sync, consumption reconciliation | `Inventory` (spools, `book(event)`, match by tag) | workspace | 8 |
| `vsslicer.fleet` | Fleet queue, compatibility check, history JSONL, Moonraker job-queue bridge, multi-printer send | `Queue`, `History` | **ui** | 9 |
| `vsslicer.printers-serial` | Marlin serial streaming and SD over serial (`serialport`, platform VSIXs) | registers a `PrinterAdapter` | **ui** | 10 |
| `vsslicer.printers-unofficial` | Reverse-engineered vendor adapters (Creality 9999/CFS, Elegoo CC2, Anycubic MQTT, Snapmaker SACP, AnkerMake), opt-in and labelled | registers `PrinterAdapter`s | **ui** | 10 |
| `vsslicer.engine-cura-wasm` | **AGPL-3.0**, separate repository: unmodified CuraEngine WASM run in a child process, with the source offer; also the home of a CuraEngine Arcus adapter if counsel approves it (see the boundary rule) | no `exports`; a CLI-style process protocol only (see below) | workspace only. No `web` build: a web extension host cannot spawn processes, so the WASM would run in-process with our code (scenario (f)) and serving it would convey object code (scenario (c)) | 10 |
| `vsslicer` (extension pack) | Bundles the extensions above | none | n/a | 1 onwards |
| `vsslicer.themes` | Colour and icon themes | none | n/a | 11 |

**Shared-API rules.**
- Apache-2.0 extensions call each other through `exports` and commands in the shared extension host. That is the normal VS Code pattern, and it has no licence issue between same-licence components.
- Heavy work never runs on the extension-host thread. Parsing and planning run in `worker_threads`; slicing runs in child processes. A crash or out-of-memory error in that work must not take down every extension in the window (`vscode-platform.md` §1 "Memory").
- Only the extensions that see the user's machine (`kind: ui`) talk to the network, serial ports and the daemon. Workspace-kind extensions reach printers only through the `vsslicer.printers` API.

**AGPL boundary rule (from `licensing.md` §2 scenario (f) and Implications 3).** An AGPL engine extension shares the extension-host process if it is called through VS Code `exports` or `executeCommand`, or listed in `extensionDependencies`. That is contested and probably makes a combined work. So:
- `vsslicer.slicer` reaches any AGPL engine only across a real process or file boundary: spawn the engine as a child process, pass input files (3MF, STL, config JSON) and read output files (G-code), progress lines on stdout, and exit codes.
- The same rule covers the optional `vsslicer.engine-cura-wasm`. Its WASM runs in its own Node child process (Electron run as Node; feasibility unverified, spike in phase 10). It is never loaded as a module or worker inside our extensions.
- Messages stay narrow and serialised. Avoid exchanging an engine's full internal settings structures beyond the config file the engine reads anyway.

**CuraEngine: CLI, not Arcus, in the Apache-2.0 extension.** `slicing-engine-embedding.md` §6 item 4 recommends Arcus for its progress and live layers. But Arcus needs `Cura.proto`, which lives in the AGPL CuraEngine repository. It also streams the full `SettingList`, per-object settings and `LayerOptimized` toolpaths, which is the "complex internal data structures" case of `licensing.md` §2 (a) and breaks the narrow-message rule above. So `vsslicer.slicer` drives CuraEngine through its CLI (`slice -j <def.json> -s key=value -o <file>`; `features-cura.md` §4; `slicing-engine-embedding.md` §4 option A). It shows progress from the stdout stage lines and reads the G-code file. An Arcus adapter, if wanted, lives in the AGPL `vsslicer.engine-cura-wasm` repository with `Cura.proto` bundled under AGPL. Whether Apache-2.0 code may speak Arcus at all is a question for counsel (owner question 13).

This deliberately overrides `slicing-engine-embedding.md` §6 item 4, which allowed `vscode.commands`; `docs/research/feature-matrix.md` (Contradictions resolved, item 2) records the conflict.

### Marketplace plan

| Stage | Plan | Source |
|---|---|---|
| Phase 1 onwards | Publish every extension and the pack to **open-vsx.org** and to the **Microsoft VS Marketplace**. Claim the verified `vsslicer` namespace on open-vsx.org early (Eclipse account, Publisher Agreement, public namespace issue). Every `package.json` carries an SPDX licence expression, which Open VSX requires. Use trusted publishing (OIDC) from CI. Publishing to Microsoft's marketplace reaches stock VS Code users and is allowed for VS Code itself. | `vscode-platform.md` §5, Implications 1 and 7; `licensing.md` §4 (Microsoft and Open VSX rows) |
| Phase 11 (fork) | A **self-hosted Open VSX** (EPL-2.0 server, run unmodified: Spring Boot, PostgreSQL, Elasticsearch or database search, OAuth2, Docker images) configured as an upstream-registry instance with **open-vsx.org as upstream**. Local misses fall through, so users keep the public catalogue. The fork's `product.json#extensionsGallery` and `controlUrl` point at it. Set stable extension UUIDs and the content-size limits. | `vscode-platform.md` §5; `licensing.md` §2 scenario (e) |
| Alternative | `coder/code-marketplace` (one Go binary that serves VSIX files, with no UI or publishing flow) for private or air-gapped builds. | `vscode-platform.md` §5 "Alternatives" |
| Never | Point a fork or custom build at, or mirror, the Microsoft Marketplace. Its Terms of Use (September 2025) limit it to Visual Studio-family products. | `licensing.md` §4; `vscode-platform.md` §5 |
| Registry policy | Refuse uploads without a licence. Require a source link for copyleft extensions. Run notice-and-takedown for third-party uploads. Enable Open VSX signature archives. Note that the editor does not verify them unless the fork adds a verifier. | `licensing.md` §2 (e), Open questions 9; `vscode-platform.md` §5 "Signing" |

There is a tension between the owner's wish for an own marketplace and `vscode-platform.md` Implications 7 ("not needed while open-vsx.org exists"). This plan defers the self-hosted registry to the fork phase. It is listed as an open question.

### Licence posture

| Point | Posture | Source | Contested? |
|---|---|---|---|
| Our code | Apache-2.0 for every VSSlicer repository except the optional engine extension. MIT would also work; Apache adds a patent grant. | `licensing.md` Implications 1 | No |
| AGPL engines (Orca, PrusaSlicer, CuraEngine) | Spawn them as separate processes. The user installs them, or we download the official upstream release on request. Never bundle them in a VSIX, and never host the binaries ourselves. | `licensing.md` §2 (a), Implications 2; `slicing-engine-embedding.md` §6 | Yes: whether downloading on the user's behalf is "conveying" (`licensing.md` open question 1) |
| In-process coupling with AGPL | Forbidden; process or file boundary only (see the boundary rule above) | `licensing.md` §2 (f) | Yes: Medium-Low confidence that in-process would be safe (`licensing.md` §2 table) |
| WASM engine | Only in the separate AGPL `vsslicer.engine-cura-wasm`, with a source offer | `licensing.md` §2 (c), Implications 3 | Yes: whether a worker that only uses `postMessage` is a separate work (`licensing.md` open question 2) |
| Porting AGPL logic | Clean-room only. Implement from our reports and specs, never from snippets out of the clones. Write our own labels and tooltips. One person reads and another implements for risky pieces: 3MF dialects, calibration, flush volumes, the painting model, and the motion planners. The Klipper planner is written from `klipper@ee2c6fb:docs/Kinematics.md` and the published junction-deviation formula, never from GPL `klippy/toolhead.py`. The Marlin/Buddy planner is written from Marlin's documentation and the published trapezoid and junction-deviation formulas, never from GPL `planner.cpp` or AGPL libpgcode or GCodeProcessor. | `licensing.md` §2 (porting row); `gcode-viewer-simulation.md` §7, Licence notes; `features-prusaslicer-superslicer.md` Licence notes; `features-bambustudio-orcaslicer.md` Licence notes | Medium-High confidence; whether Kinematics.md alone is a clean enough source is owner question 36 |
| Profiles and data | Write importers clean-room. Download vendor packs (AGPL/LGPL repos) at the user's request, as unmodified data packages with LICENSE and `source.commit`. Bundle only CC0 and MIT data (fdm_materials, OFD). Do not redistribute the Prusa `-fff` repositories, which have no licence. | `licensing.md` §3; `profiles.md` Implications 5 | Yes: whether profile data makes the reading program a covered work (`licensing.md` open question 3) |
| LGPL components | `occt-import-js` (LGPL-2.1) and Cura definitions (LGPL-3.0 data) ship as separately loadable files or data packages, so they stay replaceable | `licensing.md` §2 (LGPL); `3d-viewer.md` Licence notes | Low risk |
| GPL references | Klipper, Moonraker, Marlin, Mainsail, Fluidd, camera-streamer: read for behaviour, talk to over HTTP/WS, never copy | `licensing.md` Comparison; `remote-camera.md` Licence notes | No |
| klipper_estimator | Test oracle in CI only. Never ported, never shipped. | `gcode-viewer-simulation.md` Licence notes; `licensing.md` open question 12 | Yes: provenance of `planner.rs` |
| Vendor ToS | LAN protocols first. Cloud and reverse-engineered adapters are opt-in and labelled "unofficial". No Bambu keys, plugin binaries or Bambu Connect material. | `licensing.md` §4, Implications 6; `bambu-connectivity.md` Implications 2 | Yes: reverse-engineering clauses and their jurisdiction (`licensing.md` open question 8) |
| Fork | Build from Code-OSS and VSCodium sources (MIT). No Microsoft trademarks or icons, no Microsoft-licensed extensions. Ship third-party notices and a written source offer for every copyleft component bundled. | `licensing.md` §2 (d), (g); `vscode-platform.md` Licence notes | No |
| Kiri:Moto | Not reused until the author confirms MIT in writing | `licensing.md` Comparison, open question 5 | Yes |

## Phases

Every phase below lists its goal, deliverables, test strategy, dependencies, the reports it rests on, and the licence posture it assumes.

### Phase 1: G-code toolkit, preview and toolhead simulation

- **Goal.** Open any sliced file from PrusaSlicer, Orca, Bambu Studio, Cura or SuperSlicer and inspect it layer by layer. Simulate the toolhead with firmware-aware timing.
- **Usable deliverable.** `vsslicer.gcode` on both marketplaces. Users of any slicer get preview, an estimated time per layer and per move, scrubbing with time-interpolated toolhead position, thumbnails, object labels, the slicer's per-job filament length, weight and cost read from its summary comments, and G-code text editing (grammar, hovers). Also the `vsslicer` extension pack (one member).
- **Libraries.** `@vsslicer/gcode` (parser for text, `.bgcode` with our own heatshrink and MeatPack, `.gcode.3mf`; planners for Klipper, Marlin/Buddy and RRF, plus a Bambu estimate) and `@vsslicer/webview-kit` (WebGL2 instanced renderer, about 28 bytes per move).
- **Test strategy.**
  - Golden-file tests on a fixture corpus generated once per slicer: a calibration cube and a multi-material sample, with arc fitting on and off. G-code output of AGPL programs is data, but keep the fixtures small and record the generating version.
  - `.bgcode` decoding tested against the spec's block layout and against `.gcode` twins of the same slice.
  - Klipper planner: within under 1 minute over 12 hours of klipper_estimator output (CI oracle, not shipped). Marlin planner: compared with PrusaSlicer's M73 and summary estimates in the same files.
  - Memory and throughput budget tests on synthetic 50, 200 and 500 MB files in a worker.
  - Renderer pixel snapshots in Playwright/Chromium. Extension test: open a file larger than 50 MB through the custom editor.
- **Spikes inside the phase.**
  - `postMessage` ArrayBuffer throughput (`vscode-platform.md` open questions).
  - WebGPU probe (`3d-viewer.md` open question 1); WebGL2 remains the baseline.
  - Real moves per byte with arc fitting (`gcode-viewer-simulation.md` open questions).
- **Dependencies.** None.
- **Rests on.**
  - `gcode-viewer-simulation.md` §1–§7, Implications.
  - `vscode-platform.md` §1 (large files, worker threads), §2.
  - `3d-viewer.md` §2.
  - `feature-matrix.md` §10.
- **Licence posture.**
  - Apache-2.0, reimplemented from formats and specs.
  - Planners under the clean-room rule: Klipper from `docs/Kinematics.md` and published formulas, not `klippy/toolhead.py`; Marlin/Buddy from Marlin docs and published formulas, not `planner.cpp`, libpgcode or GCodeProcessor.
  - No libbgcode, libvgcode or libpgcode (AGPL). No klipper_estimator code. gcode-preview (MIT) only as a reference.

### Phase 2: 3MF library and model viewer (read-only)

- **Goal.** Open `.3mf` (Bambu/Orca, Prusa 2.x, Cura dialects), `.stl` and `.obj` in a 3D viewer. See plates, objects and embedded per-plate G-code and thumbnails, and open a plate's G-code in the phase-1 preview.
- **Usable deliverable.** `vsslicer.project` in viewer mode: a custom editor with a plates and objects tree view and a "Preview sliced plate" command that calls `GcodePreview.open`.
- **Libraries.** `@vsslicer/3mf` (container that preserves unknown parts, dialect detection, readers) and `@vsslicer/mesh` (worker parsing, BVH).
- **Test strategy.**
  - Read conformance against the 3MF Consortium test suites (BSD-2-Clause per `licensing.md` Comparison "3MF specs"; the suites themselves were not cloned in R1, so their content is unverified), with lib3mf WASM as an oracle in CI.
  - Round-trip tests asserting that unknown parts, relationships and content types are byte-identical after open and save of an untouched document.
  - Dialect-detection tests on fixture projects from each slicer.
  - Viewer snapshot tests. Large-mesh tests at 1, 5 and 20 M triangles (`3d-viewer.md` open question 3).
- **Dependencies.** Phase 1 (preview integration, webview kit).
- **Rests on.**
  - `3mf.md` §1–§6, Comparison, Implications.
  - `3d-viewer.md` §1–§6.
  - `projects-and-fleet.md` §1, §4, §5.
  - `vscode-platform.md` §2, §3.
  - `feature-matrix.md` §9.
- **Licence posture.**
  - Own TypeScript reader written from `3mf.md`. Never copy `bbs_3mf.cpp` or `3mf.cpp`.
  - three.js, three-mesh-bvh and fflate are MIT; lib3mf is BSD.

### Phase 3: Profiles

- **Goal.** Import the user's existing slicer profiles into one schema, browse inheritance, edit with validation, and export back to each engine's native form without loss.
- **Usable deliverable.** `vsslicer.profiles`:
  - Import from installed PrusaSlicer, Orca, Bambu Studio and Cura configuration folders; from `.orca_printer`, `.orca_filament`, `.bbscfg`, `.bbsflmt` and INI bundles; and, on request, from pinned upstream vendor packs.
  - A profile tree, a JSON Schema for editing as text, and a generated settings form (webview) with search.
  - `printer_instance` entities, with secrets in SecretStorage.
  - An add-printer flow: pick a printer model, nozzle and material from the imported set and create a `printer_instance` (the P0 minimum of the configuration wizard).
- **Libraries.** `@vsslicer/profiles`: unified schema, importers, a safe condition evaluator, and a lossless native round-trip store.
- **Test strategy.**
  - Importer golden tests on vendor packs pinned to commits (downloaded in CI, not committed): PrusaSlicer 2.9.6 INI, Orca and Bambu JSON trees, Cura definitions and fdm_materials.
  - Assert counts per entity type (for example `PrusaResearch.ini`: 35 printer models, 238 printers; `profiles.md` §1).
  - Assert that resolved values for sample (printer, nozzle, material, process) tuples match the native resolution rules. Assert native export is byte-equivalent after a round trip.
  - Condition-evaluator truth-table tests from Prusa `compatible_printers_condition` examples. JSON Schema validation of every imported entity.
- **Dependencies.** None on earlier phases. It ships independently, and phase 5 consumes it.
- **Rests on.**
  - `profiles.md` §1–§6, Comparison, Implications.
  - `features-prusaslicer-superslicer.md` §1, Implications.
  - `features-bambustudio-orcaslicer.md` §1, Implications.
  - `features-cura.md` §1, Implications.
  - `licensing.md` §3.
  - `feature-matrix.md` §1, §13.
- **Licence posture.**
  - Clean-room importers; our own labels and descriptions.
  - Vendor data downloaded at the user's request and never bundled, except fdm_materials (CC0).
  - Cura `=expr` formulas are evaluated at import for fixed tuples until an evaluator decision is made (open question).

### Phase 4: Printers (open ecosystems), daemon and export to storage

- **Goal.** Send existing G-code to Klipper/Moonraker, OctoPrint, PrusaLink and Duet printers. Start, pause and cancel jobs, watch status, browse printer files, and export to a removable drive or folder. Follow a live print in the phase-1 preview.
- **Usable deliverable.**
  - `vsslicer.printers` (UI kind) with the four adapters.
  - mDNS and SSDP discovery (`bonjour-service`, MIT), plus manual entry.
  - The `printer://` FileSystemProvider.
  - Export to storage. File names default to FAT 8.3 unless the printer profile sets a long-filename flag. Automatic detection through Marlin `M115` needs serial and arrives with `vsslicer.printers-serial` in phase 10.
  - Background upload queue with progress and cancel.
  - Live follow by file offset.
  - The `vsslicer-agent` daemon holding sessions across windows.
- **Libraries.** `@vsslicer/printer-api`, `@vsslicer/agent-protocol`.
- **Test strategy.**
  - Per-adapter contract tests against recorded HTTP and WebSocket fixtures taken from the published APIs. Moonraker, OctoPrint and PrusaLink `openapi.yaml` are read for types only until its licence is clarified.
  - OctoPrint's virtual printer in CI (not covered by R1; unverified). Klipper/Moonraker simulator feasibility is also unverified, so the fallback is recorded fixtures plus a manual hardware checklist.
  - Daemon tests: reconnect, two windows attached to one session, shutdown within the 5 s `deactivate` budget.
  - Property tests for file-name sanitisation. Upload cancel and progress tests.
- **Dependencies.** Phase 1 (live follow, send-from-preview).
- **Rests on.**
  - `printer-connectivity.md` §1, §4, §5, §6, Implications.
  - `vscode-platform.md` §1 (extension kinds, long-running processes, networking), §3, Implications 3 and 5.
  - `gcode-viewer-simulation.md` §7 (live follow).
  - `feature-matrix.md` §11.
- **Licence posture.**
  - Our own clients, written from documentation. Moonraker (GPL), OctoPrint (AGPL) and Prusa-Link-Web (GPL/AGPL) code is not copied.
  - Documented local APIs carry the lowest ToS risk.

### Phase 5: Slicing through external engines (first end-to-end release)

- **Goal.** Slice a model or a project plate with an imported profile, then preview and send. This is the first complete loop: open, slice, preview, print.
- **Usable deliverable.**
  - `vsslicer.slicer`:
    - Detects a user-installed OrcaSlicer, or offers to download the official upstream release into `globalStorageUri`.
    - Emits Orca preset JSON from `ProfileStore.resolve`.
    - Runs the CLI with an argv array, typed exit codes and `--pipe` progress on Linux (indeterminate progress elsewhere). Cancels by killing the process. Writes into a temp directory and moves the output into `.vsslicer/sliced/`.
    - Injects thumbnails rendered by `vsslicer.project`.
  - A CuraEngine CLI adapter: we resolve Cura's setting stack and formulas ourselves and pass `-j`/`-s`; progress comes from stdout stage lines (`slicing-engine-embedding.md` §5). Not Arcus (see the boundary rule).
  - Post-processing scripts run as a VS Code task after slicing.
  - VS Code tasks "slice", "upload" and "print", with problem matchers for engine warnings.
- **Test strategy.**
  - CI downloads pinned engine releases: Orca, and CuraEngine taken from the pinned Cura release, because CuraEngine has no current release of its own (`slicer-landscape.md` §3). Fixture models are sliced with fixture profiles; the G-code is parsed with `@vsslicer/gcode`.
  - Assert layer count, extrusion roles present, and that our time estimate lies within a set tolerance of the engine's own estimate.
  - Cancel test. Error-mapping tests for the exit-code table.
  - Cura settings-resolution tests against the definitions' own `value` formulas for fixture tuples.
  - Snapshot tests of the emitted preset JSON from `@vsslicer/profiles`.
- **Spikes.**
  - macOS quarantine and notarisation of downloaded engines (`slicing-engine-embedding.md` open questions).
  - Stability of Orca `--debug` progress text on macOS and Windows.
  - The exact CuraEngine CLI contract for headless use (`features-cura.md` open questions).
- **Dependencies.** Phase 3 (profiles), phase 2 (project model, thumbnails), phase 1 (preview), phase 4 (send).
- **Rests on.**
  - `slicing-engine-embedding.md` §1, §2, §4–§6, Implications.
  - `features-cura.md` §4.
  - `features-bambustudio-orcaslicer.md` §2, §6.
  - `licensing.md` §2 (a), Implications 2.
  - `feature-matrix.md` §1, §2.
- **Licence posture.**
  - Engines run as separate, unmodified processes that the user installs or downloads from upstream. We do not host them.
  - Only files and CLI arguments cross the boundary; no AGPL schema (`Cura.proto`) ships in our VSIX.
  - The PrusaSlicer adapter waits for phase 10. It targets 2.9.x until 3.0 is stable; note the exit-0 bug.

### Phase 6: Project editor

- **Goal.** Prepare prints inside VS Code:
  - transform, mirror, split and instance objects;
  - create, duplicate, lock and delete plates, with per-plate settings;
  - per-object and per-part overrides, modifier and negative volumes, support blockers and enforcers;
  - arrange;
  - per-layer pause and colour change;
  - mesh repair;
  - STEP import;
  - saving Orca/Bambu-compatible 3MF.
- **Usable deliverable.**
  - `vsslicer.project` in editor mode: `CustomEditorProvider` with command-object undo and redo, VS Code hot-exit backup, and a 3MF writer (core plus Production plus `Metadata/` in the Bambu/Orca shape and our own namespace; never another vendor's `Application`), and a generic 3MF export without vendor extensions.
  - Multi-root workspace support for several projects in one window.
- **Test strategy.**
  - Edit-operation unit tests (apply and undo are inverse operations; plate membership invariants).
  - Round trip: open in VSSlicer, edit, save, then re-open with our reader.
  - Automated interoperability: re-slice every VSSlicer-saved 3MF with the pinned upstream Orca CLI release from phase 5 and check plates and objects in the output. These are upstream release binaries in CI, not cloned code.
  - A manual matrix opens saved files in the Orca and Bambu Studio GUIs, as a supplement.
  - Arrange quality metrics on fixture sets (bed utilisation, no overlaps). STEP import through `occt-import-js` loaded as a separate WASM file.
- **Dependencies.** Phase 2, phase 5 (slice the edited plate).
- **Rests on.**
  - `projects-and-fleet.md` §1, §4, §5, Implications.
  - `3mf.md` §4, Implications.
  - `3d-viewer.md` §5, §6.
  - `features-bambustudio-orcaslicer.md` §2, §3.
  - `features-prusaslicer-superslicer.md` §2, §3.
  - `feature-matrix.md` §3, §4, §9.
- **Licence posture.**
  - The plate model is reimplemented from the 3MF layout; `PartPlate` is not copied.
  - The arrange and mesh-repair algorithms need a permissive source or our own implementation. They are not researched in R1 (open question).

### Phase 7: Cameras and Bambu LAN

- **Goal.** Watch printers live and control Bambu printers over LAN.
- **Usable deliverable.**
  - `vsslicer.camera`:
    - snapshot polling and MJPEG through the daemon's loopback proxy (Klipper, OctoPrint, PrusaLink snapshots);
    - pushed JPEG frames for Bambu A1/P1 (TLS TCP 6000);
    - WebRTC for go2rtc and camera-streamer cameras;
    - optional go2rtc sidecar (MIT) for Bambu RTSPS (X1, P2S, H2 with LAN liveview on).
  - `vsslicer.bambu`:
    - mode A (Developer Mode LAN: MQTT/TLS 8883, FTPS 990, `.gcode.3mf` plus `print.project_file`, AMS mapping and sync);
    - mode F read-only status with a "enable Developer Mode" prompt based on the `fun` flag;
    - mode B hand-off to Bambu Connect on macOS and Windows;
    - a per-model and per-firmware capability table;
    - HMS health and error notifications with the status.
- **Test strategy.**
  - Camera adapters against a local MJPEG/JPEG test server and recorded streams. CSP tests.
  - Bambu tests against the ha-bambulab `mock_data` (MIT) message fixtures and a fake MQTT broker. `.gcode.3mf` layout tests from phase 2.
  - A manual hardware checklist per supported model and firmware, dated, because Bambu firmware changes LAN behaviour.
  - Latency and bandwidth benchmarks per stream type (`remote-camera.md` open questions).
- **Dependencies.** Phase 4 (registry, daemon), phase 2 and phase 5 (`.gcode.3mf`).
- **Rests on.**
  - `remote-camera.md` §1–§4, Implications.
  - `bambu-connectivity.md` §1, §3, §5, Comparison, Implications.
  - `printer-connectivity.md` §5.
  - `features-bambustudio-orcaslicer.md` §5.
  - `feature-matrix.md` §11, §12.
- **Licence posture.**
  - Our own clients. ha-bambulab and bambu-rs (MIT) are readable references. OpenBambuAPI prose (GFDL) is not copied.
  - No Bambu keys, plugin, cloud login or identity spoofing (`bambu-connectivity.md` Implications 2). No cloud features at all in R2–R4.
  - The Bambu control features are labelled "requires Developer Mode".

### Phase 8: Filament management

- **Goal.** A filament database, a spool inventory, and consumption booked from printer feedback and slicer estimates.
- **Usable deliverable.**
  - `vsslicer.filament`: a Spoolman-compatible superset model stored locally, with an append-only `ConsumptionEvent` log.
  - OFD import (cached `all.json.gz` or the SQLite file), with SpoolmanDB filling gaps.
  - Optional live sync with an existing Spoolman, and use of Moonraker's Spoolman proxy when present.
  - Per-adapter booking in this order of trust: Moonraker, then Bambu AMS `remain`/`tag_uid`, then the slicer total, then a manual scale reading.
  - OpenPrintTag reading through the printer. Link spool to material profile through `slicer_ids`.
- **Test strategy.**
  - Event-log invariants (the used weight equals the sum of events plus scale corrections; disagreements are flagged).
  - Importer tests against a pinned OFD snapshot.
  - Spoolman REST contract tests against a Spoolman instance in Docker (MIT; the Docker image was not checked in R1, unverified).
  - Reconciliation tests on recorded job ends: Moonraker `filament_used`, Bambu `used_g` and `remain`.
- **Dependencies.** Phase 4 (printer events), phase 3 (material profiles). Phase 7 for Bambu AMS data, but the extension is usable without it.
- **Rests on.**
  - `filament-management.md` §1–§5, Implications.
  - `profiles.md` §6 (material `external_ids`).
  - `feature-matrix.md` §14.
- **Licence posture.**
  - OFD, SpoolmanDB, Spoolman schema and OpenPrintTag are MIT, used with notices.
  - No RFID-Tag-Guide material and no Bambu card decryption.

### Phase 9: Fleet, queue and history

- **Goal.** Queue plates across several printers with compatibility checks, and keep a job history linked to projects.
- **Usable deliverable.**
  - `vsslicer.fleet`: a fleet-level queue whose items carry plate reference, G-code, target and requirements (nozzle, material, model), with Moonraker-style states.
  - Moonraker printers dispatch through their native job queue; other printers dispatch from the extension.
  - Send one plate to many printers.
  - History in `.vsslicer/history/YYYY-MM.jsonl` (Moonraker job object plus project, plate, printer, profile and thumbnail), with a VSSlicer job id written into the sent file's metadata.
  - Optional back-fill from Moonraker `history/list`. No Bambu cloud importer: it would need a cloud login, which phase 7 rules out (owner question 27).
- **Test strategy.**
  - Queue state-machine tests. Compatibility-check tests on fixture printers and materials.
  - Moonraker job-queue contract tests.
  - History de-duplication tests (printer plus `start_time`). Multi-window tests through the daemon.
- **Dependencies.** Phase 4, phase 5; phase 8 for material checks.
- **Rests on.**
  - `projects-and-fleet.md` §2, §3, §5, Implications.
  - `printer-connectivity.md` §6.
  - `feature-matrix.md` §15.
- **Licence posture.**
  - Our own code. Obico, OctoFarm and FDM Monster (AGPL) interoperate only and are not embedded.
  - No Bambu cloud history importer. If the owner wants one, it would use only the user's own token under our own client identity, never a spoofed Studio identity, after ToS review (`bambu-connectivity.md` §2, Implications 2).

### Phase 10: Functionality breadth

- **Goal.** Deliver the matrix's remaining P2 rows. The items below are the larger ones; smaller P2 rows (timelapse retrieval, regex substitutions, placeholder editor, mixed printers per project) ride along with the extension that owns them. Each item ships as an update to an existing extension, or as a new optional extension, with its own tests.
- **Deliverables and tests.**
  - **Calibration generators** (`vsslicer.slicer`): temperature, flow, PA, retraction, max volumetric speed, VFA, input shaping. Each is a model plus a per-layer parameter sweep, and the picked value is written into the material or printer profile. Tests: the parser detects the intended sweep per layer in the generated G-code (`features-bambustudio-orcaslicer.md` §4, Implications).
  - **Painting** (support, seam, multi-material) with a TriangleSelector-compatible model persisted in each 3MF dialect. Tests: round trip against painted fixtures (`3d-viewer.md` §6; `3mf.md` Comparison).
  - **Cut** (planar, connectors), **boolean** (manifold-3d, Apache-2.0), **measure**, **variable layer height editor**, **height-range modifiers**. Tests: mesh validity (manifoldness) and geometry fixtures (`feature-matrix.md` §3).
  - **Multi-material:** wipe/prime tower placement and display, flush-volume matrix from colours keeping the Orca placeholder names, and per-feature filament assignment (`features-bambustudio-orcaslicer.md` §5).
  - **PrusaSlicer CLI adapter**, 2.9.x first (`slicing-engine-embedding.md` §5, §6 item 3).
  - **`vsslicer.printers-serial`**: Marlin streaming with line numbers and checksums, SD over serial, and long-filename detection from `M115`. Tests: against a serial emulator, plus hardware (`printer-connectivity.md` §3, §4).
  - **`vsslicer.printers-unofficial`**: SDCP (official; it can move into `vsslicer.printers`), Repetier, then the reverse-engineered vendor adapters, opt-in. Tests: recorded fixtures (`printer-connectivity.md` §2, Implications).
  - **`vsslicer.engine-cura-wasm`** (AGPL, separate repository): a zero-install engine for machines without Orca, run in a child process. Spike: running a child process with Electron as Node from the extension host (unverified) (`slicing-engine-embedding.md` §3, §6 item 4; `licensing.md` Implications 3).
  - **`web` builds** of `vsslicer.gcode` and the viewer for vscode.dev (`vscode-platform.md` §6). No web build of any engine (see the extension table).
- **Dependencies.** Phases 1–9 as relevant per item.
- **Licence posture.**
  - Clean-room for every algorithm studied in AGPL code (calibration, flush, painting, cut).
  - AGPL only inside `vsslicer.engine-cura-wasm`, with a source offer.
  - The reverse-engineered adapters need the owner's go-ahead and a ToS review first (open questions).

### Phase 11: Distribution: VSSlicer build, own marketplace, themes

- **Goal.** A branded, printing-focused editor with its own default gallery, plus themes.
- **Usable deliverable.**
  - A VSSlicer build based on VSSlicer-patched VSCodium scripts (MIT):
    - `product.json` branding;
    - `extensionsGallery` pointing at our Open VSX, with open-vsx.org upstream;
    - `builtInExtensions` = the VSSlicer extensions;
    - unrelated UI removed where patches exist;
    - Electron switches for WebGPU and codecs if phase-1 and phase-7 spikes call for them.
  - Signed and notarised installers (Apple Developer ID, Windows certificate or SignPath OSS), and update through GitHub releases.
  - The self-hosted Open VSX deployment.
  - `vsslicer.themes`.
- **Test strategy.**
  - Reproducible-build checks.
  - Smoke tests on every target: install, open fixtures, slice with a downloaded engine.
  - Gallery tests: search, install and update from our registry, and upstream fall-through.
  - Signature-archive verification with `ovsx verify`.
  - Rebase rehearsal on the next upstream release.
- **Dependencies.** All extensions published; the owner's decisions on name, trademarks and signing budget.
- **Rests on.**
  - `vscode-platform.md` §4, §5, Decision table, Implications 6 and 7.
  - `licensing.md` §2 (d), (e), (g), §4.
- **Licence posture.**
  - The fork is MIT.
  - Third-party notices and a source offer cover every bundled copyleft component (none planned except the optional AGPL engine extension).
  - No Microsoft marks or Marketplace.

### Phase summary

| Phase | Ships | Main oracle | Depends on |
|---|---|---|---|
| 1 | `vsslicer.gcode` | klipper_estimator, slicer M73 estimates, golden files | — |
| 2 | `vsslicer.project` (viewer) | 3MF test suites, lib3mf | 1 |
| 3 | `vsslicer.profiles` | pinned vendor packs, native round trip | — |
| 4 | `vsslicer.printers`, `vsslicer-agent` | API fixtures, OctoPrint virtual printer | 1 |
| 5 | `vsslicer.slicer` (first end-to-end) | pinned Orca and CuraEngine releases | 1, 2, 3, 4 |
| 6 | `vsslicer.project` (editor) | operation invariants, Orca CLI re-slice of every saved 3MF, re-open in installed Orca and Bambu | 2, 5 |
| 7 | `vsslicer.camera`, `vsslicer.bambu` (cameras and Bambu LAN) | test streams, ha-bambulab mock data, hardware checklist | 4, 2, 5 |
| 8 | `vsslicer.filament` | Spoolman in Docker, OFD snapshot | 4, 3 (7 optional) |
| 9 | `vsslicer.fleet` | Moonraker job-queue fixtures | 4, 5 (8) |
| 10 | breadth items and optional extensions | per item | as listed |
| 11 | VSSlicer build, Open VSX, themes | smoke tests per target | all |

## Open questions for the owner

1. Ship extensions on stock VS Code first and make the VSCodium build optional and late (recommended), or build the fork from day one?
2. Is a self-hosted marketplace wanted before the fork, given that open-vsx.org covers VSCodium users (`vscode-platform.md` Implications 7)?
3. Also publish to the Microsoft VS Marketplace to reach stock VS Code users?
4. What are the product name and icons for the custom build, and who runs the trademark check (`licensing.md` open question 10)?
5. Is a background `vsslicer-agent` daemon that outlives editor windows acceptable to users?
6. Accept that slicing requires an installed Orca, or one we download from upstream, rather than a bundled engine?
7. Should the unified schema keep its own descriptive keys, or adopt Orca's key names as canonical (`profiles.md` open questions)?
8. Is FDM only acceptable until phase 10, with SLA deferred indefinitely?
9. Is PrusaSlicer 2.9.x the reference for the Prusa adapter and imports until 3.0 is final (`slicer-landscape.md` open questions)?
10. Bambu: is control only through Developer Mode acceptable, with the user-facing caveat about losing Bambu Cloud and Handy (`bambu-connectivity.md` Implications 6)?
11. Ship reverse-engineered vendor adapters at all (Creality, Anycubic, Elegoo CC2, AnkerMake), even opt-in and labelled?
12. Which jurisdiction governs our reading of reverse-engineering clauses (EU art. 6 versus US DMCA s1201; `licensing.md` open question 8)?
13. Budget a lawyer for the contested AGPL points: downloading an engine for the user, a WASM worker, in-process coupling, profile data, and whether Apache-2.0 code may speak CuraEngine's Arcus protocol (`licensing.md` open questions 1, 2, 3, 13)?
14. Should we ask Prusa for written permission to redistribute `PrusaSlicer-settings-*-fff`, or always download from upstream (`licensing.md` open question 4)?
15. Should we ask Prusa which licence governs Prusa-Link-Web `openapi.yaml`, GPL-3.0 or AGPL (`licensing.md` open question 6)?
16. Should we contact Stewart Allen to confirm Kiri:Moto is MIT, or drop it (`licensing.md` open question 5)?
17. Is klipper_estimator acceptable only as a CI oracle, never shipped (`licensing.md` open question 12)?
18. Contributor policy: CLA or DCO, and who holds copyright (`licensing.md` open question 11)?
19. Is it acceptable that Apache-2.0 lets third parties build proprietary products on our code?
20. Self-hosted registry policy: accept third-party extensions, and who handles takedowns (`licensing.md` open question 9)?
21. Is there a budget for an Apple Developer ID, a Windows signing certificate and CI minutes for the fork (`vscode-platform.md` §4)?
22. Which printers (model and firmware) can the project test on: Bambu, Prusa MK4/Core One, a Klipper machine, Duet?
23. Is the time-estimate accuracy target "under 1 minute over 12 hours" right for "precise toolhead simulation" (`gcode-viewer-simulation.md` §7)?
24. Is WebGL2-only rendering acceptable until a WebGPU probe passes in webviews (`3d-viewer.md` §6)?
25. Is an optional go2rtc sidecar download acceptable for Bambu RTSPS cameras (`remote-camera.md` Implications 4)?
26. Filament: local inventory by default with optional Spoolman sync, or Spoolman as the store when one is present (`filament-management.md` §5)?
27. Want a Bambu cloud history importer (user's own token, our own client identity), given ToS risk? It is dropped from the plan unless you say yes (`projects-and-fleet.md` §5; `bambu-connectivity.md` §2).
28. Should plates also be written as text sidecars next to the 3MF for git diffs (`projects-and-fleet.md` open questions)?
29. Are remote setups (Remote-SSH, code-server on a print-farm Pi) a target, given that hardware extensions run on the UI side (`vscode-platform.md` §6)?
30. Is a `web` (vscode.dev) build of the viewer and preview worth maintaining (`vscode-platform.md` §6)?
31. Is Eclipse Theia a later white-label target (`vscode-platform.md` Implications 8)?
32. Should we contribute upstream, for example a cross-platform `--pipe` progress PR to Orca (`slicing-engine-embedding.md` §6)?
33. Monorepo for the Apache-2.0 extensions and libraries, with the AGPL engine extension in its own repository?
34. Telemetry: none at all, or opt-in crash reports only?
35. Arrange and mesh repair: may we depend on permissive libraries to be chosen in a spike, or must we write our own? R1 did not research either.
36. Is a clean-room planner written from Klipper's `Kinematics.md` and published formulas clean enough for an Apache-2.0 VSSlicer (`gcode-viewer-simulation.md` open questions)?
