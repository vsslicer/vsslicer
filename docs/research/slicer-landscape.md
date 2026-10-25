# Slicer landscape

Researched 2026-10-25. Code claims are `repo@<short-commit>:path:line` against shallow clones in `.reference/repos/`. GitHub metadata (releases, creation dates, commit counts) comes from `api.github.com` on 2026-10-25; "commits in 12 months" means commits since 2025-10-25 on the default branch (page count with `per_page=1`).

Commits analysed: PrusaSlicer 30ef591, OrcaSlicer 09aa0114, BambuStudio 79df7ae, Cura 5bea2f8, CuraEngine 47b0388, SuperSlicer 1f3d287, Slic3r 026c138, CrealityPrint 59ae8cb, ElegooSlicer 2d507e39, AnycubicSlicerNext 6103ed8, Snapmaker_Orca 746dd8e, grid-apps d138275. All twelve clones exist and all URLs given on the card worked.

## Findings

### 1. Clones
Done; hashes above. Note PrusaSlicer `master` is no longer the 2.9 line: `version.inc` says `3.0.0-alpha12` and the tree is split into `src/slic3r-*` modules (PrusaSlicer@30ef591:version.inc:6). Another worker holds a separate `PrusaSlicer-2.9` clone for the stable architecture.

### 2. Lineage

```
Slic3r (2011, Perl+C++)
 |-- PrusaSlicer (2016, Slic3r-PE) -- Bambu Studio (2022-07) -- OrcaSlicer (2022-07, "BambuStudio-SoftFever")
 |     |                                                          |-- Creality Print 6/7 (2023-08 repo)
 |     |-- SuperSlicer (2018, Slic3r++ then rebased on PrusaSlicer) |-- ElegooSlicer (2024-12)
 |                                                                |-- Snapmaker Orca (2024-07)
 |                                                                |-- Anycubic Slicer Next (2026-01)
CuraEngine (2013) + Cura (2014): separate lineage (Ultimaker)
Kiri:Moto / grid-apps (2017 repo, ~2013 work): independent, JavaScript
```

- **Slic3r.** Started 2011 by Alessandro Ranellucci in the RepRap community; original is Perl with a C++ core (`xs/`) and a wxPerl GUI (Slic3r@026c138:Build.PL:43, slic3r.pl, xs/, lib/Slic3r). Repo created 2011-09-01, last push 2024-06-18, last release 1.3.0 (2018-05-10), no commits in the last 12 months: effectively dormant. Its value is historical; every other FFF slicer here descends from it except Cura and Kiri.
- **PrusaSlicer.** Prusa Research fork of Slic3r, repo created 2016-03-01 ("originally based on Slic3r", PrusaSlicer@30ef591:README.md). Added the C++ rewrite of the engine and GUI, SLA support, Arachne wall generation (ported from CuraEngine), organic supports, multi-material improvements, a binary G-code format (libbgcode) and, in 3.0 alpha, a modular re-architecture with Lua scripting (`src/slic3r-biz-lua`). Stable is 2.9.6 (2026-06-25); 3.0.0-alpha12 is a prerelease (2026-09-21).
- **SuperSlicer.** supermerill's fork (created 2018-01-08, formerly Slic3r++, now declared a PrusaSlicer fork: "A PrusaSlicer fork (which is a slic3r fork)", SuperSlicer@1f3d287:README.md). Adds extra calibration tools, more tuneable settings, other seam/infill options. Slow: 9 commits in 12 months, last stable 2.5.59.13 (2024-07-01), prerelease 2.7.62.0-beta2 (2025-11-19).
- **Bambu Studio.** Bambu Lab fork of PrusaSlicer, repo created 2022-07-08 ("based on PrusaSlicer", BambuStudio@79df7ae:README.md). Adds the Bambu printer/AMS model, cloud and LAN connectivity through a closed network plugin, plate-based multi-plate projects, tree supports, and the Bambu-flavoured 3MF project format. Release v02.08.02.61 (2026-08-21).
- **OrcaSlicer.** SoftFever's fork of Bambu Studio, repo created 2022-07-16 (OrcaSlicer@09aa0114:README.md; version.inc `SoftFever_VERSION 2.5.0-dev`). Adds multi-vendor printer support (146 vendor profile entries under `resources/profiles`), calibration tools, Klipper/Moonraker/other host connectors, many extra slicing options. The Bambu networking plugin stays optional and non-free (README). v2.4.2 (2026-07-07). It has also gained a plugin hook seam (`SlicingPipelineStepPlugin`, OrcaSlicer@09aa0114:src/libslic3r/Print.hpp:132).
- **Creality Print.** Creality's official slicer; README states "originally forked from Orca Slicer" (CrealityPrint@59ae8cb:README.md). Repo created 2023-08-03, v7.3.0 on 2026-09-24. Adds Creality device integration, video, profile validation. Only 8 public commits in 12 months, which suggests periodic code drops, not an open workflow (inference).
- **ElegooSlicer.** Elegoo's Orca derivative, repo created 2024-12-02 (ElegooSlicer@2d507e39:README.md "based on Orca Slicer"). Adds Elegoo printer agents (`src/slic3r/Utils/Elegoo`, Moonraker agent). v1.5.3.5 (2026-09-03). The 2222-commit count in 12 months likely includes merged upstream history (inference).
- **Snapmaker Orca.** Snapmaker's fork of OrcaSlicer (GitHub `fork: true`), created 2024-07-10 (Snapmaker_Orca@746dd8e:README.md). Adds Snapmaker printers, MQTT device link (`src/mqtt`), Sentry telemetry wrapper. Release v2.4.0 (2026-09-21), prerelease v2.4.1-beta (2026-10-23).
- **Anycubic Slicer Next.** Anycubic's Orca derivative, repo created 2026-01-30, last push 2026-02-03 (AnycubicSlicerNext@6103ed8:README.md "based on OrcaSlicer"). No GitHub releases. Small and young; 9 commits in 12 months.
- **CuraEngine / Cura.** Ultimaker lineage, separate from Slic3r. CuraEngine (C++, created 2013-03-04) is the slicing backend; Cura (Python/Qt, created 2014-06-16) is the GUI. Arachne variable-width walls originate here. Cura 5.13.0 (2026-05-28). CuraEngine's GitHub "latest release" is a stale 2.7.0 (2017) because engine versions ship through Cura/Conan.
- **Kiri:Moto (grid-apps).** Stewart Allen / GridSpace; browser-based multi-mode slicer (FDM, CAM, laser, SLA, wire-EDM, water jet) in JavaScript, repo created 2017-04-18, "13 years in development" (grid-apps@d138275:readme.md). Runs in a browser, as an Electron app and via CLI. Release 4.7.3 (2026-08-16).

### 3. Per-project facts

| Project | Licence (file) | Last release (GitHub) | Commits, 12 mo | Language | GUI toolkit | Build | Platforms (README) |
|---|---|---|---|---|---|---|---|
| Slic3r | AGPL-3.0 (`LICENSE`) | 1.3.0, 2018-05-10 | 0 | Perl + C++ | wxPerl (`Build.PL:43` requires `Wx`) | Perl `Build.PL` + C++ | Windows, macOS (README:4); Linux from source |
| PrusaSlicer | AGPL-3.0 (`LICENSE`) | 2.9.6, 2026-06-25 (3.0.0-alpha12 pre, 2026-09-21) | 1451 | C++20 | wxWidgets + custom OpenGL/ImGui-ish layer (README) | CMake, `deps/` superbuild | Win, macOS, Linux |
| SuperSlicer | AGPL-3.0 (`LICENSE`) | 2.5.59.13, 2024-07-01 (pre 2.7.62.0-beta2, 2025-11-19) | 9 | C++ | wxWidgets | CMake | Win, macOS, Linux/AppImage |
| Bambu Studio | AGPL-3.0 (`LICENSE`) | v02.08.02.61, 2026-08-21 | 3025 | C++ | wxWidgets + ImGui | CMake | Win, macOS, Linux |
| OrcaSlicer | AGPL-3.0 (`LICENSE.txt`) | v2.4.2, 2026-07-07 | 4978 | C++ | wxWidgets + ImGui, glfw (`CMakeLists.txt:916`, `find_package(glfw3)`) | CMake, `deps/` superbuild | Win, macOS, Linux |
| Creality Print | AGPL-3.0 (`LICENSE.txt`) | v7.3.0, 2026-09-24 | 8 | C++ | wxWidgets (`CMakeLists.txt:104,112`) | CMake | Win, macOS, Linux |
| ElegooSlicer | AGPL-3.0 (`LICENSE.txt`) | v1.5.3.5, 2026-09-03 | 2222 (see above) | C++ | wxWidgets (`CMakeLists.txt:153,165`) | CMake | Win, macOS (README) |
| Anycubic Slicer Next | AGPL-3.0 (`LICENSE.txt`) | none on GitHub | 9 | C++ | wxWidgets (Orca base) | CMake | Win, macOS, Linux |
| Snapmaker Orca | AGPL-3.0 (`LICENSE.txt`) | v2.4.0, 2026-09-21 (pre v2.4.1-beta, 2026-10-23) | 669 | C++ | wxWidgets (Orca base) | CMake | Win, macOS, Linux |
| Cura | LGPL-3.0 (`LICENSE`) | 5.13.0, 2026-05-28 | 1116 | Python 3 (+QML) | PyQt6/QML on Uranium (`conanfile.py:31,32`) | Conan + CMake | Win, macOS, Linux |
| CuraEngine | AGPL-3.0 (`LICENSE`) | no independent release (2.7.0 stale) | 899 | C++ | none (CLI/service) | Conan + CMake | via Cura |
| Kiri:Moto | MIT (`license.md`, `package.json`) | 4.7.3, 2026-08-16 | 592 | JavaScript (ESM, WASM) | HTML/DOM + three.js (`package.json:67`), Electron (`:81`) | npm, esbuild/webpack | Browser, Electron (Win/macOS/Linux) |

Activity read: Orca, Bambu, Prusa, Cura and CuraEngine are very active; Snapmaker and Kiri moderately; Slic3r is dead; SuperSlicer is nearly so; Creality and Anycubic publish rarely.

### 4. Architecture per family

**Slic3r family (Prusa, Bambu, Orca and the Orca derivatives, SuperSlicer).**
- Split: `libslic3r` (engine, no GUI) vs `slic3r` / `libslic3r_gui` (GUI, wxWidgets, OpenGL, ImGui) plus a thin CLI entry point (`OrcaSlicer.cpp`). Orca/Bambu/Creality/Elegoo/Anycubic/Snapmaker keep `src/libslic3r` and `src/slic3r` side by side (OrcaSlicer@09aa0114:src/). PrusaSlicer 3.0 splits further into `slic3r-domain`, `slic3r-shared`, `slic3r-biz-*`, `slic3r-app-{cli,desktop}`, `slic3r-platform-wx` (PrusaSlicer@30ef591:src/).
- Settings definitions: C++ tables in `PrintConfigDef::init_fff_params()` (OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:1317; BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:1225; CrealityPrint@59ae8cb:src/libslic3r/PrintConfig.cpp:1145). PrusaSlicer 3.0 moves them to `ConfigDefsFDM.cpp` (PrusaSlicer@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDefsFDM.cpp:66), keeping the legacy table at `slic3r-shared/.../Legacy/PrintConfig.cpp:537`. Profiles are data files: Prusa INI bundles under `resources/presets/prusa-research-fff`, Orca/Bambu/Creality JSON per vendor under `resources/profiles`.
- Slice job: `Print::process()` (OrcaSlicer@09aa0114:src/libslic3r/Print.cpp:3260; PrusaSlicer@30ef591:src/libslic3r/src/libslic3r/Print.cpp:1332) drives per-object steps `posSlice, posPerimeters, posPrepareInfill, posInfill, posIroning, posSupportMaterial, ...` then print steps `psWipeTower, psSkirtBrim, psGCodeExport` (Print.hpp:108-130). Flow: mesh -> `PrintObject::slice()` (layer polygons; PrusaSlicer PrintObjectSlice.cpp:534) -> `make_perimeters()` (PrintObject.cpp:203 in Prusa, :520 in Orca) -> `prepare_infill()`/`infill()` -> `generate_support_material()` -> skirt/brim, wipe tower, tool ordering -> `GCode::do_export()` (OrcaSlicer GCode.cpp:2822; BambuStudio GCode.cpp:1814; Prusa `GCodeGenerator::do_export` GCode.cpp:688), followed by a G-code processor pass for time/preview data. Orca adds a plugin dispatch seam on these steps (Print.hpp:132, :1061).

**Cura family.**
- Split by process and language: Cura is a Python/PyQt6/QML application on the Uranium framework; CuraEngine is a separate C++ process. Cura talks to it over libArcus + protobuf (`plugins/CuraEngineBackend`, Cura@5bea2f8:plugins/CuraEngineBackend/CuraEngineBackend.py:35; `CuraEngine/Cura.proto`). CuraEngine also has `CommandLine` and `Emscripten` communication back ends (CuraEngine@47b0388:src/communication/).
- Settings: JSON definitions in `resources/definitions` (`fdmprinter.def.json`, 10173 lines, ~700 printer files) with inheritance, plus `quality/`, `variants/`, `intent/`, `extruders/` (Cura@5bea2f8:resources/). Setting evaluation is Python (formulas in the definitions), so the engine receives resolved values.
- Slice job: `StartSliceJob` (`StartSliceJob.py:49`, global settings at `:497`) serialises scene + settings to protobuf -> `Slice::compute()` (CuraEngine@47b0388:src/Slice.cpp:22) loops mesh groups -> `scene.processMeshGroup` -> `FffPolygonGenerator::generateAreas` (`FffPolygonGenerator.cpp:63`) -> `FffGcodeWriter::writeGCode` (`FffGcodeWriter.cpp:65`) -> G-code and layer data streamed back to Cura for preview. Functionality (3MF reader/writer, SimulationView, network printing, PostProcessing) is plugins under `plugins/`.

**Kiri:Moto.**
- Single JS code base split by directories: `src/kiri/{app,core,mode,run}`, shared geometry `src/geo`, mesh/GPU helpers, WASM. Slicing mode code lives in `src/kiri/mode/fdm/work/{slice,prepare,fill,post,export}.js` and runs in web workers (`src/kiri/run/{engine,worker,minion}.js`). `engine.slice()` posts settings to the worker client (grid-apps@d138275:src/kiri/run/engine.js:179-186).
- Settings are JS objects exported/imported as JSON (`engine.js:56`), not a declarative definition tree. Flow: widget (mesh) -> `slice` (geo/slicer.js, layer outlines) -> `prepare` (toolpaths) -> `export` (G-code), all in-browser or CLI (`run/cli.js`).

### 5. Closed slicers (documentation only, 2026-10-25)
- **Simplify3D.** Commercial, Windows/macOS/Linux. v5.0 announced 2022-12-14 with a new slicing engine ("up to 3x faster than v4"), automatic mesh repair, per-feature "targeted customisation" (hole tolerance, small-perimeter speed), searchable and comparable settings, adaptive layer height, automated seam hiding, dynamic infill density, 3D infill patterns, one-click support add/remove, live CAD-file tracking, network printer monitoring (https://www.simplify3d.com/simplify3d-releases-version-5-0-with-breakthrough-performance-automation-and-intelligence/). 5.1 added ironing smoothing and anti-scarring plus Apple Silicon. Its signature concept is multiple "processes" per print with per-process extruder assignment for support/infill/raft/perimeters (https://simplify3d.com/support/articles/printing-with-multiple-extruders). Price reported as $199 per user per year by a secondary source (https://www.3dnatives.com/en/wp-json/wp/v2/posts/22195); licence model `(unverified)`.
- **ideaMaker (Raise3D).** Free for use with Raise3D and other printers; FFF and DLP. 5.3.2 (2025-11-27) adds bridge detection over sparse infill, inner brims in single-shell mode and new Raise3D templates (https://raise3d.com/news/ideamaker-5-3-2-release-notes/). 5.0.5 added one-click print (auto support, orientation, arrange), per-feature pressure advance came in 5.3.0 beta (https://www.raise3d.com/?p=71771, https://www.raise3d.com/?p=50780). Licence and price not stated on those pages; "free" is `(unverified)`.
- **KISSlicer.** Free/Pro/Premium tiers; Pro $42 (multi-extruder, per-part extruder assignment), Premium $82 (coloured meshes, textures, curved surfaces) per the vendor purchase page as quoted by search (https://www.kisslicer.com/download-or-buy-v2305.html, https://www.3dnatives.com/en/all-you-need-to-know-about-kisslicer-020720255/). Pricing may be dated.
- **Lychee Slicer (resin, plus FDM).** Free Lite, Plus EUR 9.99/month (advanced supports, support painting, hollowing), Library EUR 19.99/month (1500+ presupported models) (https://lychee.co/pricing-and-subscription).
- **Chitubox (resin).** Free plus Pro subscription; Pro priced $16/month or $169/year in a March 2024 review, stale (https://all3dp.com/2/chitubox-vs-lychee-slicer/).
- Not found: FlashPrint documentation via search; not covered.

## Comparison

| Aspect | Slic3r family (Orca et al.) | Cura + CuraEngine | Kiri:Moto |
|---|---|---|---|
| Engine/GUI coupling | Same process, C++ library linked into GUI | Separate engine process over protobuf | Web workers in same app |
| Settings source of truth | C++ config tables + JSON/INI profiles | JSON definitions with formula inheritance | JS objects/JSON |
| Extensibility | Hardly any (Prusa 3.0 Lua; Orca plugin seam new) | Python plugin system, marketplace | JS modules |
| Reusable headless slicing | CLI binary exists (`OrcaSlicer.cpp`) | CuraEngine CLI + Arcus | CLI (`run/cli.js`), browser |
| Licence | AGPL-3.0 | LGPL (GUI) / AGPL (engine) | MIT |
| Code reuse into a VS Code extension | Hard (C++/wx, AGPL) | Engine as external process feasible | Directly usable in Node/browser |

## Implications for VSSlicer

- **Reference for later cards: OrcaSlicer (primary), Bambu Studio and PrusaSlicer (secondary), Cura/CuraEngine (profile and plugin model), Kiri:Moto (web/JS architecture).** Why: Orca has the broadest printer coverage (146 vendor entries), the most active development (4978 commits in 12 months), the superset of Bambu/Prusa features, and it is the base of four vendor slicers (Creality, Elegoo, Anycubic, Snapmaker), so studying it covers five projects at once. Bambu Studio is needed only for the Bambu-specific 3MF project format and connectivity. PrusaSlicer is the source of truth for original features and for 3.0's modular design and Lua scripting, which is the closest existing idea to VS Code-style extensibility. Cura/CuraEngine is the only proven "engine as separate process with a stable wire protocol" design and the only plugin marketplace among them. Kiri:Moto shows what a JS slicer in a webview looks like and is the only MIT reference.
- **Do not duplicate vendor forks** in analysis: Creality, Elegoo, Anycubic and Snapmaker are Orca plus printer profiles and connectors; examine them only for printer protocols and profile data.
- **Likely architecture direction (to confirm in later cards):** drive an existing engine as an external process (Orca CLI or CuraEngine) behind a VSSlicer-owned job and settings schema, rather than reimplementing slicing or embedding C++/wx GUI code. Reimplementing the viewer, project management and printer connectivity in TypeScript is where VSSlicer adds value.
- **Skip:** Slic3r (dormant), SuperSlicer (near-dormant), closed slicers except as feature benchmarks (Simplify3D multi-process model, per-feature settings, ideaMaker one-click print).

## Licence notes

- All FFF slicers here except Cura and Kiri are AGPL-3.0 (files cited in the table). Copying or linking their code makes the combined work AGPL-3.0 and imposes network-use source disclosure; invoking an unmodified binary as a separate process is a different question that needs legal review `(unverified)`.
- Cura is LGPL-3.0, but CuraEngine, which does the slicing, is AGPL-3.0.
- Kiri:Moto is MIT (`license.md`, copyright Stewart Allen), the only permissive option; its dependencies were not audited.
- Orca's Bambu networking plugin is proprietary and optional (OrcaSlicer@09aa0114:README.md). Profile data (vendor JSON/INI) ships inside the AGPL repos; its separate redistribution terms were not checked `(unverified)`.
- Closed slicers: no code studied; do not copy their settings text or UI.

## Open questions

- Is PrusaSlicer 3.0 (Lua scripting, modular libs) stable enough to be the long-term reference, or should 2.9 remain the reference until release? Its architecture changed completely in `master`.
- ElegooSlicer's 2222 commits in 12 months vs 8 for Creality: confirm whether these counts reflect real development or merged upstream history.
- Simplify3D current version, licence model, and ideaMaker licence terms were not found on primary pages.
- Whether AGPL covers running Orca/CuraEngine as an unmodified subprocess from an extension (needs legal advice).
