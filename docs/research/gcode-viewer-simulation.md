# G-code viewer and toolhead simulation

Card VSS-8, researched 2026-10-25. This report covers what it takes to parse sliced output, show it in a VS Code webview, and simulate the toolhead with firmware-accurate timing. Raw notes are in `.reference/notes/VSS-8-gcode-viewer-simulation.md`.

Sources were read from shallow clones, and none of the code was run:

| repo | commit | licence |
|---|---|---|
| PrusaSlicer | 30ef591 (3.0.0-alpha12, 2026-09-21) | AGPL-3.0 |
| OrcaSlicer | 09aa0114 | AGPL-3.0 |
| BambuStudio | 79df7ae | AGPL-3.0 |
| SuperSlicer | 1f3d287 | AGPL-3.0 |
| Cura / CuraEngine | 5bea2f8 / 47b0388 | LGPL-3.0 / AGPL-3.0 (LICENSE files) |
| libbgcode | d4da907 (2026-07-22) | AGPL-3.0 (`LICENSE`) |
| gcode-preview | 9609c5b (3.0.0-alpha.7) | MIT |
| klipper_estimator | dbcff4a (last commit 2024-04-27) | MIT |
| mainsail | 03a4d7b | GPL-3.0; it embeds @sindarius/gcodeviewer 3.7.18, LGPL-3.0-or-later |
| fluidd | b36a497 | GPL-3.0 |
| klipper | ee2c6fb | GPL-3.0 |
| Marlin | 2ef3ee6 | GPL-3.0 |

Web sources were all accessed on 2026-10-25:
- reprap.org/wiki/G-code
- help.prusa3d.com
- the Moonraker source on GitHub
- RepRapFirmware 3.6-dev source on GitHub
- gpuweb.github.io
- electronjs.org
- code.visualstudio.com

docs.duet3d.com renders on the client, so its pages could not be fetched.

**The card's paths no longer exist in PrusaSlicer.** PrusaSlicer@30ef591 has been reorganised:
- The processor and time estimator moved to `src/libpgcode/src/Slic3r/Biz/libpgcode/` (`ProcessorImpl.cpp`, `TimeMachine.cpp`, `TimeBlock.cpp`, `TimeProcessor.cpp`, `ProcessorConfig.cpp`).
- The viewer moved to `src/libvgcode/`.
- `GCodeWriter`, `Thumbnails` and `LabelObjects` are now under `src/libslic3r/src/libslic3r/GCode/`.

OrcaSlicer@09aa0114 keeps the 2.8-era layout: `src/libslic3r/GCode/GCodeProcessor.cpp`, `src/libvgcode/` and `src/slic3r/GUI/GCodeViewer.cpp`.

## Findings

### 1. G-code flavours: dialects, metadata, thumbnails, object labels

**Flavour enums.** Each slicer has its own list of flavours:
- **PrusaSlicer** has reprap (Sprinter), reprapfirmware, repetier, teacup, makerware, marlin (legacy), marlin2, klipper, sailfish, smoothie, mach3, machinekit and no-extrusion (PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp:81-93). Prusa 3.0 adds `gcfPrusaFirmwareBuddy` in the domain enum (PrusaSlicer@30ef591:src/libslic3r/src/libslic3r/GCode/GCodeWriter.cpp:23-35).
- **OrcaSlicer** has the same list (OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:225-237).
- **Bambu** is not a flavour. BBL machine profiles inherit `"gcode_flavor": "marlin"` (OrcaSlicer@09aa0114:resources/profiles/BBL/machine/fdm_machine_common.json:31), and the Bambu dialect is switched on by `is_BBL_printer()` (OrcaSlicer@09aa0114:src/libslic3r/GCode.cpp:2841-2842).
- **CuraEngine** has MARLIN 0, ULTIGCODE 1, MAKERBOT 2, BFB 3, MACH3 4, MARLIN_VOLUMATRIC 5, GRIFFIN 6, CHEETAH 61, REPETIER 7, REPRAP 8 and PLUGIN 9 (CuraEngine@47b0388:include/settings/EnumSettings.h:152-229).

**Dialect differences that matter to a parser or simulator:**

| Topic | Marlin 2 | Prusa Buddy | Klipper | RRF 3.x | Bambu |
|---|---|---|---|---|---|
| Accel | M204 P/R/T, S sets both P and T; M201 per-axis limits (Marlin@2ef3ee6:Marlin/src/gcode/config/M200-M205.cpp:262-336) | as Marlin 2 | only M204 (S, or min(P,T)); runtime `SET_VELOCITY_LIMIT ACCEL=` (klipper@ee2c6fb:klippy/toolhead.py:561-602) | M204 P/T, M201 (https://reprap.org/wiki/G-code#M204) | Marlin-style M204 in profile G-code (Orca BBL templates) |
| Feed and jerk limits | M203, M205 X/Y/Z/E, or J for junction deviation | M205; PrusaSlicer emits `M205 J` for Marlin 2 and Buddy (PrusaSlicer@30ef591:…/GCodeWriter.cpp:243-256) | M201, M203 and M205 not implemented (no hits in `klippy/`); `SQUARE_CORNER_VELOCITY` | M566 in mm/min (https://reprap.org/wiki/G-code#M566) | M205 (unverified) |
| Temperatures | M104/M109, M140/M190 | as Marlin | as Marlin (macro-mapped) | PrusaSlicer emits G10 P S for tool temperatures and no M109 wait (…/GCodeWriter.cpp:116-146) | M104/M109 |
| Pressure advance | M900 K | M572 S W (Klipper-style smoothing window) | `SET_PRESSURE_ADVANCE ADVANCE= SMOOTH_TIME=` | M572 D S | M900 in start template |
| Progress | M73 P R (Q S) | M73 P R Q S C D | M73 accepted but not documented as such (unverified) | M73 since 3.3 (https://reprap.org/wiki/G-code#M73) | M73 P R, plus layer progress (unverified) |
| Object labels | M486 S/A | M486 S/A | `EXCLUDE_OBJECT_DEFINE/START/END` | M486 S A"name" | none in G-code; objects come from 3MF metadata (unverified) |
| Vendor extras | — | M862.1–.6 checks for nozzle, model code, model name, firmware, G-code level and features; M555 print area (https://help.prusa3d.com/article/buddy-firmware-specific-g-code-commands_633112) | macros: `PRINT_START` and any custom command | M555 compatibility mode | M620/M621 AMS change, M622/M623 conditional blocks, M1002 claim/judge, M960 LEDs, M971/M973 camera, M975 vibration suppression, M976 scan, M970/M974 resonance, M980/M982 flow calibration, M1006 buzzer, M142 chamber (OrcaSlicer@09aa0114:resources/profiles/BBL/machine/Bambu Lab X1 Carbon 0.4 nozzle template machine_start_gcode.json). Meanings come only from inline comments (unverified); there is no public dictionary |

**How each firmware reaches the timing a simulator needs:**
- **Klipper** usually hides start and end work inside macros that a file-only reader cannot see.
- **Bambu** has conditional blocks (M622 J … M623) that the firmware runs or skips at print time.

klipper_estimator handles invisible macro time with `; ESTIMATOR_ADD_TIME` (klipper_estimator@dbcff4a:README.md:170-200).

**Metadata comments each slicer emits:**

| Slicer | Feature, role | Layer | Width/height | Time | Config block | Header |
|---|---|---|---|---|---|---|
| PrusaSlicer | `;TYPE:` | `;LAYER_CHANGE` then `;Z:` | `;HEIGHT:`, `;WIDTH:` | `; estimated printing time (normal mode) =` (…/GCode/PostProcessor.cpp:428-433) | `; prusaslicer_config = begin/end` at the end (…/GCode.cpp:1485-1502) | `; generated by PrusaSlicer` |
| OrcaSlicer, non-BBL | the Prusa tag set (`Reserved_Tags_compatible`) | `;LAYER_CHANGE`, `;Z:` | `;HEIGHT:`, `;WIDTH:` | Prusa line, kept for klipper_estimator (GCodeProcessor.cpp:1300-1306) | `; CONFIG_BLOCK_START/END` at the end (GCode.cpp:4884-4900) | `; HEADER_BLOCK_START/END` |
| Orca or Bambu Studio, BBL | `; FEATURE: ` | `; CHANGE_LAYER`, `; Z_HEIGHT:` (GCode.cpp:6653) | `; LAYER_HEIGHT: `, `; LINE_WIDTH: ` | `; model printing time: …; total estimated time:` (GCodeProcessor.cpp:1308) | config block at the top (GCode.cpp:4285) | `HEADER_BLOCK` with total layer number and max_z_height (GCode.cpp:4215-4275); `EXECUTABLE_BLOCK_START/END` (:4335, :4878) |
| Cura | `;TYPE:WALL-OUTER`, `WALL-INNER`, `SKIN`, `FILL`, `SUPPORT`, `SUPPORT-INTERFACE`, `SKIRT`, `PRIME-TOWER` (gcodeExport.cpp:623-647) | `;LAYER:n`, `;LAYER_COUNT:` (:664-669) | none | `;TIME:`, `;TIME_ELAPSED:` (:307, :615) | settings appended as `;SETTING_3` (unverified) | `;FLAVOR:`; the Griffin flavour uses `;START_OF_HEADER … ;PRINT.TIME:` (:230-264) |

The Orca tag lists are at OrcaSlicer@09aa0114:src/libslic3r/GCode/GCodeProcessor.cpp:100-150. The Prusa tag list is at PrusaSlicer@30ef591:src/libpgcode/include/Slic3r/Biz/libpgcode/Types.hpp:308-319. A parser needs both tag sets: the BBL set, with a leading space and different names, and the Prusa-compatible set.

**Thumbnails:**
- **Prusa format.** Blocks look like `; thumbnail begin WxH <len>` … base64 … `; thumbnail end`. The tag is `thumbnail` for PNG, `thumbnail_JPG` or `thumbnail_QOI` (PrusaSlicer@30ef591:src/libslic3r/src/libslic3r/GCode/Thumbnails.cpp:25-40; Thumbnails.hpp:87-97). In bgcode the thumbnails become binary blocks instead (section 2).
- **Orca** adds the `BTT_TFT` and `ColPic` screen formats (OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:695-700; GCode/Thumbnails.hpp:58-79).
- **Cura** writes the same comment format only through the CreateThumbnail post-processing script (Cura@5bea2f8:plugins/PostProcessingPlugin/scripts/CreateThumbnail.py:42-53).
- **Bambu** keeps thumbnails out of the G-code. They are PNG files inside the `.gcode.3mf`: `Metadata/plate_N.png`, `plate_no_light_N.png`, `top_N.png` and `pick_N.png`. The G-code itself is `Metadata/plate_N.gcode` plus `plate_N.gcode.md5`, and `Metadata/slice_info.config` holds the statistics (BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp:163-174, 6711-6742, 6905-6938).
- **Moonraker** parses `thumbnail`, `thumbnail_JPG` and `thumbnail_QOI` (it converts QOI to PNG) and does nothing special for bgcode (https://github.com/Arksine/moonraker/blob/master/moonraker/components/file_manager/metadata.py).

**Object labels:**
- **PrusaSlicer** has three styles:
  - Octoprint comments: `; printing object X` and `; stop printing object X`.
  - Firmware M486 for Marlin 2, Buddy and RRF: `M486 S<id>` plus `M486 A<name>`, or `A"name"` on RRF; ended with `M486 S-1`.
  - Klipper: `EXCLUDE_OBJECT_DEFINE NAME= CENTER= POLYGON=` in the header, with `EXCLUDE_OBJECT_START/END` around each object.

  Code: PrusaSlicer@30ef591:src/libslic3r/src/libslic3r/GCode/LabelObjects.cpp:190-275. The POLYGON format is JSON (klipper@ee2c6fb:docs/Exclude_Object.md:51-86).
- **Cura** labels objects with `;MESH:<name>` (CuraEngine@47b0388:src/LayerPlan.cpp:3921).
- **Moonraker** can rewrite M486 files into EXCLUDE_OBJECT form with preprocess_cancellation (Moonraker metadata.py).
- **Fluidd** parses `EXCLUDE_OBJECT_DEFINE` (fluidd@b36a497:src/workers/parseGcode.ts:109, 273).

### 2. Binary G-code (bgcode)

The format is specified in libbgcode@d4da907:doc/specifications.md:1-184, with code in `src/LibBGCode/{core,binarize,convert}`.

**File structure.**
- **Byte order:** every integer is little-endian.
- **File header:** 10 bytes. Magic `GCDE` (u32), version u32 (= 1), checksum type u16 (0 none, 1 CRC32) (spec:13-31).
- **Block order:** file metadata (optional), printer metadata, thumbnails (optional, one block each), print metadata, slicer metadata, then G-code blocks (spec:2-9).
- **Block header:**
  - Fields: type u16, compression u16, uncompressed size u32, and compressed size u32.
  - Size: 8 bytes when compression is 0 (compressed size omitted), otherwise 12 bytes.
  - Type values: 0 FileMetadata, 1 GCode, 2 SlicerMetadata, 3 PrinterMetadata, 4 PrintMetadata, 5 Thumbnail (spec:41-63; core/core.hpp:57-65).
- **Block parameters:**
  - Metadata blocks: u16 encoding, 0 = INI. The code also has 1 = JSON (core.hpp:75-79), which the spec does not list.
  - Thumbnail blocks: u16 format (0 PNG, 1 JPG, 2 QOI), plus u16 width and u16 height (spec:124-140).
  - G-code blocks: u16 encoding, 0 none, 1 MeatPack, 2 MeatPack keeping comments (spec:169-182).

**Compression.** Values are 0 none, 1 Deflate (zlib), 2 Heatshrink with window 11 and lookahead 4, 3 Heatshrink with window 12 and lookahead 4 (spec:65-71; binarize/CMakeLists.txt:3-39 links heatshrink 0.4 and zlib). MeatPack is adapted from OctoPrint-MeatPack. It packs common G-code characters into 4 bits (binarize/meatpack.hpp:8-12).

**Checksums.** When enabled, each block ends with a 4-byte CRC32 (polynomial 0xEDB88320, software implementation in core/core_impl.hpp:79-89). It covers the block header, parameters and payload (core/core.cpp:22-58).

**Block size.** The binarizer collects up to 65,536 bytes of G-code text per block and splits on line boundaries (binarize.hpp:150; binarize.cpp:963-1010). A reader can therefore seek block by block and decompress one block at a time, which suits streaming and lazy viewing.

**PrusaSlicer's export settings.** File and printer metadata are uncompressed, so firmware can read them cheaply. Print and slicer metadata use Deflate. G-code uses Heatshrink 12/4 plus MeatPack with comments, and blocks carry CRC32 (PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/ResultExport/ResultExportDataFinalizer.cpp:57-68).

**Undocumented in the spec.** libbgcode has a "Slicer3" metadata block: the SlicerMetadata type with JSON encoding, used by PrusaSlicer 3 (binarize.hpp:74-91; binarize.cpp:803-835).

**Bindings.** There are Python bindings (pybind11, `pybgcode/`) and an Emscripten WASM build exposing `ascii2bgcode` and the reverse (`src/LibBGCode/wasm/bgcode_wa.cpp`).

**Licence.** AGPL-3.0, so linking or shipping the WASM build in our extension makes the whole extension AGPL.

The format is small: a header, 6 block types, 3 codecs and CRC32. A clean reader needs inflate, which browsers have as DecompressionStream, plus a heatshrink decoder of about 200 lines and a MeatPack decoder. We can write those ourselves from the spec.

### 3. Arc moves (G2/G3, G5)

**Who emits arcs.**
- PrusaSlicer fits arcs with its own `Geometry/ArcWelder.cpp` (option `arc_fitting`, PrintConfig.cpp:541) and writes G2/G3 in I/J form only (…/GCodeWriter.cpp:349-472).
- Orca has `enable_arc_fitting` (PrintConfig.cpp:4426).
- No slicer studied emits G5.

**How firmware linearises arcs:**

| Firmware | Rule | Forms | G5 |
|---|---|---|---|
| Marlin 2 | `ARC_SUPPORT` is on by default. Segment length = `MAX_ARC_SEGMENT_MM` 1.0, or feedrate / `ARC_SEGMENTS_PER_SEC` clamped to [`MIN_ARC_SEGMENT_MM` 0.1, max]. At least `MIN_CIRCLE_SEGMENTS` 72 per full circle, and an exact correction every `N_ARC_CORRECTION` 25 segments. Each segment gets a planner duration hint (Marlin@2ef3ee6:Marlin/Configuration_adv.h:2694-2708; src/gcode/motion/G2_G3.cpp:95-239) | I/J, R; P full circles optional; `CNC_WORKSPACE_PLANES` optional | `BEZIER_CURVE_SUPPORT`, off by default (Configuration_adv.h:2705; src/module/planner_bezier.cpp) |
| Klipper | `[gcode_arcs] resolution`, default 1.0 mm; segments = floor(length / resolution); arcs shorter than that become lines. Planes via G17/18/19 (klipper@ee2c6fb:klippy/extras/gcode_arcs.py:31-144; docs/Config_Reference.md:1723-1735) | I/J/K only. **No R**, and no relative mode (gcode_arcs.py:63-90) | no |
| RRF 3.6-dev | Segmented through the kinematics segmentation settings (unverified detail) | I/J and R; negative R gives the long arc; the end radius is checked for consistency (Duet3D/RepRapFirmware 3.6-dev `src/GCodes/GCodes.cpp` `DoArcMove`) | not found |
| Buddy | Prusa's processor ports Buddy `plan_arc` with a chord tolerance of 0.0125 mm (see below) | G2/G3 documented (help.prusa3d.com article 633112) | (unverified) |

**How estimators and viewers linearise arcs:**
- **PrusaSlicer (libpgcode)** picks a rule by flavour:
  - Marlin 2 and Buddy use `arc_discretization_steps(r, angle, 0.0125 mm)`, the fewest chords that stay within that deviation (ProcessorImpl.cpp:955-975, 1120-1206).
  - Other flavours use segment = clamp(min(√(8·r·0.02), F/50), 0.1, 2.0) mm (ProcessorImpl.cpp:1128-1134).
  - The R form is resolved by `arc_center` (:929-950).
- **OrcaSlicer** has the same two branches (GCodeProcessor.cpp:6050-6296).
- **klipper_estimator** reuses Klipper's resolution rule (lib/src/arcs.rs:30-36).
- **gcode-preview** tessellates by chord tolerance, 0.05 mm by default, with at most 22.5° per segment (gcode-preview@9609c5b:src/arc-tessellator.ts:38-56, 143).
- **Fluidd** converts the R form to I/J and draws native SVG arcs, with no linearisation (fluidd@b36a497:src/workers/parseGcode.ts:125, 311-322; src/util/gcode-preview.ts:38, 78).
- **Sindarius** (Mainsail) arc handling was not checked in its minified bundle (unverified).

For drawing, a tolerance-based tessellation is right. For timing, the simulator must use the target firmware's own segmentation, because Klipper's 1 mm segments add junction slowdowns that Marlin's hinted segments do not.

### 4. Firmware motion planning for estimation and simulation

| Aspect | Klipper | Marlin 2 | RRF 3.4+ | Prusa Buddy |
|---|---|---|---|---|
| Accel profile | Constant-accel trapezoid (klippy/toolhead.py:46-47, 112-114; docs/Kinematics.md:35-55) | Trapezoid. Optional `S_CURVE_ACCELERATION` is a 6th-order Bézier over the **same** accel time, so block durations do not change (Configuration.h:1446-1460; planner.cpp:864-887; stepper.cpp:235-241) | Trapezoid (unverified) | Marlin base |
| Corners | `square_corner_velocity` (default 5) is turned into jd = scv²(√2−1)/accel. Junction v² = R·jd·a, with R = sin(θ/2)/(1−sin(θ/2)), plus a centripetal cap mid-move (toolhead.py:66-99, 213-214, 534-537) | Junction deviation by default, `JUNCTION_DEVIATION_MM` 0.013 with `JD_HANDLE_SMALL_SEGMENTS`, same R formula (planner.cpp:2550). `CLASSIC_JERK` is optional: X/Y 10, Z 0.3, E 5 (Configuration.h:1413-1445) | Per-axis instantaneous speed change (M566, mm/min); no junction deviation | Jerk or junction deviation |
| Anti-zigzag | `minimum_cruise_ratio` 0.5, applied as pseudo-accel a·(1−mcr). It replaced `max_accel_to_decel` (toolhead.py:211-212, 537; Kinematics.md:99-117) | — | — | — |
| Lookahead | Time-based queue, flushed after 0.150 s; 1.0 s buffer high-water mark (toolhead.py:116-170, 195) | Ring of `BLOCK_BUFFER_SIZE` 16 blocks: reverse pass, forward pass, then trapezoids (Configuration_adv.h:2798-2802; planner.cpp:1020-1203) | DDA ring (unverified) | Marlin |
| Input shaping | zv, mzv (default), ei, 2hump_ei, 3hump_ei per axis; `SET_INPUT_SHAPER` (extras/shaper_defs.py:147-157; input_shaper.py:14-21). Changes step timing, not move duration | `INPUT_SHAPING_X/Y/Z` is ZV only, M593 D F, default 40 Hz / 0.15 (Configuration_adv.h:1286-1310). `FT_MOTION` (M493) adds ZVD…3HEI, MZV and constant-jolt (Configuration_adv.h:1173-1323) | M593 P"zvd, zvdd, zvddd, mzv, ei2, ei3, custom" F S L; DAA before 3.3 (https://reprap.org/wiki/G-code#M593; RepRapFirmware 3.6-dev src/Movement/AxisShaper.cpp). May lengthen accel phases (unverified) | M593 T0–5 (ZV…3HUMP_EI) D F; firmware 5.0.0 on MK4, 5.1.0 on MINI and XL (https://help.prusa3d.com/de/article/input-shaper-mk4-s-mk3-9-s-mk3-5-s-xl-mini-_451816) |
| Pressure advance | `pressure_advance` (s) with `smooth_time` 0.040; extruder steps only (kinematics/extruder.py:13-34; Kinematics.md:241-298) | `LIN_ADVANCE` M900 K (default 0.22), `SMOOTH_LIN_ADVANCE`, `NONLINEAR_EXTRUSION`. Classic linear advance caps accel to `MAX_E_JERK`/(K·e/D), **which changes time** (Configuration_adv.h:2484-2527; planner.cpp:2376-2384) | M572 D S (s) | M572 S W (0–0.2 s window), Klipper-style; firmware 5.0.0-alpha1 (https://forum.prusa3d.com/forum/input-shaping/firmware-5-0-0-alpha1/) |
| Exposed in config | `[printer]`: max_velocity, max_accel, minimum_cruise_ratio, square_corner_velocity; `[extruder]`: pressure_advance, instantaneous_corner_velocity; `[input_shaper]`; `[gcode_arcs]` | Compile-time `Configuration*.h`; runtime M201/M203/M204/M205/M900/M593, stored by M500 | `config.g`: M201/M203/M204/M566/M572/M593 | Compile-time plus M-codes; printer profile limits in PrusaSlicer |

Notes on the table:
- Klipper's runtime command is `SET_VELOCITY_LIMIT`.
- The Marlin rows cite Marlin@2ef3ee6 (Marlin/ and src/module/), and the M-codes are dispatched in src/gcode/gcode.cpp:723-731.
- The RRF M-codes are documented at https://reprap.org/wiki/G-code.
- Bambu firmware is closed, so its motion model is unknown (unverified). Its profiles emit Marlin-style M204/M205 and private resonance commands.

What follows for simulation:
- **Planner model per firmware.** Move durations need the trapezoid, the junction model (scv-derived junction deviation, Marlin junction deviation or classic jerk, or RRF per-axis jerk) and lookahead.
- **Input shaping and Klipper pressure advance** move the nozzle, not the clock. A time simulator can ignore them, and only a position-accurate path render would need the shaper smoothing.
- **Exceptions.** Marlin's classic linear advance accel cap must be modelled, and RRF shaping may lengthen moves (unverified).
- **Klipper and Marlin limits.** Klipper ignores the M201/M203/M205 limits that slicers emit. An estimator that honours them for a Klipper printer is wrong, so limits must come from the printer config: Moonraker `printer.cfg`, or a profile.

### 5. Existing viewers and estimators

**Estimators:**

| Tool | Model | Klipper fidelity | Accuracy claim | Licence |
|---|---|---|---|---|
| PrusaSlicer libpgcode | Port of the Buddy Marlin planner. One TimeMachine per mode (normal and stealth) writes M73 P/R and Q/S lines. 64-block queue, recalculated every 256 blocks. Trapezoid only. Junction deviation if `machine_max_junction_deviation` > 0, else classic jerk (TimeMachine.cpp:40-145; TimeBlock.cpp:32-73; TimeProcessor.hpp:14-17, .cpp:128-131; ProcessorImpl.cpp:726-842) | Treated as Marlin: no scv, no minimum cruise ratio, no SET_VELOCITY_LIMIT. M205 J is not parsed (ProcessorImpl.cpp:1560-1582) | none stated | AGPL-3.0 |
| OrcaSlicer GCodeProcessor | Marlin junction deviation and jerk "ported from PrusaSlicer" (GCodeProcessor.cpp:7815), plus `plan_klipper()`, a port of Klipper's `LookAheadQueue.flush` with the minimum-cruise-ratio pass and lazy flush (:503-617) | Good: scv-derived junction deviation, SET_VELOCITY_LIMIT with Klipper 0.13 precedence (:4180, 6867-6910, 7786-7800) | none stated | AGPL-3.0 |
| klipper_estimator | Rust, about 3.3 kLOC. `lib/src/planner.rs` ports the Klipper toolhead (junction at :399-421), with arcs, firmware retraction and kind tracking from slicer comments. Config comes from Moonraker or JSON (tool/src/main.rs:310-322). Post-processing rewrites M73 and slicer summary lines for Prusa, Super, Orca, Cura, ideaMaker and S3D (tool/src/cmd/post_process.rs:47-302) | Reference implementation. Cannot see inside macros; uses `; ESTIMATOR_ADD_TIME`. No delta kinematics | "more than a minute over a >12 hour print … is considered a bug" (README.md:11-13); not verified here | MIT |

**Viewers:**

| Viewer | Parse | Geometry | Bytes per move (GPU) | Scrub | Simulation | Licence |
|---|---|---|---|---|---|---|
| libvgcode (PrusaSlicer 2.8+ and 3.0, Orca) | C++ processor output, shared with no copy (`shared_ptr<const MoveVertices>`, FdmViewerInputData.hpp:32) | One instanced 8-vertex/24-index prism per segment (SegmentTemplate.cpp; draw at :101). Per-move data in texture buffers, or in 2D textures in the GLES path (ViewerImpl.cpp:363-375, 524-595, 2361-2370) | about 40 (position 16, height/width/angle 16, colour 4, visible index 4) | Recomputes the visible-index list and re-uploads only that (ViewerImpl.cpp:1300-1365) | Tool marker snaps to vertices, with no interpolation inside a segment (:2734-2739). Times come from the processor | AGPL-3.0 (SegmentTemplate.cpp:1-4) |
| Legacy Prusa viewer (pre-2.8; SuperSlicer, BambuStudio) | same processor | Baked triangles per move (SuperSlicer@1f3d287:src/slic3r/GUI/GCodeViewer.hpp:30, 568-600) | about 264 | rebuild per range | vertex steps | AGPL-3.0 |
| gcode-preview | Main thread, streaming text into JS `number[]` (gcode-preview.ts:175-243; path.ts:21-81) | three.js fat lines, or swept tubes as a BatchedMesh (objects-manager.ts:568-623, 723-730; extrusion-geometry.ts:56-123) | lines about 48; tubes 400+ and held twice | Z clipping planes (objects-manager.ts:563-572, 740-766) | progressive draw per frame, no timing | MIT |
| Mainsail → @sindarius/gcodeviewer 3.7.18 (Babylon.js) | Main thread | Thin instances: mat4 + rgba = 80 bytes plus a JS object per move. Quality levels drop every Nth row, 25k to 25M lines (Viewer.vue:103-109, 517-533) | 80+ | file-position slider (:1128-1156) | Follows the printer's `virtual_sdcard.file_position` (:419, :736). Feedrate-only "simulation" | GPL-3.0 / LGPL-3.0+ |
| Fluidd | Web Worker, streaming, typed arrays handed over without copying (parseGcode.ts:24-33, 208, 218-225, 575-576) | 2D SVG per layer, native arcs (GcodePreview.vue:8-80) | 26 on the CPU; no GPU | per layer | Binary search of file offsets against the printer's position (store/gcodePreview/getters.ts:208) | GPL-3.0 |

Orca's libvgcode adds colour modes (pressure advance, acceleration, jerk), order-independent transparency, shadows and section planes on desktop GL only (OrcaSlicer@09aa0114:src/libvgcode/include/Types.hpp:90-114; ViewerImpl.hpp:563-630). Its CPU vertex (`PathVertex`, about 88 bytes) also carries acceleration and jerk per move (include/PathVertex.hpp:19-85).

### 6. Rendering approaches for a webview, and memory for 50–500 MB

**Platform (2026-10-25):**
- **WebGL2.** VS Code 1.144 runs on Electron 43.8.3 (github.com/microsoft/vscode `package.json` and `.npmrc`), so webviews get Chromium WebGL2.
- **WebGPU.** VS Code's own editor has a WebGPU renderer (`src/vs/editor/browser/gpu/gpuDisposable.ts`). Whether `navigator.gpu` works inside extension webviews, and on which Linux drivers, is unverified.
- **WebGPU default limits:** 256 MiB per buffer, 128 MiB per storage binding, 8192 per texture side (https://gpuweb.github.io/gpuweb/).
- **JS heap.** V8 caps the heap at 4 GB under pointer compression, and ArrayBuffers sit outside it (https://www.electronjs.org/blog/v8-memory-cage).
- **Hidden webviews** lose their context unless `retainContextWhenHidden` is set, which costs memory (https://code.visualstudio.com/api/extension-guides/webview). GPU data must be quick to rebuild from a compact cache.

**Approaches:**

| Approach | Pros | Cons |
|---|---|---|
| GL_LINES or fat-line instances | Cheapest; good for travels and far zoom | No width or height; fat lines need an instanced quad anyway |
| Baked tube or prism triangles | Simple shaders | 200–450 bytes per move; any colour or range change rebuilds or re-uploads everything |
| Instanced segment template, with per-move attributes in data textures (libvgcode) | About 40 bytes per move. Scrub = rewrite one u32 index list. Colour mode = rewrite one rgba8 texture. Works in WebGL2 (`texelFetch`) | Vertex shader is more complex; texture-size chunking needed |
| Same, with WebGPU storage buffers | Compute shaders can build visibility and colour on the GPU | Webview support unverified; 128 MiB binding limit means chunking |
| 2D SVG or canvas per layer (Fluidd) | Trivial, exact arcs | No 3D view |

**Layer scrubbing and feature colouring.**
- Keep the geometry static. Visibility is a contiguous range plus role and travel filters, which is cheap with an index list (libvgcode) or with `drawArraysInstanced` over a first/count range when moves are sorted by file order.
- Compute feature, speed, flow, fan, temperature, layer-time and tool colouring in the shader from per-move scalars and a palette or LUT texture. Then switching mode means swapping a uniform, not re-uploading.

**Memory.** Assume 500 MB of G-code is about 15M moves, at roughly 33 bytes per line (unverified; more if arcs are linearised):

| Layout | Bytes per move | 15M moves |
|---|---|---|
| Raw text kept in memory | ~33 | 500 MB; avoid by keeping only file offsets |
| Prusa `MoveVertex` (CPU) | ~76 | 1.1 GB |
| Orca `PathVertex` (CPU) | ~88 | 1.3 GB |
| libvgcode GPU | ~40 | 600 MB |
| Legacy baked triangles | ~264 | 4.0 GB |
| gcode-preview tubes | 400+, held twice | 6+ GB, not workable |
| Sindarius thin instances | 80+ plus JS objects | 1.2 GB+, so it decimates |
| Fluidd structure-of-arrays (2D) | 26 | 390 MB |
| **Proposed:** f32×3 position, f16 width and height, u8 role/tool/flags, u32 file offset, f32 start time; colour from the shader | ~28 | ~420 MB |

**Measured moves per byte (GCP-17, 2026-10-25).** `@vsslicer/gcode-parser@0.8.5` on the 12 text files of the golden corpus (`vsslicer/modules/gcode-parser/test/fixtures`, repo `0714681`), default tessellation (0.05 mm, 15° per chord); raw numbers in `.reference/notes/GCP-17-moves-per-byte.md`:

- The corpus averages 33.4k moves per MB (30 bytes per move, 23–31 bytes per line). Files without arcs reach at most 39.8k per MB, so 500 MB gives 16.7M moves on average and 19.9M at worst.
- Arc fitting raises moves per byte, because the file shrinks more than the move count. Bambu Studio's cylinder goes from 36.1k to 57.1k per MB (−68% bytes, −50% moves, 5.5 chords per G2/G3). Orca's goes from 30.0k to 32.1k (3.8 chords per arc).
- The worst case at 500 MB is 28.6M moves: 800 MB at 28 bytes, 914 MB with the 4-byte extrusion column. A tolerance of 0.01 mm gives 46M moves, and a 5° chord limit gives 57M.
- Unverified: the corpus holds only small prints, scaled up linearly. Large-radius arcs are bound by the tolerance (about 70 chords per circle at r = 50 mm), and no fixture has any.

At 50 MB (about 1.5M moves) every approach except tubes fits comfortably. At 500 MB, only compact typed arrays plus an instanced template stay under about 1 GB in total across the extension host, the webview and the GPU. Above roughly 20M moves, the next step is level of detail for far zoom: merge collinear segments or drop travels out of range.

### 7. Recommendation

**Parse in the extension host.** Write a Node worker thread in TypeScript (or Rust compiled to WASM), streamed from disk.
- It reads text G-code, our own bgcode reader (inflate via DecompressionStream, heatshrink, MeatPack), and `.gcode.3mf` (zip → `Metadata/plate_N.gcode`).
- It recognises both tag sets: the Prusa/compatible set and the BBL set.
- It extracts thumbnails, object labels in all three forms, and the config block. The config block gives the printer limits when no live printer config is available.
- Output is structure-of-arrays typed arrays, transferred to the webview without copying. Raw text stays on disk, reached through file offsets, so the G-code pane can read lines lazily.

**Simulate with our own planner per firmware**, run in the same worker:
- **Klipper:** reimplement the toolhead algorithm cleanly from klipper@ee2c6fb:docs/Kinematics.md and the published formulas: trapezoid, scv-derived junction deviation, minimum cruise ratio and lookahead flush. Use klipper_estimator only as a black-box test oracle, and copy none of its code. Its planner (klipper_estimator@dbcff4a:lib/src/planner.rs:399-421) translates GPL-3.0 klippy/toolhead.py `calc_junction` (toolhead.py:66-99) almost line by line, so its MIT label may not cover that code (provenance risk; see Licence notes).
- **Marlin 2 / Buddy:** a 16-block reverse/forward/trapezoid planner with junction deviation or classic jerk, firmware arc segmentation, and linear-advance accel capping.
- **RRF:** per-axis jerk from M566, in mm/min.
- **Bambu:** treat it as Marlin with jerk from the profile, and mark the result as an estimate (closed firmware).
- **Limits** come from the live printer (Moonraker `printer.cfg` / `configfile`, RRF `config.g`) when connected, otherwise from the profile. Ignore M201/M203/M205 for Klipper.
- **Output** is per-move start time and speeds (entry, cruise, exit). The viewer interpolates the toolhead inside a segment at time t; libvgcode does not do this.
- **Accuracy target:** within klipper_estimator's own bar, under 1 minute over 12 hours, checked against klipper_estimator output and, later, real print logs.
- Input shaping and pressure advance are out of scope for timing in v1. They are only needed for a "true nozzle path" overlay later.

**Render in the webview with WebGL2 first.**
- Reimplement libvgcode's technique from its description: one instanced segment template, per-move data in 2D data textures, a visible-index list or contiguous range for scrubbing, and colouring in the shader.
- three.js is optional. A raw WebGL2 renderer of a few hundred lines avoids per-object overhead.
- Add WebGPU as a second backend once a spike confirms `navigator.gpu` in webviews.
- For live prints, follow the file position the way Fluidd and Mainsail do, by binary search over file offsets.

**Reuse versus reimplement:**
- **Reimplement:** the parser, bgcode reader, planner and renderer.
- **Use as a tool, not as code:** run klipper_estimator as a test oracle, and optionally as a separate CLI the user installs. Do not port its planner (provenance risk; see Licence notes).
- **Can be taken as libraries:**
  - gcode-preview (MIT), for a quick small-file preview or for reading its arc tessellator.
  - three.js (MIT).
  - fflate or the native DecompressionStream for inflate.
  - The heatshrink reference implementation (ISC licence, unverified).
- **Do not link:** libbgcode, libvgcode or libpgcode, which are AGPL.

## Comparison

| Capability | PrusaSlicer 3 | OrcaSlicer | gcode-preview | Mainsail (Sindarius) | Fluidd | klipper_estimator |
|---|---|---|---|---|---|---|
| bgcode read | yes (libbgcode) | no (no `bgcode` hits in src) | no | no | no | no |
| 3D | yes | yes | yes | yes | no (2D) | — |
| Worker parse | native | native | no | no | yes | CLI |
| Bytes per move (GPU) | ~40 | ~40 | 48 / 400+ | 80+ | 26 (CPU) | — |
| Klipper-accurate time | no | yes | — | no | — | yes |
| Marlin/Buddy-accurate time | yes | yes | — | no | — | — |
| Arc handling | firmware-like segmentation | firmware-like segmentation | tolerance tessellation | (unverified) | native SVG arcs | Klipper resolution |
| Live print follow | — | — | — | file position | file position | — |
| Licence | AGPL | AGPL | MIT | GPL / LGPL | GPL | MIT (planner may derive from GPL Klipper) |

## Implications for VSSlicer

- **Reimplement:**
  - a streaming parser for text, bgcode and `.gcode.3mf`;
  - per-firmware planners (Klipper, Marlin/Buddy, RRF);
  - a WebGL2 instanced renderer using a compact structure-of-arrays layout of about 28 bytes per move.
- **Do not port:** klipper_estimator's planner. It is MIT-labelled but appears to be a translation of GPL-3.0 Klipper code. Reimplement from Kinematics.md and the formulas, and keep klipper_estimator as an oracle only.
- **Wrap, optionally:** the klipper_estimator CLI as a post-processor that rewrites M73 and summary comments, like Orca's compatibility line.
- **Skip in v1:** input-shaper and pressure-advance position effects, G5 (no slicer emits it), and the Bambu private M-codes beyond showing them as named markers.
- **Data contract:** the per-move arrays (position, width, height, role, tool, flags, file offset, start time) are the interface between parser, simulator and renderer. That lets the planner and renderer evolve separately, and lets printer-connectivity cards drive live follow through file offsets.

## Licence notes

- **AGPL-3.0:** libbgcode, libvgcode, libpgcode and GCodeProcessor (PrusaSlicer, Orca, Bambu Studio). Copying or linking them, including the libbgcode WASM, makes VSSlicer AGPL. Use them only as references for behaviour and format.
- **GPL-3.0:** Klipper, Marlin, Mainsail and Fluidd. Read for behaviour; do not copy code.
- **LGPL-3.0+:** @sindarius/gcodeviewer. It could be used as a separate dynamically loaded module, but it is not recommended because it caps scale.
- **MIT:** gcode-preview, safe to reuse with attribution.
- **MIT label with a provenance risk:** klipper_estimator. Its `lib/src/planner.rs:399-421` is a near line-by-line translation of GPL-3.0 klipper@ee2c6fb:klippy/toolhead.py:66-99 (`calc_junction`) and the lookahead flush. If it is a derivative work, the MIT licence cannot relicense that part. Do not copy or port it. Running it as a separate program, or comparing against its output, is fine. Reimplement the planner from klipper@ee2c6fb:docs/Kinematics.md, which is GPL-3.0 text but describes the method, and from the published junction-deviation formula (inference, not legal advice).
- **Format specs are not code.** Reimplementing bgcode from `doc/specifications.md` is a reimplementation of a format. Keeping the spec's own text out of our code and docs avoids questions (inference, not legal advice).

## Open questions

- Is WebGPU (`navigator.gpu`) available inside VS Code extension webviews on Windows, macOS and Linux? What `MAX_TEXTURE_SIZE` and memory limits apply in practice? This needs a spike.
- RRF: lookahead depth, its segmentation of arcs and moves (M669 S/T), and whether input shaping lengthens moves. The docs could not be fetched; read the RRF source in depth.
- Bambu firmware motion model, and the real meanings of M1002, M622/M623 and the M97x codes. Do M622 J blocks run conditionally per printer state, which affects time?
- How Prusa Buddy phase stepping and input shaping affect timing, and whether Buddy's input shaping derives from Klipper.
- How accurate klipper_estimator, Orca `plan_klipper` and Prusa really are against measured prints. This needs instrumented test prints.
- For the licensing synthesis (VSS-16): does klipper_estimator's planner count as a derivative of GPL-3.0 Klipper? Is a clean-room reimplementation from Kinematics.md enough for a non-GPL VSSlicer? Is a bundled klipper_estimator binary acceptable?
- ~~The real ratio of bytes per line to moves per file with arc fitting on.~~ Measured by GCP-17 (§6). What is still open is large-radius arc fitting on a large print.
- How Sindarius gcodeviewer handles arcs (minified bundle not checked).
