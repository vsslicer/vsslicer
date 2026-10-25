# Feature matrix

Card VSS-17, written 2026-10-25. A synthesis of the sixteen R1 reports in `docs/research/`, with no new primary research except one recount (see [Contradictions resolved](#contradictions-resolved)). Raw notes: `.reference/notes/VSS-17-feature-matrix-and-roadmap.md`. The roadmap built on this matrix is `.ai/plans/roadmap.md`.

Revisions behind every cell, as given in the inventories: PrusaSlicer `30ef591` (3.0.0-alpha12; profile facts from 2.9.6 `b028299`), SuperSlicer `1f3d287` (2.7.62.0-beta2), Bambu Studio `79df7ae`, OrcaSlicer `09aa0114`, Cura `5bea2f8` with CuraEngine `47b0388`. The "Notable others" column comes from documentation only (`slicer-landscape.md` §2 and §5). The Orca derivatives (Creality Print, ElegooSlicer, Snapmaker Orca, Anycubic Slicer Next) are Orca plus printer profiles and connectors (`slicer-landscape.md` Implications), so they appear in that column only where they add something.

## How to read it

**Cells.**

| Mark | Meaning |
|---|---|
| `●` | Originated in this project |
| `inh` | Inherited down the Slic3r → PrusaSlicer → Bambu Studio → OrcaSlicer lineage (or PrusaSlicer → SuperSlicer). It is the same feature, counted once at its origin |
| `inh+` | Inherited and materially extended here (the extension is named) |
| `port` | Re-implemented or ported from another lineage (for example Cura → PrusaSlicer) |
| `own` | An independent implementation of the same capability, not inherited |
| `—` | Absent at the analysed commit |
| `plg` | Only through a plugin or marketplace package |
| `?` | Not covered by the R1 inventories |

**Origin** names the project that introduced the capability, according to the inventories. "Direction unverified" means the inventories could only show key presence, not who came first (`features-bambustudio-orcaslicer.md` §1, direction caveat).

**Priority for VSSlicer.**

| Priority | Meaning | Roadmap phases |
|---|---|---|
| P0 | Needed for the first usable releases: view, preview, slice through an external engine, send | 1–5 |
| P1 | Needed for daily use at parity with Orca or PrusaSlicer | 6–9 (some arrive earlier) |
| P2 | Advanced; after parity | 10 (some arrive earlier) |
| P3 | Niche, deferred or skipped | 10 or never |

VSSlicer does not implement slicing algorithms. It drives an external engine (`slicing-engine-embedding.md` §6). For engine-side capabilities, the priority says when VSSlicer must surface the capability (schema, UI, preview), not when it is implemented.

**Source abbreviations.** Every row cites the report and section it comes from:

| Abbreviation | Report |
|---|---|
| PS | `docs/research/features-prusaslicer-superslicer.md` (A = Appendix A, B = Appendix B) |
| BO | `docs/research/features-bambustudio-orcaslicer.md` |
| CU | `docs/research/features-cura.md` |
| LS | `docs/research/slicer-landscape.md` |
| 3MF | `docs/research/3mf.md` |
| GV | `docs/research/gcode-viewer-simulation.md` |
| 3DV | `docs/research/3d-viewer.md` |
| PC | `docs/research/printer-connectivity.md` |
| BC | `docs/research/bambu-connectivity.md` |
| CAM | `docs/research/remote-camera.md` |
| PR | `docs/research/profiles.md` |
| FM | `docs/research/filament-management.md` |
| PF | `docs/research/projects-and-fleet.md` |
| ENG | `docs/research/slicing-engine-embedding.md` |
| VP | `docs/research/vscode-platform.md` |
| LIC | `docs/research/licensing.md` |

## 1. Slicing settings by category

The counts are setting keys, counted by script over the inventories' own tables:
- PrusaSlicer: the per-option-group counts in PS Appendix A headings.
- SuperSlicer: keys per `.ui` page and group in PS Appendix B, with "shared" rows expanded.
- OrcaSlicer: rows per `Tab.cpp` page and group in BO §1.
- Bambu Studio: an approximation. It counts rows of the Orca-layout tables whose origin code is not Orca-added (`O`, `O(SS)`, `P>O`, `P~O`), plus BO's Bambu-only tables. Bambu's own Tab layout differs.
- Cura: the category counts in CU §1.

The mapping of native groups onto these rows is ours. The settings totals are in the last row.

| Category | PrusaSlicer 3.0 | SuperSlicer | Bambu Studio (approx.) | OrcaSlicer | Cura | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|
| Layers, slicing precision, resolution | Layers & Surfaces 18, Precision & Slicing 19 (+24 hidden) | Slicing 28 | Layer height 3, Precision 10 | Layer height 3, Precision 14, Z contouring 4 | resolution 15 | Slic3r; Z contouring (`zaa_*`) Orca | P0 | Every slice needs layer height and first layer | PS §1, A; BO §1; CU §1 |
| Walls, perimeters, seams, bridging, overhangs | Walls & Perimeters 22 | Perimeters & Shell 67 (vertical shells, quality, seam, gap fill, Arachne, external-first, avoid crossing) | Seam 15, wall generator 7, walls and surfaces 7, walls 4, bridging 3, overhangs 1 | Seam 20, Wall generator 11, Walls and surfaces 23, Walls 3, Bridging 9, Overhangs 9 | shell 34 | Slic3r; Arachne Cura (port to Prusa 2.5); scarf seam claimed by Orca, Prusa 2.9 equivalent (direction unverified) | P0 | Core strength and quality knobs | PS §1, §5, B; BO §1; CU §1, §5 |
| Top/bottom shells, infill, ironing | Infill 15 | Infill 45, Horizontal shells 6, shell infill 4 | Top/bottom 11, Infill 29 (incl. Bambu-only conformal), Advanced 8, Ironing 6 | Top/bottom 19, Infill 34, Advanced 10, Ironing 7 | top_bottom 50, infill 36 | Slic3r; ironing Prusa 2.3; Lightning Cura (port to Prusa 2.5) | P0 | Core | PS §5, B; BO §1; CU §1 |
| Supports and raft | Supports 51 | Support material 43, Support & Other 3 | Support 41 | Support 49 (tree 12, raft 3) | support 110 | Slic3r grid supports; tree supports Cura (CU §5), Bambu `tree_support_*` (BO §1); organic Prusa 2.6, from Cura tree supports | P0 | Most models need supports | PS §5, A; BO §1; CU §2, §5 |
| Skirt, brim, adhesion | Bed adhesion 13 | Skirt & Brim 19 | Skirt 4, Brim 3 | Skirt 9, Brim 11 | platform_adhesion 79 (incl. raft) | Slic3r; brim ears SuperSlicer/Orca (direction unverified) | P0 | First-layer success | PS §1; BO §1, §3; CU §1 |
| Speed, acceleration, jerk | Speed 25, Motion & Dynamics 22 | Speed 54 | Speed 49 | Speed 50 | speed 76 | Slic3r; overhang speed bands Bambu; junction deviation and input shaping Orca | P0 | Also feeds our time estimator | PS §1, A; BO §1; CU §1; GV §4 |
| Extrusion width, flow, retraction, travel | Extrusion & Retraction 19 | Width & Flow 43 (+ retraction in `extruder.ui` 39) | Line width 9 (+ printer Extruder 23) | Line width 9 (+ printer Extruder 28) | travel 25 (retraction, combing) | Slic3r; per-feature flow ratios Orca | P0 | Core | PS A, B; BO §1; CU §1 |
| Cooling | Cooling 17 | Cooling 20 | Cooling 23 | Cooling 23 | cooling 17 | Slic3r; per-feature fan speeds SuperSlicer | P0 | Core | PS §1, A, B; BO §1; CU §1 |
| Filament material, temperatures, overrides, pressure advance | Material & Temperatures 25, Extrusion & Calibration 6, Overrides 3 | Filament 18, Speed & PA 20, Overrides 26 | Filament 40, Overrides 16, Advanced 2 | Filament 44, Overrides 23, Advanced 3 | material 60 | Slic3r; per-plate-type bed temperatures Bambu; adaptive PA Orca; `pressure_advance` key Prusa 3.0 | P0 | Material profiles are the most-edited presets | PS §5, A, B; BO §1; CU §1 |
| Multi-material, wipe or prime tower, tool change | Print MM 28, Filament MM 20, Single-extruder MM 7, Multiple extruders 1 | Multiple extruders 26, Filament MM 27 | Print MM 30, Filament MM 8, Printer MM 4 | Print MM 49, Filament MM 22, Printer MM 26 | dual 30 | PrusaSlicer wipe tower; Bambu prime tower; Cura prime tower independent (`own`) | P1 | Not needed for single-material first releases | PS §3, A; BO §1, §5; CU §4 |
| Printer definition and machine limits | General 39, Bed 3, Machine limits 10 | `printer_fff` General 38, `extruder.ui` 39 | Basic information 21, Motion ability 7, Extruder 23 | Basic information 55, Motion ability 21, Extruder 28 | machine_settings 70, fdmextruder 31 | Slic3r | P0 | Engine input and planner limits | PS A, B; BO §1; CU §1; GV §7 |
| Custom G-code, output options, post-processing | Printer custom G-code 11, Filament 3, Print 1, Output 1 | Output options 16, printer custom G-code 13, filament 2 | Machine G-code 10, G-code output 4, post-processing 1 | Machine G-code 12, G-code output 7, role-change 1, post-processing 1, pipeline plugin 1 | start/end G-code in machine_settings; ppr 7; command_line_settings 5 | Slic3r | P0 | Start and end G-code are required to print | PS §3, A; BO §1, §6; CU §1 |
| Special modes, fuzzy skin, mesh fixes, experimental | no own group (spread across Layers & Surfaces and Walls) | Modifying slices 17 | Special mode 7, Fuzzy skin 9 | Special mode 10, Fuzzy skin 12 | meshfix 16, blackmagic 15, experimental 95 | Spiral vase Slic3r (unverified); fuzzy skin Cura (port to Prusa 2.4) | P1 | Pass-through first; no UI work beyond the schema | PS §5; BO §1; CU §1 |
| Plate-level settings | per-bed config containers (3.0) | — | TabPrintPlate 5 | TabPrintPlate 5 | — | Bambu | P1 | Arrive with the plate model | BO §1, §2; PF §1 |
| SLA print, material and printer | Pad 12, Hollowing 4, Material printing profile 19, SLA supports (84 SLA keys in total, BO §1) | `sla_print` 45, `sla_material` 17, `material_override` 13, `printer_sla` 33 | 76 inherited keys, no SLA workflow | 76 inherited keys, no SLA workflow | — | PrusaSlicer | P3 | FDM first; no resin engine chosen | PS §4; BO §1 |
| Milling (CNC post-process) | — | `milling.ui` 4 plus `milling_*` keys | — | — | — | SuperSlicer | P3 | Out of product scope | PS §1, §5 |
| **Total keys** | 471 (3.0 domain) + 178 legacy-only | 893 (356 SuperSlicer-only) | 615 FFF + 76 SLA | 804 FFF + 76 SLA | 740 + 31 extruder | | | Totals include keys on no GUI page | PS §1, Comparison; BO §1; CU §1 |

Origin of keys inside the Bambu Studio and OrcaSlicer counts (non-SLA):
- 119 are Prusa-inherited.
- 133 are Prusa keys that Bambu renamed.
- 251 are Bambu-added and kept by Orca, and 100 are Bambu-only.
- 232 are Orca-added, and 18 more are Orca keys shared with SuperSlicer (BO §1, origin code table).

So "804 Orca keys" are not 804 features. About 300 of them are PrusaSlicer keys (119 `P` + 133 `P~` + 8 `P~O` + 43 `P>O` = 303), and 133 of those carry Bambu names.

## 2. Engine-provided slicing features (surfaced, not implemented, by VSSlicer)

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Arachne variable-width walls | port (2.5) | inh (Arachne group) | inh | inh | ● | — | Cura | P0 | Free with the engine; one schema enum | PS §5; CU §5 |
| Tree and organic supports | port, "organic" (2.6) | inh (organic group) | `own` (`tree_support_*`) | inh | ● | Simplify3D one-click supports; ideaMaker auto support | Cura | P0 | Free with the engine | PS §5; BO §1; CU §2, §5; LS §5 |
| Lightning, gyroid and 3D infill patterns | port (Lightning, 2.5) | inh | inh | inh+ (`gyroid_optimized`, lateral lattice) | ● (cross_3d, cubicsubdiv, lightning) | Simplify3D 3D infill, dynamic density | Cura (Lightning) | P0 | Enum pass-through | PS §5; BO §1; CU §1, §5; LS §5 |
| Ironing | ● (2.3) | inh | inh+ (`ironing_pattern`) | inh | `own` | Simplify3D ironing smoothing (5.1) | PrusaSlicer 2.3 | P1 | Pass-through | PS §5; BO §1; CU §2; LS §5 |
| Fuzzy skin | port (2.4) | inh | inh | inh | ● | — | Cura | P1 | Pass-through | PS §5; CU §2 |
| Scarf or sloped seams | `own` (2.9, equivalent) | — | inh or `own` (`seam_slope_*`, direction unverified) | ● (claimed, README) | `own` (`scarf_joint_seam_length`) | Simplify3D automated seam hiding | Orca (claimed; direction unverified) | P1 | Pass-through | PS §5; BO §1; CU §5; LS §5 |
| Arc fitting (G2/G3 output) | `own` (2.7; equivalent key, BO §1) | inh ("from BBS") | ● | inh | — | — | Bambu (per SuperSlicer comment) | P0 | Our parser must read arcs | PS §5; BO §1; CU §5; GV §3 |
| Adaptive layer height (automatic) | ● (adaptive + smooth) | inh | inh | inh | `own` (automatic only) | Simplify3D adaptive layer height | PrusaSlicer | P1 | Pass-through; the editor is in section 3 | PS §2; BO §3; CU §2; LS §5 |
| Sequential (object-by-object) printing | inh (`complete_objects`) | inh+ (sort order, one skirt, parallel step) | inh (`print_sequence`) | inh | `own` (one_at_a_time, user order) | — | Slic3r | P2 | Needs collision display | PS §3; BO §2; CU §2 |
| Interlocking between materials | `own` (2.9.1) | — | ? | ? | ● | — | Cura (direction unverified) | P3 | Niche | PS §5; CU §2, §5 |
| Input shaping and junction deviation emission, adaptive PA | — (`pressure_advance` only, 3.0) | — | — | ● | `own` (`material_pressure_advance_factor`) | ideaMaker per-feature PA | Orca | P2 | Pairs with motion calibration | BO §1, §4; CU §5; LS §5 |
| Conformal infill, circle and hole compensation, height slowdown | — | hole compensation `own` | ● (Bambu-only) | — | — | — | Bambu | P3 | Bambu-only keys | BO §1 |
| Belt, IDEX/multi-gantry and pellet printers | — | — | — | ● | — | — | Orca | P3 | Niche hardware | BO §1, §3 |
| Bridge detection over sparse infill | ? | ? | ? | inh+ (`internal_bridge_*`) | ? | ideaMaker 5.3.2 | unverified | P1 | Pass-through | BO §1; LS §5 |
| Pressure equalizer, monotonic infill, ramping travels | ● (2.5, 2.3, 2.7) | inh (pressure equalizer) | ? | ? | ? | — | PrusaSlicer | P1 | Pass-through | PS §1, §5, B |
| Mold, conical support or make-overhang-printable, gradual infill | — | — | ? | `own` (`make_overhang_printable*`) | ● | — | Cura | P2 | Pass-through | CU §2, §5; BO §1 |
| Klipper adaptive bed mesh (`bed_mesh_*`) | — | — | — | ● | — | — | Orca | P2 | Pass-through; Klipper users | BO §1 |

## 3. Model preparation

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Move, rotate, scale, lay on face | inh | inh | inh+ (object manipulation panel) | inh | `own` (Uranium tools, lay flat) | Kiri:Moto (three.js) | Slic3r (unverified) | P1 | First editor phase; engine CLI can arrange and orient before then | PS §2; BO §3; CU §2; LS §4 |
| Mirror, split, instances, unit conversion, merge | inh | inh+ (imperial and metre conversion) | inh | inh | `own` (mirror, group, merge) | — | Slic3r (unverified) | P1 | Basic editing | PS §2; CU §2 |
| Mesh repair | admesh on load + Windows repair | inh | Windows SDK repair | inh+ (cross-platform CGAL repair) | plg (Mesh Tools, AGPL) | Simplify3D automatic repair | Slic3r (admesh); Orca cross-platform | P1 | Broken imports fail to slice | PS §2; BO §3; CU §2; LS §5 |
| Planar cut, connectors, dovetail | ● (connectors 2.6) | inh | inh+ (dovetail) | inh+ (Prusa connectors restored, multiple dovetails) | — | — | Slic3r plane cut; Prusa 2.6 connectors; Bambu dovetail | P2 | Needs a cap-mesh implementation | PS §2, §5; BO §3; CU §5 |
| Mesh boolean (union, difference, intersection) | — (merge only) | — (CSG back end for SLA) | ● | inh (mcut) | — (`cutting_mesh` at slice time) | — | Bambu | P2 | manifold-3d (Apache-2.0) available | PS §2; BO §3; CU §2; 3DV Licence notes |
| Simplify (decimation) | ● (2.4) | inh | inh | inh | — | — | PrusaSlicer 2.4 | P3 | Rare need | PS §5; BO §3 |
| Support and seam painting | ● (2.3) | inh+ (seam volumes) | inh | inh | `own` (PaintTool: seam, support) | Lychee support painting (paid tier) | PrusaSlicer 2.3 | P2 | Needs a TriangleSelector re-implementation | PS §2, §5; BO §3; CU §2; 3DV §6; LS §5 |
| Fuzzy-skin painting | ● (2.9) | — | inh | inh | — | — | PrusaSlicer 2.9 | P3 | Niche | PS §2, §5; BO §3 |
| Multi-material (colour) painting | ● (2.4) | inh | inh+ (texture-to-colour) | inh+ (texture-to-colour) | `own` (PaintTool extruder, texture + UV) | KISSlicer Premium coloured meshes | PrusaSlicer 2.4 | P2 | Same painting model as above | PS §2, §5; BO §3; CU §2; LS §5 |
| Texture displacement | — | — | — | ● | — | — | Orca | P3 | Orca-only | BO §3 |
| Modifier and negative volumes, support enforcers and blockers | inh | inh+ (brim patch, seam volumes) | inh | inh | `own` (infill, cutting, support and anti-overhang meshes; Support Eraser) | Simplify3D per-region "targeted customisation" | Slic3r | P1 | Common workflow | PS §2, §5; BO §3; CU §2; LS §5 |
| Height-range modifiers | ● | inh | inh | inh | — | — | PrusaSlicer | P2 | Layer-range overrides | PS §2; BO §3 |
| Variable layer height editor (adaptive, smooth, brush) | ● | inh | inh | inh | — (automatic only) | — | PrusaSlicer | P2 | Interactive editor | PS §2, §5; BO §3; CU §2, §5 |
| Text emboss | ● (2.6) | inh | `own` (`GLGizmoText`) | inh (Prusa emboss) | — | — | PrusaSlicer 2.6 | P3 | Nice to have | PS §2, §5; BO §3 |
| SVG emboss | ● (2.7) | inh | inh | inh | — | — | PrusaSlicer 2.7 | P3 | Nice to have | PS §5; BO §3 |
| Measure | ● (2.6) | inh | inh+ (assembly measuring) | inh | — | — | PrusaSlicer 2.6 | P2 | Viewer tool, cheap with a BVH | PS §2; BO §3; 3DV §6 |
| Assembly view, alignment | — | — | ● | inh | — | — | Bambu | P3 | Niche | BO §3 |
| Auto-orient | SLA only (unverified for 3.0) | ? | ● | inh | — | ideaMaker one-click print (support, orient, arrange) | Bambu | P2 | Orca CLI path first | BO §3; LS §5 |
| Shapes, gallery, generators | ● (cube, cylinder, sphere, text, SVG, gallery; Lua) | inh+ (FreeCAD scripts, mosaic) | ? | inh+ (handy models, tolerance test) | — | — | PrusaSlicer | P3 | Calibration models need only a few shapes | PS §2; BO §4 |
| Image to heightmap or lithophane | — | — | — | — | ● (ImageReader) | — | Cura | P3 | Niche | CU §2 |
| Model checker (warp risk) | — | — | — | — | ● | — | Cura | P3 | Niche | CU §2 |
| Import STL, OBJ, 3MF | inh | inh | inh | inh | `own` | all | Slic3r | P0 | Minimum input set | PS §4; BO §6; CU §3; 3DV §6 |
| Import STEP | ● (2.5, OCCT) | inh | inh | inh | — | Simplify3D live CAD tracking | PrusaSlicer 2.5 | P1 | occt-import-js is LGPL-2.1: load it as a separate WASM file | PS §4, §5; BO §6; 3DV Licence notes |
| Import AMF, SVG, ZIP and other formats | SVG yes, AMF dropped in 3.0 | AMF, SVG, ZIP, HueForge `.hfp`, SLA archives | ? | AMF, SVG, ZIP | AMF, X3D, glTF/ply/dae/ctm, images | — | Slic3r (AMF) | P3 | Rare | PS §4; BO §6; CU §3 |

## 4. Arrange, plates and per-object settings

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Automatic arrange (polygon nesting) | ● (NFP kernels, arrange gizmo) | inh (2.7 arrange) | inh+ (across plates, rotation, avoid calibration area) | inh+ (IDEX arrange) | `own` (Nest2D, grid) | ideaMaker one-click arrange | PrusaSlicer | P1 | Multi-object plates; the engine CLI arranges until then | PS §3; BO §3; CU §2; LS §5 |
| Fill bed, multiply | ● | inh | ? | ? | `own` (multiply to grid) | — | PrusaSlicer | P2 | Convenience | PS §3; CU §2 |
| SMT sequential arrange | ● (2.9.1; not built at 3.0-alpha12) | — | — | — | — | — | PrusaSlicer 2.9.1 | P3 | Disabled upstream | PS §3 |
| Multi-plate projects (plate as a first-class object) | `own` (2.9 multiple beds; 3.0 BedInstance) | — | ● (up to 36 plates) | inh | hidden preference | — | Bambu (Prusa independently in 2.9) | P1 | The plate is the unit of slicing and sending | BO §2; PS §5; PF §1, §5; CU §5 |
| Per-plate settings and per-plate custom G-code | per-bed config (3.0) | — | ● | inh | — | — | Bambu | P1 | Config layer: global < plate < object | BO §2; PF §1 |
| Per-layer pause, colour change, custom G-code | ● (`custom_gcode_per_print_z`) | inh | inh+ (per plate) | inh | plg (PauseAtHeight, FilamentChange scripts) | — | PrusaSlicer | P1 | Common workflow; stored in the 3MF | 3MF Comparison; BO §2; CU §3 |
| Per-object, part and range setting overrides | inh+ (3.0 `overrides_in` per definition) | inh+ ("Quick Add Settings") | inh | inh | `own` (per-mesh settings, `settable_per_mesh`) | Simplify3D multiple processes per print | Slic3r | P1 | Common workflow | PS §1, §3; BO §2; CU §1, §2; LS §5 |
| Several projects open at once | ● (3.0) | ? | ? | ? | ? | — | PrusaSlicer 3.0 (others not checked) | P1 | Native in VS Code multi-root | PF §1, §4 |
| Mixed printers in one project | ● (3.0) | ? | ? | ? | ? | — | PrusaSlicer 3.0 | P2 | The project model allows a printer per plate | PS §5 |

## 5. Multi-material and tool changing

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Wipe tower, ramming, purge matrix | ● | inh+ (skinnydip, toolchange temperature) | inh+ (prime tower redesign) | inh+ (both tower types) | `own` (prime tower normal or interleaved, ooze shield) | — | PrusaSlicer | P2 | Engine does the tower; VSSlicer UI for it waits for phase 10. Settings pass through from phase 3 | PS §3, §5; BO §5; CU §4 |
| Flush volumes derived from colours | — | — | ● | inh+ (20000 mm³ cap) | — | — | Bambu | P2 | Multi-material UI is phase 10; until then the imported matrix is passed to the engine unchanged | BO §5, Implications |
| Purge into infill, objects or support | ● (infill, objects) | inh | inh+ (support) | inh | — | — | PrusaSlicer | P2 | Engine pass-through | PS §3; BO §5 |
| Per-feature filament assignment | — | — | — | ● (`*_filament_id`) | `own` (support/adhesion extruder settings) | Simplify3D processes per extruder; KISSlicer per-part extruder | Orca | P2 | Pass-through | BO §1; CU §4; LS §5 |
| Multi-tool presets and toolchangers | ● (3.0 Tool preset) | — | extruder variants | inh+ (IDEX/`imex_*`) | `own` (per-extruder stacks) | — | PrusaSlicer 3.0 | P2 | The schema models it from phase 3 | PS §1; PR §4, §6; CU §4 |
| Dual-nozzle filament grouping | — | — | ● | inh | — | — | Bambu | P2 | H2D class printers | BO §5 |
| AMS slot mapping at send, sync AMS to project | — | — | ● | inh | — | — | Bambu | P1 | Bambu printing requires it | BO §5; BC §1 |

## 6. Calibration

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Temperature tower | `own` (3.0 Lua plugin) | `own` (Calibration menu, undated against Orca) | inh (merged from Orca) | ● (framework) | plg (unverified) | — | Orca (BO §4; direction against SuperSlicer unverified) | P2 | After parity; simple generator: model plus per-layer sweep (phase 10) | BO §4; PS §4; CU §5 |
| Flow, pressure advance, retraction, max volumetric speed | flow tower only (3.0 Lua) | `own` (flow, extruder flow, retraction, PA, bridge flow) | inh (wizards for Bambu printers) | ● (YOLO and two-pass flow; PA line, pattern, tower; retraction; max volumetric speed) | plg (unverified) | — | Orca | P2 | Needs engine, editor and profile write-back first (phase 10); write-back is our improvement over every slicer except Bambu's wizard | BO §4, Implications; PS §4 |
| Motion tests (VFA, input shaping, cornering) | — | — | VFA only | ● | — | — | Orca | P2 | Klipper users | BO §4 |
| Static test models (cube, tolerance, bed levelling, ironing patterns) | 2.x static models | ● (calibration cube with goals, bed levelling) | — | inh+ (tolerance test) | — | — | SuperSlicer | P2 | Data, not code | PS §4; BO §4 |
| Printer-side automatic calibration (PA tables over MQTT) | — | — | ● | inh (Bambu printers) | — | — | Bambu | P3 | Depends on Bambu firmware access | BO §4; BC §3 |

## 7. G-code output and post-processing

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| External post-processing scripts | inh (`SLIC3R_<KEY>` env export stubbed in 3.0) | inh+ (full `SLIC3R_<KEY>` env) | inh | inh+ (env export) | `own` (Python `Script` classes, 20 bundled) | klipper_estimator as a post-processor | Slic3r | P1 | Run as a VS Code task after slicing (phase 5) | PS §3; BO §6; CU §3; GV Implications |
| Regex find and replace (`gcode_substitutions`) | ● | inh | — | — | `own` (SearchAndReplace script) | — | PrusaSlicer | P2 | Pass-through | PS §3; BO §1, §6; CU §3 |
| Placeholder macro language (`{if}`, expressions) | ● (from Slic3r `[var]`) | inh+ (`exists()`, custom variables) | inh | inh | — (settings evaluated by formulas, CU §1) | — | Slic3r `[var]`; PrusaSlicer macros | P1 | Imported start G-code relies on it; the engine evaluates it | PS §3; BO §6 |
| Placeholder catalogue and G-code template editor | 2.9 dialog (not built in 3.0) | ? | — | inh (typed placeholder definitions and editor) | — | — | PrusaSlicer 2.9 | P2 | VS Code completion and hovers do this well | PS §3; BO §6 |
| Feature and role-change G-code hooks | — | `own` (`feature_gcode`, `object_gcode`) | `own` (`printing_by_object_gcode`, timelapse) | `own` (`change_extrusion_role_gcode`) | — | — | independent in each; no origin established | P2 | Pass-through | PS §1; BO §6 |
| Binary G-code (`.bgcode`) output | ● (2.7) | inh | — | — | — | — | PrusaSlicer 2.7 | P2 | Comes from the Prusa engine; reading it is P0 (section 10) | PS §4, §5; BO §6; GV §2 |
| `.gcode.3mf` sliced output | — | — | ● | inh | — | — | Bambu | P1 | Bambu printers print this layout | BO §6; 3MF §4, Implications |
| Thumbnails in G-code (PNG, JPG, QOI, BTT TFT, ColPic) | ● | inh | in 3MF only | inh | `own` (CreateThumbnail script) | — | PrusaSlicer | P1 | We render thumbnails in our viewer and inject them | BO §6; CU §3; ENG Implications |
| Object labels, exclude object | ● (2.7) | inh | skip objects via MQTT | inh (`gcode_label_objects`, `exclude_object`) | ? | — | PrusaSlicer 2.7 | P1 | Cancel-object on Klipper and Prusa | PS §5; BO §5, §6; GV §1 |
| Engine-pipeline plugin hooks | `own` (3.0 Lua project plugins) | AngelScript (UI only) | — | `own` (`SlicingPipelineStepPlugin`) | ● (gRPC engine slots) | — | Cura (oldest of the three in the reports; direction unverified) | P3 | VS Code extensions are our plugin model | PS §2; BO §6; CU §3; LS §2 |
| Toolpaths export to OBJ | ● | inh | ? | inh | — | — | PrusaSlicer | P3 | Rare | PS §4; BO §6 |
| Export meshes to STL or Draco (`.drc`) | ● (STL) | inh (STL) | ? | inh+ (Draco) | `own` (STL, OBJ) | — | Slic3r line (STL) | P3 | Rare | PS §4; BO §6; CU §3 |
| Other output targets (UFP, Makerbot, gzip G-code) | — | — | — | — | ● | — | Cura | P3 | Ultimaker ecosystem, skipped | CU §3, Implications |

## 8. SLA and resin

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| SLA pipeline (hollow, drill, supports, pad, rasterise) | ● | inh | keys only | keys only | — | Lychee, Chitubox (commercial), ideaMaker DLP, Kiri:Moto SLA mode | PrusaSlicer | P3 | FDM first; no resin engine | PS §4; BO §1; LS §2, §5 |
| SLA hollow and support-point editors | 2.9 only (not built in 3.0) | inh | — | — | — | Lychee (hollowing, support painting) | PrusaSlicer | P3 | As above | PS §2; LS §5 |
| SLA archive formats | SL1, SL1S | inh+ (CWS, 15 Anycubic formats) | — | — | — | Elegoo SDCP upload of `.ctb` | PrusaSlicer | P3 | As above | PS §4; PC §4 |

## 9. Projects and 3MF

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| 3MF project with own config dialect | ● (2.x `Slic3r_PE.config`; 3.0 JSON) | inh+ (unbaked variant) | inh+ (Bambu dialect: plates, `project_settings.config`) | inh+ (`OrcaSlicer` tag) | `own` (workspace 3MF, `Cura/*.cfg`) | — | PrusaSlicer (project 3MF) | P0 | The project file is the source of truth | 3MF §3–§5, Comparison; PS §5; PF §1, §5 |
| Open other slicers' 3MF | ? | ● (Bambu 3MF import) | detects own prefix | inh | reads core 3MF | — | SuperSlicer (Bambu import) | P0 | Read Bambu/Orca and Prusa 2.x first | 3MF Implications; PS §4 |
| Lossless round trip of unknown parts | — | — | — | — | — | — | none: VSSlicer new | P0 | Every dialect depends on parts without MustPreserve | 3MF §1, Implications |
| Generic 3MF export (no vendor extensions) | ? | ? | — | ● | `own` | — | Orca | P1 | Interchange | BO §6 |
| Embedded per-plate G-code and thumbnails | — | — | ● | inh | — | — | Bambu | P0 read, P1 write | Needed for Bambu sends and for previews of projects | 3MF §4; BO §2 |
| Painting, layer-height, cut and per-layer G-code persistence | ● | inh | `own` (`paint_*`) | inh+ (`paint_texture_*`) | `own` (textures) | — | PrusaSlicer | P2 | Arrives with painting | 3MF Comparison |
| Undo, redo, autosave, crash recovery | snapshot stack; 3.0 BackupStore | inh | snapshot stack + backup thread | inh | operation stack; settings-only autosave | — | Slic3r line (snapshots) | P1 | VS Code custom editors supply undo, dirty state and hot exit | PF §1, §5; VP §2 |
| Project folder with queue and history sidecars | — | — | — | — | — | — | none: VSSlicer new | P1 | `.vsslicer/` beside the 3MF | PF §4, §5 |
| Universal Cura Project (`.ucp`) | — | — | — | — | ● | — | Cura | P3 | Skipped | CU §3 |

## 10. G-code preview, time estimation and simulation

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Layer and feature preview (colour by feature, speed, width, flow) | ● (2.3; libvgcode 2.8) | inh (2.7 viewer) | inh | inh (libvgcode) | `own` (SimulationView) | Mainsail (Sindarius) 3D, Fluidd 2D (web UIs, not slicers) | PrusaSlicer 2.3 | P0 | Core of the product | PS §5; GV §5, Comparison; CU §3 |
| Standalone viewer for any G-code file | ● | inh | ? | ? | `own` (GCodeReader) | gcode-preview (MIT) | PrusaSlicer 2.3 | P0 | Usable without slicing | PS §4; CU §3; GV §5 |
| G-code text editing (grammar, hovers on commands) | ? | ? | ? | ? | ? | — | none in the inventories: VSSlicer new | P0 | Ships with the preview in phase 1; works below the 50 MB sync limit | VP Decision table |
| Read `.bgcode` | ● | inh | — | — | — | — | PrusaSlicer 2.7 | P0 | Prusa printers prefer it; own reader from the spec | GV §2, Comparison; PC §4 |
| Read `.gcode.3mf` | — | — | ● | inh | — | — | Bambu | P0 | Bambu output | GV §7; 3MF §4 |
| Firmware-aware time estimate | ● (Marlin/Buddy) | inh | inh | inh+ (Klipper `plan_klipper`) | `own` (engine estimate per feature) | klipper_estimator (MIT label, GPL-derived planner: oracle only) | PrusaSlicer (Marlin), Orca (Klipper) | P0 | Own per-firmware planners; target under 1 min error over 12 h | GV §4, §5, §7, Comparison |
| Time-interpolated toolhead simulation | — (move-by-move scrubbing only) | — | — | — | — | — | none: VSSlicer new | P0 | In the owner's product definition; libvgcode does not interpolate within moves | GV §7 |
| Arc rendering | firmware-like segmentation | inh | inh | inh | n/a (no arcs emitted) | gcode-preview tolerance tessellation | PrusaSlicer | P0 | Arc-fitted output is common | GV §3, Comparison |
| 50–500 MB files | native, about 40 B/move | inh | inh | inh | engine-streamed layers | Fluidd 26 B/move (CPU) | n/a | P0 | Target about 28 B/move; custom editor, not TextDocument (50 MB limit) | GV §6, Comparison; VP §1 |
| Live print follow (file position from the printer) | — | — | — | — | — | Mainsail, Fluidd | Mainsail/Fluidd | P1 | Needs printer connectivity | GV §5, §7 |
| Per-job filament use, weight and cost | ● (print statistics) | inh | inh | inh | `own` (`PrintTimeMaterialEstimates`) | — | Slic3r line | P0 | Phase 1 reads the slicer's summary comments; feeds filament consumption estimates | BO §6; CU §4; FM §5 |

## 11. Printer connectivity and storage export

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Print-host upload (OctoPrint, PrusaLink, Duet, Moonraker...) | ● (7 host types in 2.x; print-host keys not yet ported to 3.0) | inh | inh (Prusa's seven) | inh+ (17 host types) | `own` (UM3 network); OctoPrint plg (unverified) | Orca derivatives add vendor agents (Elegoo, Snapmaker MQTT); Simplify3D network monitoring | PrusaSlicer | P0 | Moonraker, OctoPrint, PrusaLink and Duet first | BO §5; PS §1; PC §1, §6, Implications; LS §2, §5 |
| Status, telemetry and job control | — (upload and test only, `IPrintHost`) | — | ● (device panel, Bambu printers) | inh+ (printer agents, embedded web UI) | `own` (UM3 network) | Creality Print device integration | Bambu (panel) | P1 | Capability-based adapter interface | PC §6; BO §5; LS §2 |
| Printer health and error notifications (HMS) | — | — | ● (Assistant/HMS tab) | inh | ? | — | Bambu | P1 | Shown with status in phase 7 | BO §5 |
| Bambu LAN or cloud control | — | — | ● (closed network plugin) | inh (optional plugin) | — (BambuLab G-code flavour only) | — | Bambu | P1 | Developer Mode LAN first; no plugin, no keys | BC §1, §3, Implications; BO §5; CU §5 |
| Vendor protocols (Creality 9999, SDCP, Anycubic MQTT, Snapmaker SACP, AnkerMake) | — | — | — | inh+ (Creality, Elegoo, Snapmaker, Qidi agents) | — | vendor Orca forks | Orca and vendor forks | P2 | Opt-in, labelled reverse-engineered; SDCP official | PC §2, Implications; LIC §4 |
| USB serial printing (Marlin) | — (serial only for flashing) | — | — | — | ● (USBPrinting) | — | Cura | P2 | Native module in an optional extension | PC §3; CU §3; VP §1 |
| Firmware flashing and updates | ● (Flash Printer Firmware) | inh | `own` (Bambu firmware tab) | inh | `own` (FirmwareUpdater) | — | PrusaSlicer | P3 | Risky, rare | PS §4; BO §5; CU §3 |
| Printer discovery (mDNS, SSDP, UDP) | ● (Bonjour `_octoprint._tcp` lookup for `.local` hosts) | ? | ? | inh (Bonjour) | ? | Creality K2 mDNS discovery (vendor code) | PrusaSlicer (in the reports) | P1 | Adds printers without typing IPs; Moonraker and OctoPrint also answer SSDP | PC §5 |
| Browse files on the printer | — | — | ● (Storage tab) | inh | — | Mainsail, Fluidd | Bambu | P1 | `printer://` FileSystemProvider | BO §5; VP §3 |
| Export to removable media or a shared folder | ? (not in the inventory) | ? | ? | ? | ● (RemovableDriveOutputDevice) | — | Cura (in the inventories) | P0 | Simplest send path; FAT 8.3 names | CU §3; PC §4 |
| Wi-Fi config writer for Prusa printers | — | ● | — | — | — | — | SuperSlicer | P3 | Niche | PS §4 |
| Prusa Connect (cloud) | ● (2.8) | — | — | inh (`prusaconnect` host type) | — | — | PrusaSlicer 2.8 | P3 | API mostly not public | PS §5; BO §5; LIC §4 |

## 12. Cameras

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Live camera view in the app | — | — | ● (closed `BambuSource`; RTSPS or TCP 6000 JPEG; TUTK P2P remote) | inh+ (generic HTTP, MJPEG, RTSP, WebRTC) | ? | Mainsail, Fluidd (web) | Bambu | P1 | MJPEG and snapshots first, WebRTC next, go2rtc sidecar for RTSPS | BO §5; CAM §1, Implications; BC §1 |
| Snapshot and timelapse retrieval | — | — | ● (SD over FTPS) | inh | — | Moonraker timelapse, OctoPrint `/api/timelapse` | Bambu | P2 | Timelapse provider per ecosystem | CAM §3; BC §1 |
| Timelapse G-code generation | — | — | ● (`timelapse_type`, `time_lapse_gcode`) | inh | `own` (TimeLapse script) | — | Bambu | P2 | Pass-through | BO §1, §6; CU §3 |

## 13. Profiles

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Bundled vendor profile library | ● (35 INI bundles in 2.9.6; YAML in 3.0) | inh (unverified) | 12 vendors | 70 vendors + OrcaFilamentLibrary | 707 machine definitions | Orca forks add vendor profiles | PrusaSlicer bundles; Cura independent | P0 | Importers plus download on request; we do not maintain a library | PR §1, §2, §3, §5, Implications; CU §1; LIC §3 |
| Inheritance and compatibility conditions | ● (multi-parent, conditions) | inh | inh+ (single parent + `include`) | inh+ (cross-vendor) | `own` (container stack, Python formulas) | — | PrusaSlicer | P0 | One safe condition evaluator in TS | PR §1–§3, Comparison, Implications |
| Add-printer flow (configuration wizard) | ● | inh | ? | ? | `own` (MachineSettingsAction) | — | PrusaSlicer | P0 | Minimum: pick a printer, nozzle and material (phase 3) | PS §4; CU §3 |
| Physical printer (instance with a host connection) | ● | inh | ? | `own` (user machine preset) | `own` (machine instance) | — | PrusaSlicer | P0 | `printer_instance` entity; secrets in SecretStorage | PS §5; PR §6, Implications |
| Nozzle or tool as its own entity | ● (3.0 `tool`) | — | per-nozzle presets + extruder variants | inh | `own` (variants) | — | PrusaSlicer 3.0 | P0 | Schema shape: avoids combinatorial presets | PR §4, §6, Implications |
| Intent profiles over quality | — | — | — | — | ● | — | Cura | P2 | Optional `intent` field | CU §5; PR §6 |
| Profile bundle import and export (`.ini` bundle, `.orca_*`, `.bbscfg`, `.curaprofile`) | ● (config bundle) | inh | `own` (`.bbscfg`, `.bbsflmt`) | `own` (`.orca_printer`, `.orca_filament`, `.orca_bundle`) | `own` (`.curaprofile`, unverified) | — | PrusaSlicer | P1 | Users share profiles this way | PR Comparison, Implications |
| Profile update channel | ● (preset repo API) | ? | inh+ (OTA via plugin) | inh+ (opt-in check-version) | releases + marketplace | — | PrusaSlicer | P2 | Upstream downloads with pinned commits | PR Comparison; LIC §3 |
| User preset cloud sync | — | — | ● | inh | unverified | — | Bambu | P3 | Git and the workspace replace it | PR Comparison; PF §4 |
| Settings search and comparison | ● (Search) | inh | ? | ? | ? | Simplify3D searchable, comparable settings | PrusaSlicer (in the inventories) | P1 | Webview form with search; diffs through git | PS §4; LS §5 |
| Data-driven settings layout | `own` (3.0 per-definition category, group, order, GUI type) | `own` (`.ui` layout files) | — | — | `own` (JSON definitions) | — | independent in each; no origin established | P0 | Generate the UI from our schema; write our own labels (AGPL text) | PS §1, Implications; CU Implications; LIC §2 |

## 14. Filament management

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Filament presets (temperatures, flow, density, cost) | inh | inh | inh | inh | `own` (+ fdm_materials XML) | — | Slic3r | P0 | Needed to slice | PS A; BO §1; PR §3 |
| Filament database import | — | — | — | `own` (OrcaFilamentLibrary) | `own` (fdm_materials, CC0) | Open Filament Database (MIT), SpoolmanDB, used by SimplyPrint | n/a | P1 | OFD primary, fdm_materials seed | FM §2, §5; PR §5 |
| Spool inventory | — | — | — | — | — | Spoolman, SimplyPrint, OctoPrint FilamentManager | Spoolman (outside the slicers) | P1 | Owner requirement; Spoolman-compatible model | FM §1, §5, Comparison |
| Consumption from printer feedback | — | — | AMS `remain` shown | inh | — | Moonraker Spoolman component, SimplyPrint AMS sync | n/a | P1 | Append-only consumption events, reconciled per source | FM §4, §5 |
| RFID and NFC spool tags | — | — | ● (AMS RFID, read by the printer) | inh | — | OpenPrintTag (Prusa, MIT) | Bambu | P2 | Read tags through the printer; never decrypt cards | FM §3, §5; LIC §3 |

## 15. Fleet and queue

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Background upload queue | ● (`PrintHostQueueDialog`) | inh | ? | inh | — | — | PrusaSlicer | P1 | Background uploads with progress in phase 4 | BO §5 |
| Send one plate to many printers | — | — | ● (Multi-device) | inh | — | FDM Monster batch print | Bambu | P2 | Fleet phase | BO §5; PF §2 |
| Fleet queue with compatibility matching | — | — | — | — | — | Bambu Farm Manager, SimplyPrint (`for_printers`) | outside the slicers | P2 | Moonraker-shaped states plus a nozzle and material check | PF §2, §5 |
| Job history | — | — | ● (cloud tasks via plugin) | inh | — | Moonraker history, OctoFarm | Bambu (cloud) | P1 | Own JSONL with the slicer-to-printer link (phase 9) | PF §3, §5, Comparison |
| Cloud fleet services (Prusa Connect, Digital Factory) | `own` (Connect) | — | `own` (cloud) | inh | `own` (Digital Factory) | 3DPrinterOS, SimplyPrint | various | P3 | Proprietary APIs; skip in R1 | PF §2, Implications; CU Implications |

## 16. Platform and extensibility

| Feature | PrusaSlicer | SuperSlicer | Bambu | Orca | Cura | Notable others | Origin | Pri | Reason | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| In-app extension marketplace | — | — | — | — | ● (Marketplace, `.curapackage`) | — | Cura | P0 | VSSlicer is extensions on Open VSX and the VS Marketplace | CU §3; VP §5, Implications |
| Scripting and plugin API | `own` (3.0 Lua, beta) | `own` (AngelScript UI) | — | `own` (pipeline plugins) | ● (Python plugins) | Kiri:Moto JS modules | Cura (direction unverified) | P3 | The VS Code extension API is ours | PS §2; BO §6; CU §3; LS Comparison |
| Web or browser target | — | — | — | — | — | Kiri:Moto (browser, Electron) | Kiri:Moto | P2 | `web` extensions for viewer and preview; no slicing or LAN | VP §6; LS §2 |
| Themes | ? | ? (its user-editable `.ui` files are settings layouts, not themes) | ? | ? | ? | — | n/a | P3 | Owner: themes last | owner product definition; PS §4 |

## Contradictions resolved

1. **Orca vendor count.** `slicer-landscape.md` §2 says "146 vendor profile entries", and `profiles.md` §2 says 70 vendor indices plus `OrcaFilamentLibrary`. A recount in `OrcaSlicer@09aa0114:resources/profiles` found 146 entries in total, of which 71 are `.json` files (excluding `blacklist.json`) and 71 are directories. So 146 counts files and directories together. This matrix uses 70 vendors.
2. **Engine-extension boundary.** `slicing-engine-embedding.md` §6 item 4 allows the main extension to reach an AGPL WASM engine extension through `vscode.commands`. `licensing.md` §2 scenario (f) treats in-process `exports` and commands as probably combining the works. The later and more specific `licensing.md` reading governs; it cites the FSF FAQ `#MereAggregation` and `#GPLPlugins`. The roadmap requires a process or file boundary.
3. **Kiri:Moto licence.** `slicer-landscape.md` §3 lists Kiri:Moto as MIT. `slicing-engine-embedding.md` Licence notes and `licensing.md` Comparison report "All Rights Reserved" headers and treat it as not reusable until the author confirms. This matrix follows the latter.

## Coverage gaps

- **Cells marked `?`.** The R1 inventories did not cover these: Bambu and Orca settings search, the Orca/Bambu configuration wizard, export to removable media in the Slic3r line, Cura cameras and object labels. Any of them could change the "Origin" attribution where it currently rests on the one inventory that covered the feature.
- **Origin before 2.3.** PrusaSlicer origins before 2.3 are marked unverified in `features-prusaslicer-superslicer.md` §5.
- **Bambu-versus-Orca direction.** Per-key direction is unverified because the clones are shallow (`features-bambustudio-orcaslicer.md` open question 2).
- **Closed slicers.** Simplify3D, ideaMaker, KISSlicer, Lychee and Chitubox are covered only at feature-list level, from vendor pages (`slicer-landscape.md` §5).
