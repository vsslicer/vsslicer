# Feature inventory: PrusaSlicer and SuperSlicer

Card VSS-2. Researched 2026-10-25.

Sources:

- PrusaSlicer, https://github.com/prusa3d/PrusaSlicer, commit `30ef591` (30ef59195e0f), committed 2026-09-21,
  `version.inc` = **3.0.0-alpha12**. AGPL-3.0.
- SuperSlicer, https://github.com/supermerill/SuperSlicer, commit `1f3d287` (1f3d287e9be4), branch `master_27`,
  tag `2.7.62.0-beta2`, committed 2025-11-18. AGPL-3.0. Based on PrusaSlicer 2.7 (version 2.7.62).
- PrusaSlicer release notes 2.3.0 to 2.9.1 on GitHub, the Prusa macro documentation
  (https://help.prusa3d.com/article/macros_1775) and the SuperSlicer README.
- Raw dump of every setting, the key-set diff and the working log:
  `.reference/notes/VSS-2-features-prusaslicer-superslicer.md`.

Citations below use `P@30ef591:<path>:<line>` for PrusaSlicer and `S@1f3d287:<path>:<line>` for SuperSlicer.

**The PrusaSlicer layout this card expected is gone at this commit.** PrusaSlicer 3.0 was restructured into about
25 modules. `src/libslic3r/PrintConfig.cpp` and `src/slic3r/GUI/Tab.cpp` no longer exist. Settings are now defined in
`P@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDefsFDM.cpp`, `ConfigDefsSLA.cpp` and `ConfigCommon.cpp`. Each
definition carries its own GUI grouping: `location`, `category`, `option_group`, `order` and `gui_type`. The category
and group enums are in `P@30ef591:src/slic3r-domain/include/Slic3r/Domain/ConfigDef.hpp:126-370`, and their display
titles in `P@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDef.cpp:10,96`. The 2.x `PrintConfig.cpp` survives as
`P@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp` and is used to load old configs. Most
gizmos moved to `P@30ef591:src/slic3r-shared/src/Slic3r/App/Plater/*Gizmo.cpp`, and presets are now YAML
(`P@30ef591:specs/presets/preset-schema.json`).

**Built tree versus leftover code (PrusaSlicer 3.0).** Not everything in the 3.0 checkout is compiled. `src/slic3r/` has
no `CMakeLists.txt`, and `P@30ef591:src/CMakeLists.txt:12-48` does not include it. Its files (`src/slic3r/GUI/Gizmos/*`,
`GUI/Jobs/SeqArrangeJob.cpp`, `EditGCodeDialog.cpp`, `FirmwareDialog.cpp`, `ConfigWizard.cpp`, ...) are 2.9-era leftovers.
`libseqarrange` is commented out (`src/CMakeLists.txt:23`), and so is `ArrangeHelper.cpp`
(`src/libslic3r/CMakeLists.txt:84-85`). Unless a PrusaSlicer claim below says "legacy" or "not built", it rests on a file
listed in the CMake source lists of `slic3r-domain`, `libslic3r`, `slic3r-shared`, `slic3r-biz-*`, `libvgcode` or
`libpgcode`. Those lists were checked for the cited files. The legacy 2.x `PrintConfig.cpp` is built
(`src/slic3r-shared/CMakeLists.txt:1077-1078`) but used only to load old configs.

SuperSlicer keeps the 2.x layout. Settings are in `S@1f3d287:src/libslic3r/PrintConfig.cpp`. The GUI pages are data
files, `S@1f3d287:resources/ui_layout/default/*.ui`, with `page:`/`group:`/`line:`/`setting:` lines that
`src/slic3r/GUI/Tab.cpp` reads. SuperSlicer documents the format in `S@1f3d287:resources/ui_layout/Readme.md`.

## Findings

### 1. Settings: categories, settings, types, meanings, GUI grouping, SuperSlicer additions

Method: a script parsed every `def = (this->|defs.)add(_nullable)?("key", type)` call in the four definition files.
It skipped commented-out code and expanded the generated key families:

- SLA `prefix + "support_*"`: default plus `branching`.
- `machine_max_{feedrate,acceleration,jerk}_` + x/y/z/e.
- `filament_<opt>` and `material_ow_<opt>` override loops.

GUI grouping comes from `category`/`option_group` in PrusaSlicer 3.0 and from the `.ui` files in SuperSlicer. As a
self-check, the number of parsed definitions was compared with the raw `add(` line count. Every unparsed line sits in
a `/* */` or `//` block. One example is `compatible_printers`, commented out with a TODO at
`P@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDefsFDM.cpp:589`.

| Set | Definitions | Keys after expansion |
|---|---|---|
| PrusaSlicer 3.0 domain (FDM + SLA + common) | 445 | 471 |
| PrusaSlicer 2.x legacy `PrintConfig.cpp` (in 3.0 tree) | 587 | 637 |
| SuperSlicer `PrintConfig.cpp` | 831 | 893 |
| SuperSlicer-only (not in either Prusa set) | - | 356 |
| Prusa keys absent from SuperSlicer | - | 112 (mostly 2.8-3.0 features: scarf seams, interlocking, dynamic overhang speeds, stamping, SLA tilt profiles, junction deviation, pressure advance) |
| Prusa 2.x keys not yet in the 3.0 domain | 153 defs | 178 (print host, CLI, statistics/placeholder-only options, compatibility keys) |

The 3.0 GUI category tree has the following categories. Each holds titled option groups, listed in the appendix.

- Print: Layers & surfaces, Walls & perimeters, Infill, Bed adhesion, Supports, Speed, Motion dynamics,
  Extrusion & retraction, Multi-material, Precision slicing, Custom G-code, Pad, Hollowing, Output options, Notes.
- Filament: Material & temperatures, Extrusion calibration, Cooling, Multi-material, Overrides, Custom G-code,
  Material printing profile (SLA), Notes, Dependencies.
- Printer: General, Bed, Custom G-code, Machine limits, Multiple extruders, Single-extruder MM setup, Notes.
- Object (extruders) and Volume (wipe options).

Source: `P@30ef591:src/slic3r-domain/include/Slic3r/Domain/ConfigDef.hpp:126-178`.

3.0 adds a fourth preset kind, **Tool**, for multi-tool machines, next to Print, Filament and Printer. It also adds an
`overrides_in` list per setting that says which other places may override it (Tool, Object, Volume). For example,
`fill_density` is stored in Print and may be overridden in Tool, Object and Volume
(`P@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDefsFDM.cpp:1571-1574`). This replaces 2.x's hard-coded
per-object option lists.

SuperSlicer's pages follow its `.ui` files:

- `print.ui`: Perimeters & Shell, Slicing, Infill, Skirt & Brim, Support material, Speed, Width & Flow,
  Multiple extruders, Output options, Notes, Dependencies, Support & Other.
- `filament.ui`, `filament_override.ui`, `printer_fff.ui`, `extruder.ui`, `milling.ui`.
- SLA: `sla_print.ui`, `sla_material.ui`, `material_override.ui`, `printer_sla.ui`.
- "Frequent settings" sidebar: `freq_fff.ui`, `freq_sla.ui`.

Some sidebar entries are `s_*` virtual settings backed by AngelScript (`S@1f3d287:resources/ui_layout/default/print.as`,
engine at `S@1f3d287:src/slic3r/GUI/ScriptExecutor.cpp:19-21`). SuperSlicer also tags each definition with its own
origin flag, `def->mode = ... | comPrusa` or `| comSuSi` (e.g. `S@1f3d287:src/libslic3r/PrintConfig.cpp:7735`). The
[SS] marks in this report come from the key diff, not from those flags.

The complete tables are in **Appendix A** (PrusaSlicer 3.0 by category and option group, plus 2.x keys not yet
ported) and **Appendix B** (SuperSlicer by `.ui` page and group, with every SuperSlicer-only key in its own row marked
[SS]). Main SuperSlicer-only families, all with rows in Appendix B:

- Per-feature fan speeds: `perimeter_fan_speed`, `infill_fan_speed`, `gap_fill_fan_speed`, `fan_speedup_time` and
  related.
- Per-feature pressure advance in the filament: `filament_*_pa`.
- Overhang handling: `overhangs_*`.
- Gap fill: `gap_fill_*`.
- Holes: `hole_size_compensation`, `hole_to_polyhole*`.
- Infill: dense infill `infill_dense*`, and `infill_connection_*`.
- Brim: `brim_ears*`, `brim_inside_holes`, `brim_per_object`.
- First-layer size compensation: `first_layer_size_compensation*`.
- G-code output: `gcode_precision_*`, `gcode_min_resolution`, `max_gcode_per_second`.
- Custom G-code hooks: `feature_gcode`, `object_gcode`, `between_objects_gcode_before_move`.
- User variables: `print_/filament_/printer_custom_variables`.
- Sequential printing: `complete_objects_sort`, `parallel_objects_step`.
- Milling (CNC): `milling_*`.
- Other: skinnydip (`filament_*skinnydip*`), `thin_perimeters*`, `perimeter_loop*`, `curve_smoothing_*`.

### 2. Model-preparation tools

| Tool | PrusaSlicer 3.0 (30ef591) | SuperSlicer (1f3d287) |
|---|---|---|
| Move / Rotate / Scale / Place on face | `src/slic3r-shared/src/Slic3r/App/Plater/{TranslationGizmo,RotationGizmo,ScaleGizmo,PlaceOnFaceGizmo}.cpp`; list `.../ToolGizmosUiInfo.cpp:17-29` | `src/slic3r/GUI/Gizmos/GLGizmosManager.cpp:106-109` |
| Cut (plane, connectors plug/dowel/snap, cut to parts, flip plane) | `.../Plater/CutGizmo.cpp`, `CutDialog.cpp`; `ToolGizmosUiInfo.cpp:79` | `GLGizmoCut.cpp`; connector types `src/libslic3r/Model.hpp:243-257`; registered `GLGizmosManager.cpp:110` |
| Boolean / CSG | Negative volumes subtracted from and parts united into one mesh by "Merge" (`src/slic3r-shared/src/Slic3r/App/MenuBuilder.cpp:260`), via `merge_object_volumes` on CGAL (`src/slic3r-biz-cgal-algorithms/include/Slic3r/Biz/CGAL/Algorithms/MergeObjectVolumes.hpp`). Negative volumes are otherwise applied at slice time. No interactive boolean gizmo. | CGAL/libigl `src/libslic3r/MeshBoolean.cpp`; CSG tree `src/libslic3r/CSGMesh/` (used by SLA and Plater.cpp:7595); "Merge objects to one single object" `src/slic3r/GUI/GUI_Factories.cpp:1182`. No boolean gizmo. |
| Mesh repair, Windows | "Fix by Windows repair algorithm" (`MenuBuilder.cpp:194`), WinRT job `src/slic3r-shared/src/Slic3r/Biz/Scene/MeshRepairJob.cpp:127-139` (Windows 10+). This is the former "Fix by Netfabb" (https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.4.0-alpha1) | `src/slic3r/Utils/FixModelByWin10.cpp:215,331`; menu `GUI_Factories.cpp:994`; also offered after cut (`GLGizmoCut.cpp:3330`) |
| Mesh repair, built-in | admesh repairs on load (`bundled_deps/admesh`, used by e.g. `src/libslic3r/src/libslic3r/BuildVolume.hpp:4`) | admesh, same origin |
| Simplify (quadric edge collapse) | `.../Plater/SimplifyGizmo.cpp` | `GLGizmoSimplify.cpp`, `GLGizmosManager.cpp:119` |
| Paint-on supports | `.../Plater/PaintOnSupportsGizmo.cpp` | `GLGizmoFdmSupports.cpp` |
| Paint-on seams | `.../Plater/PaintOnSeamsGizmo.cpp` | `GLGizmoSeam.cpp`, plus seam attractor/enforcer volumes (`src/libslic3r/Model.hpp:338-341`, `GUI_Factories.cpp:188-191`) [SS] |
| Paint-on fuzzy skin | `.../Plater/PaintOnFuzzySkinGizmo.cpp`; `fuzzy_skin_segmentation_by_painting` (`src/libslic3r/src/libslic3r/MultiMaterialSegmentation.hpp:48`) | absent (fuzzy skin is global or per object only: `fuzzy_skin` at `PrintConfig.cpp:3126`) |
| Multi-material painting | `.../Plater/MultiMaterialPaintingGizmo.cpp`; tools BRUSH, BUCKET_FILL, SMART_FILL, HEIGHT_RANGE, COLOR_REPLACE (`include/Slic3r/App/Plater/PaintOnGizmoBase.hpp:39-46`) | `GLGizmoMmuSegmentation.cpp`; `src/libslic3r/MultiMaterialSegmentation.hpp:28` |
| Modifier meshes (part, negative, modifier, support blocker/enforcer) | `ModelVolumeType` (`src/slic3r-domain/include/Slic3r/Domain/ModelVolume.hpp:42`); menu `MenuBuilder.cpp:246-256` | `src/libslic3r/Model.hpp:331-344`, plus **brim patch / brim negative** and **seam** volumes [SS]; menu `GUI_Factories.cpp:183-193,683-794` |
| Height-range modifiers (layer ranges) | `.../Plater/HeightRangeGizmo.cpp`, `HeightRangeDialog.cpp` | "Height range Modifier" `GUI_Factories.cpp:801`, `src/slic3r/GUI/GUI_ObjectLayers.cpp` |
| Variable layer height (adaptive + smoothing + manual brush) | `.../Plater/VariableLayerHeightGizmo.cpp`; setting `variable_layer_height` (`ConfigDefsFDM.cpp:4658`) | `GLCanvas3D.hpp:198` (LayersEditing); `src/libslic3r/Slicing.hpp:165,178` (adaptive, smooth); `PrintConfig.cpp:7218` |
| Text emboss (part / negative / modifier, on surface) | `.../Plater/TextGizmo.cpp`, `TextDialog.cpp` | `GLGizmoEmboss.cpp`; "Add text / negative text / text modifier" `GUI_Factories.cpp:199-201` |
| SVG emboss | `.../Plater/SvgGizmo.cpp` | `GLGizmoSVG.cpp`, `GUI_Factories.cpp:205-207` |
| Measure (points, edges, circles, planes; scale to measured length) | `.../Plater/MeasureGizmo.cpp`, `Measure.cpp` | `GLGizmoMeasure.cpp` |
| SLA hollow / SLA support points | **No gizmo in the built 3.0 GUI.** Neither is in the 16-tool list (`ToolGizmosUiInfo.cpp:16-85`). `GLGizmoHollow.cpp`/`GLGizmoSlaSupports.cpp` remain only in the unbuilt `src/slic3r/GUI/Gizmos/` (2.9 code). The SLA back end (hollowing, support points, `SLAPrint`) is built in libslic3r (`src/libslic3r/CMakeLists.txt:360-363`). | `GLGizmoHollow.cpp`, `GLGizmoSlaSupports.cpp` under `src/slic3r/GUI/Gizmos/`, registered `GLGizmosManager.cpp:111,113` |
| Shapes / gallery | Add shape Cube/Cylinder/Sphere/Text/SVG/Gallery (`MenuBuilder.cpp:199-244`) | Shape Gallery (`MainFrame.cpp:2087`), FreeCAD Python object script (`MainFrame.cpp:2098`, `FreeCADDialog.cpp`) [SS], mosaic from picture (`MainFrame.cpp:2103`, `CreateMMUTiledCanvas.cpp:869`) [SS] |
| Unit conversion, mirror, split, instances, fill bed | split/instances/fill bed/scale to volume (`MenuBuilder.cpp:173-190`) | `GUI_Factories.cpp:1105-1548` (imperial/meter conversion, mirror X/Y/Z, split to objects/parts, instances, fill bed) |
| Plugins (Lua project plugins) | Plugins menu (`MenuBuilder.cpp:266-272`); API `src/slic3r-shared/src/Slic3r/App/Lua/ProjectApi.cpp` (make_cube/cylinder/..., emboss_text/svg, load_stl, add_object, insert_layer_custom_gcode, preset access); bundled `resources/lua/com.prusa3d.slicer.calibration` | absent |

### 3. Arrange, per-object settings, sequential printing, MMU, post-processing, placeholders

- **Arrange.**
  - PrusaSlicer uses a no-fit-polygon packer in `P@30ef591:src/slic3r-biz-arrange/src/Slic3r/Biz/*/NFP.cpp`. Its
    kernels include TMArrange, Gravity, Compactify, RectangleOverfit and WipeTowerPositioning (`.../Kernels/`). The
    UI is an Arrange gizmo (`ToolGizmosUiInfo.cpp:39`) plus "Arrange selection" and "Fill bed".
  - SuperSlicer uses the 2.7 arrange in `S@1f3d287:src/libslic3r/Arrange/`. Options are geometry handling
    convex/balanced/advanced, strategy auto/pull-to-center and XL pivots (`ArrangeSettingsView.hpp:20-27`). Tasks are
    arrange, fill bed and multiply selection (`Arrange/Tasks/`).
- **Per-object and per-region settings.**
  - Both slicers attach settings to objects, parts, modifier meshes and height ranges (see the volume and
    height-range rows in section 2).
  - In PrusaSlicer 3.0, which settings may be overridden where is data on each definition (`overrides_in`, Tool /
    Object / Volume). Two categories exist only at object/volume level: `Object_Extruders` (the per-object `extruder`, `ConfigDefsFDM.cpp:952`) and `Volume_WipeOptions` (`wipe_into_infill`/`wipe_into_objects`, `:4793,4803`).
  - SuperSlicer offers "Add settings" and "Quick Add Settings" categories per item (`GUI_Factories.cpp:485,810`).
- **Sequential printing.**
  - Both slicers print object by object with `complete_objects` (`P@30ef591:...ConfigDefsFDM.cpp:624`;
    `S@1f3d287:src/libslic3r/PrintConfig.cpp:1207`). Collision checks use `extruder_clearance_radius`/`_height`.
  - PrusaSlicer 2.9.1 added an SMT-solver (z3) sequential arrange, "smarter sequential printing"
    (https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.9.1). **It is disabled in the 3.0-alpha12 build**:
    `#add_subdirectory(libseqarrange)` (`P@30ef591:src/CMakeLists.txt:23`), `ArrangeHelper.cpp` commented out
    (`src/libslic3r/CMakeLists.txt:84-85`), and the job `src/slic3r/GUI/Jobs/SeqArrangeJob.cpp` sits in the unbuilt
    `src/slic3r/`. The solver sources remain (`src/libseqarrange/include/libseqarrange/seq_interface.hpp:1-9`; z3 link
    at `src/libseqarrange/CMakeLists.txt:9`). In the built 3.0 tree, sequential printing is `complete_objects` plus
    clearance checks only.
  - SuperSlicer adds print order (`complete_objects_sort`, `:1246`), one skirt for all (`complete_objects_one_skirt`,
    `:1238`) and "parallel objects step" (`parallel_objects_step`, `:1217`), which prints several objects in Z
    batches. All three are [SS].
- **Wipe tower and multi-material.**
  - Both slicers share the PrusaSlicer `WipeTower` class (`P@30ef591:src/libslic3r/src/libslic3r/GCode/WipeTower.hpp:24`;
    `S@1f3d287:src/libslic3r/GCode/WipeTower.hpp:29`) and `ToolOrdering`.
  - Shared settings: `wipe_tower` (P:4691, S:7334), `wiping_volumes_matrix` (P:4702, S:7379), `wipe_into_infill`/
    `wipe_into_objects` (P:4791/4801, S:7506/7515), `ooze_prevention` (P:2864, S:4493),
    `single_extruder_multi_material` (P:3841, S:6249) with ramming and cooling-move filament settings, and
    `mmu_segmented_region_max_width` (P:2301, S:3841).
  - PrusaSlicer 3.0 adds Tool presets for multi-tool printers (INDX/XL presets `resources/presets/.../preset-tool-*.yaml`),
    interlocking beams and stamping/purge options (Appendix A, Print > Multi-material and Filament > Multi-material).
  - SuperSlicer adds skinnydip, toolchange temperature and toolchange part-fan options (`filament_*`, Appendix B) and a
    tiled MMU "mosaic" generator.
- **Post-processing scripts.**
  - Both slicers read `post_process` (P:3008, S:5087) and run each script on a `.pp` copy of the G-code. They set
    `SLIC3R_PP_HOST` and `SLIC3R_PP_OUTPUT_NAME`, and the script may write `<file>.output_name` to rename the output
    (`S@1f3d287:src/libslic3r/GCode/PostProcessor.cpp:260-330`).
  - SuperSlicer exports every setting as `SLIC3R_<KEY>` (`config.setenv_()`, `PostProcessor.cpp:305`; prefix at
    `Config.cpp:1540-1542`).
  - **PrusaSlicer 3.0-alpha12 stubs that export out**: `PANIC("config.setenv_() not implemented")`
    (`P@30ef591:src/libslic3r/src/libslic3r/GCode/PostProcessor.cpp:1026-1027`).
  - `.pl` scripts run through bundled Perl on Windows (`:111-141`).
  - The Prusa file also inserts M73 progress lines and a statistics block (`:204-456`).
  - Both slicers have regex find/replace, `gcode_substitutions` (P:2019, S:3415, `GCode/FindReplace.cpp`).
- **Custom G-code and the placeholder parser.**
  - Both use the same Boost.Spirit macro language, which started as Slic3r's `[var]` substitution. It has `{if}`,
    `{elsif}`, `{else}` and `{endif}` blocks; `and/or/not`; `min/max`, `int`, `round`, `digits`/`zdigits`, `is_nil`,
    `one_of`, `empty`, `size` and `interpolate_table`; `local`/`global` variables and `repeat`; and regex `=~`/`!~`.
  - Prusa locations: `P@30ef591:src/slic3r-biz-parser/src/Slic3r/Biz/Parser/PlaceholderParser.cpp:2016-2191`, regex
    at `:666-680`. Documentation: https://help.prusa3d.com/article/macros_1775.
  - SuperSlicer adds `exists(var)` (`S@1f3d287:src/libslic3r/PlaceholderParser.cpp:2466`), user-defined variables
    from `print_/filament_/printer_custom_variables` (`:2694,2818`), import of `SLIC3R_*` environment variables
    (`:156-159`) and extra hooks (`feature_gcode`, `object_gcode`, `between_objects_gcode_before_move`).
  - The variables available to the parser are the settings plus the placeholder-only definitions in
    `PrintStatisticsConfigDef`, `CustomGcodeSpecificConfigDef`, `TimestampsConfigDef`, `DimensionsConfigDef`,
    `ObjectsInfoConfigDef` and the slicing-state defs. These are listed in the "not placed on any page" tables of
    Appendices A and B.
  - The 2.9 G-code editor dialog (placeholder browser) survives as `P@30ef591:src/slic3r/GUI/EditGCodeDialog.cpp`,
    which is not built in 3.0-alpha12. No replacement was located in the built modules (unverified).

### 4. Calibration and helper tools, SLA pipeline, export formats

**Calibration.**

- SuperSlicer has a Calibration menu (`S@1f3d287:src/slic3r/GUI/MainFrame.cpp:2056-2078`) with these tests:
  bed/extruder levelling, filament flow, extruder flow (multiplier curve across speeds), filament temperature
  tower, retraction, pressure/linear advance, bridge flow, ironing/over-bridge pattern, and a calibration cube with
  goals (`CalibrationCubeDialog.cpp:32-52`). Dialogs are `Calibration*Dialog.cpp`; models are in
  `resources/calibration/*`.
- PrusaSlicer 3.0 ships calibration as a Lua plugin, `P@30ef591:resources/lua/com.prusa3d.slicer.calibration`.
  `manifest.json` declares licence AGPL-3.0-only and API `project.plugin` 1.0.0. The plugin provides:
  - `flow_tower.lua`: menu "Calibration/Flow Tower", with parameters for min/max volumetric flow, number of steps,
    step depth, ticks, brim and a note (`:1-15`).
  - `temp_tower.lua`.
  - `note_badge.lua`, which uses `api.emboss_text`.
- The 3.0 welcome text announces "early plugin support and built-in calibration prints"
  (`P@30ef591:src/slic3r-shared/src/Slic3r/App/WelcomeDialog.cpp:299-303`).

**Other helpers.**

- PrusaSlicer 3.0 (built) exposes Configuration Wizard, Flash Printer Firmware, Search and Keyboard Shortcuts menu
  entries (`P@30ef591:src/slic3r-shared/src/Slic3r/App/MenuBuilder.cpp:59,115,121,141`). Its `ConfigWizard.cpp` and
  `FirmwareDialog.cpp` live in the unbuilt `src/slic3r/GUI/`, so how those entries are implemented in 3.0 is
  unverified. SuperSlicer has all of them (`S@1f3d287:src/slic3r/GUI/{ConfigWizard,FirmwareDialog,KBShortcutsDialog,Search}.cpp`)
  plus a standalone G-code viewer (`MainFrame.cpp:94,1916`). SuperSlicer has ASCII/binary G-code conversion
  (`S@1f3d287:src/slic3r/GUI/MainFrame.cpp:1894-1897`); no such command was found in the built 3.0 modules. Both export toolpaths to OBJ
  (`P@30ef591:src/libvgcode/src/Slic3r/App/libvgcode/ViewerImpl.cpp:1363`; SS `MainFrame.cpp:1874`).
- SuperSlicer only: Wi-Fi config writer for Prusa printers (`WifiConfigDialog.cpp:23`, `prusa_printer_settings.ini`),
  "Import/Export Prusa Config" (`MainFrame.cpp:1834,1888`), user-editable UI layouts (`resources/ui_layout/Readme.md`)
  and FanMover, which shifts fan commands earlier in time (`src/libslic3r/GCode/FanMover.cpp`).

**SLA pipeline.** Both slicers share the PrusaSlicer pipeline (`P@30ef591:src/libslic3r/include/libslic3r/PrintSteps.hpp`;
`S@1f3d287:src/libslic3r/SLAPrint.hpp:26-42`):

- Per-object steps: assembly (CSG of parts) → hollowing → drill holes → slice → support points → support tree
  (default or branching) → pad → slice supports.
- Print-level steps: merge slices and evaluate → rasterize.
- Code: `src/libslic3r/SLA/` (Hollowing, SupportPointGenerator, DefaultSupportTree, BranchingTreeSLA, Pad,
  RasterBase, ZCorrection).
- PrusaSlicer 3.0 adds tilt profiles per material (`tilt_*`, Appendix A).
- Archive formats: PrusaSlicer 3.0 writes SL1 and SL1S (`P@30ef591:src/libslic3r/src/libslic3r/Format/SL1.cpp`,
  `SL1_SVG.cpp`; wildcards `src/slic3r-shared/src/Slic3r/App/Wildcards.cpp:28-29`). SuperSlicer also writes Masked CWS
  and 15 Anycubic Photon formats (`S@1f3d287:src/libslic3r/Format/SLAArchiveFormatRegistry.cpp:29-80`).

**Import/export formats.**

| Format | PrusaSlicer 3.0 | SuperSlicer |
|---|---|---|
| 3MF (project + model) | import/export (`src/slic3r-shared/src/Slic3r/Biz/Format/3mf.cpp`, `3mf/PrusaFile.cpp`) | import/export (`src/libslic3r/Format/3mf.cpp`), plus "3MF for SuperSlicer only (no baked transform)" and "unbake" variants (`GUI_App.cpp:585-586`) and Bambu 3MF import (`Format/bbs_3mf.cpp`, `BBConfig.cpp`) |
| STL | import/export (`Biz/Format/STL.cpp`) | import (also imperial units) / export (`MainFrame.cpp:1810-1814`) |
| OBJ | import/export (`Biz/Format/OBJ.cpp`) | import/export |
| AMF | **import dropped**: extensions are .3mf .stl .obj .svg .step/.stp (`Biz/FileLoadingLogic.cpp:1234-1244`); the stale error text at `:818` still lists .amf | import/export (`Format/AMF.cpp`; export also from CLI `export_amf`) |
| STEP | import via OCCT (`Biz/Format/STEP.cpp`, `src/occt_wrapper`) | import (`Format/STEP.cpp`) |
| SVG | import as an embossed object (`Biz/Format/SVG.cpp`) | import (`Format/SVG.cpp`) |
| G-code / bgcode | export `.gcode` and `.bgcode`, selected by `binary_gcode` (`ConfigDefsFDM.cpp:2508`; `Wildcards.cpp:26-27`; dep `deps/+LibBGCode`) | export both (`binary_gcode` `PrintConfig.cpp:4026`); viewer opens `.gcode .gco .bgcode .bgc .g .ngc` (`GUI_App.cpp:587`) |
| Other | ZIP, PNG/SVG bed textures, printer certificates (`Wildcards.cpp:35-39`) | HueForge `.hfp` import (`Format/HFP.cpp`), ZIP archive import, SLA archive import, INI/bundle configs (`GUI_App.cpp:592-601`) |

### 5. Origin of each feature family

PrusaSlicer forked Slic3r and SuperSlicer forks PrusaSlicer. A feature is counted once, at its origin. Dates come from
the PrusaSlicer release notes.

| Feature family | Origin | Evidence |
|---|---|---|
| Core FDM pipeline: perimeters, infill patterns, supports (grid), skirt/brim, cooling, retraction, custom G-code, `[placeholder]` substitution, post-processing scripts, per-object settings/modifiers, sequential printing (`complete_objects`), cut (plane), STL/OBJ/AMF IO | Slic3r | Slic3r lineage; same keys in Slic3r (unverified per key) |
| Wipe tower, MMU single-extruder ramming, wiping volumes, variable layer height editor, SLA pipeline, 3MF project, physical printers, macro language with `{if}` | PrusaSlicer (Slic3r PE) | (unverified per feature: these predate the GitHub release notes fetched here) |
| Paint-on supports, seam painting, ironing, monotonic infill, adaptive/support cubic infill, G-code viewer | PrusaSlicer 2.3 | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.3.0 |
| Fuzzy skin (ported from Cura), mesh simplification, sequential-print clearance visualisation | PrusaSlicer 2.4 (fuzzy skin originated in Cura) | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.4.0-alpha1 |
| Multi-material painting / segmentation | PrusaSlicer 2.4 | 2.4.0 series (unverified on fetched page); later improvements https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.9.0-alpha1 |
| Arachne, Lightning infill, pressure equalizer, STEP import | PrusaSlicer 2.5 (Arachne and Lightning from Cura) | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.5.0 |
| Organic supports (from Thomas Rahm's Cura tree supports), measure tool, text emboss, cut with connectors | PrusaSlicer 2.6 | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.6.0-alpha2 , .../version_2.6.0-alpha4 |
| SVG emboss, binary G-code (bgcode), ramping travels, G2/G3 arc fitting, cancel object labels | PrusaSlicer 2.7 | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.7.0 |
| New G-code viewer (libvgcode), seam rework, Prusa Connect | PrusaSlicer 2.8 | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.8.0 |
| Multiple beds, scarf seams, paint-on fuzzy skin, multiple nozzle diameters; height-range painting (inspired by BambuStudio, reimplemented) | PrusaSlicer 2.9 | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.9.0 , .../version_2.9.0-alpha1 |
| SMT sequential arrange, multi-material interlocking | PrusaSlicer 2.9.1 | https://github.com/prusa3d/PrusaSlicer/releases/tag/version_2.9.1 |
| Tool presets, multi-project, mixed printers per project, Lua plugins, plugin calibration prints, YAML presets, `pressure_advance` setting | PrusaSlicer 3.0 (alpha) | `P@30ef591:src/slic3r-shared/src/Slic3r/App/WelcomeDialog.cpp:299-303`; `ConfigDefsFDM.cpp` (`[3.0]` rows) |
| Calibration menu prints, AngelScript UI layouts, milling post-process, FreeCAD scripts, mosaic, brim ears/patches, seam volumes, hole compensation/polyholes, dense infill, overhang tuning, per-feature fan and PA, gap-fill tuning, custom variables, `exists()`, G-code precision, parallel objects step, skinnydip, Bambu/HueForge import, Anycubic SLA output | SuperSlicer (all 356 SS-only keys) | Appendix B [SS] rows; https://github.com/supermerill/SuperSlicer (README feature list) |
| Arc fitting step "from BBS" in SuperSlicer | BambuStudio, via SuperSlicer | `S@1f3d287:src/libslic3r/Print.hpp:103` comment |

### 6. Citation coverage

Every finding above cites `repo@commit:path:line` or a URL. The appendix rows cite the defining line in the named
file. Items marked (unverified) are origin attributions not confirmed against a fetched primary page.

## Comparison

| Aspect | PrusaSlicer 3.0-alpha12 | SuperSlicer 2.7.62-beta2 |
|---|---|---|
| Settings count (keys) | 471 (3.0 domain) + 178 legacy-only | 893 (356 SuperSlicer-only) |
| Settings model | typed defs with location, overrides_in, category, option_group, order, gui_type | 2.x `ConfigOptionDef` + `.ui` layout files + AngelScript virtual settings |
| Preset kinds | Print, Filament/Material, Printer, **Tool**, Physical printer; YAML presets | Print, Filament, Printer, Physical printer; INI |
| Gizmos | 16 tools incl. fuzzy-skin paint, height range, arrange gizmo; no SLA hollow/support gizmos in the built GUI | 14 gizmos (2.7 set) |
| Extensibility | Lua project plugins (beta API) | AngelScript for GUI settings; FreeCAD Python generator; post-process scripts |
| Calibration | Lua plugin: flow tower, temperature tower | 9 built-in calibration tests plus an Introduction entry |
| Sequential | `complete_objects` + clearance; SMT (z3) arrange from 2.9.1 present in source but not built at 30ef591 | object order sort, one skirt, parallel step |
| Post-process env | `SLIC3R_<KEY>` export stubbed (PANIC) at this commit | full `SLIC3R_<KEY>` export |
| Import | 3MF, STL, OBJ, STEP, SVG (no AMF) | 3MF (+Bambu), STL, OBJ, AMF, STEP, SVG, HFP, ZIP, SLA archives |
| SLA output | SL1, SL1S | SL1, SL1S, CWS, 15 Anycubic formats |
| Maintenance | active (alpha12 dated 2026-09-21) | last commit 2025-11-18, beta tag |

## Implications for VSSlicer

- **Settings schema.** PrusaSlicer 3.0's definition model has typed keys, a storage location, an override list, a
  category/group/order and a GUI type. It is a ready template for a VS Code settings UI generated from data. We could
  generate our own JSON schema from such a table instead of hand-coding pages. Copying the definitions themselves
  copies AGPL text (labels, tooltips).
- **SuperSlicer `.ui` files** show that a data-driven page layout is enough to render about 650 settings with
  rows, groups and per-setting widths. This maps naturally onto a webview form.
- **Treat PrusaSlicer 3.0 as unstable.** Its config layer and post-processor are mid-port: 178 legacy keys are not yet
  in the domain, the `SLIC3R_*` env export PANICs, and AMF import is gone. If we wrap a PrusaSlicer CLI, target
  2.9.x for stability until 3.0 is final.
- **Plugins.** PrusaSlicer's Lua API (shape primitives, emboss, custom layer G-code, preset queries) covers the same
  ground as a VSSlicer "generator" extension point. Calibration as plugins is a model worth copying: tests become
  data, not core code.
- **Do not double count.** Most model-prep tools (cut, emboss, measure, painting, simplify) are PrusaSlicer features
  that SuperSlicer and the later forks inherited. Count them once under PrusaSlicer. SuperSlicer's own value is in
  its 356 extra settings and its calibration, milling and scripting features.

## Licence notes

- PrusaSlicer and SuperSlicer are AGPL-3.0 (`LICENSE` in both clones). The bundled Prusa calibration plugin declares
  AGPL-3.0-only (`P@30ef591:resources/lua/com.prusa3d.slicer.calibration/manifest.json`).
- Reusing setting labels, tooltips or `.ui` layouts verbatim would put AGPL-licensed text in VSSlicer.
- Key names and behaviour descriptions are facts. Re-describe them in our own words, or keep any AGPL-derived
  component in a separate process (CLI wrapper).

## Open questions

- Whether PrusaSlicer 3.0 final will restore `SLIC3R_<KEY>` environment export for post-processing scripts and AMF
  import (both missing at 30ef591).
- How the 178 legacy-only PrusaSlicer keys (print host, CLI, compatibility conditions) will be represented in 3.0:
  some are commented out with TODOs in `ConfigDefsFDM.cpp`.
- The Lua plugin API version and its stability guarantees (`required_apis` = `project.plugin` 1.0.0): is it intended
  for third parties in 3.0 final?
- SuperSlicer maintenance: the last commit is a 2025 beta. Is OrcaSlicer (card for OrcaSlicer/BambuStudio) the better
  source for SuperSlicer-derived features today?
- Origins marked (unverified) for pre-2.3 Slic3r PE features need a check against Slic3r and Slic3r PE changelogs.

## Appendix A: PrusaSlicer settings

### PrusaSlicer 3.0 settings by GUI category and option group

Source: `PrusaSlicer@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDefsFDM.cpp` (FDM, "F"), `ConfigDefsSLA.cpp` ("S"), `ConfigCommon.cpp` ("C"); the `line` column is the `defs.add(...)` line. Category and option-group titles come from `PrusaSlicer@30ef591:src/slic3r-domain/src/Slic3r/Domain/ConfigDef.cpp:10-200` (`translate_category`/`translate_option_group`). `[3.0]` marks keys absent from the 2.x legacy `PrintConfig.cpp`. Location = which preset/box stores the value (Print, Filament/Material, Printer, Tool, Object, Volume, Project).

#### Print > Bed adhesion (13)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Brim** | | | | |
| `brim_type` | enum | Print | F:549 | Brim type: The places where the brim will be printed around each object on the first layer. |
| `brim_width` | double | Print | F:534 | Brim width: The horizontal width of the brim that will be printed around each object on the first layer. |
| `brim_separation` | double | Print | F:566 | Brim separation gap: Offset of brim from the printed object. |
| **Raft** | | | | |
| `raft_contact_distance` | double | Print | F:3085 | Raft contact Z distance: The vertical distance between object and raft. |
| `raft_expansion` | double | Print | F:3099 | Raft expansion: Expansion of the raft in XY plane for better stability. |
| `raft_layers` | int | Print | F:3142 | Raft layers: The object will be raised by this number of layers, and support material will be generated under it. |
| `raft_first_layer_density` | Percentage | Print | F:3113 | First layer density: Density of the first raft layer. |
| `raft_first_layer_expansion` | double | Print | F:3128 | Raft first layer expansion: Expansion of the raft first layer to improve adhesion to print bed. |
| **Skirt** | | | | |
| `skirts` | int | Print | F:3584 | Skirt Loops: Number of loops for the skirt. |
| `skirt_distance` | double | Print | F:3543 | Distance from brim/object: Distance between skirt and brim (when draft shield is not used) or objects. |
| `skirt_height` | int | Print | F:3555 | Skirt height: Height of skirt expressed in layers. |
| `min_skirt_length` | double | Print | F:2824 | Minimal filament extrusion length: Generate no less than the number of skirt loops required to consume the specified amount of filament on the bottom layer. |
| `draft_shield` | enum | Print | F:3566 | Draft shield: With draft shield active, the skirt will be printed skirt_distance from the object, possibly intersecting brim. |

#### Print > Custom G-code (1)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Custom G-code** | | | | |
| `custom_parameters_print` | string | Print | F:4997 | Custom print parameters: custom_parameter_print |

#### Print > Extrusion & Retraction (19)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Extrusion Width** | | | | |
| `automatic_extrusion_widths` | bool | Print | F:81 | Automatic extrusion widths calculation: Automatically calculates extrusion widths based on the nozzle diameter of the currently used extruder. |
| `extrusion_width` | FloatOrPercentage | Print | F:1031 | Default extrusion width: Set this to a non-zero value to allow a manual extrusion width. |
| `first_layer_extrusion_width` | FloatOrPercentage | Print | F:1675 | First layer: Set this to a non-zero value to set a manual extrusion width for first layer. |
| `perimeter_extrusion_width` | FloatOrPercentage | Print | F:2959 | Perimeters: Set this to a non-zero value to set a manual extrusion width for perimeters. |
| `external_perimeter_extrusion_width` | FloatOrPercentage | Print | F:878 | External perimeters: Set this to a non-zero value to set a manual extrusion width for external perimeters. |
| `infill_extrusion_width` | FloatOrPercentage | Print | F:2217 | Infill: Set this to a non-zero value to set a manual extrusion width for infill. |
| `solid_infill_extrusion_width` | FloatOrPercentage | Print | F:3669 | Solid infill: Set this to a non-zero value to set a manual extrusion width for infill for solid surfaces. |
| `top_infill_extrusion_width` | FloatOrPercentage | Print | F:4516 | Top solid infill: Set this to a non-zero value to set a manual extrusion width for infill for top surfaces. |
| `support_material_extrusion_width` | FloatOrPercentage | Print | F:4031 | Support material: Set this to a non-zero value to set a manual extrusion width for support material. |
| **Idle Tool Retraction** | | | | |
| `retract_length_toolchange` | double | Print | F:3239 | Retraction Length (Toolchange): When retraction is triggered before changing tool, filament is pulled back by the specified amount (the length is measured on raw filament, before... |
| `retract_restart_extra_toolchange` | double | Print | F:3365 | Extra length on restart: When the retraction is compensated after changing tool, the extruder will push this additional amount of filament. |
| **Retraction** | | | | |
| `retract_length` | double | Print | F:3225 | Retraction Length: When retraction is triggered, filament is pulled back by the specified amount (the length is measured on raw filament, before it enters the extruder). |
| `retract_speed` | double | Print | F:3377 | Retraction Speed: The speed for retractions (it only applies to the extruder motor). |
| `deretract_speed` | double | Print | F:3390 | Deretraction Speed: The speed for loading of a filament into extruder after retraction (it only applies to the extruder motor). |
| `retract_restart_extra` | double | Print | F:3352 | Deretraction extra length: When the retraction is compensated after the travel move, the extruder will push this additional amount of filament. |
| `retract_before_travel` | double | Print | F:3189 | Minimum travel after retraction: Retraction is not triggered when travel moves are shorter than this length. |
| `retract_layer_change` | bool | Print | F:3214 | Retract on layer change: This flag enforces a retraction whenever a Z move is done. |
| `wipe` | bool | Print | F:4679 | Wipe while retracting: This flag will move the nozzle while retracting to minimize the possible blob on leaky extruders. |
| `retract_before_wipe` | Percentage | Print | F:3201 | Retract amount before wipe: With bowden extruders, it may be wise to do some amount of quick retract before doing the wipe movement. |

#### Print > Hollowing (4)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Hollowing** | | | | |
| `hollowing_enable` | bool | Print | S:725 | Enable hollowing: Hollow out a model to have an empty interior |
| `hollowing_min_thickness` | double | Print | S:735 | Wall thickness: Minimum wall thickness of a hollowed model. |
| `hollowing_quality` | double | Print | S:748 | Accuracy: Performance vs accuracy of calculation. |
| `hollowing_closing_distance` | double | Print | S:760 | Closing distance: Hollowing is done in two steps: first, an imaginary interior is calculated deeper (offset plus the closing distance) in the object and then it's in... |

#### Print > Infill (15)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Advanced** | | | | |
| `infill_first` | bool | Print | F:2235 | Infill before perimeters: This option will switch the print order of perimeters and infill, making the latter first. |
| `solid_infill_every_layers` | int | Print | F:3653 | Solid infill every: This feature allows to force a solid layer every given number of layers. |
| `bridge_angle` | double | Print | F:292 | Bridging angle: Bridging angle override. |
| `bridge_flow_ratio` | double | Print | F:320 | Bridge flow ratio: This factor affects the amount of plastic for bridging. |
| `fill_angle` | double | Print | F:1555 | Fill angle: Default base angle for infill orientation. |
| `only_retract_when_crossing_perimeters` | bool | Print | F:2851 | Only retract when crossing perimeters: Disables retraction when the travel path does not exceed the upper layer's perimeters (and thus any ooze will be probably invisible). |
| `solid_infill_below_area` | double | Print | F:3628 | Solid infill threshold area: Force solid infill for regions having a smaller area than the specified threshold. |
| **Density pattern** | | | | |
| `fill_density` | Percentage | Print | F:1571 | Fill density: Density of internal infill, expressed in the range 0% - 100%. |
| `fill_pattern` | enum | Print | F:1601 | Fill pattern: Fill pattern for general low-density infill. |
| **Infill combination** | | | | |
| `automatic_infill_combination` | bool | Print | F:92 | Automatic infill combination: This feature automatically combines infill of several layers and speeds up your print by extruding thicker infill layers while preserving thin peri... |
| `automatic_infill_combination_max_layer_height` | FloatOrPercentage | Print | F:104 | Automatic infill combination - Max layer height: Maximum layer height for combining infill when automatic infill combining is enabled. |
| `infill_every_layers` | int | Print | F:2135 | Combine infill every n layers: This feature allows to combine infill and speed up your print by extruding thicker infill layers while preserving thin perimeters, thus accuracy. |
| **Overlap** | | | | |
| `infill_overlap` | FloatOrPercentage | Print | F:2245 | Infill/perimeters overlap: This setting applies an additional overlap between infill and perimeters for better bonding. |
| **Walls anchoring** | | | | |
| `infill_anchor` | FloatOrPercentage | Print | F:2150 | Length of the infill anchor: Connect an infill line to an internal perimeter with a short segment of an additional perimeter. |
| `infill_anchor_max` | FloatOrPercentage | Print | F:2178 | Maximum length of the infill anchor: Connect an infill line to an internal perimeter with a short segment of an additional perimeter. |

#### Print > Layers & Surfaces (18)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Ironing** | | | | |
| `ironing` | bool | Print | F:2329 | Enable ironing: Enable ironing of the top layers with the hot print head for smooth surface |
| `ironing_type` | enum | Print | F:2414 | Ironing Type: Ironing Type |
| `ironing_flowrate` | Percentage | Print | F:2430 | Flow rate: Percent of a flow rate relative to object's normal layer height. |
| `ironing_spacing` | double | Print | F:2443 | Spacing between ironing passes: Distance between ironing lines |
| `ironing_speed` | double | Print | F:2456 | Ironing speed: Ironing |
| **Layer height** | | | | |
| `first_layer_height` | FloatOrPercentage | Print | F:1693 | First layer height: When printing with very low layer heights, you might still want to print a thicker bottom layer to improve adhesion and tolerance for non perfect b... |
| `max_layer_height` | double | Print | F:2703 | Max: This is the highest printable layer height for this extruder, used to cap the variable layer height and support layer height. |
| `min_layer_height` | double | Print | F:2798 | Min: This is the lowest printable layer height for this extruder and limits the resolution for variable layer height. |
| `layer_height` | double | print | C:136 | Layer height: This setting controls the height (and thus the total number) of the slices/layers. |
| `faded_layers` | int | Print | S:349 | Faded layers: Number of the layers needed for the exposure time fade from initial exposure time to the exposure time |
| **Only one perimeter** | | | | |
| `only_one_perimeter_first_layer` | bool | Print | F:352 | Only one perimeter on first layer: Use only one perimeter on the first layer. |
| `top_one_perimeter_type` | enum | Print | F:336 | Single perimeter on top surfaces: Use only one perimeter on flat top surface, to give more space to the top infill pattern. |
| **Surface patterns** | | | | |
| `top_fill_pattern` | enum | Print | F:831 | Top fill pattern: Fill pattern for top infill. |
| `bottom_fill_pattern` | enum | Print | F:855 | Bottom fill pattern: Fill pattern for bottom infill. |
| **Top/Bottom shells** | | | | |
| `top_solid_layers` | int | Print | F:4552 | Top solid layers: Number of solid layers to generate on top surfaces. |
| `top_solid_min_thickness` | double | Print | F:4565 | Minimum top shell thickness: The number of top solid layers is increased above top_solid_layers if necessary to satisfy minimum thickness of top shell. |
| `bottom_solid_layers` | int | Print | F:250 | Bottom solid layers: Number of solid layers to generate on bottom surfaces. |
| `bottom_solid_min_thickness` | double | Print | F:263 | Minimum bottom shell thickness: The number of bottom solid layers is increased above bottom_solid_layers if necessary to satisfy minimum thickness of bottom shell. |

#### Print > Motion & Dynamics (22)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Bridges Acceleration** | | | | |
| `bridge_acceleration` | double | Print | F:278 | Bridge: This is the acceleration your printer will use for bridges. |
| **First layer Acceleration** | | | | |
| `first_layer_acceleration` | double | Print | F:1632 | First layer: This is the acceleration your printer will use for first layer. |
| `first_layer_acceleration_over_raft` | double | Print | F:1646 | First object layer over raft interface: This is the acceleration your printer will use for first layer of object above raft interface. |
| **Main Structure Acceleration** | | | | |
| `default_acceleration` | double | Print | F:711 | Default: This is the acceleration your printer will be reset to after the role-specific acceleration values are used (perimeter/infill). |
| `perimeter_acceleration` | double | Print | F:2921 | Perimeters: This is the acceleration your printer will use for perimeters. |
| `solid_infill_acceleration` | double | Print | F:2063 | Solid infill: This is the acceleration your printer will use for solid infill. |
| `top_solid_infill_acceleration` | double | Print | F:2077 | Top solid infill: This is the acceleration your printer will use for top solid infill. |
| `infill_acceleration` | double | Print | F:2050 | Infill: This is the acceleration your printer will use for infill. |
| `external_perimeter_acceleration` | double | Print | F:2934 | External perimeters: This is the acceleration your printer will use for external perimeters. |
| **Travel Avoidance** | | | | |
| `avoid_crossing_curled_overhangs` | bool | Print | F:122 | Avoid crossing curled overhangs (Experimental): Plan travel moves such that the extruder avoids areas where the filament may be curled up. |
| `avoid_crossing_perimeters` | bool | Print | F:135 | Avoid crossing perimeters: Optimize travel moves in order to minimize the crossing of perimeters. |
| `avoid_crossing_perimeters_max_detour` | double | Print | F:147 | Avoid crossing perimeters - Max detour length: The maximum detour length for avoid crossing perimeters. |
| **Travels Acceleration** | | | | |
| `travel_acceleration` | double | Print | F:2104 | Travel: This is the acceleration your printer will use for travel moves. |
| `travel_short_distance_acceleration` | double | Print | F:2119 | Travel short distance acceleration: Acceleration used for short travel moves. |
| **Vertical Lift** | | | | |
| `retract_lift` | double | Print | F:3307 | Lift height: Lift height applied before travel. |
| `retract_lift_above` | double | Print | F:3321 | Only lift Z above: If you set this to a positive value, Z lift will only take place above the specified absolute Z. |
| `retract_lift_below` | double | Print | F:3336 | Only lift Z below: If you set this to a positive value, Z lift will only take place below the specified absolute Z. |
| `travel_lift_before_obstacle` | bool | Print | F:3295 | Steeper ramp before obstacles: If enabled, PrusaSlicer detects obstacles along the travel path and makes the slope steeper in case an obstacle might be hit during the initial pha... |
| `travel_max_lift` | double | Print | F:3280 | Maximum ramping lift: Maximum lift height of the ramping lift. |
| `travel_ramping_lift` | bool | Print | F:3267 | Use ramping lift: Generates a ramping lift instead of lifting the extruder directly upwards. |
| `travel_slope` | double | Print | F:3253 | Ramping slope angle: Slope of the ramp in the initial phase of the travel. |
| **Wipe Tower Acceleration** | | | | |
| `wipe_tower_acceleration` | double | Print | F:2091 | Wipe tower: This is the acceleration your printer will use for wipe tower. |

#### Print > Multi-Material (28)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Bonding & Interlocking** | | | | |
| `interface_shells` | bool | Print | F:2288 | Interface shells: Force the generation of solid shells between adjacent materials/volumes. |
| `interlocking_beam` | bool | Print | F:2340 | Use beam interlocking: Generate interlocking beam structure at the locations where different filaments touch. |
| `interlocking_beam_layer_count` | int | Print | F:2378 | Interlocking beam layers: The height of the beams of the interlocking structure, measured in number of layers. |
| `interlocking_beam_width` | double | Print | F:2351 | Interlocking beam width: The width of the interlocking structure beams. |
| `interlocking_boundary_avoidance` | int | Print | F:2402 | Interlocking boundary avoidance: The distance from the outside of a model where interlocking structures will not be generated, measured in cells. |
| `interlocking_depth` | int | Print | F:2390 | Interlocking depth: The distance from the boundary between filaments to generate interlocking structure, measured in cells. |
| `interlocking_orientation` | double | Print | F:2364 | Interlocking direction: Orientation of interlocking beams. |
| `mmu_segmented_region_interlocking_depth` | double | Print | F:2314 | Interlocking depth of a segmented region: Interlocking depth of a segmented region. |
| `mmu_segmented_region_max_width` | double | Print | F:2301 | Maximum width of a segmented region: Maximum width of a segmented region. |
| **Extruder Assignment** | | | | |
| `perimeter_extruder` | int | Print | F:2946 | Perimeter extruder: The extruder to use when printing perimeters and brim. |
| `infill_extruder` | int | Print | F:2205 | Infill extruder: The extruder to use when printing infill. |
| `solid_infill_extruder` | int | Print | F:3641 | Solid infill extruder: The extruder to use when printing solid infill. |
| `support_material_extruder` | int | Print | F:4018 | Support material/raft/skirt extruder: The extruder to use when printing support material, raft and skirt (1+, 0 to use the current extruder to minimize tool changes). |
| `support_material_interface_extruder` | int | Print | F:4090 | Support material/raft interface extruder: The extruder to use when printing support material interface (1+, 0 to use the current extruder to minimize tool changes). |
| `wipe_tower_extruder` | int | Print | F:4824 | Wipe tower extruder: The extruder to use when printing perimeter of the wipe tower. |
| `bed_temperature_extruder` | int | Print | F:209 | Bed temperature by extruder: The extruder which determines bed temperatures. |
| **Ooze prevention** | | | | |
| `ooze_prevention` | bool | Print | F:2864 | Enable: This option will drop the temperature of the inactive extruders to prevent oozing. |
| `standby_temperature_delta` | int | Print | F:3732 | Temperature variation: Temperature difference to be applied when an extruder is not active. |
| **Tool changes** | | | | |
| `toolchange_ordering` | enum | Print | F:3873 | Toolchange ordering: Determines the order of tool changes on each layer. |
| **Wipe Tower** | | | | |
| `wipe_tower` | bool | Print | F:4691 | Enable: Multi material printers may need to prime or purge extruders on tool changes. |
| `wipe_tower_width` | double | Print | F:4722 | Width: Width of a wipe tower |
| `wipe_tower_brim_width` | double | Print | F:4734 | Wipe tower brim width: Wipe tower brim width |
| `wipe_tower_bridging` | double | Print | F:4811 | Maximal bridging distance: Maximal distance between supports on sparse infill sections. |
| `wipe_tower_extra_spacing` | Percentage | Print | F:4760 | Wipe tower purge lines spacing: Spacing of purge lines on the wipe tower. |
| `wipe_tower_cone_angle` | double | Print | F:4746 | Stabilization cone apex angle: Angle at the apex of the cone that is used to stabilize the wipe tower. |
| `wipe_tower_extra_flow` | Percentage | Print | F:4775 | Extra flow for purging: Extra flow used for the purging lines on the wipe tower. |
| `wipe_tower_no_sparse_layers` | bool | Print | F:3861 | No sparse layers (EXPERIMENTAL): If enabled, the wipe tower will not be printed on layers with no toolchanges. |
| `single_extruder_multi_material_priming` | bool | Print | F:3851 | Prime all printing extruders: If enabled, all printing extruders will be primed at the front edge of the print bed at the start of the print. |

#### Print > Notes (1)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Notes** | | | | |
| `notes` | string | Print | F:2838 | Configuration notes: You can put here your personal notes. |

#### Print > Output options (1)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Output file** | | | | |
| `output_filename_format` | string | print | C:163 | Output filename format: You can use all configuration options as variables inside this template. |

#### Print > Pad (12)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Pad** | | | | |
| `pad_enable` | bool | Print | S:562 | Use pad: Add a pad underneath the supported model |
| `pad_wall_thickness` | double | Print | S:572 | Pad wall thickness: The thickness of the pad and its optional cavity walls. |
| `pad_wall_height` | double | Print | S:585 | Pad wall height: Defines the pad cavity depth. |
| `pad_brim_size` | double | Print | S:602 | Pad brim size: How far should the pad extend around the contained geometry |
| `pad_max_merge_distance` | double | Print | S:616 | Max merge distance: Some objects can get along with a few smaller pads instead of a single big one. |
| `pad_wall_slope` | double | Print | S:640 | Pad wall slope: The slope of the pad wall relative to the bed plane. |
| `pad_around_object` | bool | Print | S:654 | Pad around object: Create pad around object and ignore the support elevation |
| `pad_around_object_everywhere` | bool | Print | S:664 | Pad around object everywhere: Force pad around object everywhere |
| `pad_object_gap` | double | Print | S:674 | Pad object gap: The gap between the object bottom and the generated pad in zero elevation mode. |
| `pad_object_connector_stride` | double | Print | S:688 | Pad object connector stride: Distance between two connector sticks which connect the object and the generated pad. |
| `pad_object_connector_width` | double | Print | S:700 | Pad object connector width: Width of the connector sticks which connect the object and the generated pad. |
| `pad_object_connector_penetration` | double | Print | S:712 | Pad object connector penetration: How much should the tiny connectors penetrate into the model body. |

#### Print > Precision & Slicing (19)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Arachne perimeter generator** | | | | |
| `min_bead_width` | FloatOrPercentage | Print | F:4966 | Minimum perimeter width: Width of the perimeter that will replace thin features (according to the Minimum feature size) of the model. |
| `min_feature_size` | FloatOrPercentage | Print | F:4949 | Minimum feature size: Minimum thickness of thin features. |
| `wall_distribution_count` | int | Print | F:4936 | Perimeter distribution count: The number of perimeters, counted from the center, over which the variation needs to be spread. |
| `wall_transition_angle` | double | Print | F:4919 | Perimeter transitioning threshold angle: When to create transitions between even and odd numbers of perimeters. |
| `wall_transition_filter_deviation` | FloatOrPercentage | Print | F:4899 | Perimeter transitioning filter margin: Prevent transitioning back and forth between one extra perimeter and one less. |
| `wall_transition_length` | FloatOrPercentage | Print | F:4883 | Perimeter transition length: When transitioning between different numbers of perimeters as the part becomes thinner, a certain amount of space is allotted to split or join the... |
| **Dimensional Accuracy** | | | | |
| `xy_size_compensation` | double | Print | F:4836 | XY Size Compensation: The object will be grown/shrunk in the XY plane by the configured value (negative = inwards, positive = outwards). |
| `slice_closing_radius` | double | print | C:176 | Slice gap closing radius: Cracks smaller than 2x gap closing radius are being filled during the triangle mesh slicing. |
| **Perimeter Generator** | | | | |
| `perimeter_generator` | enum | Print | F:4864 | Perimeter generator: Classic perimeter generator produces perimeters with constant extrusion width and for very thin areas is used gap-fill. |
| **Resolution & G-code Data** | | | | |
| `resolution` | double | Print | F:3156 | Slice resolution: Minimum detail resolution, used to simplify the input file for speeding up the slicing job and reducing memory usage. |
| `gcode_resolution` | double | Print | F:3171 | G-code resolution: Maximum deviation of exported G-code paths from their full resolution counterparts. |
| `arc_fitting` | enum | Print | F:67 | Arc fitting: Enable to get a G-code file which has G2 and G3 moves. |
| `gcode_comments` | bool | Print | F:1961 | Verbose G-code: Enable this to get a commented G-code file, with each line explained by a descriptive text. |
| `gcode_label_objects` | enum | Print | F:2001 | Label objects: Selects whether labels should be exported at object boundaries and in what format. |
| **Scripts & Substitutions** | | | | |
| `gcode_substitutions` | string[] | Print | F:2019 | G-code substitutions: Find / replace patterns in G-code lines and substitute them. |
| **Slicing Strategy** | | | | |
| `slicing_mode` | enum | print | C:193 | Slicing Mode: Use "Even-odd" for 3DLabPrint airplane models. |
| `spiral_vase` | bool | Print | F:3718 | Spiral vase: This feature will raise Z gradually while printing a single-walled object in order to remove any visible seam. |
| `complete_objects` | bool | Print | F:624 | Complete individual objects: When printing multiple objects or copies, this feature will complete each object before moving onto next one (and starting it from its bottom layer). |
| **Corrections** | | | | |
| `elefant_foot_compensation` | double | printer | C:83 | Elephant foot compensation: The first layer will be shrunk in the XY plane by the configured value to compensate for the 1st layer squish aka an Elephant Foot effect. |

#### Print > Speed (25)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Dynamic overhang speed** | | | | |
| `enable_dynamic_overhang_speeds` | bool | Print | F:393 | Enable dynamic overhang speeds: This setting enables dynamic speed control on overhangs. |
| `overhang_speed_0` | FloatOrPercentage | Print | F:411 | speed for 0% overlap (bridge) |
| `overhang_speed_1` | FloatOrPercentage | Print | F:425 | speed for 25% overlap |
| `overhang_speed_2` | FloatOrPercentage | Print | F:439 | speed for 50% overlap |
| `overhang_speed_3` | FloatOrPercentage | Print | F:453 | speed for 75% overlap |
| **First layer** | | | | |
| `first_layer_speed` | FloatOrPercentage | Print | F:1710 | First layer speed: If expressed as absolute value in mm/s, this speed will be applied to all the print moves of the first layer, regardless of their type. |
| `first_layer_solid_infill_speed` | FloatOrPercentage | Print | F:1744 | First layer solid infill speed: If expressed as absolute value in mm/s, this speed will be applied to the solid infill print moves of the first layer. |
| `first_layer_speed_over_raft` | FloatOrPercentage | Print | F:1846 | Speed of object first layer over raft interface: If expressed as absolute value in mm/s, this speed will be applied to all the print moves of the first object layer above raft interface, regardles... |
| **Main structure** | | | | |
| `external_perimeter_speed` | FloatOrPercentage | Print | F:895 | External perimeters: This separate setting will affect the speed of external perimeters (the visible ones). |
| `perimeter_speed` | double | Print | F:2978 | Perimeters: Speed for perimeters (contours, aka vertical shells). |
| `small_perimeter_speed` | FloatOrPercentage | Print | F:3612 | Small perimeters: This separate setting will affect the speed of perimeters having radius <= 6.5mm (usually holes). |
| `infill_speed` | double | Print | F:2259 | Infill: Speed for printing the internal fill. |
| `solid_infill_speed` | FloatOrPercentage | Print | F:3686 | Solid infill: Speed for printing solid regions (top/bottom/internal horizontal shells). |
| `top_solid_infill_speed` | FloatOrPercentage | Print | F:4534 | Top solid infill: Speed for printing top solid layers (it only applies to the uppermost external layers and not to their internal solid layers). |
| `gap_fill_speed` | double | Print | F:1947 | Gap fill: Speed for filling small gaps using short zigzag moves. |
| **Pressure equalizer** | | | | |
| `max_volumetric_extrusion_rate_slope_negative` | double | Print | F:2766 | Max volumetric slope negative: This experimental setting is used to limit the speed of change in extrusion rate for a transition from higher speed to lower speed. |
| `max_volumetric_extrusion_rate_slope_positive` | double | Print | F:2748 | Max volumetric slope positive: This experimental setting is used to limit the speed of change in extrusion rate for a transition from lower speed to higher speed. |
| **Support and Bridges** | | | | |
| `bridge_speed` | double | Print | F:363 | Bridges: Speed for printing bridges. |
| `over_bridge_speed` | FloatOrPercentage | Print | F:377 | Over bridges: Speed for printing solid infill above bridges. |
| `support_material_speed` | double | Print | F:4241 | Support material: Speed for printing support material. |
| `support_material_interface_speed` | FloatOrPercentage | Print | F:4175 | Support material interface: Speed for printing support material interface layers. |
| **Travels** | | | | |
| `travel_speed` | double | Print | F:4581 | Travel: Speed for travel moves (jumps between distant extrusion points). |
| `travel_speed_z` | double | Print | F:4596 | Z travel: Speed for movements along the Z axis. |
| **Volumetric speed** | | | | |
| `max_print_speed` | double | Print | F:2719 | Max print speed: When setting other speed settings to 0 Slic3r will autocalculate the optimal speed in order to keep constant extruder pressure. |
| `max_volumetric_speed` | double | Print | F:2734 | Max volumetric speed: This experimental setting is used to set the maximum volumetric speed your extruder supports. |

#### Print > Supports (51)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **-** | | | | |
| `support_object_elevation` (+ `branchingsupport_object_elevation`) | double | Print | S:1272 | How much the supports should lift up the supported object. |
| **Generation** | | | | |
| `support_material` | enum | Print | F:3895 | Generate Supports: Enable support material generation. |
| `support_material_style` | enum | Print | F:4255 | Style: Style and shape of the support towers. |
| `support_material_threshold` | int | Print | F:4289 | Overhang threshold: Support material will not be generated for overhangs whose slope angle (90° = vertical) is above the given threshold. |
| `support_material_buildplate_only` | bool | Print | F:3949 | Support on build plate only: Only create support if it lies on a build plate. |
| `support_material_enforce_layers` | int | Print | F:4000 | Enforce support for the first n layers: Generate support material for the specified number of layers counting from bottom, regardless of whether normal support material is enabled or not... |
| `dont_support_bridges` | bool | Print | F:755 | Don't support bridges: Experimental option for preventing support material from being generated under bridged areas. |
| `supports_enable` | bool | Print | S:512 | Generate supports: Generate supports for the models |
| `support_tree_type` | enum | Print | S:522 | Support tree type: Support tree building strategy |
| `support_enforcers_only` | bool | Print | S:540 | Support only in enforced regions: Only create support if it lies in a support enforcer. |
| `support_points_density_relative` | int | Print | S:550 | Support points density: This is a relative measure of support points density. |
| **Interface separation** | | | | |
| `support_material_bottom_contact_distance` | double | Print | F:3980 | Bottom contact Z distance: The vertical distance between the object top surface and the support material interface. |
| `support_material_bottom_interface_layers` | int | Print | F:4123 | Bottom interface layers: Number of interface layers to insert between the object(s) and support material. |
| `support_material_contact_distance` | double | Print | F:3960 | Top contact Z distance: The vertical distance between object and support material interface. |
| `support_material_xy_spacing` | FloatOrPercentage | Print | F:3916 | XY separation between an object and its support: XY separation between an object and its support. |
| `support_material_interface_contact_loops` | bool | Print | F:4078 | Interface loops: Cover the top contact layer of the supports with loops. |
| `support_material_interface_layers` | int | Print | F:4103 | Top interface layers: Number of interface layers to insert between the object(s) and support material. |
| `support_material_interface_pattern` | enum | Print | F:4208 | Interface pattern: Pattern used to generate support material interface. |
| `support_material_interface_spacing` | double | Print | F:4161 | Interface pattern spacing: Spacing between interface lines. |
| **Organic supports** | | | | |
| `support_tree_angle` | double | Print | F:4321 | Maximum Branch Angle: The maximum angle of the branches, when the branches have to avoid the model. |
| `support_tree_angle_slow` | double | Print | F:4338 | Preferred Branch Angle: The preferred angle of the branches, when they do not have to avoid the model. |
| `support_tree_branch_diameter` | double | Print | F:4371 | Branch Diameter: The diameter of the thinnest branches of organic support. |
| `support_tree_branch_diameter_angle` | double | Print | F:4388 | Branch Diameter Angle: The angle of the branches' diameter as they gradually become thicker towards the bottom. |
| `support_tree_branch_diameter_double_wall` | double | Print | F:4406 | Branch Diameter with double walls: Branches with area larger than the area of a circle of this diameter will be printed with double walls for stability. |
| `support_tree_branch_distance` | double | Print | F:4426 | Branch Distance: How far apart the branches need to be when they touch the model. |
| `support_tree_tip_diameter` | double | Print | F:4355 | Tip Diameter: Branch tip diameter for organic supports. |
| `support_tree_top_rate` | Percentage | Print | F:4441 | Branch Density: Adjusts the density of the support structure used to generate the tips of the branches. |
| **Pattern density** | | | | |
| `support_material_pattern` | enum | Print | F:4191 | Pattern: Pattern used to generate support material. |
| `support_material_spacing` | double | Print | F:4227 | Pattern spacing: Spacing between support material lines. |
| `support_material_angle` | double | Print | F:3934 | Pattern angle: Use this setting to rotate the support material pattern on the horizontal plane. |
| **Connection of the support sticks and junctions** | | | | |
| `support_critical_angle` (+ `branchingsupport_critical_angle`) | double | Print | S:1228 | The default angle for connecting support sticks and junctions. |
| `support_max_bridge_length` (+ `branchingsupport_max_bridge_length`) | double | Print | S:1242 | The max length of a bridge |
| `support_max_pillar_link_distance` (+ `branchingsupport_max_pillar_link_distance`) | double | Print | S:1258 | The max distance of two pillars to get linked with each other. |
| **Support geometry** | | | | |
| `support_material_first_layer_density` [3.0] | Percentage | Print | F:4049 | First layer density: Density of the first support layer. |
| `support_material_first_layer_expansion` [3.0] | double | Print | F:4064 | First layer expansion: Expansion of the support first layer to improve adhesion to print bed. |
| `support_material_closing_radius` | double | Print | F:4146 | Closing radius: For snug supports, the support regions will be merged using morphological closing operation. |
| `support_material_synchronize_layers` | bool | Print | F:4274 | Synchronize with object layers: Synchronize support layers with the object print layers. |
| `support_material_with_sheath` | bool | Print | F:4308 | With sheath around the support: Add a sheath (a single perimeter line) around the base support. |
| **Support head** | | | | |
| `support_head_front_diameter` (+ `branchingsupport_head_front_diameter`) | double | Print | S:1035 | Diameter of the pointing side of the head |
| `support_head_penetration` (+ `branchingsupport_head_penetration`) | double | Print | S:1048 | How much the pinhead has to penetrate the model surface |
| `support_head_width` (+ `branchingsupport_head_width`) | double | Print | S:1061 | Width from the back sphere center to the front sphere center |
| **Support pillar** | | | | |
| `support_pillar_diameter` (+ `branchingsupport_pillar_diameter`) | double | Print | S:1075 | Diameter in mm of the support pillars |
| `support_small_pillar_diameter_percent` (+ `branchingsupport_small_pillar_diameter_percent`) | Percentage | Print | S:1089 | The percentage of smaller pillars compared to the normal pillar diameter which are used in problematic areas where a normal pilla cannot fit. |
| `support_max_bridges_on_pillar` (+ `branchingsupport_max_bridges_on_pillar`) | int | Print | S:1104 | Maximum number of bridges that can be placed on a pillar. |
| `support_max_weight_on_model` (+ `branchingsupport_max_weight_on_model`) | double | Print | S:1122 | Maximum weight of sub-trees that terminate on the model instead of the print bed. |
| `support_pillar_connection_mode` (+ `branchingsupport_pillar_connection_mode`) | enum | Print | S:1137 | Controls the bridge type between two neighboring pillars. |
| `support_buildplate_only` (+ `branchingsupport_buildplate_only`) | bool | Print | S:1156 | Only create support if it lies on a build plate. |
| `support_pillar_widening_factor` (+ `branchingsupport_pillar_widening_factor`) | double | Print | S:1167 | Merging bridges or pillars into another pillars can increase the radius. |
| `support_base_diameter` (+ `branchingsupport_base_diameter`) | double | Print | S:1184 | Diameter in mm of the pillar base |
| `support_base_height` (+ `branchingsupport_base_height`) | double | Print | S:1198 | The height of the pillar base cone |
| `support_base_safety_distance` (+ `branchingsupport_base_safety_distance`) | double | Print | S:1211 | The minimum distance of the pillar base from the model in mm. |

#### Print > Walls & Perimeters (22)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Fuzzy skin** | | | | |
| `fuzzy_skin` | enum | Print | F:1892 | Fuzzy Skin: Fuzzy skin type. |
| `fuzzy_skin_point_dist` | double | Print | F:1922 | Fuzzy skin point distance: Perimeters will be split into multiple segments by inserting Fuzzy skin points. |
| `fuzzy_skin_thickness` | double | Print | F:1908 | Fuzzy skin thickness: The maximum distance that each skin point can be offset (both ways), measured perpendicular to the perimeter wall. |
| **Perimeters** | | | | |
| `perimeters` | int | Print | F:2992 | Perimeters: This option sets the minimal number of perimeters to generate for each layer. |
| **Seams** | | | | |
| `seam_position` | enum | Print | F:3421 | Seam position: Position of perimeters starting points. |
| `staggered_inner_seams` | bool | Print | F:3439 | Staggered inner seams: This option causes the inner seams to be shifted backwards based on their depth, forming a zigzag pattern. |
| `seam_gap_distance` | FloatOrPercentage | Print | F:3404 | Seam gap distance: The distance between the endpoints of a closed loop perimeter. |
| `scarf_seam_placement` | enum | Print | F:3451 | Scarf joint placement: Where to place scarf joint seam. |
| `scarf_seam_only_on_smooth` | bool | Print | F:3470 | Scarf joint only on smooth perimeters: Only use the scarf joint when the perimeter is smooth. |
| `scarf_seam_start_height` | Percentage | Print | F:3481 | Scarf start height: Start height of the scarf joint specified as fraction of the current layer height. |
| `scarf_seam_entire_loop` | bool | Print | F:3495 | Scarf joint around entire perimeter: Extend the scarf around entire length of the perimeter. |
| `scarf_seam_length` | double | Print | F:3506 | Scarf joint length: Length of the scarf joint. |
| `scarf_seam_max_segment_length` | double | Print | F:3519 | Max scarf joint segment length: Maximum length of any scarf joint segment. |
| `scarf_seam_on_inner_perimeters` | bool | Print | F:3532 | Scarf joint on inner perimeters: Use scarf joint on inner perimeters. |
| **Walls quality** | | | | |
| `external_perimeters_first` | bool | Print | F:911 | External perimeters first: Print contour perimeters from the outermost one to the innermost one instead of the default inverse order. |
| `extra_perimeters` | bool | Print | F:923 | Extra perimeters if needed: Add more perimeters when needed for avoiding gaps in sloping walls. |
| `extra_perimeters_on_overhangs` | bool | Print | F:936 | Extra perimeters on overhangs (Experimental): Detect overhang areas where bridges cannot be anchored, and fill them with extra perimeter paths. |
| `overhangs` | bool | Print | F:2874 | Detect bridging perimeters: Experimental option to adjust flow for overhangs (bridge flow will be used), to apply bridge speed to them and enable fan. |
| `thick_bridges` | bool | Print | F:4475 | Thick bridges: If enabled, bridges are more reliable, can bridge longer distances, but may look worse. |
| `thin_walls` | bool | Print | F:4488 | Detect thin walls: Detect single-width walls (parts where two extrusions don't fit and we need to collapse them into a single trace). |
| `gap_fill_enabled` | bool | Print | F:1936 | Fill gaps: Enables filling of gaps between perimeters and between the inner most perimeters and infill. |
| `ensure_vertical_shell_thickness` | enum | Print | F:814 | Ensure vertical shell thickness: Add solid infill near sloping surfaces to guarantee the vertical shell thickness (top+bottom solid layers). |

#### Filament > Cooling (17)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Cooling logic** | | | | |
| `cooling` | bool | Filament | F:637 | Enable auto cooling: This flag enables the automatic cooling logic that adjusts print speed and fan speed according to layer printing time. |
| `cooling_slowdown_logic` | enum | Filament | F:649 | Cooling slowdown logic: Determines how the printer slows down layer printing when the minimum layer time isn't reached. |
| `cooling_perimeter_transition_distance` | double | Filament | F:674 | Perimeter transition distance: Distance in millimeters before non-slowed perimeters where the original unslowed print speed is restored. |
| **Cooling Thresholds** | | | | |
| `fan_below_layer_time` | int | Filament | F:1061 | Enable fan if layer print time is below: If layer print time is estimated below this number of seconds, fan will be enabled and its speed will be calculated by interpolating the minimum an... |
| `min_print_speed` | double | Filament | F:2812 | Min print speed: Slic3r will not scale speed down below this speed. |
| `slowdown_below_layer_time` | int | Filament | F:3598 | Slow down if layer print time is below: If layer print time is estimated below this number of seconds, print moves speed will be scaled down to extend duration to this value. |
| **Dynamic Fan Speed** | | | | |
| `enable_dynamic_fan_speeds` | bool | Filament | F:467 | Enable dynamic fan speeds: This setting enables dynamic fan speed control on overhangs. |
| `overhang_fan_speed_0` | int | Filament | F:482 | speed for 0% overlap (bridge) |
| `overhang_fan_speed_1` | int | Filament | F:495 | speed for 25% overlap |
| `overhang_fan_speed_2` | int | Filament | F:508 | speed for 50% overlap |
| `overhang_fan_speed_3` | int | Filament | F:521 | speed for 75% overlap |
| **Fan Control & Limits** | | | | |
| `fan_always_on` | bool | Filament | F:1050 | Keep fan always on: If this is enabled, fan will never be disabled and will be kept running at least at its minimum speed. |
| `min_fan_speed` | int | Filament | F:2784 | Min fan speed: This setting represents the minimum PWM your fan needs to work. |
| `max_fan_speed` | int | Filament | F:2689 | Max fan speed: This setting represents the maximum speed of your fan. |
| `bridge_fan_speed` | int | Filament | F:307 | Bridges fan speed: This fan speed is enforced during all bridges and overhangs. |
| **First Layers** | | | | |
| `disable_fan_first_layers` | int | Filament | F:741 | Disable fan for the first: You can set this to a positive value to disable fan at all during the first layers, so that it does not make adhesion worse. |
| `full_fan_speed_layer` | int | Filament | F:1877 | Full fan speed at layer: Fan speed will be ramped up linearly from zero at layer "disable_fan_first_layers" to maximum at layer "full_fan_speed_layer". |

#### Filament > Custom G-code (3)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Custom G-code** | | | | |
| `start_filament_gcode` | string | Filament | F:3781 | Start G-code: This start procedure is inserted at the beginning, after any printer start gcode (and after any toolchange to this filament in case of multi-materi... |
| `end_filament_gcode` | string | Filament | F:798 | End G-code: This end procedure is inserted at the end of the output file, before the printer end gcode (and before any toolchange from this filament in case of... |
| `custom_parameters_filament` | string | Filament | F:5030 | Custom filament parameters: custom_parameter_filament |

#### Filament > Extrusion & Calibration (6)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Compensation** | | | | |
| `filament_shrinkage_compensation_xy` | Percentage | Filament | F:1525 | Shrinkage compensation XY: Enter your filament shrinkage percentages for the X and Y axes here to apply scaling of the object to compensate for shrinkage in the X and Y axes. |
| `filament_shrinkage_compensation_z` | Percentage | Filament | F:1540 | Shrinkage compensation Z: Enter your filament shrinkage percentages for the Z axis here to apply scaling of the object to compensate for shrinkage in the Z axis. |
| **Extrusion & Calibration** | | | | |
| `filament_diameter` | double | Filament | F:1408 | Diameter: Enter your filament diameter here. |
| `extrusion_multiplier` | double | Filament | F:1017 | Extrusion multiplier: This factor changes the amount of flow proportionally. |
| **Pressure Advance** | | | | |
| `pressure_advance` [3.0] | enum | Filament | F:3024 | Pressure advance: Controls how the pressure advance value is emitted into g-code for this filament. |
| `pressure_advance_value` [3.0] | double | Filament | F:3046 | Pressure advance: Pressure Advance (also called Linear Advance in some firmware) compensates for nozzle pressure to achieve sharper corners. |

#### Filament > Material printing profile (19)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **-** | | | | |
| `material_print_speed` | enum | Material | S:778 | Print speed: A slower printing profile might be necessary when using materials with higher viscosity or with some hollowed parts. |
| **Profile settings** | | | | |
| `delay_before_exposure` | double[] | Material | S:812 | Delay before exposure: Delay before exposure after previous layer separation. |
| `delay_after_exposure` | double[] | Material | S:824 | Delay after exposure: Delay after exposure before layer separation. |
| `tower_hop_height` | double[] | Material | S:836 | Tower hop height: The height of the tower raise. |
| `tower_speed` | EnumVectorWrapper | Material | S:848 | Tower speed: Tower speed used for tower raise. |
| `tilt_down_initial_speed` | EnumVectorWrapper | Material | S:891 | Tilt down initial speed: Tilt speed used for an initial portion of tilt down move. |
| `tilt_down_finish_speed` | EnumVectorWrapper | Material | S:901 | Tilt down finish speed: Tilt speed used for the rest of the tilt down move. |
| `tilt_up_initial_speed` | EnumVectorWrapper | Material | S:911 | Tilt up initial speed: Tilt speed used for an initial portion of tilt up move. |
| `tilt_up_finish_speed` | EnumVectorWrapper | Material | S:921 | Tilt up finish speed: Tilt speed used for the rest of the tilt-up. |
| `use_tilt` | bool[] | Material | S:931 | Use tilt: If enabled, tilt is used for layer separation. |
| `tilt_down_offset_steps` | int[] | Material | S:940 | Tilt down offset steps: Number of steps to move down from the calibrated (horizontal) position with 'tilt_down_initial_speed'. |
| `tilt_down_offset_delay` | double[] | Material | S:952 | Tilt down offset delay: Delay after the tilt reaches 'tilt_down_offset_steps' position. |
| `tilt_down_cycles` | int[] | Material | S:964 | Tilt down cycles: Number of cycles to split the rest of the tilt down move. |
| `tilt_down_delay` | double[] | Material | S:975 | Tilt down delay: The delay between tilt-down cycles. |
| `tilt_up_offset_steps` | int[] | Material | S:987 | Tilt up offset steps: Move tilt up to calibrated (horizontal) position minus this offset. |
| `tilt_up_offset_delay` | double[] | Material | S:999 | Tilt up offset delay: Delay after the tilt reaches 'tilt_up_offset_steps' position. |
| `tilt_up_cycles` | int[] | Material | S:1011 | Tilt up cycles: Number of cycles to split the rest of the tilt-up. |
| `tilt_up_delay` | double[] | Material | S:1022 | Tilt up delay: The delay between tilt-up cycles. |
| **Tilt** | | | | |
| `area_fill` | double | Material | S:164 | Area fill threshold: The value is expressed as a percentage of the bed area. |

#### Filament > Material & Temperatures (25)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **First Layers** | | | | |
| `initial_layer_height` | double | Material | S:294 | Initial layer height: Initial layer height |
| **Bed & Chamber Temperature** | | | | |
| `first_layer_bed_temperature` | int | Filament | F:1660 | First layer bed temperature: Heated build plate temperature for the first layer. |
| `bed_temperature` | int | Filament | F:161 | Bed temperature: Bed temperature for layers after the first one. |
| `chamber_minimal_temperature` | int | Filament | F:192 | Chamber minimal temperature: Minimal chamber temperature that the printer waits for before the print starts. |
| `chamber_temperature` | int | Filament | F:176 | Chamber temperature: Required chamber temperature for the print. |
| **Corrections** | | | | |
| `zcorrection_layers` | int | Material | S:245 | Z compensation: Number of layers to Z correct to avoid cross layer bleed |
| `material_correction_x` | double | Material | S:436 | Correction for expansion in X axis: Correction for expansion in X axis |
| `material_correction_y` | double | Material | S:447 | Correction for expansion in Y axis: Correction for expansion in Y axis |
| `material_correction_z` | double | Material | S:458 | Correction for expansion in Z axis: Correction for expansion in Z axis |
| **Exposure** | | | | |
| `initial_exposure_time` | double | Material | S:416 | Initial exposure time: Initial exposure time |
| **Material Property** | | | | |
| `filament_type` | string | Filament | F:1435 | Filament type: The filament material type for use in custom G-codes. |
| `filament_abrasive` | bool | Filament | F:1477 | Abrasive material: This flag means that the material is abrasive and requires a hardened nozzle. |
| `filament_soluble` | bool | Filament | F:1467 | Soluble material: Soluble material is most likely used for a soluble support. |
| `filament_cost` | double | Filament | F:1487 | Cost: Enter your filament cost per kg here. |
| `filament_density` | double | Filament | F:1421 | Density: Enter your filament density here. |
| `filament_spool_weight` | double | Filament | F:1499 | Spool weight: Enter weight of the empty filament spool. |
| `material_colour` | string | Material | S:271 | Color: This is only used in the Slic3r interface as a visual help. |
| `bottle_volume` | double | Material | S:305 | Bottle volume: Bottle volume |
| `bottle_weight` | double | Material | S:316 | Bottle weight: Bottle weight |
| `material_density` | double | Material | S:327 | Density: Density |
| `bottle_cost` | double | Material | S:338 | Cost: Cost |
| **Nozzle Temperature** | | | | |
| `first_layer_temperature` | int | Filament | F:1862 | First layer nozzle temperature: Nozzle temperature for the first layer. |
| `idle_temperature` | int? | Filament | F:4983 | Idle temperature: Nozzle temperature when the tool is currently not used in multi-tool setups.This is only used when 'Ooze prevention' is active in Print Settings. |
| `temperature` | int | Filament | F:4460 | Nozzle temperature: Nozzle temperature for layers after the first one. |
| **Exposure** | | | | |
| `exposure_time` | double | Material | S:383 | Exposure time: Exposure time |

#### Filament > Multi-Material (20)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Flush parameters (experimental)** | | | | |
| `filament_flush_volume` | double | Filament | F:1380 | Flush volume: Volume of filament to flush during a tool change. |
| `filament_flush_speed` | double | Filament | F:1394 | Flush speed: Extrusion speed used for flushing during a tool change. |
| **Movement & Timing** | | | | |
| `filament_loading_speed_start` | double | Filament | F:1171 | Loading speed at the start: Speed used at the very beginning of loading phase. |
| `filament_unloading_speed` | double | Filament | F:1183 | Unloading speed: Speed used for unloading the filament on the wipe tower (does not affect initial part of unloading just after ramming). |
| `filament_unloading_speed_start` | double | Filament | F:1196 | Unloading speed at the start: Speed used for unloading the tip of the filament immediately after ramming. |
| `filament_loading_speed` | double | Filament | F:1159 | Loading speed: Speed used for loading the filament on the wipe tower. |
| **Multitool Ramming** | | | | |
| `filament_multitool_ramming` | bool | Filament | F:1344 | Enable ramming for multitool setups: Perform ramming when using multitool printer (i.e. |
| `filament_multitool_ramming_volume` | double | Filament | F:1356 | Multitool ramming volume: The volume to be rammed before the toolchange. |
| `filament_multitool_ramming_flow` | double | Filament | F:1368 | Multitool ramming flow: Flow used for ramming the filament before the toolchange. |
| `filament_ramming_temperature_delta` | int | Filament | F:1324 | Ramming temperature variation: Temperature difference to be applied right before ramming. |
| `filament_ramming_initial_delay` | double | Filament | F:1334 | Pause before ramming: Time in seconds that the printer will remain idle before ramming, allowing the melt zone temperature to equalize. |
| **Tip Shaping & Cooling** | | | | |
| `filament_ramming_parameters` | string | Filament | F:1313 | Ramming parameters: This string is edited by RammingDialog and contains ramming specific parameters. |
| `filament_cooling_moves` | int | Filament | F:1247 | Number of cooling moves: Filament is cooled by being moved back and forth in the cooling tubes. |
| `filament_cooling_initial_speed` | double | Filament | F:1260 | Speed of the first cooling move: Cooling moves are gradually accelerating beginning at this speed. |
| `filament_cooling_final_speed` | double | Filament | F:1287 | Speed of the last cooling move: Cooling moves are gradually accelerating towards this speed. |
| `filament_stamping_distance` | double | Filament | F:1234 | Stamping distance measured from the center of the cooling tube: If set to nonzero value, filament is moved toward the nozzle between the individual cooling moves ("stamping"). |
| `filament_stamping_loading_speed` | double | Filament | F:1222 | Stamping loading speed: Speed used for stamping. |
| `filament_toolchange_delay` | double | Filament | F:1208 | Delay after unloading: Time to wait after the filament is unloaded. |
| **Wipe Tower Purging** | | | | |
| `filament_purge_multiplier` | Percentage | Filament | F:1299 | Purge volume multiplier: Purging volume on the wipe tower is determined by 'multimaterial_purging' in Printer Settings. |
| `filament_minimal_purge_on_wipe_tower` | double | Filament | F:1272 | Minimal purge on wipe tower: After a tool change, the exact position of the newly loaded filament inside the nozzle may not be known, and the filament pressure is likely not ye... |

#### Filament > Notes (2)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Notes** | | | | |
| `filament_notes` | string | Filament | F:1105 | Filament notes: You can put your notes regarding the filament here. |
| `material_notes` | string | Material | S:469 | SLA print material notes: You can put your notes regarding the SLA print material here. |

#### Filament > Overrides (3)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Print Speed Override** | | | | |
| `filament_infill_max_crossing_speed` | double | Filament | F:1145 | Max crossing infill speed: Maximum speed allowed for this filament while printing infill with self intersections in a single layer. |
| `filament_infill_max_speed` | double | Filament | F:1131 | Max non-crossing infill speed: Maximum speed allowed for this filament while printing infill without any self intersections in a single layer. |
| `filament_max_volumetric_speed` | double | Filament | F:1118 | Max volumetric speed: Maximum volumetric speed allowed for this filament. |

#### Printer > Bed (3)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Size & Coordinates** | | | | |
| `bed_shape` | Vec2d[] | printer | C:56 | Bed shape |
| `bed_custom_texture` | string | printer | C:65 | Bed custom texture |
| `bed_custom_model` | string | printer | C:74 | Bed custom model |

#### Printer > Custom G-code (11)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Custom G-code** | | | | |
| `start_gcode` | string | Printer | F:3767 | Start G-code: This start procedure is inserted at the beginning, possibly prepended by temperature-changing commands. |
| `autoemit_temperature_commands` | bool | Printer | F:3747 | Emit temperature commands automatically: When enabled, PrusaSlicer will check whether your custom Start G-code contains G-codes to set extruder, bed or chamber temperature (M104, M109, M14... |
| `end_gcode` | string | Printer | F:777 | End G-code: This end procedure is inserted at the end of the output file. |
| `before_layer_gcode` | string | Printer | F:222 | Before layer change G-code: This custom code is inserted at every layer change, right before the Z move. |
| `layer_gcode` | string | Printer | F:2469 | After layer change G-code: This custom code is inserted at every layer change, right after the Z move and before the extruder moves to the first layer point. |
| `toolchange_gcode` | string | Printer | F:4500 | Tool change G-code: This custom code is inserted before every toolchange. |
| `between_objects_gcode` | string | Printer | F:237 | Between objects G-code: This code is inserted between objects when using sequential printing. |
| `color_change_gcode` | string | Printer | F:3802 | Color change G-code: This G-code will be used as a code for the color change |
| `pause_print_gcode` | string | Printer | F:3815 | Pause Print G-code: This G-code will be used as a code for the pause print |
| `template_custom_gcode` | string | Printer | F:3828 | Custom G-code: This G-code will be used as a custom code |
| `custom_parameters_printer` | string | Printer | F:5017 | Custom printer parameters: custom_parameter_printer |

#### Printer > General (39)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Capabilities & Features** | | | | |
| `single_extruder_multi_material` | bool | Printer | F:3841 | Single Extruder Multi Material: The printer multiplexes filaments into a single hot end. |
| `use_firmware_retraction` | bool | Printer | F:4611 | Use firmware retraction: This setting uses G10 and G11 commands to have the firmware handle the retraction. |
| `silent_mode` | bool | Printer | F:2498 | Supports stealth mode: The firmware supports stealth mode |
| `variable_layer_height` | bool | Printer | F:4658 | Enable variable layer height feature: Some printers or printer setups may have difficulties printing with a variable layer height. |
| `prefer_clockwise_movements` | bool | Printer | F:4669 | Prefer clockwise movements: This setting makes the printer print loops clockwise instead of counterclockwise. |
| `filament_change_time` | double | Printer | F:1075 | Filament change time: Time required for a single filament change. |
| **Corrections** | | | | |
| `relative_correction_x` | double | Printer | S:188 | Printer scaling X axis correction: Printer scaling correction in X axis |
| `relative_correction_y` | double | Printer | S:199 | Printer scaling Y axis correction: Printer scaling correction in Y axis |
| `relative_correction_z` | double | Printer | S:210 | Printer scaling Z axis correction: Printer scaling correction in Z axis |
| `absolute_correction` | double | Printer | S:221 | Printer absolute correction: Will inflate or deflate the sliced 2D polygons according to the sign of the correction. |
| `elefant_foot_min_width` | double | Printer | S:234 | Elephant foot minimum width: Minimum width of features to maintain when doing elephant foot compensation. |
| `gamma_correction` | double | Printer | S:255 | Printer gamma correction: This will apply a gamma correction to the rasterized 2D polygons. |
| **Display** | | | | |
| `display_width` | double | Printer | S:52 | Display width: Width of the display |
| `display_height` | double | Printer | S:62 | Display height: Height of the display |
| `display_pixels_x` | int | Printer | S:72 | Number of pixels in: Number of pixels in X |
| `display_pixels_y` | int | Printer | S:83 | Y: Number of pixels in Y |
| `display_mirror_x` | bool | Printer | S:93 | Display horizontal mirroring: Enable horizontal mirroring of output images |
| `display_mirror_y` | bool | Printer | S:103 | Display vertical mirroring: Enable vertical mirroring of output images |
| `display_orientation` | enum | Printer | S:113 | Display orientation: Set the actual LCD display orientation inside the SLA printer. |
| **Exposure** | | | | |
| `min_exposure_time` | double | Printer | S:361 | Minimum exposure time: Minimum exposure time |
| `max_exposure_time` | double | Printer | S:372 | Maximum exposure time: Maximum exposure time |
| `min_initial_exposure_time` | double | Printer | S:394 | Minimum initial exposure time: Minimum initial exposure time |
| `max_initial_exposure_time` | double | Printer | S:405 | Maximum initial exposure time: Maximum initial exposure time |
| **Firmware & G-code** | | | | |
| `gcode_flavor` | enum | Printer | F:1973 | G-code flavor: Some G/M-code commands, including temperature control and others, are not universal. |
| `binary_gcode` | bool | Printer | F:2508 | Supports binary G-code: Enable, if the firmware supports binary G-code format (bgcode). |
| `remaining_times` | bool | Printer | F:2485 | Supports remaining times: Emit M73 P[percent printed] R[remaining time in minutes] at 1 minute intervals into the G-code to let the firmware show accurate remaining time. |
| `stuck_filament_detection` | bool | Printer | F:4622 | Supports stuck filament monitoring configuration: Enable, if the firmware supports configuring the stuck filament detection via the M591 gcode. |
| `use_relative_e_distances` | bool | Printer | F:4632 | Use relative E distances: If your firmware requires relative E values, check this, otherwise leave it unchecked. |
| `use_volumetric_e` | bool | Printer | F:4643 | Use volumetric E: This experimental setting uses outputs the E values in cubic millimeters instead of linear millimeters. |
| `thumbnails` | string | printer | C:106 | G-code thumbnails: Picture sizes to be stored in .gcode / .bgcode and .sl1 / .sl1s files, in the following format: "XxY/EXT, XxY/EXT, ..." Currently supported extensi... |
| **Output** | | | | |
| `sla_archive_format` | string | Printer | S:793 | Format of the output SLA archive |
| `sla_output_precision` | double | Printer | S:801 | SLA output precision: Minimum resolution in nanometers |
| **Sequential Printing Limits** | | | | |
| `extruder_clearance_height` | double | Printer | F:987 | Height: Only used when 'Print Settings -> Complete individual objects' is active. |
| `extruder_clearance_radius` | double | Printer | F:1002 | Radius: Only used when 'Print Settings -> Complete individual objects' is active. |
| **Size & Clearances** | | | | |
| `z_offset` | double | Printer | F:4850 | Z offset: This value will be added (or subtracted) from all the Z coordinates in the output G-code. |
| `max_print_height` | double | printer | C:150 | Max print height: Set this to the maximum height that can be reached by your extruder while printing. |
| **Tilt** | | | | |
| `fast_tilt_time` | double | Printer | S:128 | Fast tilt: Time of the fast tilt |
| `slow_tilt_time` | double | Printer | S:140 | Slow tilt: Time of the slow tilt |
| `high_viscosity_tilt_time` | double | Printer | S:152 | Tilt for high viscosity resin: Time of the super slow tilt |

#### Printer > Machine limits (10)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **General** | | | | |
| `machine_limits_usage` | enum | Printer | F:2519 | Purpose of Machine Limits: How to apply the Machine Limits |
| **Jerk Limits** | | | | |
| `machine_max_jerk_{x,y,z,e}` | double[] | Printer | F:2594 | Maximum jerk %1%: Maximum jerk of the %1% axis |
| **Junction Deviation** | | | | |
| `machine_max_junction_deviation` | double[] | Printer | F:2629 | Maximum junction deviation: Maximum junction deviation (M205 J, only apply if JD > 0 for Marlin Firmware). |
| **Maximum Accelerations** | | | | |
| `machine_max_acceleration_{x,y,z,e}` | double[] | Printer | F:2573 | Maximum acceleration %1%: Maximum acceleration of the %1% axis |
| `machine_max_acceleration_extruding` | double[] | Printer | F:2653 | Maximum acceleration when extruding: Maximum acceleration when extruding |
| `machine_max_acceleration_retracting` | double[] | Printer | F:2665 | Maximum acceleration when retracting: Maximum acceleration when retracting. |
| `machine_max_acceleration_travel` | double[] | Printer | F:2678 | Maximum acceleration for travel moves: Maximum acceleration for travel moves. |
| **Maximum Feedrates** | | | | |
| `machine_max_feedrate_{x,y,z,e}` | double[] | Printer | F:2552 | Maximum feedrate %1%: Maximum feedrate of the %1% axis |
| **Minimum Feedrates** | | | | |
| `machine_min_extruding_rate` | double[] | Printer | F:2617 | Minimum feedrate when extruding: Minimum feedrate when extruding (M205 S) |
| `machine_min_travel_rate` | double[] | Printer | F:2641 | Minimum travel feedrate: Minimum travel feedrate (M205 T) |

#### Printer > Multiple extruders (1)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Position** | | | | |
| `extruder_offset` | Vec2d[] | Printer | F:966 | Extruder offset: If your firmware doesn't handle the extruder displacement you need the G-code to take it into account. |

#### Printer > Printer notes (1)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Notes** | | | | |
| `printer_notes` | string | printer | C:227 | Printer notes: You can put your notes regarding the printer here. |

#### Printer > Single extruder MM setup (7)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **Single Extruder MMSetup_Single Extruder Multimaterial Parameters** | | | | |
| `cooling_tube_retraction` | double | Printer | F:689 | Cooling tube position: Distance of the center-point of the cooling tube from the extruder tip. |
| `cooling_tube_length` | double | Printer | F:700 | Cooling tube length: Length of the cooling tube to limit space for cooling moves inside it. |
| `high_current_on_filament_swap` | bool | Printer | F:2030 | High extruder current on filament swap: It may be beneficial to increase the extruder motor current during the filament exchange sequence to allow for rapid ramming feed rates and to over... |
| `enable_pressure_advance_during_ramming` | bool | Printer | F:2041 | Enable pressure advance during ramming: Check to enable pressure advance during ramming. |
| `parking_pos_retraction` | double | Printer | F:2886 | Filament parking position: Distance of the extruder tip from the position where the filament is parked when unloaded. |
| `extra_loading_move` | double | Printer | F:2898 | Extra loading distance: When set to zero, the distance the filament is moved from parking position during load is exactly the same as it was moved back during unload. |
| `multimaterial_purging` | double | Printer | F:2910 | Purging volume: Determines purging volume on the wipe tower. |

#### Object > Extruders (1)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **-** | | | | |
| `extruder` | int | Object | F:948 | Extruder: The extruder to use (unless more specific extruder settings are specified). |

#### Volume > Wipe options (2)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **-** | | | | |
| `wipe_into_infill` | bool | Volume | F:4791 | Wipe into this object's infill: Purging after toolchange will be done inside this object's infills. |
| `wipe_into_objects` | bool | Object | F:4801 | Wipe into this object: Object will be used to purge the nozzle after a toolchange to save material that would otherwise end up in the wipe tower and decrease print time. |

#### Hidden > Layers & Surfaces (24)

| key | type | loc | src:line | meaning |
|---|---|---|---|---|
| **-** | | | | |
| `filament_colour` | string | Filament | F:1090 | Color: Leave unused if the filament profile isn't tied to a specific color. |
| `printer_technology` | enum | printer | C:40 | Printer technology: Printer technology |
| `thumbnails_format` | enum | printer | C:123 | Format of G-code thumbnails: Format of G-code thumbnails: PNG for best quality, JPG for smallest size, QOI for low memory firmware |
| `printer_model` | string | printer | C:213 | Printer type: Type of the printer. |
| `printer_variant` | string | printer | C:220 | Printer variant: Name of the printer variant. |
| `default_print` [3.0] | string | printer | C:239 | Default Print Preset: Name or ID of print preset to use as default when this printer preset is selected. |
| `default_material` [3.0] | string | print | C:246 | Default Material Preset: Name or ID of material preset to use as default when this print preset is selected. |
| `extruder_colour` | string[] | Project | F:959 | Extruder Color |
| `filament_vendor` | string | Filament | F:1519 | (no label/tooltip) |
| `printer_vendor` | string | Printer | F:3062 | Printer vendor: Name of the printer vendor. |
| `wiping_volumes_matrix` | double[] | Project | F:4702 | Purging volumes - matrix: This matrix describes volumes (in cubic milimetres) required to purge the new filament on the wipe tower for any given pair of tools. |
| `wiping_volumes_use_custom_matrix` | bool | Project | F:4715 | (no label/tooltip) |
| `default_tool_print` [3.0] | string | Print | F:5043 | Default Tool Print Preset: Name or ID of tool print preset to use as default when this print preset is selected. |
| `material_type` | string | Material | S:280 | SLA material type: SLA material type |
| `material_vendor` | string | Material | S:483 | (no label/tooltip) |
| **Corrections** | | | | |
| `material_correction` | double[] | Material | S:427 | Correction for expansion: Correction for expansion |
| **Scripts & Substitutions** | | | | |
| `post_process` | string[] | Print | F:3008 | Post-processing scripts: If you want to process the output G-code through custom scripts, just list their absolute paths here. |
| **First layer** | | | | |
| `first_layer_infill_speed` | FloatOrPercentage | Print | F:1727 | First layer infill speed: If expressed as absolute value in mm/s, this speed will be applied to the infill print moves of the first layer. |
| `first_layer_perimeter_speed` [3.0] | FloatOrPercentage | Print | F:1761 | First layer perimeter speed: If expressed as absolute value in mm/s, this speed will be applied to the perimeter print moves of the first layer. |
| `first_layer_external_perimeter_speed` [3.0] | FloatOrPercentage | Print | F:1778 | First layer perimeter speed: If expressed as absolute value in mm/s, this speed will be applied to the external perimeter print moves of the first layer. |
| `first_layer_support_material_speed` [3.0] | FloatOrPercentage | Print | F:1795 | First layer support material speed: If expressed as absolute value in mm/s, this speed will be applied to any support print moves of the first layer. |
| `first_layer_top_solid_infill_speed` [3.0] | FloatOrPercentage | Print | F:1812 | First layer top solid infill speed: If expressed as absolute value in mm/s, this speed will be applied to any top solid print moves of the first layer. |
| `first_layer_gap_fill_speed` [3.0] | FloatOrPercentage | Print | F:1829 | First layer gap fill speed: If expressed as absolute value in mm/s, this speed will be applied to any gap fill print moves of the first layer. |
| **Corrections** | | | | |
| `relative_correction` | double[] | Printer | S:177 | Printer scaling correction: Printer scaling correction |

### PrusaSlicer 2.x keys not (yet) ported to the 3.0 domain (153)

Source: `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp`, kept for loading old configs. Grouped by the defining function; `category` is the 2.x `OptionCategory`-style string where set.

| key | type | section | line | meaning |
|---|---|---|---|---|
| `print_host` | string | PrintConfigDef / - | 439 | Hostname, IP or URL: Slic3r can upload G-code files to a printer host. |
| `printhost_apikey` | string | PrintConfigDef / - | 449 | API Key / Password: Slic3r can upload G-code files to a printer host. |
| `printhost_port` | string | PrintConfigDef / - | 457 | Printer: Name of the printer |
| `printhost_cafile` | string | PrintConfigDef / - | 465 | HTTPS CA File: Custom CA certificate file can be specified for HTTPS OctoPrint connections, in crt/pem format. |
| `printhost_user` | string | PrintConfigDef / - | 475 | User |
| `printhost_password` | string | PrintConfigDef / - | 482 | Password |
| `printhost_ssl_ignore_revoke` | bool | PrintConfigDef / - | 491 | Ignore HTTPS certificate revocation checks: Ignore HTTPS certificate revocation checks in case of missing or offline distribution points. |
| `preset_names` | string[] | PrintConfigDef / - | 499 | Printer preset names: Names of presets related to the physical printer |
| `printhost_authorization_type` | enum | PrintConfigDef / - | 505 | Authorization Type |
| `profile_vendor` | string | PrintConfigDef / - | 516 | Profile vendor: Name of profile vendor |
| `profile_version` | string | PrintConfigDef / - | 523 | Profile version: Version of profile |
| `preset_name` | string | PrintConfigDef / - | 532 | (no label/tooltip) |
| `colorprint_heights` | float[] | PrintConfigDef / - | 902 | Colorprint height: Heights at which a filament change is to occur. |
| `compatible_printers` | string[] | PrintConfigDef / - | 907 | Compatible printers |
| `compatible_printers_condition` | string | PrintConfigDef / - | 913 | Compatible printers condition: A boolean expression using the configuration values of an active printer profile. |
| `compatible_prints` | string[] | PrintConfigDef / - | 922 | Compatible print profiles |
| `compatible_prints_condition` | string | PrintConfigDef / - | 928 | Compatible print profiles condition: A boolean expression using the configuration values of an active print profile. |
| `compatible_printers_condition_cummulative` | string[] | PrintConfigDef / - | 939 | (no label/tooltip) |
| `compatible_prints_condition_cummulative` | string[] | PrintConfigDef / - | 942 | (no label/tooltip) |
| `default_filament_profile` | string[] | PrintConfigDef / - | 1007 | Default filament profile: Default filament profile associated with the current printer profile. |
| `default_print_profile` | string | PrintConfigDef / - | 1014 | Default print profile: Default print profile associated with the current printer profile. |
| `duplicate_distance` | float | PrintConfigDef / - | 1039 | Distance between copies: Distance used for the auto-arrange feature of the plater. |
| `extrusion_axis` | string | PrintConfigDef / - | 1209 | Extrusion axis: Use this option to set the axis letter associated to your printer's extruder (usually E but some printers use A). |
| `filament_load_time` | float[] | PrintConfigDef / - | 1414 | Filament load time: Time for the printer firmware (or the Multi Material Unit 2.0) to load a new filament during a tool change (when executing the T code). |
| `filament_unload_time` | float[] | PrintConfigDef / - | 1440 | Filament unload time: Time for the printer firmware (or the Multi Material Unit 2.0) to unload a filament during a tool change (when executing the T code). |
| `filament_settings_id` | string[] | PrintConfigDef / - | 1547 | (no label/tooltip) |
| `inherits` | string | PrintConfigDef / - | 2058 | Inherits profile: Name of the profile, from which this profile inherits. |
| `inherits_cummulative` | string[] | PrintConfigDef / - | 2068 | (no label/tooltip) |
| `nozzle_diameter` | float[] | PrintConfigDef / - | 2508 | Nozzle diameter: This is the diameter of your extruder nozzle (for example: 0.5, 0.35 etc.) |
| `host_type` | enum | PrintConfigDef / - | 2514 | Host Type: Slic3r can upload G-code files to a printer host. |
| `print_settings_id` | string | PrintConfigDef / - | 2693 | (no label/tooltip) |
| `printer_settings_id` | string | PrintConfigDef / - | 2697 | (no label/tooltip) |
| `physical_printer_settings_id` | string | PrintConfigDef / - | 2701 | (no label/tooltip) |
| `nozzle_high_flow` | bool[] | PrintConfigDef / - | 2848 | High flow nozzle: High flow nozzles allow higher print speeds. |
| `seam_preferred_direction` | float | PrintConfigDef / - | 3010 | Preferred direction of the seam: Seam preferred direction |
| `seam_preferred_direction_jitter` | float | PrintConfigDef / - | 3020 | Seam preferred direction jitter: Preferred direction of the seam - jitter |
| `solid_layers` | int | PrintConfigDef / - | 3145 | Solid layers: Number of solid layers to generate on top and bottom surfaces. |
| `solid_min_thickness` | float | PrintConfigDef / - | 3152 | Minimum thickness of a top / bottom shell: Minimum thickness of a top / bottom shell |
| `support_material_auto` | bool | PrintConfigDef / L("Support material") | 3321 | Auto generated supports: If checked, supports will be generated automatically based on the overhang threshold value. |
| `filament_<opt>` (17 keys: retract_length, retract_lift, retract_lift_above, retract_lift_below, retract_speed, travel_max_lift, deretract_speed, retract_restart_extra, retract_before_travel, retract_length_toolchange, retract_restart_extra_toolchange, retract_layer_change, wipe, travel_lift_before_obstacle, travel_ramping_lift, retract_before_wipe, travel_slope) | it_opt->second.type | PrintConfigDef / - | 4086 | (no label/tooltip) |
| `filament_<opt>` (1 keys: seam_gap_distance) | (float|%)[] | PrintConfigDef / - | 4110 | (no label/tooltip) |
| `default_sla_material_profile` | string | PrintConfigDef / - | 4681 | Default SLA material profile: Default print profile associated with the current printer profile. |
| `sla_material_settings_id` | string | PrintConfigDef / - | 4688 | (no label/tooltip) |
| `default_sla_print_profile` | string | PrintConfigDef / - | 4692 | Default SLA material profile: Default print profile associated with the current printer profile. |
| `sla_print_settings_id` | string | PrintConfigDef / - | 4699 | (no label/tooltip) |
| `material_ow_<opt>` (11 keys: support_head_front_diameter, branchingsupport_head_front_diameter, support_head_penetration, branchingsupport_head_penetration, support_head_width, branchingsupport_head_width, support_pillar_diameter, branchingsupport_pillar_diameter, elefant_foot_compensation, absolute_correction, support_points_density_relative) | it_opt->second.type | PrintConfigDef / - | 4948 | (no label/tooltip) |
| `load` | string[] | CLIInputConfigDef / - | 5862 | Load config file: Load configuration from the specified file. |
| `printer-profile` | string | CLIInputConfigDef / - | 5866 | Printer preset name: Name of the printer preset used for slicing. |
| `print-profile` | string | CLIInputConfigDef / - | 5871 | Print preset name: Name of the print preset used for slicing. |
| `material-profile` | string[] | CLIInputConfigDef / - | 5876 | Material preset name(s): Name(s) of the material preset(s) used for slicing. |
| `help` | bool | CLIActionsConfigDef / - | 5889 | Help: Show this help. |
| `help_fff` | bool | CLIActionsConfigDef / - | 5895 | Help (FFF options): Show the full list of print/G-code configuration options. |
| `help_sla` | bool | CLIActionsConfigDef / - | 5900 | Help (SLA options): Show the full list of SLA print configuration options. |
| `query-printer-models` | bool | CLIActionsConfigDef / - | 5905 | Get list of printer models: Get list of installed printer models into JSON. |
| `query-print-filament-profiles` | bool | CLIActionsConfigDef / - | 5915 | Get list of print profiles and filament profiles for the selected printer profile: Get list of print profiles and filament profiles for the selected 'printer-profile' into JSON. |
| `gcodeviewer` | bool | CLIActionsConfigDef / - | 5924 | G-code viewer: Visualize an already sliced and saved G-code |
| `save` | string | CLIActionsConfigDef / - | 5932 | Save config file: Save configuration to the specified file. |
| `info` | bool | CLIActionsConfigDef / - | 5939 | Output Model Info: Write information about the model to the console. |
| `export_obj` | bool | CLIActionsConfigDef / - | 5944 | Export OBJ: Export the model(s) as OBJ. |
| `export_stl` | bool | CLIActionsConfigDef / - | 5949 | Export STL: Export the model(s) as STL. |
| `export_3mf` | bool | CLIActionsConfigDef / - | 5956 | Export 3MF: Export the model(s) as 3MF. |
| `slice` | bool | CLIActionsConfigDef / - | 5964 | Slice: Slice the model as FFF or SLA based on the printer_technology configuration value and export the result. |
| `export_sla` | bool | CLIActionsConfigDef / - | 5972 | Export SLA: Slice the model and export SLA printing layers as PNG. |
| `export_gcode` | bool | CLIActionsConfigDef / - | 5978 | Export G-code: Slice the model and export toolpaths as G-code. |
| `align_xy` | point | CLITransformConfigDef / - | 5990 | Align XY: Align the model to the given point. |
| `cut` | float | CLITransformConfigDef / - | 5995 | Cut: Cut model at the given Z. |
| `center` | point | CLITransformConfigDef / - | 6000 | Center: Center the print around the given center. |
| `dont_arrange` | bool | CLITransformConfigDef / - | 6005 | Don't arrange: Do not rearrange the given models before merging and keep their original XY coordinates. |
| `ensure_on_bed` | bool | CLITransformConfigDef / - | 6009 | Ensure on bed: Lift the object above the bed when it is partially below. |
| `duplicate` | int | CLITransformConfigDef / - | 6014 | Duplicate: Multiply copies by this factor. |
| `duplicate_grid` | point | CLITransformConfigDef / - | 6019 | Duplicate by grid: Multiply copies by creating a grid. |
| `merge` | bool | CLITransformConfigDef / - | 6023 | Merge: Arrange the supplied models in a plate and merge them in a single model in order to perform actions once. |
| `rotate` | float | CLITransformConfigDef / - | 6028 | Rotate: Rotation angle around the Z axis in degrees. |
| `rotate_x` | float | CLITransformConfigDef / - | 6033 | Rotate around X: Rotation angle around the X axis in degrees. |
| `rotate_y` | float | CLITransformConfigDef / - | 6038 | Rotate around Y: Rotation angle around the Y axis in degrees. |
| `scale` | float|% | CLITransformConfigDef / - | 6043 | Scale: Scaling factor or percentage. |
| `split` | bool | CLITransformConfigDef / - | 6048 | Split: Detect unconnected parts in the given model(s) and split them into separate objects. |
| `scale_to_fit` | point3 | CLITransformConfigDef / - | 6052 | Scale to Fit: Scale to fit the given volume. |
| `ignore_nonexistent_config` | bool | CLIMiscConfigDef / - | 6062 | Ignore non-existent config files: Do not fail if a file supplied to --load does not exist. |
| `config_compatibility` | enum | CLIMiscConfigDef / - | 6066 | Forward-compatibility rule when loading configurations from config files and project files (3MF, AMF).: This version of PrusaSlicer may not understand configurations produced by the newest PrusaSlicer versions. |
| `output` | string | CLIMiscConfigDef / - | 6078 | Output File: The file where the output will be written (if not specified, it will be based on the input file). |
| `datadir` | string | CLIMiscConfigDef / - | 6083 | Data directory: Load and store settings at the given directory. |
| `threads` | int | CLIMiscConfigDef / - | 6087 | Maximum number of threads: Sets the maximum number of threads the slicing process will use. |
| `loglevel` | int | CLIMiscConfigDef / - | 6092 | Logging level: Sets logging sensitivity. |
| `opengl-aa` | bool | CLIMiscConfigDef / - | 6099 | Automatic OpenGL antialiasing samples number selection: Automatically select the highest number of samples for OpenGL antialiasing. |
| `opengl-version` | string | CLIMiscConfigDef / - | 6106 | OpenGL version: Select a specific version of OpenGL |
| `opengl-compatibility` | bool | CLIMiscConfigDef / - | 6112 | OpenGL compatibility profile: Enable OpenGL compatibility profile |
| `opengl-debug` | bool | CLIMiscConfigDef / - | 6118 | OpenGL debug output: Activate OpenGL debug output on graphic cards which support it (OpenGL 4.3 or higher) |
| `single_instance` | bool | CLIMiscConfigDef / - | 6125 | Single instance mode: If enabled, the command line arguments are sent to an existing instance of GUI PrusaSlicer, or an existing PrusaSlicer window is activated. |
| `delete-after-load` | string | CLIMiscConfigDef / - | 6131 | Delete files after loading: Delete files after loading. |
| `sw_renderer` | bool | CLIMiscConfigDef / - | 6136 | Render with a software renderer: Render with a software renderer. |
| `webdev` | bool | CLIMiscConfigDef / - | 6143 | Enable webdev tools: Enable webdev tools |
| `single_instance_on_url` | bool | CLIMiscConfigDef / - | 6147 | Single instance mode for prusaslicer url: Works as single_instance but only if prusaslicer url is present. |
| `zhop` | float | ReadOnlySlicingStatesConfigDef / - | 6165 | Current z-hop: Contains z-hop present at the beginning of the custom G-code block. |
| `position` | float[] | ReadWriteSlicingStatesConfigDef / - | 6174 | Position: Position of the extruder at the beginning of the custom G-code block. |
| `e_retracted` | float[] | ReadWriteSlicingStatesConfigDef / - | 6179 | Retraction: Retraction state at the beginning of the custom G-code block. |
| `e_restart_extra` | float[] | ReadWriteSlicingStatesConfigDef / - | 6184 | Extra deretraction: Currently planned extra extruder priming after deretraction. |
| `e_position` | float[] | ReadWriteSlicingStatesConfigDef / - | 6188 | Absolute E position: Current position of the extruder axis. |
| `current_extruder` | int | OtherSlicingStatesConfigDef / - | 6197 | Current extruder: Zero-based index of currently used extruder. |
| `current_object_idx` | int | OtherSlicingStatesConfigDef / - | 6201 | Current object index: Specific for sequential printing. |
| `has_single_extruder_multi_material_priming` | bool | OtherSlicingStatesConfigDef / - | 6205 | Has single extruder MM priming: Are the extra multi-material priming regions used in this print? |
| `has_wipe_tower` | bool | OtherSlicingStatesConfigDef / - | 6209 | Has wipe tower: Whether or not wipe tower is being generated in the print. |
| `initial_extruder` | int | OtherSlicingStatesConfigDef / - | 6213 | Initial extruder: Zero-based index of the first extruder used in the print. |
| `initial_filament_type` | string | OtherSlicingStatesConfigDef / - | 6217 | Initial filament type: String containing filament type of the first used extruder. |
| `initial_tool` | int | OtherSlicingStatesConfigDef / - | 6222 | Initial tool: Zero-based index of the first extruder used in the print. |
| `is_extruder_used` | bool[] | OtherSlicingStatesConfigDef / - | 6226 | Is extruder used?: Vector of booleans stating whether a given extruder is used in the print. |
| `extruded_volume` | float[] | PrintStatisticsConfigDef / - | 6235 | Volume per extruder: Total filament volume extruded per extruder during the entire print. |
| `normal_print_time` | string | PrintStatisticsConfigDef / - | 6239 | Print time (normal mode): Estimated print time when printed in normal mode (i.e. |
| `num_printing_extruders` | int | PrintStatisticsConfigDef / - | 6243 | Number of printing extruders: Number of extruders used during the print. |
| `print_time` | string | PrintStatisticsConfigDef / - | 6247 | Print time (normal mode): Estimated print time when printed in normal mode (i.e. |
| `printing_filament_types` | string | PrintStatisticsConfigDef / - | 6251 | Used filament types: Comma-separated list of all filament types used during the print. |
| `silent_print_time` | string | PrintStatisticsConfigDef / - | 6255 | Print time (silent mode): Estimated print time when printed in silent mode. |
| `total_cost` | float | PrintStatisticsConfigDef / - | 6259 | Total cost: Total cost of all material used in the print. |
| `total_weight` | float | PrintStatisticsConfigDef / - | 6263 | Total weight: Total weight of the print. |
| `total_wipe_tower_cost` | float | PrintStatisticsConfigDef / - | 6267 | Total wipe tower cost: Total cost of the material wasted on the wipe tower. |
| `total_wipe_tower_filament` | float | PrintStatisticsConfigDef / - | 6271 | Wipe tower volume: Total filament volume extruded on the wipe tower. |
| `used_filament` | float | PrintStatisticsConfigDef / - | 6275 | Used filament: Total length of filament used in the print. |
| `total_toolchanges` | int | PrintStatisticsConfigDef / - | 6279 | Total number of toolchanges: Number of toolchanges during the print. |
| `extruded_volume_total` | float | PrintStatisticsConfigDef / - | 6283 | Total volume: Total volume of filament used during the entire print. |
| `extruded_weight` | float[] | PrintStatisticsConfigDef / - | 6287 | Weight per extruder: Weight per extruder extruded during the entire print. |
| `extruded_weight_total` | float | PrintStatisticsConfigDef / - | 6291 | Total weight: Total weight of the print. |
| `total_layer_count` | int | PrintStatisticsConfigDef / - | 6295 | Total layer count: Number of layers in the entire print. |
| `num_objects` | int | ObjectsInfoConfigDef / - | 6304 | Number of objects: Total number of objects in the print. |
| `num_instances` | int | ObjectsInfoConfigDef / - | 6308 | Number of instances: Total number of object instances in the print, summed over all objects. |
| `scale` | string[] | ObjectsInfoConfigDef / - | 6312 | Scale per object: Contains a string with the information about what scaling was applied to the individual objects. |
| `input_filename_base` | string | ObjectsInfoConfigDef / - | 6318 | Input filename without extension: Source filename of the first object, without extension. |
| `first_layer_print_convex_hull` | points | DimensionsConfigDef / - | 6330 | First layer convex hull: Vector of points of the first layer convex hull. |
| `first_layer_print_min` | float[] | DimensionsConfigDef / - | 6335 | Bottom-left corner of first layer bounding box |
| `first_layer_print_max` | float[] | DimensionsConfigDef / - | 6339 | Top-right corner of first layer bounding box |
| `first_layer_print_size` | float[] | DimensionsConfigDef / - | 6343 | Size of the first layer bounding box |
| `print_bed_min` | float[] | DimensionsConfigDef / - | 6347 | Bottom-left corner of print bed bounding box |
| `print_bed_max` | float[] | DimensionsConfigDef / - | 6351 | Top-right corner of print bed bounding box |
| `print_bed_size` | float[] | DimensionsConfigDef / - | 6355 | Size of the print bed bounding box |
| `timestamp` | string | TimestampsConfigDef / - | 6364 | Timestamp: String containing current time in yyyyMMdd-hhmmss format. |
| `year` | int | TimestampsConfigDef / - | 6368 | Year |
| `month` | int | TimestampsConfigDef / - | 6371 | Month |
| `day` | int | TimestampsConfigDef / - | 6374 | Day |
| `hour` | int | TimestampsConfigDef / - | 6377 | Hour |
| `minute` | int | TimestampsConfigDef / - | 6380 | Minute |
| `second` | int | TimestampsConfigDef / - | 6383 | Second |
| `num_extruders` | int | OtherPresetsConfigDef / - | 6391 | Number of extruders: Total number of extruders, regardless of whether they are used in the current print. |
| `print_preset` | string | OtherPresetsConfigDef / - | 6395 | Print preset name: Name of the print preset used for slicing. |
| `filament_preset` | string[] | OtherPresetsConfigDef / - | 6399 | Filament preset name: Names of the filament presets used for slicing. |
| `printer_preset` | string | OtherPresetsConfigDef / - | 6404 | Printer preset name: Name of the printer preset used for slicing. |
| `physical_printer_preset` | string | OtherPresetsConfigDef / - | 6408 | Physical printer name: Name of the physical printer used for slicing. |
| `layer_num` | int | CustomGcodeSpecificConfigDef / - | 6434 | Layer number: Zero-based index of the current layer (i.e. |
| `layer_z` | float | CustomGcodeSpecificConfigDef / - | 6438 | Layer Z: Height of the current layer above the print bed, measured to the top of the layer. |
| `max_layer_z` | float | CustomGcodeSpecificConfigDef / - | 6442 | Maximal layer Z: Height of the last layer above the print bed. |
| `filament_extruder_id` | int | CustomGcodeSpecificConfigDef / - | 6446 | Current extruder index: Zero-based index of currently used extruder (i.e. |
| `previous_extruder` | int | CustomGcodeSpecificConfigDef / - | 6450 | Previous extruder: Index of the extruder that is being unloaded. |
| `next_extruder` | int | CustomGcodeSpecificConfigDef / - | 6454 | Next extruder: Index of the extruder that is being loaded. |
| `toolchange_z` | float | CustomGcodeSpecificConfigDef / - | 6458 | Toolchange Z: Height above the print bed when the toolchange takes place. |
| `color_change_extruder` | int | CustomGcodeSpecificConfigDef / - | 6462 | Color change extruder: Index of the extruder for which color change will be performed. |


## Appendix B: SuperSlicer settings

### SuperSlicer settings by GUI page and group

GUI layout source: `SuperSlicer@1f3d287:resources/ui_layout/default/*.ui` (parsed by `SuperSlicer@1f3d287:src/slic3r/GUI/Tab.cpp`); definitions: `SuperSlicer@1f3d287:src/libslic3r/PrintConfig.cpp` (line column). Keys present in PrusaSlicer (2.x legacy or 3.0) are listed by name only on one line per group (their meaning is in the PrusaSlicer table); **SuperSlicer-only keys get a full row and the mark [SS]**.

#### print.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Dependencies > Profile dependencies | shared: `compatible_printers`, `compatible_printers_condition` | | | |
| Perimeters & Shell > Vertical shells | shared: `perimeters`, `s_wall_thickness`(script), `perimeter_generator`, `spiral_vase` | | | |
| Perimeters & Shell > Vertical shells | `perimeters_hole` [SS] | int | 5071 | Max perimeter count for holes: This option sets the number of perimeters to have over holes. |
| Perimeters & Shell > Horizontal shells | shared: `top_solid_layers`, `bottom_solid_layers`, `top_solid_min_thickness`, `bottom_solid_min_thickness`, `ensure_vertical_shell_thickness` | | | |
| Perimeters & Shell > Horizontal shells | `solid_over_perimeters` [SS] | int | 6277 | No solid infill over perimeters: In sloping areas, when you have a number of top / bottom solid layers and few perimeters, it may be necessary to put some solid infill above/below... |
| Perimeters & Shell > Infill | shared: `fill_pattern`, `fill_density`, `top_fill_pattern` | | | |
| Perimeters & Shell > Infill | `infill_dense` [SS] | bool | 3594 | Dense infill layer: Enables the creation of a support layer under the first solid layer. |
| Perimeters & Shell > Quality | shared: `only_one_perimeter_first_layer`, `extra_perimeters_on_overhangs`, `thin_walls`, `overhangs` | | | |
| Perimeters & Shell > Quality | `only_one_perimeter_top` [SS] | bool | 4471 | Only one perimeter on Top surfaces: Use only one perimeter on flat top surface, to give more space to the top infill pattern. |
| Perimeters & Shell > Quality | `min_width_top_surface` [SS] | float|% | 4341 | Minimum top width for infill: If a top surface has to be printed and it's partially covered by another layer, it won't be considered at a top layer where its width is below this... |
| Perimeters & Shell > Quality | `extra_perimeters_odd_layers` [SS] | bool | 1808 | Extra perimeter on even layers: Add one perimeter every even layer (and not on odd layers like the first one). |
| Perimeters & Shell > Quality | `extra_perimeters_below_area` [SS] | float|% | 1781 | Extra perimeters on small areas: After laying all the perimeters, if there is an area smaler (in mm²) than this value, then fill it with more perimeters. |
| Perimeters & Shell > Quality | `thin_perimeters` [SS] | percent | 6864 | Overlapping external perimeter: Allow outermost perimeter to overlap itself to avoid the use of thin walls. |
| Perimeters & Shell > Quality | `thin_perimeters_all` [SS] | percent | 6877 | Overlapping all perimeters: Allow all perimeters to overlap, instead of just external ones. |
| Perimeters & Shell > Quality | `thin_walls_min_width` [SS] | float|% | 6900 | Thin walls min width: Minimum width for the extrusion to be extruded (widths lower than the nozzle diameter will be over-extruded at the nozzle diameter). |
| Perimeters & Shell > Quality | `thin_walls_overlap` [SS] | float|% | 6913 | Thin wall overlap: Overlap between the thin wall and the perimeters. |
| Perimeters & Shell > Quality | `thin_walls_merge` [SS] | bool | 6924 | Thin wall merge: Allow the external perimeter to merge the thin walls in the path. |
| Perimeters & Shell > Quality | `perimeter_direction` [SS] | enum | 4960 | Perimeter direction: Default direction to print the perimeters (contours and holes): clockwise (CW) or counter-clockwise (CCW). |
| Perimeters & Shell > Quality | `perimeter_reverse` [SS] | bool | 5022 | Perimeter reversal on even layers: On even layers, all perimeter loops are reversed (it disables the overhang reversal, so it doesn't double-reverse).That setting will likely create... |
| Perimeters & Shell > Quality | `overhangs_reverse` [SS] | bool | 4812 | Overhang reversal on even layers: Extrude perimeters that have an overhanging part in the reverse direction on even layers (not on odd layers like the first one). |
| Perimeters & Shell > Quality | `overhangs_reverse_threshold` [SS] | float|% | 4822 | Overhang reversal threshold: Number of mm the overhang need to be for the reversal to be considered useful. |
| Perimeters & Shell > Avoid crossing perimeters | shared: `avoid_crossing_perimeters`, `avoid_crossing_perimeters_max_detour`, `avoid_crossing_curled_overhangs` | | | |
| Perimeters & Shell > Avoid crossing perimeters | `avoid_crossing_not_first_layer` [SS] | bool | 742 | Don't avoid crossing on 1st layer: Disable 'Avoid crossing perimeters' for the first layer. |
| Perimeters & Shell > Avoid crossing perimeters | `avoid_crossing_top` [SS] | bool | 762 | Avoid top surface for travels: When using 'Avoid crossing perimeters', consider the top surfaces as a void, to avoid travelling over them if possible. |
| Perimeters & Shell > Avoid crossing perimeters | `avoid_travel_island` [SS] | bool | 769 | Find smallest crossing between islands: When using 'Avoid crossing perimeters', if you neeed to travel between two islands, find the two poitns that are nearest to each other. |
| Perimeters & Shell > Avoid crossing perimeters | `avoid_travel_island_weight` [SS] | float | 777 | Weight for internal distance while choosing island crossing: When using 'Avoid crossing perimeters', and 'Find smallest travel between islands', also consider the distance bewteen the crossing poitns and the... |
| Perimeters & Shell > Seam | shared: `s_seam_position`(script), `staggered_inner_seams` | | | |
| Perimeters & Shell > Seam | `seam_angle_cost` [SS] | percent | 5673 | Seam angle cost: Cost of placing the seam at a bad angle. |
| Perimeters & Shell > Seam | `seam_travel_cost` [SS] | percent | 5766 | Seam travel cost: Cost of moving the extruder. |
| Perimeters & Shell > Seam | `seam_visibility` [SS] | bool | 5777 | Seam visibility check: Check and penalize seams that are the most visible. |
| Perimeters & Shell > Seam | `seam_notch_inner` [SS] | float|% | 5736 | Seam notch for round holes: In convex holes (circular/oval), it's sometimes very problematic to have a little buldge from the seam. |
| Perimeters & Shell > Seam | `seam_notch_outer` [SS] | float|% | 5751 | Seam notch for round perimeters: In convex perimeters (circular/oval), it's sometimes very problematic to have a little buldge from the seam. |
| Perimeters & Shell > Seam | `seam_notch_all` [SS] | float|% | 5710 | Seam notch: It's sometimes very problematic to have a little buldge from the seam. |
| Perimeters & Shell > Seam | `seam_notch_angle` [SS] | float | 5724 | Seam notch maximum angle: If the (external) angle at the seam is higher than this value, then no notch will be set. |
| Perimeters & Shell > Gap Fill | shared: `gap_fill_enabled` | | | |
| Perimeters & Shell > Gap Fill | `gap_fill_last` [SS] | bool | 3226 | Gapfill: after last perimeter: All gaps, between the last perimeter and the infill, which are thinner than a perimeter will be filled by gapfill. |
| Perimeters & Shell > Gap Fill | `gap_fill_no_overhang` [SS] | bool | 3289 | No gap fill on overhang areas: Prevent gapfill into overhang areas. |
| Perimeters & Shell > Gap Fill | `gap_fill_extension` [SS] | float|% | 3185 | Gap fill: extra extension: Increase the length of all gapfills by this amount (may overextrude a little bit) Can be a % of the extrusion width Is also used by infill's gapfill. |
| Perimeters & Shell > Gap Fill | `gap_fill_perimeter` [SS] | bool | 3309 | Allow Perimeter inside Gap fill: Allow to create a perimeter inside a gapfill area if it's possible. |
| Perimeters & Shell > Gap Fill | `gap_fill_min_width` [SS] | float|% | 3275 | Gapfill: Min width: This setting represents the minimum width of a gapfill. |
| Perimeters & Shell > Gap Fill | `gap_fill_max_width` [SS] | float|% | 3234 | Gapfill: Max width: This setting represents the maximum width of a gapfill. |
| Perimeters & Shell > Gap Fill | `gap_fill_min_area` [SS] | float|% | 3248 | Gapfill: Min surface: This setting represents the minimum mm² for a gapfill extrusion to be created. |
| Perimeters & Shell > Gap Fill | `gap_fill_min_length` [SS] | float|% | 3261 | Gapfill: Min length: This setting represents the minimum mm for a gapfill extrusion to be extruded. |
| Perimeters & Shell > Advanced | shared: `fuzzy_skin`, `fuzzy_skin_thickness`, `fuzzy_skin_point_dist` | | | |
| Perimeters & Shell > Advanced | `no_perimeter_unsupported_algo` [SS] | enum | 4833 | No perimeters on bridge areas: Experimental option to remove perimeters where there is nothing under them and where a bridged infill should be better. |
| Perimeters & Shell > Advanced | `perimeter_loop` [SS] | bool | 4988 | Perimeters loop: Join the perimeters to create only one continuous extrusion without any z-hop. |
| Perimeters & Shell > Advanced | `perimeter_loop_seam` [SS] | enum | 4997 | Perimeter loop seam: Position of perimeters starting points. |
| Perimeters & Shell > Advanced | `perimeter_round_corners` [SS] | bool | 5030 | Round corners for perimeters: Internal perimeters will go around sharp corners by turning around instead of making the same sharp corner. |
| Perimeters & Shell > External perimeter first | shared: `external_perimeters_first` | | | |
| Perimeters & Shell > External perimeter first | `external_perimeters_first_force` [SS] | bool | 1725 | External perimeters first: force for all: Print all external contours & periemter first, then the internal ones. |
| Perimeters & Shell > External perimeter first | `external_perimeters_nothole` [SS] | bool | 1753 | Ext peri first for outer side: Only do the vase trick on the external side. |
| Perimeters & Shell > External perimeter first | `external_perimeters_hole` [SS] | bool | 1761 | ext peri first for inner side: Only do the vase trick on the external side. |
| Perimeters & Shell > External perimeter first | `external_perimeters_vase` [SS] | bool | 1733 | External perimeters in vase mode: Print contour perimeters in two circles, in a continuous way, like for a vase mode. |
| Perimeters & Shell > External perimeter first | `external_perimeters_vase_min_height` [SS] | float|% | 1743 | Minimum extrusion height: When using the 'external_perimeters_vase' (scarf seam) setting, it will use this setting to compute the base height (it doesn't start at 0), so be... |
| Perimeters & Shell > External perimeter first | `perimeter_bonding` [SS] | percent | 4885 | Perimeter bonding: This setting may slightly degrade the quality of your external perimeter, in exchange for a better bonding between perimeters.Use it if you have gr... |
| Perimeters & Shell > Arachne perimeter generator (variable width) | shared: `wall_transition_angle`, `wall_transition_filter_deviation`, `wall_transition_length`, `wall_distribution_count`, `min_bead_width`, `min_feature_size` | | | |
| Infill > Infill | shared: `fill_density`, `fill_pattern`, `infill_anchor_max`, `infill_anchor`, `top_fill_pattern`, `bottom_fill_pattern` | | | |
| Infill > Infill | `infill_connection` [SS] | enum | 3520 | Connection of sparse infill lines: Give to the infill algorithm if the infill needs to be connected, and on which perimeters Can be useful for art or with high infill/perimeter overlap. |
| Infill > Infill | `fill_aligned_z` [SS] | bool | 2668 | Align sparse infill in z: The voids of the pattern of sparse infill grows with the extrusion width, to keep the same percentage of fill. |
| Infill > Infill | `solid_fill_pattern` [SS] | enum | 1532 | Solid fill pattern: Fill pattern for solid (internal) infill. |
| Infill > Infill | `infill_connection_solid` [SS] | enum | 3579 | Connection of solid infill lines: Give to the infill algorithm if the infill needs to be connected, and on which perimeters Can be useful for art or with high infill/perimeter overlap. |
| Infill > Infill | `infill_filled_solid` [SS] | bool | 3698 | GapFill for solid infill areas: On solid infill areas, add gapfill where the infill pattern can't go. |
| Infill > Infill | `infill_connection_top` [SS] | enum | 3535 | Connection of top infill lines: Give to the infill algorithm if the infill needs to be connected, and on which perimeters Can be useful for art or with high infill/perimeter overlap. |
| Infill > Infill | `infill_filled_top` [SS] | bool | 3705 | GapFill for top infill areas: On top infill areas, add gapfill where the infill pattern can't go. |
| Infill > Infill | `infill_connection_bottom` [SS] | enum | 3550 | Connection of bottom infill lines: Give to the infill algorithm if the infill needs to be connected, and on which perimeters Can be useful for art or with high infill/perimeter overlap. |
| Infill > Infill | `infill_filled_bottom` [SS] | bool | 3691 | GapFill for bottom infill areas: On bottom infill areas, add gapfill where the infill pattern can't go. |
| Infill > Infill | `bridge_fill_pattern` [SS] | enum | 909 | Bridging fill pattern: Fill pattern for bridges and internal bridge infill. |
| Infill > Infill | `infill_connection_bridge` [SS] | enum | 3565 | Connection of bridged infill lines: Give to the bridge infill algorithm if the infill needs to be connected, and on which perimeters. |
| Infill > Reducing printing time | shared: `infill_every_layers` | | | |
| Infill > Reducing printing time | `infill_dense` [SS] | bool | 3594 | Dense infill layer: Enables the creation of a support layer under the first solid layer. |
| Infill > Reducing printing time | `infill_dense_algo` [SS] | enum | 3603 | Dense infill algorithm: Choose the way the dense layer is laid out. |
| Infill > Reducing printing time | `internal_bridge_expansion` [SS] | bool | 3795 | Extends internal bridge to infill: When creating internal bridges, extends the line to the nearest internal line it can use to support itself. |
| Infill > Infill angle | shared: `fill_angle`, `bridge_angle` | | | |
| Infill > Infill angle | `fill_angle_increment` [SS] | float | 2706 | Fill angle increment: Add this angle each layer to the base angle for infill. |
| Infill > Infill angle | `fill_angle_cross` [SS] | bool | 2692 | Alternate Fill Angle: It's better for some infill like rectilinear to rotate 90° each layer. |
| Infill > Infill angle | `fill_angle_follow_model` [SS] | bool | 2699 | Rotate with object: If your object has a z-rotation, then the infill will also be rotated by this value. |
| Infill > Advanced | shared: `solid_infill_every_layers`, `solid_infill_below_area`, `only_retract_when_crossing_perimeters`, `infill_first` | | | |
| Infill > Advanced | `solid_infill_below_layer_area` [SS] | float | 5994 | Solid infill layer threshold area: Force solid infill for the whole layer when the combined area of all objects that are printed at the same layer is smaller than this value. |
| Infill > Advanced | `solid_infill_below_width` [SS] | float|% | 6003 | Solid infill threshold width: Force solid infill for parts of regions having a smaller width than the specified threshold. |
| Infill > Advanced | `internal_bridge_min_width` [SS] | float|% | 3820 | Internal bridge infill threshold width: Minimum width for the solid infill to convert into an internal bridge infill. |
| Infill > Advanced | `external_infill_margin` [SS] | float|% | 1589 | Default infill margin: This parameter grows the top/bottom/solid layers by the specified mm to anchor them into the sparse infill and support the perimeters above. |
| Infill > Advanced | `bridged_infill_margin` [SS] | float|% | 882 | Bridge margin: This parameter grows the bridged solid infill layers by the specified mm to anchor them into the sparse infill and over the perimeters below. |
| Infill > Advanced | `enforce_retract_first_layer` [SS] | bool | 1567 | Don't check crossings for retraction on first layer: let the retraction happens on the first layer even if the travel path does not exceed the upper layer's perimeters. |
| Infill > Advanced Infill options | `fill_smooth_distribution` [SS] | percent | 2875 | Ironing flow distribution: This is the percentage of the flow that is used for the second ironing pass. |
| Infill > Advanced Infill options | `fill_smooth_width` [SS] | float|% | 2860 | Ironing width: This is the width of the ironing pass, in a % of the top infill extrusion width, should not be more than 50% (two times more lines, 50% overlap). |
| Infill > Advanced Infill options | `enforce_full_fill_volume` [SS] | bool | 1557 | Enforce 100% fill volume: Experimental option which modifies (in solid infill) fill flow to have the exact amount of plastic inside the volume to fill (it generally changes... |
| Infill > Advanced Infill options | `small_area_infill_flow_compensation_model` [SS] | Graph | 2888 | Flow Compensation Model: Flow Compensation Model, used to adjust the flow for small solid infill lines. |
| Infill > Ironing post-process (This will go on top of infills and perimeters) | shared: `ironing`, `ironing_type`, `ironing_flowrate`, `ironing_spacing` | | | |
| Infill > Ironing post-process (This will go on top of infills and perimeters) | `ironing_angle` [SS] | float | 3882 | Ironing angle: Ironing post-process angle. |
| Slicing > Layer height | shared: `layer_height`, `first_layer_height` | | | |
| Slicing > Filtering | shared: `resolution` | | | |
| Slicing > Filtering | `resolution_internal` [SS] | float | 5428 | Internal resolution: Minimum detail resolution, used for internal structures (gapfill and some infill patterns). |
| Slicing > Filtering | `model_precision` [SS] | float | 4376 | Model rounding precision: This is the rounding error of the input object. |
| Slicing > Filtering | `bridge_precision` [SS] | float|% | 967 | Bridge precision: This is the precision of the bridge detection. |
| Slicing > Part merging | shared: `slice_closing_radius` | | | |
| Slicing > Part merging | `slice_merge_min_width` [SS] | float|% | 5904 | Slice mmu merge: min width: When you have in an object multiple parts, the last one in the list has the highest priority and will be used where it intersects other parts. |
| Slicing > Part merging | `slice_merge_dent` [SS] | float|% | 5890 | Slice mmu merge: dent: When you have in an object multiple parts, the last one in the list has the highest priority and will be used where it intersects other parts. |
| Slicing > Modifying slices | shared: `xy_size_compensation` | | | |
| Slicing > Modifying slices | `curve_smoothing_precision` [SS] | float | 1322 | Curve smoothing precision: These parameters allow the slicer to smooth the angles in each layer. |
| Slicing > Modifying slices | `curve_smoothing_angle_convex` [SS] | float | 1293 | Curve smoothing minimum angle (convex): Minimum (convex) angle at a vertex to enable smoothing (trying to create a curve around the vertex). |
| Slicing > Modifying slices | `curve_smoothing_angle_concave` [SS] | float | 1308 | Curve smoothing minimum angle (concave): Minimum (concave) angle at a vertex to enable smoothing (trying to create a curve around the vertex). |
| Slicing > Modifying slices | `curve_smoothing_cutoff_dist` [SS] | float | 1338 | Curve smoothing cutoff dist: Maximum distance between two points to allow adding new ones. |
| Slicing > Modifying slices | `xy_inner_size_compensation` [SS] | float | 7564 | Inner XY size compensation: The object will be grown/shrunk in the XY plane by the configured value (negative = inwards = remove area, positive = outwards = add area). |
| Slicing > Modifying slices | `first_layer_size_compensation` [SS] | float | 2815 | XY First layer compensation: The first layer will be grown / shrunk in the XY plane by the configured value to compensate for the 1st layer squish aka an Elephant Foot effect. |
| Slicing > Modifying slices | `first_layer_size_compensation_layers` [SS] | int | 2825 | XY First layer compensation height in layers: The number of layers on which the elephant foot compensation will be active. |
| Slicing > Modifying slices | `first_layer_size_compensation_no_collapse` [SS] | bool | 2838 | XY First layer compensation: no collapse: The compensations won't shrink thin areas below a threshold for the first layer(s). |
| Slicing > Modifying slices | `hole_size_compensation` [SS] | float | 7575 | XY holes compensation: The convex holes will be grown / shrunk in the XY plane by the configured value (negative = inwards = remove area, positive = outwards = add area,... |
| Slicing > Modifying slices | `hole_size_threshold` [SS] | float | 7587 | XY holes threshold: Maximum area for the hole where the hole_size_compensation will apply fully. |
| Slicing > Modifying slices | `hole_to_polyhole` [SS] | bool | 7598 | Convert round holes to polyholes: Search for almost-circular holes that span more than one layer and convert the geometry to polyholes. |
| Slicing > Modifying slices | `hole_to_polyhole_threshold` [SS] | float|% | 7608 | Polyhole detection margin: Maximum deflection of a point to the estimated radius of the circle. |
| Slicing > Modifying slices | `hole_to_polyhole_twisted` [SS] | bool | 7621 | Polyhole twist: Rotate the polyhole every layer. |
| Slicing > Modifying slices | `overhangs_max_slope` [SS] | float|% | 4718 | Overhangs max slope: Maximum slope for overhangs. |
| Slicing > Modifying slices | `overhangs_bridge_threshold` [SS] | float | 4532 | Bridge max length: Maximum distance for bridges. |
| Slicing > Modifying slices | `overhangs_bridge_upper_layers` [SS] | int | 4544 | Consider upper bridges: Don't put overhangs in the area if it will be filled in next layer(s) by bridges. |
| Slicing > Other | shared: `slicing_mode` | | | |
| Slicing > Other | `allow_empty_layers` [SS] | bool | 659 | Allow empty layers: Prevent the gcode builder from triggering an exception if a full layer is empty, and allow the print to start from thin air afterward. |
| Skirt & Brim > Skirt | shared: `skirts`, `skirt_distance`, `skirt_height`, `draft_shield`, `min_skirt_length` | | | |
| Skirt & Brim > Skirt | `skirt_distance_from_brim` [SS] | bool | 5835 | Skirt distance from brim: The distance is computed from the brim and not from the objects |
| Skirt & Brim > Skirt | `skirt_brim` [SS] | int | 5817 | Skirt brim: Extra skirt lines on the first layer. |
| Skirt & Brim > Brim | shared: `brim_width`, `brim_separation` | | | |
| Skirt & Brim > Brim | `brim_inside_holes` [SS] | bool | 1016 | Brim inside holes: Allow to create a brim over an island when it's inside a hole (or surrounded by an object). |
| Skirt & Brim > Brim | `brim_width_interior` [SS] | float | 1043 | Interior Brim width: Horizontal width of the brim that will be printed inside each object on the first layer. |
| Skirt & Brim > Brim | `brim_ears` [SS] | bool | 1052 | Brim ears: Only draw brim over the sharp edges of the model. |
| Skirt & Brim > Brim | `brim_ears_max_angle` [SS] | float | 1060 | Brim ear max angle: Maximum angle to let a brim ear appear. |
| Skirt & Brim > Brim | `brim_ears_detection_length` [SS] | float | 1085 | Brim ear detection length: The geometry will be decimated before dectecting sharp angles. |
| Skirt & Brim > Brim | `brim_ears_pattern` [SS] | enum | 1096 | Ear pattern: Pattern for the ear. |
| Skirt & Brim > Brim | `brim_per_object` [SS] | bool | 1024 | Brim per object: Create a brim per object instead of a brim for the plater. |
| Support & Other > Skirt & Brim | shared: `skirts`, `brim_width` | | | |
| Support & Other > Skirt & Brim | `brim_ears` [SS] | bool | 1052 | Brim ears: Only draw brim over the sharp edges of the model. |
| Support & Other > Support Material | shared: `support_material`, `support_material_auto`, `support_material_buildplate_only` | | | |
| Support & Other > Sequential printing | shared: `complete_objects` | | | |
| Support material > Support material | shared: `support_material`, `support_material_auto`, `support_material_threshold`, `support_material_enforce_layers` | | | |
| Support material > Raft | shared: `raft_layers`, `raft_first_layer_density`, `raft_first_layer_expansion`, `raft_contact_distance`, `raft_expansion` | | | |
| Support material > Raft | `raft_layer_height` [SS] | float|% | 5329 | Raft layer height: Maximum layer height for the raft, after the first layer that uses the first layer height, and before the interface layers. |
| Support material > Raft | `raft_interface_layer_height` [SS] | float|% | 5341 | Raft interface layer height: Maximum layer height for the raft interface. |
| Support material > Raft | `raft_contact_distance_type` [SS] | enum | 5273 | Raft contact distance type: How to compute the vertical z-distance. |
| Support material > Options for support material and raft | shared: `support_material_style`, `support_material_contact_distance`, `support_material_bottom_contact_distance`, `support_material_pattern`, `support_material_spacing`, `support_material_angle`, `support_material_with_sheath`, `support_material_closing_radius`, `support_material_buildplate_only`, `support_material_xy_spacing`, `dont_support_bridges`, `support_material_synchronize_layers` | | | |
| Support material > Options for support material and raft | `support_material_layer_height` [SS] | float|% | 6667 | Support layer height: Maximum layer height for the support, after the first layer that uses the first layer height, and before the interface layers. |
| Support material > Options for support material and raft | `support_material_contact_distance_type` [SS] | enum | 6379 | Support contact distance type: How to compute the vertical z-distance. |
| Support material > Options for support material interface | shared: `support_material_interface_spacing`, `support_material_interface_layers`, `support_material_bottom_interface_layers`, `support_material_interface_contact_loops` | | | |
| Support material > Options for support material interface | `support_material_interface_layer_height` [SS] | float|% | 6582 | Support interface layer height: Maximum layer height for the support interface. |
| Support material > Options for support material interface | `support_material_top_interface_pattern` [SS] | enum | 6647 | Support top interface pattern: Pattern for the top interface layers. |
| Support material > Options for support material interface | `support_material_bottom_interface_pattern` [SS] | enum | 6629 | Support bottom interface pattern: Pattern for the bottom interface layers (the ones that start on the object). |
| Support material > Options for support material interface | `support_material_interface_angle` [SS] | float | 6486 | Support interface pattern angle: Use this setting to rotate the support material pattern on the horizontal plane. |
| Support material > Options for support material interface | `support_material_interface_angle_increment` [SS] | float | 6497 | Support interface angle increment: Each layer, add this angle to the interface pattern angle. |
| Support material > Organic supports | shared: `support_tree_angle`, `support_tree_angle_slow`, `support_tree_branch_diameter`, `support_tree_branch_diameter_angle`, `support_tree_tip_diameter`, `support_tree_branch_diameter_double_wall`, `support_tree_branch_distance`, `support_tree_top_rate` | | | |
| Speed > Speed for print moves | shared: `perimeter_speed`, `external_perimeter_speed`, `solid_infill_speed`, `infill_speed`, `top_solid_infill_speed`, `support_material_speed`, `support_material_interface_speed`, `bridge_speed`, `gap_fill_speed`, `ironing_speed` | | | |
| Speed > Speed for print moves | `default_speed` [SS] | float|% | 1396 | Default speed: This is the reference speed that other 'main' speed can reference to by a %. |
| Speed > Speed for print moves | `brim_speed` [SS] | float|% | 1119 | Brim & Skirt speed: This separate setting will affect the speed of brim and skirt. |
| Speed > Speed for print moves | `internal_bridge_speed` [SS] | float|% | 3830 | Internal Bridge Infill speed: Speed for printing the bridges that support the top layer. |
| Speed > Speed for print moves | `overhangs_speed` [SS] | float|% | 4732 | Overhangs speed: Speed for printing overhangs. |
| Speed > Speed for print moves | `overhangs_width_speed` [SS] | float|% | 4799 | Overhangs speed threshold: Minimum unsupported width for an extrusion to apply the overhang speed & fan speed to it. |
| Speed > Speed for print moves | `overhangs_dynamic_speed` [SS] | Graph | 4628 | Dynamic overhang speeds: Overhang size is expressed as a percentage of overlap of the extrusion with the previous layer: 100% would be full overlap (no overhang), while 0%... |
| Speed > Speed for print moves | `overhangs_speed_enforce` [SS] | int | 4745 | Enforce overhangs speed: Set the speed of the full perimeters to the overhang speed, and also the next one(s) if any. |
| Speed > Speed for print moves | `gap_fill_flow_match_perimeter` [SS] | percent | 3214 | Gapfill: cap speed with perimeter flow: A percentage of the perimeter flow (mm3/s) is used as a limit for the gap fill flow, and so the gapfill may reduce its speed when the gap fill extr... |
| Speed > Speed for print moves | `thin_walls_speed` [SS] | float|% | 6947 | Thin walls speed: Speed for thin walls (external extrusions that are alone because the obect is too thin at these places). |
| Speed > Speed for print moves | `wipe_tower_speed` [SS] | float | 7343 | Wipe Tower Speed: Printing speed of the wipe tower. |
| Speed > Speed for print moves | `wipe_tower_wipe_starting_speed` [SS] | float|% | 7352 | Wipe tower wipe starting speed: Start of the wiping speed ramp up (for wipe tower). |
| Speed > Speed for non-print moves | shared: `travel_speed`, `travel_speed_z` | | | |
| Speed > Modifiers | shared: `first_layer_speed`, `first_layer_infill_speed`, `first_layer_speed_over_raft`, `small_perimeter_speed` | | | |
| Speed > Modifiers | `first_layer_min_speed` [SS] | float | 3088 | Min first layer speed: Minimum speed when printing the first layer. |
| Speed > Modifiers | `small_perimeter_min_length` [SS] | float|% | 5957 | Min small perimeters length: This sets the threshold for small perimeter length. |
| Speed > Modifiers | `small_perimeter_max_length` [SS] | float|% | 5971 | Max small perimeters length: This sets the end of the threshold for small perimeter length. |
| Speed > Autospeed (advanced) | shared: `max_volumetric_speed`, `max_print_speed` | | | |
| Speed > Autospeed (advanced) | `autospeed_min_thin_flow` [SS] | float|% | 708 | Minimum flow for thin extrusions: Thin walls and gapfill have very thin extrusions (often at the ends). |
| Speed > Pressure equalizer (experimental) | shared: `max_volumetric_extrusion_rate_slope_positive`, `max_volumetric_extrusion_rate_slope_negative` | | | |
| Speed > Acceleration control (advanced) | shared: `default_acceleration`, `perimeter_acceleration`, `external_perimeter_acceleration`, `solid_infill_acceleration`, `infill_acceleration`, `top_solid_infill_acceleration`, `bridge_acceleration`, `travel_acceleration`, `first_layer_acceleration`, `first_layer_acceleration_over_raft` | | | |
| Speed > Acceleration control (advanced) | `support_material_acceleration` [SS] | float|% | 6303 | Support acceleration: This is the acceleration your printer will use for support material. |
| Speed > Acceleration control (advanced) | `support_material_interface_acceleration` [SS] | float|% | 6325 | Support interface acceleration: This is the acceleration your printer will use for support material interfaces. |
| Speed > Acceleration control (advanced) | `brim_acceleration` [SS] | float|% | 1071 | Brim & Skirt acceleration: This is the acceleration your printer will use for brim and skirt. |
| Speed > Acceleration control (advanced) | `internal_bridge_acceleration` [SS] | float|% | 3780 | Internal bridges acceleration: This is the acceleration your printer will use for internal bridges. |
| Speed > Acceleration control (advanced) | `overhangs_acceleration` [SS] | float|% | 4518 | Overhang acceleration: This is the acceleration your printer will use for overhangs. |
| Speed > Acceleration control (advanced) | `gap_fill_acceleration` [SS] | float|% | 3171 | Gap fill acceleration: This is the acceleration your printer will use for gap fills. |
| Speed > Acceleration control (advanced) | `thin_walls_acceleration` [SS] | float|% | 6933 | Thin walls acceleration: This is the acceleration your printer will use for thin walls. |
| Speed > Acceleration control (advanced) | `ironing_acceleration` [SS] | float|% | 3868 | Ironing acceleration: This is the acceleration your printer will use for ironing. |
| Speed > Acceleration control (advanced) | `travel_deceleration_use_target` [SS] | bool | 7159 | Use target acceleration for travel deceleration: If selected, the deceleration of a travel will use the acceleration value of the extrusion that will be printed after it (if any) |
| Width & Flow > Extrusion width | shared: `extrusion_width`, `perimeter_extrusion_width`, `external_perimeter_extrusion_width`, `infill_extrusion_width`, `solid_infill_extrusion_width`, `top_infill_extrusion_width`, `support_material_extrusion_width`, `first_layer_extrusion_width` | | | |
| Width & Flow > Extrusion width | `extrusion_spacing` [SS] | float|% | 1989 | Default extrusion spacing: This is the DEFAULT extrusion spacing. |
| Width & Flow > Extrusion width | `perimeter_extrusion_spacing` [SS] | float|% | 4931 | Perimeter spacing: Like Perimeter width but spacing is the distance between two perimeter lines (as they overlap a bit, it's not the same). |
| Width & Flow > Extrusion width | `perimeter_extrusion_change_odd_layers` [SS] | float|% | 4947 | Perimeters spacing change on even layers: Change width on every even layer (and not on odd layers like the first one) for better overlap with adjacent layers and getting stringer shells. |
| Width & Flow > Extrusion width | `external_perimeter_extrusion_spacing` [SS] | float|% | 1620 | External perimeters spacing: Like the External perimeters width, but this value is the distance between the edge and the 'frontier' to the next perimeter. |
| Width & Flow > Extrusion width | `external_perimeter_extrusion_change_odd_layers` [SS] | float|% | 1637 | External perimeters spacing change on even layers: Change width on every even layer (and not on odd layers like the first one) for better overlap with adjacent layers and getting stringer shells. |
| Width & Flow > Extrusion width | `infill_extrusion_spacing` [SS] | float|% | 3660 | Infill spacing: Like First layer width but spacing is the distance between two lines (as they overlap a bit, it's not the same). |
| Width & Flow > Extrusion width | `infill_extrusion_change_odd_layers` [SS] | float|% | 3647 | Infill spacing change on even layers: Change width on every even layer (and not on odd layers like the first one) for better overlap with adjacent layers and getting stringer shells. |
| Width & Flow > Extrusion width | `solid_infill_extrusion_spacing` [SS] | float|% | 6077 | Solid infill spacing: Like Solid infill width but spacing is the distance between two lines (as they overlap a bit, it's not the same). |
| Width & Flow > Extrusion width | `solid_infill_extrusion_change_odd_layers` [SS] | float|% | 6064 | Solid infill spacing change on even layers: Change width on every even layer (and not on odd layers like the first one) for better overlap with adjacent layers and getting stringer shells. |
| Width & Flow > Extrusion width | `top_infill_extrusion_spacing` [SS] | float|% | 7065 | Top solid spacing: Like Top solid infill width but spacing is the distance between two lines (as they overlap a bit, it's not the same). |
| Width & Flow > Extrusion width | `skirt_extrusion_width` [SS] | float|% | 5852 | Skirt width: Horizontal width of the skirt that will be printed around each object. |
| Width & Flow > Extrusion width | `overhangs_extrusion_spacing` [SS] | float|% | 4667 | Overhangs extrusion spacing: Set this to a non-zero value to set a manual extrusion width for perimeters. |
| Width & Flow > Extrusion width | `first_layer_extrusion_spacing` [SS] | float|% | 2979 | First layer spacing: Like First layer width but spacing is the distance between two lines (as they overlap a bit, it's not the same). |
| Width & Flow > Extrusion width | `first_layer_infill_extrusion_width` [SS] | float|% | 2996 | First layer infill width: Set this to a non-zero value to set a manual extrusion width for first layer infill (sparse and solid). |
| Width & Flow > Extrusion width | `first_layer_infill_extrusion_spacing` [SS] | float|% | 3018 | First layer infill spacing: Like First layer infill width but spacing is the distance between two lines (as they overlap a bit, it's not the same). |
| Width & Flow > Overlap | shared: `infill_overlap` | | | |
| Width & Flow > Overlap | `perimeter_overlap` [SS] | percent | 5009 | Perimeter overlap: This setting allows you to reduce the overlap between the perimeters, to reduce the impact of the perimeters' artifacts. |
| Width & Flow > Overlap | `external_perimeter_overlap` [SS] | percent | 1677 | Ext. peri. overlap: This setting allows you to reduce the overlap between the perimeters and the external one, to reduce the impact of the perimeters' artifacts. |
| Width & Flow > Overlap | `gap_fill_overlap` [SS] | percent | 3296 | Gap fill overlap: This setting allows you to reduce the overlap between the perimeters and the gap fill. |
| Width & Flow > Overlap | `solid_infill_overlap` [SS] | percent | 6014 | Solid infill overlap: This setting allows you to reduce the overlap between the lines of the solid fill, to reduce the % filled if you see overextrusion signs on solid a... |
| Width & Flow > Overlap | `top_solid_infill_overlap` [SS] | percent | 7094 | Top solid infill overlap: This setting allows you to reduce the overlap between the lines of the top solid fill, to reduce the % filled if you see overextrusion signs on sol... |
| Width & Flow > Overlap | `bridge_overlap_min` [SS] | percent | 977 | Min bridge density: Minimum density for bridge lines. |
| Width & Flow > Overlap | `bridge_overlap` [SS] | percent | 990 | Max bridge density: Maximum density for bridge lines. |
| Width & Flow > Flow | shared: `bridge_flow_ratio`, `s_not_thick_bridge`(script) | | | |
| Width & Flow > Flow | `over_bridge_flow_ratio` [SS] | percent | 954 | Above bridge flow ratio: Flow ratio to compensate for the gaps in a bridged top surface. |
| Width & Flow > Flow | `fill_top_flow_ratio` [SS] | percent | 2793 | Top fill flow ratio: You can increase this to over-extrude on the top layer if there is not enough plastic to make a good fill. |
| Width & Flow > Flow | `first_layer_flow_ratio` [SS] | percent | 2803 | First layer flow ratio: You can increase this to over-extrude on the first layer if there is not enough plastic because your bed isn't levelled. |
| Width & Flow > Flow | `bridge_type` [SS] | enum | 920 | Bridge flow baseline: This setting allow you to choose the base for the bridge flow compute, the result will be multiplied by the bridge flow to have the final result. |
| Width & Flow > Flow | `overhangs_flow_ratio` [SS] | percent | 4700 | Overhangs flow ratio: This factor affects the amount of plastic for overhangs. |
| Width & Flow > Flow | `overhangs_type` [SS] | enum | 4759 | Overhangs flow baseline: This setting allow you to choose the base for the overhang flow compute, the result will be multiplied by the overhang flow to have the final result. |
| Width & Flow > Flow | `overhangs_width` [SS] | float|% | 4786 | Overhangs flow threshold: Minimum unsupported width for an extrusion to apply the overhang flow to it. |
| Width & Flow > Flow | `overhangs_dynamic_flow` [SS] | Graph | 4593 | Dynamic overhang flow: Overhang size is expressed as a percentage of overlap of the extrusion with the previous layer: 100% would be full overlap (no overhang), while 0%... |
| Width & Flow > Advanced | `external_perimeter_cut_corners` [SS] | percent | 1650 | Ext. peri. cut corners: Activate this option to modify the flow to acknowledge that the nozzle is round and the corners will have a round shape, and so change the flow to... |
| Width & Flow > Advanced | `first_layer_strong_start` [SS] | percent | 2847 | First layer squished start point: When on the first layer, to be sure the start of an extrusion attach to the build plate, the extrude will first extrude on place before to start mo... |
| Multiple extruders > Extruders | shared: `perimeter_extruder`, `infill_extruder`, `solid_infill_extruder`, `support_material_extruder`, `support_material_interface_extruder`, `wipe_tower_extruder` | | | |
| Multiple extruders > Ooze prevention | shared: `ooze_prevention`, `standby_temperature_delta` | | | |
| Multiple extruders > Wipe tower | shared: `wipe_tower`, `wipe_tower_width`, `wipe_tower_brim_width`, `wipe_tower_cone_angle`, `wipe_tower_bridging`, `wipe_tower_extra_spacing`, `wipe_tower_no_sparse_layers`, `single_extruder_multi_material_priming` | | | |
| Multiple extruders > Wipe tower | `wipe_tower_x` [SS] | float | 7455 | Wipe tower X: X coordinate of the left front corner of a wipe tower |
| Multiple extruders > Wipe tower | `wipe_tower_y` [SS] | float | 7464 | Wipe tower Y: Y coordinate of the left front corner of a wipe tower |
| Multiple extruders > Wipe tower | `wipe_tower_rotation_angle` [SS] | float | 7480 | Wipe tower rotation angle: Wipe tower rotation angle with respect to x-axis. |
| Multiple extruders > Wipe tower | `wipe_tower_extrusion_width` [SS] | float|% | 7362 | Wipe Tower purge line width: When wiping, the extrusion should be at least 125% of the nozzle diameter. |
| Multiple extruders > Wipe tower | `priming_position` [SS] | point | 5103 | Priming position: Coordinates of the left front corner of the priming patch. |
| Multiple extruders > Advanced | shared: `interface_shells`, `mmu_segmented_region_max_width`, `mmu_segmented_region_interlocking_depth` | | | |
| Multiple extruders > Advanced | `print_first_layer_bed_temperature` [SS] | int | 5155 | First Layer Bed Temperature: Override the temperature of the bed while printing the first layer. |
| Multiple extruders > Advanced | `print_bed_temperature` [SS] | int | 5144 | Bed Temperature: Override the temperature of the bed. |
| Output options > Platter | shared: `duplicate_distance` | | | |
| Output options > Sequential printing | shared: `complete_objects`, `extruder_clearance_radius`, `extruder_clearance_height` | | | |
| Output options > Sequential printing | `parallel_objects_step` [SS] | float | 1217 | Parallel printing step: When multiple objects are present, instead of jumping form one to another at each layer the printer will continue to print the current object layer... |
| Output options > Sequential printing | `parallel_objects_step_max_z` [SS] | float | 1230 | Max height for parallel printing step: If the nozzle print higher than taht, the print is switched back to normal printing. |
| Output options > Sequential printing | `complete_objects_one_skirt` [SS] | bool | 1238 | Allow only one skirt loop: When using 'Complete individual objects', the default behavior is to draw the skirt around each object. |
| Output options > Sequential printing | `complete_objects_sort` [SS] | enum | 1246 | Object sort: When printing multiple objects or copies on after another, this will help you to choose how it's ordered. |
| Output options > Output file | shared: `gcode_comments`, `gcode_label_objects`, `output_filename_format` | | | |
| Output options > Post-processing script | shared: `post_process` | | | |
| Output options > Post-processing milling | `milling_post_process` [SS] | bool | 8036 | Milling post-processing: If activated, at the end of each layer, the printer will switch to a milling head and mill the external perimeters. |
| Output options > Post-processing milling | `milling_extra_size` [SS] | float|% | 8044 | Milling extra XY size: This increases the size of the object by a certain amount to have enough plastic to mill. |
| Output options > Post-processing milling | `milling_after_z` [SS] | float|% | 8055 | Milling only after: This setting restricts the post-process milling to a certain height, to avoid milling the bed. |
| Output options > Post-processing milling | `milling_speed` [SS] | float | 8065 | Milling Speed: Speed for milling tool. |
| Notes > Notes | shared: `notes` | | | |
| Notes > Custom variables | `print_custom_variables` [SS] | string | 4433 | Custom Print variables: You can add data accessible to custom-gcode macros. |

#### filament.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Filament > Filament | shared: `filament_colour`, `filament_diameter`, `filament_density`, `filament_cost`, `filament_spool_weight` | | | |
| Filament > Flow | shared: `extrusion_multiplier` | | | |
| Filament > Flow | `filament_fill_top_flow_ratio` [SS] | percent[] | 2062 | Top fill flow ratio: You can increase this to over-extrude on the top layer if there is not enough plastic to make a good fill. |
| Filament > Flow | `filament_first_layer_flow_ratio` [SS] | percent[] | 2074 | First layer flow ratio: You can increase this to over/under-extrude on the first layer if there is not enough / too many plastic because your bed isn't levelled / flat. |
| Filament > Temperature °C | shared: `first_layer_temperature`, `temperature`, `first_layer_bed_temperature`, `bed_temperature`, `chamber_temperature`, `idle_temperature` | | | |
| Filament > Filament properties | shared: `filament_type`, `filament_soluble` | | | |
| Filament > Filament properties | `filament_shrink` [SS] | percent[] | 2552 | Shrinkage: Enter the shrinkage percentage that the filament will get after cooling (94% if you measure 94mm instead of 100mm). |
| Filament > Filament properties | `filament_max_overlap` [SS] | percent[] | 2565 | Max line overlap: This setting will ensure that all 'overlap' are not higher than this value. |
| Speed & Pressure advance > Print speed override | shared: `filament_max_volumetric_speed` | | | |
| Speed & Pressure advance > Print speed override | `filament_max_speed` [SS] | float[] | 2097 | Max speed: Maximum speed allowed for this filament. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_pressure_advance` [SS] | float[] | 2330 | Pressure advance: Default pressure advance value (Linear advance factor for Marlin). |
| Speed & Pressure advance > Pressure/Linear advance | `filament_perimeter_pa` [SS] | (float|%)[] | 2435 | Perimeters: Pressure advance for perimeter sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_external_perimeter_pa` [SS] | (float|%)[] | 2372 | External perimeter: Pressure advance for external perimeter. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_solid_infill_pa` [SS] | (float|%)[] | 2444 | Solid infill: Pressure advance for solid infill sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_infill_pa` [SS] | (float|%)[] | 2408 | Infill: Pressure advance for infill sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_top_solid_infill_pa` [SS] | (float|%)[] | 2480 | Top solid infill: Pressure advance for top solid infill sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_support_material_pa` [SS] | (float|%)[] | 2453 | Support: Pressure advance for support sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_support_material_interface_pa` [SS] | (float|%)[] | 2462 | Support interface: Pressure advance for support interface sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_brim_pa` [SS] | (float|%)[] | 2363 | Brim: Pressure advance for brim. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_bridge_pa` [SS] | (float|%)[] | 2345 | Bridge: Pressure advance for bridge sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_bridge_internal_pa` [SS] | (float|%)[] | 2354 | Internal bridge: Pressure advance for internal bridge sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_overhangs_pa` [SS] | (float|%)[] | 2426 | Overhangs: Pressure advance for overhang sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_gap_fill_pa` [SS] | (float|%)[] | 2399 | Gap fill: Pressure advance for gap fill sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_thin_walls_pa` [SS] | (float|%)[] | 2471 | Thin walls: Pressure advance for thin wall sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_ironing_pa` [SS] | (float|%)[] | 2417 | Ironing: Pressure advance for ironing sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_travel_pa` [SS] | (float|%)[] | 2489 | Travel: Pressure advance for travel sections, may help retraction and unretraction. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_first_layer_pa` [SS] | (float|%)[] | 2381 | First layer: Pressure advance for first layer sections. |
| Speed & Pressure advance > Pressure/Linear advance | `filament_first_layer_pa_over_raft` [SS] | (float|%)[] | 2390 | Over raft: Pressure advance for first layer sections over raft . |
| Cooling > Fan speed - default | shared: `bridge_fan_speed`, `disable_fan_first_layers`, `full_fan_speed_layer` | | | |
| Cooling > Fan speed - default | `default_fan_speed` [SS] | int[] | 1373 | Default fan speed: Default speed for the fan, to set the speed for features where there is no fan control. |
| Cooling > Fan speed - default | `perimeter_fan_speed` [SS] | int[] | 4973 | Internal Perimeter fan speed: This fan speed is enforced during all Perimeter moves Set to 0 to stop the fan. |
| Cooling > Fan speed - default | `external_perimeter_fan_speed` [SS] | int[] | 1661 | External perimeter fan speed: When set to a non-zero value this fan speed is used only for external perimeters (visible ones) and thin walls. |
| Cooling > Fan speed - default | `infill_fan_speed` [SS] | int[] | 3676 | Internal Infill fan speed: This fan speed is enforced during all Internal Infill moves Set to 0 to stop the fan. |
| Cooling > Fan speed - default | `solid_infill_fan_speed` [SS] | int[] | 6093 | Solid Infill fan speed: This fan speed is enforced during all Solid Infill moves Set to 0 to stop the fan. |
| Cooling > Fan speed - default | `top_fan_speed` [SS] | int[] | 7032 | Top Solid fan speed: This fan speed is enforced during all top fills (including ironing). |
| Cooling > Fan speed - default | `support_material_fan_speed` [SS] | int[] | 6471 | Support Material fan speed: This fan speed is enforced during all support moves Set to 0 to stop the fan. |
| Cooling > Fan speed - default | `support_material_interface_fan_speed` [SS] | int[] | 6507 | Support interface fan speed: This fan speed is enforced during all support interfaces, to be able to weaken their bonding with a high fan speed. |
| Cooling > Fan speed - default | `internal_bridge_fan_speed` [SS] | int[] | 3804 | Internal Bridge Infill fan speed: This fan speed is enforced during all infill bridges. |
| Cooling > Fan speed - default | `overhangs_fan_speed` [SS] | int[] | 4686 | Overhangs Perimeter fan speed: This fan speed is enforced during all Overhang Perimeter moves If disabled, the previous (perimeter) fan speed will be used. |
| Cooling > Fan speed - default | `overhangs_dynamic_fan_speed` [SS] | graph[] | 4556 | Dynamic overhang speeds: This setting can only works correctly if dynamic speed is also enabled (overhangs_dynamic_fan_speed). |
| Cooling > Fan speed - default | `gap_fill_fan_speed` [SS] | int[] | 3199 | Gap fill fan speed: This fan speed is enforced during all gap fill Perimeter moves Set to 0 to stop the fan. |
| Cooling > Short layer time - began to increase base fan speed | shared: `fan_below_layer_time`, `max_fan_speed` | | | |
| Cooling > Very short layer time - began to decrease extrusion rate | shared: `slowdown_below_layer_time`, `min_print_speed` | | | |
| Cooling > Very short layer time - began to decrease extrusion rate | `max_speed_reduction` [SS] | percent[] | 4252 | Max speed reduction: This setting control by how much the speed can be reduced to increase the layer time. |
| Multimaterial > Multimaterial toolchange temperature | `filament_enable_toolchange_temp` [SS] | bool[] | 2149 | Toolchange temperature enabled: Determines whether toolchange temperatures will be applied |
| Multimaterial > Multimaterial toolchange temperature | `filament_toolchange_temp` [SS] | int[] | 2223 | Toolchange temperature: To further reduce stringing, it can be helpful to set a lower temperature just prior to extracting filament from the hotend. |
| Multimaterial > Multimaterial toolchange temperature | `filament_use_fast_skinnydip` [SS] | bool[] | 2156 | Fast mode: Experimental: drops nozzle temperature during cooling moves instead of prior to extraction to reduce wait time. |
| Multimaterial > Multimaterial toolchange temperature | `filament_enable_toolchange_part_fan` [SS] | bool[] | 2163 | Use part fan to cool hotend: Experimental setting. |
| Multimaterial > Multimaterial toolchange temperature | `filament_toolchange_part_fan_speed` [SS] | int[] | 2170 | Toolchange part fan speed: Experimental setting. |
| Multimaterial > Multimaterial toolchange string reduction | `filament_use_skinnydip` [SS] | bool[] | 2180 | Enable Skinnydip string reduction: Skinnydip performs a secondary dip into the meltzone to burn off fine strings of filament |
| Multimaterial > Multimaterial toolchange string reduction | `filament_skinnydip_distance` [SS] | float[] | 2232 | Insertion distance: For stock extruders, usually 40-42mm. |
| Multimaterial > Multimaterial toolchange string reduction | `filament_melt_zone_pause` [SS] | int[] | 2187 | Pause in melt zone: Stay in melt zone for this amount of time before extracting the filament. |
| Multimaterial > Multimaterial toolchange string reduction | `filament_cooling_zone_pause` [SS] | int[] | 2196 | Pause before extraction : Can be useful to avoid bondtech gears deforming hot tips, but not ordinarily needed |
| Multimaterial > Multimaterial toolchange string reduction | `filament_dip_insertion_speed` [SS] | float[] | 2205 | Speed to move into melt zone: usually not necessary to change this |
| Multimaterial > Multimaterial toolchange string reduction | `filament_dip_extraction_speed` [SS] | float[] | 2214 | Speed to extract from melt zone: usually not necessary to change this |
| Multimaterial > Wipe tower parameters | shared: `filament_minimal_purge_on_wipe_tower` | | | |
| Multimaterial > Wipe tower parameters | `filament_max_wipe_tower_speed` [SS] | float[] | 2121 | Max speed on the wipe tower: This setting is used to set the maximum speed when extruding inside the wipe tower (use M220). |
| Multimaterial > Toolchange parameters with single extruder MM printers | shared: `filament_loading_speed_start`, `filament_loading_speed`, `filament_unloading_speed_start`, `filament_unloading_speed`, `filament_load_time`, `filament_unload_time`, `filament_toolchange_delay`, `filament_cooling_moves`, `filament_cooling_initial_speed`, `filament_cooling_final_speed` | | | |
| Multimaterial > Toolchange parameters with single extruder MM printers | `filament_wipe_advanced_pigment` [SS] | float[] | 7404 | Pigment percentage: The pigment % for this filament (bewteen 0 and 1, 1=100%). |
| Multimaterial > Toolchange parameters with multi extruder MM printers | shared: `filament_multitool_ramming`, `filament_multitool_ramming_volume`, `filament_multitool_ramming_flow` | | | |
| Custom G-code > Start G-code | shared: `start_filament_gcode` | | | |
| Custom G-code > End G-code | shared: `end_filament_gcode` | | | |
| Notes > Notes | shared: `filament_notes` | | | |
| Notes > Custom variables | `filament_custom_variables` [SS] | string[] | 2040 | Custom Filament variables: You can add data accessible to custom-gcode macros. |
| Dependencies > Profile dependencies | shared: `compatible_printers`, `compatible_printers_condition`, `compatible_prints`, `compatible_prints_condition` | | | |

#### filament_override.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Filament Overrides > Travel lift | shared: `filament_retract_lift`, `filament_travel_ramping_lift`, `filament_travel_slope`, `filament_travel_lift_before_obstacle`, `filament_retract_lift_above`, `filament_retract_lift_below`, `filament_wipe`, `filament_retract_before_wipe` | | | |
| Filament Overrides > Travel lift | `filament_wipe_extra_perimeter` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_inside_depth` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_inside_end` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_inside_start` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_only_crossing` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_return` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_speed` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Travel lift | `filament_wipe_lift` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Retraction | shared: `filament_retract_length`, `filament_retract_speed`, `filament_deretract_speed`, `filament_retract_restart_extra`, `filament_retract_before_travel`, `filament_retract_layer_change` | | | |
| Filament Overrides > Retraction | `filament_retract_lift_before_travel` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |
| Filament Overrides > Retraction when tool is disabled | shared: `filament_retract_length_toolchange`, `filament_retract_restart_extra_toolchange` | | | |
| Filament Overrides > Others | `filament_seam_gap` [SS] | it_opt->second.type | 7775 | (no label/tooltip) |

#### printer_fff.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| General > Size and coordinates | shared: `max_print_height`, `z_offset` | | | |
| General > Size and coordinates | `init_z_rotate` [SS] | float | 7653 | Preferred orientation: Rotate stl around z axes while adding them to the bed. |
| General > Size and coordinates | `z_step` [SS] | float | 7640 | Z full step: Set this to the height moved when your Z motor (or equivalent) turns one step.If your motor needs 200 steps to move your head/platter by 1mm, this... |
| General > Size and coordinates | `lift_min` [SS] | float | 4044 | Min height for travel: When an extruder travels to an object (from the start position or from an object to another), the nozzle height is guaranteed to be at least at thi... |
| General > Capabilities | shared: `single_extruder_multi_material` | | | |
| General > Firmware | shared: `gcode_flavor`, `silent_mode`, `binary_gcode`, `remaining_times`, `arc_fitting` | | | |
| General > Firmware | `remaining_times_type` [SS] | enum | 3983 | Supports remaining times method: M73: Emit M73 P{percent printed} R{remaining time in minutes} at 1 minute intervals into the G-code to let the firmware show accurate remaining time. |
| General > Firmware | `gcode_precision_xyz` [SS] | int | 3397 | xyz decimals: Choose how many digits after the dot for xyz coordinates. |
| General > Firmware | `gcode_precision_e` [SS] | int | 3406 | Extruder decimals: Choose how many digits after the dot for extruder moves. |
| General > Firmware | `gcode_min_length` [SS] | float|% | 5401 | Minimum extrusion length: When outputting gcode, this setting ensure that there is almost no commands more than this value apart. |
| General > Firmware | `gcode_min_resolution` [SS] | float|% | 5416 | minimum resolution: Maximum deviation of exported G-code paths from their full resolution counterparts when some commands are culled by 'gcode_min_length' or 'max_gcod... |
| General > Firmware | `max_gcode_per_second` [SS] | float | 4195 | Maximum G1 per second (Experimental): If your firmware stops while printing, it may have its gcode queue full. |
| General > Firmware | `arc_fitting_ignore_holes` [SS] | bool | 680 | Arc fitting: ignore holes: Don't trnsform holes into arc (G2/G3). |
| General > Firmware | `arc_fitting_resolution` [SS] | float|% | 688 | Arc fitting resolution: When using the arc_fitting option, resolution used to simplify the path into an arc. |
| General > Firmware | `arc_fitting_tolerance` [SS] | float|% | 698 | Arc fitting tolerance: When using the arc_fitting option, allow the curve to deviate a cetain % from the collection of strait paths. |
| General > Firmware | `gcode_filename_illegal_char` [SS] | string | 3348 | Illegal characters for filename: All characters that are written here will be replaced by '_' when writing the gcode file name. |
| General > Firmware | `gcode_ascii` [SS] | bool | 3331 | Only ascii characters in gcode: When printing the gcode file, replace any non-ascii character by a '_'. |
| General > Cooling fan | `fan_printer_min_speed` [SS] | int | 5133 | Minimum fan speed: This setting represents the minimum fan speed (like minimum PWM) your fan needs to work. |
| General > Cooling fan | `fan_speedup_time` [SS] | float | 4007 | Fan startup delay: Move the fan start in the past by at least this delay (in seconds, you can use decimals). |
| General > Cooling fan | `fan_speedup_overhangs` [SS] | bool | 4019 | Fan delay only for overhangs: Will only take into account the delay for the cooling of overhangs. |
| General > Cooling fan | `fan_kickstart` [SS] | float | 4033 | Fan KickStart time: Add a M106 S255 (max speed for fan) for this amount of seconds before going down to the desired speed to kick-start the cooling fan. |
| General > Cooling fan | `fan_percentage` [SS] | bool | 4318 | Fan PWM from 0-100: Set this if your printer uses control values from 0-100 instead of 0-255. |
| General > Thumbnails | shared: `thumbnails`, `thumbnails_format` | | | |
| General > Thumbnails | `thumbnails_custom_color` [SS] | bool | 488 | Enforce thumbnail color: Enforce a specific color on thumbnails. |
| General > Thumbnails | `thumbnails_color` [SS] | string | 479 | Thumbnail color: This is the color that will be enforced on objects in the thumbnails. |
| General > Thumbnails | `thumbnails_with_bed` [SS] | bool | 502 | Bed on thumbnail: Show the bed texture on the thumbnail picture. |
| General > Thumbnails | `thumbnails_tag_format` [SS] | bool | 515 | Write the thumbnail type in gcode.: instead of writing 'thumbnails' as tag in the gcode, it will write 'thumbnails_PNG', thumbnails_JPG', 'thumbnail_QOI', etc.. |
| General > Thumbnails | `thumbnails_end_file` [SS] | bool | 495 | Print at the end: Print the thumbnail code at the end of the gcode file instead of the front. |
| General > Advanced | shared: `use_relative_e_distances`, `use_firmware_retraction`, `use_volumetric_e`, `variable_layer_height` | | | |
| Custom G-code >  | shared: `autoemit_temperature_commands` | | | |
| Custom G-code >  | `start_gcode_manual` [SS] | bool | 6191 | Only custom Start G-code: Ensure that the slicer won't add heating, fan, extruder... |
| Custom G-code > Start G-code | shared: `start_gcode` | | | |
| Custom G-code > End G-code | shared: `end_gcode` | | | |
| Custom G-code > Before layer change G-code | shared: `before_layer_gcode` | | | |
| Custom G-code > After layer change G-code | shared: `layer_gcode` | | | |
| Custom G-code > Tool change G-code | shared: `toolchange_gcode` | | | |
| Custom G-code > Between objects G-code (for sequential printing) | shared: `between_objects_gcode` | | | |
| Custom G-code > Between objects G-code (for sequential printing) | `between_objects_gcode_before_move` [SS] | bool | 826 | Put gcode before the move: 'This'between_objects_gcode' code is inserted before moving to the next object, instead of after moving to the next object. |
| Custom G-code > Between extrusion role change G-code | `feature_gcode` [SS] | string | 3954 | After extrusion type change in G-code: This custom code is inserted at every extrusion type change.Note that you can use placeholder variables for all Slic3r settings as well as {last_ex... |
| Custom G-code > Colour Change G-code | shared: `color_change_gcode` | | | |
| Custom G-code > Pause Print G-code | shared: `pause_print_gcode` | | | |
| Custom G-code > Template Custom G-code | shared: `template_custom_gcode` | | | |
| Notes > Notes | shared: `printer_notes` | | | |
| Notes > Custom variables | `printer_custom_variables` [SS] | string | 5114 | Custom Printer variables: You can add data accessible to custom-gcode macros. |

#### extruder.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| idx > Name and Size | shared: `nozzle_diameter` | | | |
| idx > Name and Size | `tool_name` [SS] | string[] | 7024 | Tool name: Only used for Klipper, where you can name the extruder. |
| idx > Layer height limits | shared: `min_layer_height`, `max_layer_height` | | | |
| idx > Offsets (for multi-extruder printers) | shared: `extruder_offset` | | | |
| idx > Offsets (for multi-extruder printers) | `extruder_temperature_offset` [SS] | float[] | 1913 | Extruder temp offset: This offset will be added to all extruder temperatures set in the filament settings. |
| idx > Offsets (for multi-extruder printers) | `extruder_fan_offset` [SS] | percent[] | 1924 | Extruder fan offset: This offset wil be added to all fan values set in the filament properties. |
| idx > Offsets (for multi-extruder printers) | `extruder_extrusion_multiplier_speed` [SS] | graph[] | 1875 | Extrusion multipler: This string is edited by a Dialog and contains extusion multiplier for different speeds. |
| idx > Travel lift | shared: `retract_lift`, `travel_ramping_lift`, `travel_slope`, `travel_lift_before_obstacle`, `retract_lift_above`, `retract_lift_below` | | | |
| idx > Travel lift | `retract_lift_first_layer` [SS] | bool[] | 5583 | Enforce lift on first layer: Select this option to enforce z-lift on the first layer. |
| idx > Travel lift | `retract_lift_top` [SS] | string[] | 5593 | Lift only on: Select this option to not use/enforce the z-lift on a top surface. |
| idx > Retraction | shared: `retract_length`, `retract_speed`, `deretract_speed`, `retract_restart_extra`, `retract_before_travel`, `retract_layer_change` | | | |
| idx > Retraction | `retract_lift_before_travel` [SS] | float[] | 5449 | Minimum travel after z lift: Z lift is not triggered when travel moves are shorter than this length. |
| idx > Retraction wipe | shared: `wipe`, `retract_before_wipe` | | | |
| idx > Retraction wipe | `wipe_speed` [SS] | float[] | 7325 | Wipe speed: Speed in mm/s of the wipe. |
| idx > Retraction wipe | `wipe_only_crossing` [SS] | bool[] | 7308 | Wipe only when crossing perimeters: Don't wipe when you don't cross a perimeter. |
| idx > Retraction wipe | `wipe_return` [SS] | bool[] | 7316 | return to seam to end the wipe: If true, it ensure the wipe ends at the seam. |
| idx > General wipe | `wipe_inside_start` [SS] | bool[] | 7246 | Wipe inside at start: Before extruding an external perimeter, this flag will place the nozzle a bit inward and in advance of the seam position before unretracting. |
| idx > General wipe | `wipe_inside_end` [SS] | bool[] | 7255 | Wipe inside at end: This flag will wipe the nozzle a bit inward after extruding an external perimeter. |
| idx > General wipe | `wipe_inside_depth` [SS] | percent[] | 7265 | Maximum Wipe deviation to the inside: By how much the 'wipe inside' can dive inside the object (if possible)? |
| idx > General wipe | `wipe_extra_perimeter` [SS] | float[] | 7235 | Extra Wipe for external perimeters: When the external perimeter loop extrusion ends, a wipe is done, going slightly inside the print. |
| idx > General wipe | `wipe_lift` [SS] | (float|%)[] | 7277 | Wipe lift: When wiping, it will lift gradually to this height, so the filament can be 'cut' more easily. |
| idx > General wipe | `wipe_lift_length` [SS] | (float|%)[] | 7286 | Wipe length with lift: Distance in the wipe that is used to lift. |
| idx > General wipe | `wipe_min` [SS] | (float|%)[] | 7298 | Minimum Wipe length: Ensure the nozzle will move at least this much. |
| idx > General wipe | `seam_gap` [SS] | (float|%)[] | 5685 | Seam gap: To avoid visible seam, the extrusion can be stoppped a bit before the end of the loop. |
| idx > General wipe | `seam_gap_external` [SS] | (float|%)[] | 5697 | Seam gap for external perimeters: To avoid visible seam, the extrusion can be stoppped a bit before the end of the loop. |
| idx > Retraction when tool is disabled (advanced settings for multi-extruder setups) | shared: `retract_length_toolchange`, `retract_restart_extra_toolchange` | | | |

#### milling.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| idx > Size | `milling_diameter` [SS] | float[] | 7970 | Milling diameter: This is the diameter of your cutting tool. |
| idx > Behavior | `milling_z_lift` [SS] | float[] | 8000 | Tool z lift: Amount of lift for travel. |
| idx > G-Code | `milling_toolchange_start_gcode` [SS] | string[] | 8008 | G-Code to switch to this toolhead: Put here the gcode to change the toolhead (called after the g-code T{next_extruder}). |
| idx > G-Code | `milling_toolchange_end_gcode` [SS] | string[] | 8022 | G-Code to switch from this toolhead: Enter here the gcode to end the toolhead action, like stopping the spindle. |

#### sla_print.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Dependencies > Profile dependencies | shared: `compatible_printers`, `compatible_printers_condition` | | | |
| Layers and perimeters > Layers | shared: `layer_height`, `faded_layers` | | | |
| Advanced > Slicing | shared: `slice_closing_radius`, `slicing_mode` | | | |
| Output options > Output file | shared: `output_filename_format` | | | |
| Supports > Supports | shared: `supports_enable`, `support_tree_type`, `support_enforcers_only` | | | |
| Supports > Support head | shared: `support_head_front_diameter`, `support_head_penetration`, `support_head_width` | | | |
| Supports > Support pillar | shared: `support_pillar_diameter`, `support_small_pillar_diameter_percent`, `support_max_bridges_on_pillar`, `support_pillar_connection_mode`, `support_buildplate_only`, `support_pillar_widening_factor`, `support_max_weight_on_model`, `support_base_diameter`, `support_base_height`, `support_base_safety_distance`, `support_object_elevation` | | | |
| Supports > Connection of the support sticks and junctions | shared: `support_critical_angle`, `support_max_bridge_length`, `support_max_pillar_link_distance` | | | |
| Supports > Automatic generation | shared: `support_points_density_relative` | | | |
| Supports > Automatic generation | `support_points_minimal_distance` [SS] | float | 8660 | Minimal distance of the support points: No support points will be placed closer than this threshold. |
| Pad > Pad | shared: `pad_enable`, `pad_wall_thickness`, `pad_wall_height`, `pad_brim_size`, `pad_max_merge_distance`, `pad_wall_slope`, `pad_around_object`, `pad_around_object_everywhere`, `pad_object_gap`, `pad_object_connector_stride`, `pad_object_connector_width`, `pad_object_connector_penetration` | | | |
| Hollowing > Hollowing | shared: `hollowing_enable`, `hollowing_min_thickness`, `hollowing_quality`, `hollowing_closing_distance` | | | |

#### sla_material.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Dependencies > Profile dependencies | shared: `compatible_printers`, `compatible_printers_condition`, `compatible_prints`, `compatible_prints_condition` | | | |
| Material > Material | shared: `material_colour`, `bottle_cost`, `bottle_volume`, `bottle_weight`, `material_density` | | | |
| Material > Layers | shared: `initial_layer_height` | | | |
| Material > Exposure | shared: `exposure_time`, `initial_exposure_time` | | | |
| Material > Corrections | shared: `material_correction_x`, `material_correction_y`, `material_correction_z` | | | |
| Notes > Notes | shared: `material_notes` | | | |
| Material printing profile > Material printing profile | shared: `material_print_speed` | | | |

#### material_override.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Material Overrides > Support head | shared: `material_ow_support_head_front_diameter`, `material_ow_branchingsupport_head_front_diameter`, `material_ow_support_head_penetration`, `material_ow_branchingsupport_head_penetration`, `material_ow_support_head_width`, `material_ow_branchingsupport_head_width` | | | |
| Material Overrides > Support pillar | shared: `material_ow_support_pillar_diameter`, `material_ow_branchingsupport_pillar_diameter` | | | |
| Material Overrides > Automatic generation | shared: `material_ow_support_points_density_relative` | | | |
| Material Overrides > Corrections | `material_ow_relative_correction_x` [SS] | it_opt->second.type | 8882 | (no label/tooltip) |
| Material Overrides > Corrections | `material_ow_relative_correction_y` [SS] | it_opt->second.type | 8882 | (no label/tooltip) |
| Material Overrides > Corrections | `material_ow_relative_correction_z` [SS] | it_opt->second.type | 8882 | (no label/tooltip) |
| Material Overrides > Corrections | `material_ow_first_layer_size_compensation` [SS] | it_opt->second.type | 8882 | (no label/tooltip) |

#### printer_sla.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| General > Corrections | shared: `relative_correction_x`, `relative_correction_y`, `relative_correction_z`, `absolute_correction`, `gamma_correction` | | | |
| General > Corrections | `first_layer_size_compensation` [SS] | float | 2815 | XY First layer compensation: The first layer will be grown / shrunk in the XY plane by the configured value to compensate for the 1st layer squish aka an Elephant Foot effect. |
| General > Corrections | `elephant_foot_min_width` [SS] | float | 8413 | minimum width: Minimum width of features to maintain when doing the first layer compensation. |
| General > Size and coordinates | shared: `max_print_height` | | | |
| General > Thumbnails | shared: `thumbnails` | | | |
| General > Thumbnails | `thumbnails_custom_color` [SS] | bool | 488 | Enforce thumbnail color: Enforce a specific color on thumbnails. |
| General > Thumbnails | `thumbnails_color` [SS] | string | 479 | Thumbnail color: This is the color that will be enforced on objects in the thumbnails. |
| General > Thumbnails | `thumbnails_with_bed` [SS] | bool | 502 | Bed on thumbnail: Show the bed texture on the thumbnail picture. |
| General > Thumbnails | `thumbnails_with_support` [SS] | bool | 522 | Support on thumbnail: Show the supports (and pads) on the thumbnail picture. |
| General > Thumbnails | `thumbnails_tag_format` [SS] | bool | 515 | Write the thumbnail type in gcode.: instead of writing 'thumbnails' as tag in the gcode, it will write 'thumbnails_PNG', thumbnails_JPG', 'thumbnail_QOI', etc.. |
| General > Display | shared: `display_width`, `display_height`, `display_pixels_x`, `display_pixels_y`, `display_orientation`, `display_mirror_x`, `display_mirror_y` | | | |
| General > Tilt | shared: `fast_tilt_time`, `slow_tilt_time`, `high_viscosity_tilt_time`, `area_fill` | | | |
| General > Exposure | shared: `min_exposure_time`, `max_exposure_time`, `min_initial_exposure_time`, `max_initial_exposure_time` | | | |
| General > Output | shared: `sla_output_precision` | | | |
| General > Output | `output_format` [SS] | enum | 8856 | Output Format: Select the output format for this printer. |
| General > Output | `output_format` [SS] | enum | 8856 | Output Format: Select the output format for this printer. |
| Notes > Notes | shared: `printer_notes` | | | |

#### freq_fff.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| Frequent settings >  | shared: `s_support_fff`(script), `s_fill_density`(script), `s_brim`(script) | | | |

#### freq_sla.ui

| page > group | key | type | line | meaning |
|---|---|---|---|---|
| print >  | shared: `s_support_sla`(script), `s_pad`(script) | | | |

#### SuperSlicer definitions not placed in any .ui page (219)

Hidden, computed, per-object, CLI or placeholder-only options, grouped by defining function and `OptionCategory`. Shared keys by name; SuperSlicer-only keys with a row.

| section / category | key | type | line | meaning |
|---|---|---|---|---|
| PrintConfigDef / - | shared: `printhost_port`, `printhost_user`, `printhost_password`, `printhost_ssl_ignore_revoke`, `preset_names`, `printhost_authorization_type`, `preset_name`, `compatible_printers_condition_cummulative`, `compatible_prints_condition_cummulative`, `default_filament_profile`, `default_print_profile`, `filament_ramming_parameters`, `filament_settings_id`, `filament_vendor`, `gcode_substitutions`, `inherits`, `inherits_cummulative`, `parking_pos_retraction`, `extra_loading_move`, `printer_model`, `printer_vendor`, `printer_variant`, `print_settings_id`, `printer_settings_id`, `physical_printer_settings_id`, `seam_preferred_direction`, `seam_preferred_direction_jitter`, `solid_min_thickness`, `wiping_volumes_matrix`, `relative_correction`, `material_type`, `material_correction`, `material_vendor`, `default_sla_material_profile`, `sla_material_settings_id`, `default_sla_print_profile`, `sla_print_settings_id` | | | |
| PrintConfigDef / - | `print_version` [SS] | string | 438 | (no label/tooltip) |
| PrintConfigDef / - | `filament_settings_modified` [SS] | bool[] | 2658 | (no label/tooltip) |
| PrintConfigDef / - | `print_settings_modified` [SS] | bool | 5244 | (no label/tooltip) |
| PrintConfigDef / - | `printer_settings_modified` [SS] | bool | 5254 | (no label/tooltip) |
| PrintConfigDef / - | `wiping_volumes_extruders` [SS] | float[] | 7371 | Purging volumes - load/unload volumes: This vector saves required volumes to change from/to each tool used on the wipe tower. |
| PrintConfigDef / - | `wipe_advanced` [SS] | bool | 7391 | Enable advanced wiping volume: Allow Slic3r to compute the purge volume via smart computations. |
| PrintConfigDef / - | `wipe_advanced_nozzle_melted_volume` [SS] | float | 7397 | Nozzle volume: The volume of melted plastic inside your nozzle. |
| PrintConfigDef / - | `wipe_advanced_multiplier` [SS] | float | 7413 | Auto-wipe multiplier: The volume multiplier used to compute the final volume to extrude by the algorithm. |
| PrintConfigDef / - | `wipe_advanced_algo` [SS] | enum | 7422 | Auto-wipe algorithm: Algorithm for the advanced wipe. |
| PrintConfigDef / - | `sla_material_settings_modified` [SS] | bool | 8603 | (no label/tooltip) |
| PrintConfigDef / - | `sla_print_settings_modified` [SS] | bool | 8614 | (no label/tooltip) |
| PrintConfigDef / general | shared: `printer_technology`, `bed_shape`, `bed_custom_texture`, `bed_custom_model`, `print_host`, `printhost_apikey`, `printhost_cafile`, `high_current_on_filament_swap`, `host_type` | | | |
| PrintConfigDef / general | `printhost_client_cert` [SS] | string | 586 | Client Certificate File: A Client certificate file for use with 2-way ssl authentication, in p12/pfx format. |
| PrintConfigDef / general | `printhost_client_cert_password` [SS] | string | 594 | Client Certificate Password: Password for client certificate for 2-way ssl authentication. |
| PrintConfigDef / general | `milling_cutter` [SS] | int | 7951 | Milling cutter: The milling cutter to use (unless more specific extruder settings are specified). |
| PrintConfigDef / L("Skirt and brim") | shared: `brim_type` | | | |
| PrintConfigDef / slicing | shared: `colorprint_heights`, `solid_layers` | | | |
| PrintConfigDef / cooling | shared: `cooling`, `fan_always_on`, `min_fan_speed` | | | |
| PrintConfigDef / mmsetup | shared: `cooling_tube_retraction`, `cooling_tube_length` | | | |
| PrintConfigDef / perimeter | shared: `extra_perimeters`, `seam_position` | | | |
| PrintConfigDef / perimeter | `extra_perimeters_count` [SS] | int | 1791 | Extra perimeters: To be used in modifiers, as long as periemeter contour & hole count split the perimeters. |
| PrintConfigDef / perimeter | `only_one_perimeter_top_other_algo` [SS] | bool | 4478 | Only one peri - other algo: If you have some problem with the 'Only one perimeter on Top surfaces' option, you can try to activate this on the problematic layer. |
| PrintConfigDef / extruders | shared: `extruder`, `extruder_colour`, `extrusion_axis` | | | |
| PrintConfigDef / extruders | `first_layer_extruder` [SS] | int | 1828 | First layer extruder: The extruder to use (unless more specific extruder settings are specified) for the first layer. |
| PrintConfigDef / extruders | `milling_offset` [SS] | points | 7979 | Tool offset: If your firmware doesn't handle the extruder displacement you need the G-code to take it into account. |
| PrintConfigDef / extruders | `milling_z_offset` [SS] | float[] | 7991 | Tool z offset: . |
| PrintConfigDef / filament | `print_extrusion_multiplier` [SS] | percent | 1955 | Extrusion multiplier: This factor changes the amount of flow proportionally. |
| PrintConfigDef / filament | `print_first_layer_temperature` [SS] | int | 5167 | First Layer Temperature: Override the temperature of the extruder (for the first layer). |
| PrintConfigDef / filament | `print_retract_length` [SS] | float | 5178 | Retraction length: Override the retract_length setting from the printer config. |
| PrintConfigDef / filament | `print_retract_lift` [SS] | float | 5187 | Z-lift override: Set the new lift-z value for this override. |
| PrintConfigDef / filament | `print_temperature` [SS] | int | 5197 | Temperature: Override the temperature of the extruder. |
| PrintConfigDef / infill | `fill_angle_template` [SS] | float[] | 2719 | Fill angle template: This define the succetion of infill angle. |
| PrintConfigDef / limits | shared: `machine_limits_usage`, `machine_max_feedrate_{x,y,z,e}`, `machine_max_acceleration_{x,y,z,e}`, `machine_max_jerk_{x,y,z,e}`, `machine_min_extruding_rate`, `machine_min_travel_rate`, `machine_max_acceleration_extruding`, `machine_max_acceleration_retracting`, `machine_max_acceleration_travel` | | | |
| PrintConfigDef / advanced | `object_gcode` [SS] | string | 4452 | Per object G-code: This code is inserted each layer, when the object began to print (just after the label if any). |
| PrintConfigDef / output | `region_gcode` [SS] | string | 5353 | Per region G-code: This code is inserted when a region is starting to print something (infill, perimeter, ironing). |
| PrintConfigDef / speed | `gcode_command_buffer` [SS] | int | 5393 | Command buffer: Buffer the firmware has for gcode comamnds. |
| PrintConfigDef / support | `support_material_angle_height` [SS] | float | 6363 | Pattern angle swap height: Use this setting to rotate the support material pattern by 90° at this height (in mm). |
| PrintConfigDef / firmware | `time_cost` [SS] | float | 6974 | Time cost: This setting allows you to set how much an hour of printing time is costing you in printer maintenance, loan, human albor, etc. |
| PrintConfigDef / firmware | `time_estimation_compensation` [SS] | percent | 6983 | Time estimation compensation: This setting allows you to modify the time estimation by a % amount. |
| PrintConfigDef / firmware | `time_start_gcode` [SS] | float | 6992 | Time for start custom gcode: This setting allows you to modify the time estimation by a flat amount to compensate for start script, the homing routine, and other things. |
| PrintConfigDef / firmware | `time_toolchange` [SS] | float | 7001 | Time for toolchange: This setting allows you to modify the time estimation by a flat amount for each toolchange. |
| PrintConfigDef / wipe | shared: `wipe_into_infill`, `wipe_into_objects` | | | |
| CLIActionsConfigDef / - | shared: `export_obj`, `export_sla`, `export_3mf`, `export_stl`, `export_gcode`, `gcodeviewer`, `opengl-version`, `opengl-compatibility`, `opengl-debug`, `slice`, `help`, `help_fff`, `help_sla`, `info`, `save` | | | |
| CLIActionsConfigDef / - | `export_amf` [SS] | bool | 11997 | Export AMF: Export the model(s) as AMF. |
| CLITransformConfigDef / - | shared: `align_xy`, `cut`, `center`, `dont_arrange`, `ensure_on_bed`, `duplicate`, `duplicate_grid`, `merge`, `rotate`, `rotate_x`, `rotate_y`, `scale`, `split`, `scale_to_fit`, `delete-after-load` | | | |
| CLITransformConfigDef / - | `repair` [SS] | bool | 12132 | Repair: Try to repair any non-manifold meshes (this option is implicitly added whenever we need to slice the model to perform the requested action). |
| CLIMiscConfigDef / - | shared: `ignore_nonexistent_config`, `config_compatibility`, `load`, `output`, `single_instance`, `datadir`, `threads`, `loglevel`, `sw_renderer` | | | |
| ReadOnlySlicingStatesConfigDef / - | shared: `zhop` | | | |
| ReadWriteSlicingStatesConfigDef / - | shared: `position`, `e_retracted`, `e_restart_extra`, `e_position` | | | |
| OtherSlicingStatesConfigDef / - | shared: `current_extruder`, `current_object_idx`, `has_single_extruder_multi_material_priming`, `has_wipe_tower`, `initial_extruder`, `initial_filament_type`, `initial_tool`, `is_extruder_used` | | | |
| PrintStatisticsConfigDef / - | shared: `extruded_volume`, `normal_print_time`, `num_printing_extruders`, `print_time`, `printing_filament_types`, `silent_print_time`, `total_cost`, `total_weight`, `total_wipe_tower_cost`, `total_wipe_tower_filament`, `used_filament`, `total_toolchanges`, `extruded_volume_total`, `extruded_weight`, `extruded_weight_total`, `total_layer_count` | | | |
| ObjectsInfoConfigDef / - | shared: `num_objects`, `num_instances`, `scale`, `input_filename_base` | | | |
| DimensionsConfigDef / - | shared: `first_layer_print_convex_hull`, `first_layer_print_min`, `first_layer_print_max`, `first_layer_print_size`, `print_bed_min`, `print_bed_max`, `print_bed_size` | | | |
| TimestampsConfigDef / - | shared: `timestamp`, `year`, `month`, `day`, `hour`, `minute`, `second` | | | |
| OtherPresetsConfigDef / - | shared: `num_extruders`, `print_preset`, `filament_preset`, `printer_preset`, `physical_printer_preset` | | | |
| OtherPresetsConfigDef / - | `num_milling` [SS] | int | 12482 | Number of mills: Total number of mills, regardless of whether they are used in the current print. |
| CustomGcodeSpecificConfigDef / - | shared: `layer_num`, `layer_z`, `max_layer_z`, `filament_extruder_id`, `previous_extruder`, `next_extruder`, `toolchange_z`, `color_change_extruder` | | | |
| CustomGcodeSpecificConfigDef / - | `previous_layer_z` [SS] | float | 12539 | Previous Layer Z: Height of the previous layer. |
| CustomGcodeSpecificConfigDef / - | `next_color` [SS] | string | 12571 | Next color: Next color to display when a color change is performed, in #ffffff format. |
| CustomGcodeSpecificConfigDef / - | `next_colour` [SS] | string | 12576 | Next colour: Next color to display when a color change is performed, in #ffffff format (same as 'next_color', but for british people). |
| CustomGcodeSpecificConfigDef / - | `previous_extrusion_role` [SS] | string | 12581 | Previous extrusion role: The extrusion role before changing to the new one. |
| CustomGcodeSpecificConfigDef / - | `next_extrusion_role` [SS] | string | 12585 | Next extrusion role: The new extrusion role the gcode changes to. |
| CustomGcodeSpecificConfigDef / - | `extrusion_role` [SS] | string | 12589 | Extrusion role: Deprecated, use next_extrusion_role. |
| CustomGcodeSpecificConfigDef / - | `last_extrusion_role` [SS] | string | 12593 | Last extrusion role: Deprecated, use previous_extrusion_role. |
| CustomGcodeSpecificConfigDef / - | `start_gcode_bed_temperature` [SS] | int | 12597 | Computed bed temperature for first layer: It's the 'print_first_layer_bed_temperature' if defined or the maximum of the 'first_layer_bed_temperature' used in the first layer. |
| CustomGcodeSpecificConfigDef / - | `gcode_bed_temperature` [SS] | int | 12601 | Computed bed temperature: It's the 'print_bed_temperature' if defined or the maximum of the 'bed_temperature'. |
| CustomGcodeSpecificConfigDef / - | `layer_used_filament` [SS] | int | 12605 | Computed used filaent for each extruder: It's an array of mm of extruded filament at this layer, the layer that ends now. |
| CustomGcodeSpecificConfigDef / - | `previous_object_id` [SS] | int | 12610 | Index of the object that finished printing.: 0-based index, the index is the object's position in the right panel list in the platter tab, from top to bottom. |
| CustomGcodeSpecificConfigDef / - | `next_object_id` [SS] | int | 12615 | Index of the object that will start printing.: 0-based index, the index is the object's position in the right panel list in the platter tab, from top to bottom. |
| CustomGcodeSpecificConfigDef / - | `previous_object_name` [SS] | string | 12620 | Name of the object that finished printing.: It's the same name used for 'label object' gcode. |
| CustomGcodeSpecificConfigDef / - | `next_object_name` [SS] | string | 12624 | Name of the object that will start printing.: It's the same name used for 'label object' gcode. |

Override families: `filament_<opt>` for 28 retraction/wipe/travel options (deretract_speed, retract_before_travel, retract_before_wipe, retract_layer_change, retract_length, retract_length_toolchange, retract_lift, retract_lift_above, retract_lift_before_travel, retract_lift_below, retract_restart_extra, retract_restart_extra_toolchange, retract_speed, seam_gap, travel_lift_before_obstacle, travel_ramping_lift, travel_slope, wipe, wipe_extra_perimeter, wipe_inside_depth, wipe_inside_end, wipe_inside_start, wipe_lift, wipe_lift_length, wipe_min, wipe_only_crossing, wipe_return, wipe_speed); `material_ow_<opt>` (SLA material overrides) for 13 options (branchingsupport_head_front_diameter, branchingsupport_head_penetration, branchingsupport_head_width, branchingsupport_pillar_diameter, first_layer_size_compensation, relative_correction_x, relative_correction_y, relative_correction_z, support_head_front_diameter, support_head_penetration, support_head_width, support_pillar_diameter, support_points_density_relative).

