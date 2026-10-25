# Feature inventory: Bambu Studio and OrcaSlicer

Scope: every user-facing feature of Bambu Studio and OrcaSlicer, taken from their option definitions (`PrintConfig.cpp`) and GUI code, with what each fork added over PrusaSlicer. Researched 2026-10-25 (VSS-3). Protocol and camera details are dated to these commits; the printer-API card covers the protocols themselves.

Sources (shallow clones in `.reference/repos/`):

| Project | Commit | Notes |
|---|---|---|
| BambuStudio | `79df7ae` | `src/libslic3r/PrintConfig.cpp` (10619 lines) |
| OrcaSlicer | `09aa0114` | `src/libslic3r/PrintConfig.cpp` (14447 lines) |
| PrusaSlicer | `30ef591` (3.0.0-alpha12, 2026-09-21) | Prusa 3.0 restructured its source tree, so `src/libslic3r/PrintConfig.cpp` no longer exists. The 2.x option set now lives in `src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp`, which is used here as the inherited baseline |
| SuperSlicer | `1f3d287` | used only to tag Orca keys that also exist in SuperSlicer |

Lineage: Bambu Studio "is based on PrusaSlicer" (BambuStudio@79df7ae:README.md:8). Orca forked Bambu Studio and also draws on PrusaSlicer, SuperSlicer and Cura (OrcaSlicer@09aa0114:README.md:242-244). Citation shorthand used in the settings tables: `P<line>`, `B<line>` and `O<line>` are lines in the three `PrintConfig.cpp` files listed above, at the listed commits.

Method for settings: a script reads the three files as text (nothing cloned is executed). It collects every `this->add("key", coType)` between `PrintConfigDef::PrintConfigDef` and `handle_legacy`, plus the loop-generated `filament_*` overrides. It classifies each key by preset type (`s_Preset_*_options` in `src/libslic3r/Preset.cpp`) and by `Tab.cpp` page and group (`add_options_page` / `new_optgroup`). Bambu renamed most Prusa keys (for example `perimeters` became `wall_loops`) without leaving `handle_legacy` aliases, so a raw key diff overcounts "Bambu-added" keys. A curated map of 151 Prusa-to-Bambu equivalences fixes this; it was checked against all three key sets, and three proposed pairs were rejected. A tooltip-similarity pass found 15 more. The equivalence map is a semantic judgement, not proof of descent. The full three-way dump, with every key's label, tooltip and line numbers, is in `.reference/notes/VSS-3-features-bambustudio-orcaslicer.md`.

## Findings

### 1. Settings: every category and setting, with origin

Counts of non-SLA keys parsed: Prusa 386, Bambu 615, Orca 804. SLA keys: Prusa 84, Bambu 76, Orca 76. The per-axis machine limits (`machine_max_speed/acceleration/jerk_{x,y,z,e}`) are defined in a loop and expanded by the extractor. Bambu and Orca keep the inherited SLA definitions but have no SLA workflow.

Origin codes:

| Code | Meaning | Count (non-SLA) |
|---|---|---|
| `P` | Prusa-inherited (same key in Prusa, Bambu, Orca) | 119 |
| `P~` | Prusa feature renamed by Bambu (Orca keeps Bambu name); Prusa key in parentheses | 133 |
| `P~O` | Orca key equivalent to a Prusa key, not in Bambu | 8 |
| `P~-O` | Bambu rename of a Prusa key, dropped by Orca | 6 |
| `P>O` | Same key in Prusa and Orca, absent in Bambu (Orca port from Prusa/SuperSlicer, or Bambu removal) | 43 |
| `P-O` | Prusa key kept by Bambu, removed by Orca | 6 |
| `B` | Bambu-added, inherited by Orca | 251 |
| `B-only` | Bambu-added, not in Orca | 100 |
| `O` | Orca-added | 232 |
| `O(SS)` | Orca-added, same key exists in SuperSlicer (likely ported from it) | 18 |
| `P-renamed` | Prusa key whose feature lives under another name in the forks | 149 |
| `P-only` | Prusa key with no fork equivalent | 69 |

Feature families each fork added, read off the `B`, `B-only`, `O` and `O(SS)` keys (individual keys and their meanings are in the tables below):

| Added by | Feature families (representative keys) |
|---|---|
| Bambu (kept by Orca) | Plate types with per-plate bed temperatures (`cool_plate_temp`, `eng_plate_temp`, `hot_plate_temp`, `textured_plate_temp` + `_initial_layer`, `curr_bed_type`). Prime tower redesign (`prime_tower_*`, `wipe_tower_*` rib/fillet). Colour-derived flush volumes (`flush_multiplier`; the matrix itself is Prusa's renamed `wiping_volumes_matrix`). Multi-extruder and multi-nozzle variants (`extruder_variant_list`, `*_extruder_variant`, `filament_map*`, `nozzle_volume_type`). Timelapse (`timelapse_type`, `time_lapse_gcode`). Arc fitting (`enable_arc_fitting`). Seam slope / scarf (`seam_slope_*`). Overhang speed bands (`overhang_1_4_speed`...`overhang_4_4_speed`). Tree supports (`tree_support_*`). Ironing pattern (`ironing_pattern`; ironing itself is Prusa's `ironing_type`). Exclude areas (`bed_exclude_area`), head-wrap detection (`wrapping_*`), cooling filter and auxiliary/chamber fans (`support_cooling_filter`, `additional_cooling_fan_speed`, `support_chamber_temp_control`). Filament metadata for the AMS (`filament_ids`, `required_nozzle_HRC`, `filament_is_support`) |
| Bambu only (not in Orca at `09aa0114`) | Conformal infill (`conformal_*`), circle and hole compensation (`enable_circle_compensation`, `hole_coef_*`, `counter_coef_*`), height-based slowdown (`slowdown_start_*`, `slowdown_end_*`, `enable_height_slowdown`), periodic modifiers (`periodic_modifier*`), AMS-type load/unload times (`ams_filament_load_time_ams*`), per-filament scarf seam (`filament_scarf_*`), `skirt_per_object`, `vertical_shell_speed`, `sub_top_surface_pattern`, `print_in_clockwise`. Several Bambu-only keys are Orca features under another name (`prime_tower_rib_width` / Orca `wipe_tower_rib_width`, `role_base_wipe_speed` / `role_based_wipe_speed`, `enable_support_ironing` / `support_ironing`), so the two key sets are drifting apart |
| Orca | Calibration and motion: input shaping (`input_shaping_*`), junction deviation, adaptive pressure advance (`adaptive_pressure_advance*`), resonance avoidance. Per-feature flow ratios (`outer_wall_flow_ratio`, `sparse_infill_flow_ratio`, `bridge`/`overhang`/`support`/`gap_fill` flow ratios). Bridging (`internal_bridge_*`, `thick_internal_bridges`, `enable_extra_bridge_layer`, `bridge_density`). Infill (`gyroid_optimized`, lateral lattice, rotate templates, `adaptive_infill_*`, `align_infill_direction_to_model`, `infill_complete_top`). Walls and surfaces (`only_one_wall_top`, `wall_direction`, `top_surface_expansion*`, `overhang_reverse*`, `make_overhang_printable*`, `zaa_*`). Brim (`brim_ears*`, `combine_brims`, `brim_use_efc_outline`). Skirt (`skirt_type`, `single_loop_draft_shield`). Per-feature filament assignment (`*_filament_id`). Prusa-style wipe tower (`wipe_tower_type`, `wipe_tower_wall_type`, ramming and cooling moves). Belt printers (`belt_*`), IDEX/multi-gantry (`imex_*`), parallel printheads, pellet printers (`pellet_*`). Klipper adaptive bed mesh (`bed_mesh_*`). Air filtration and chamber control (`activate_air_filtration_*`, `activate_chamber_temp_control`). Role-change G-code hooks (`change_extrusion_role_gcode` and process/filament variants). Plugins (`plugins`, `slicing_pipeline_plugin`, `print_`/`printer_`/`filament_plugin_config_overrides` defined in a loop at O1305). Print hosts (`host_type` enum, `printer_agent`) |
| Orca, also in SuperSlicer | `brim_ears*`, `hole_to_polyhole*`, `fan_speedup_*`, `fan_kickstart`, `first_layer_flow_ratio`, `internal_bridge_speed`/`_fan_speed`, `ironing_angle`, `min_width_top_surface`, `small_area_infill_flow_compensation_model`, `time_cost` (these are probably ports from SuperSlicer; the direction is unverified per key) |
| Orca, same key as Prusa but absent in Bambu (`P>O`) | Prusa MMU and multi-tool ramming (`filament_cooling_*`, `filament_loading_*`, `filament_multitool_ramming*`, `cooling_tube_*`, `parking_pos_retraction`), `gcode_label_objects`, `gcode_comments`, `thumbnails`/`thumbnails_format`, `staggered_inner_seams`, `travel_slope`, `idle_temperature`, `z_offset`, `machine_max_junction_deviation`, `chamber_temperature` |
| Prusa keys absent from both forks | `gcode_substitutions`, `binary_gcode`, `between_objects_gcode`, `color_change_gcode`, the Prusa-style `overhang_fan_speed_0..3`, `travel_max_lift` (ramping lift maps loosely to Bambu `z_hop_types`), `wipe_tower_acceleration`, `automatic_extrusion_widths`, `prefer_clockwise_movements`, `nozzle_high_flow`, `filament_abrasive` (several were added to Prusa after Bambu forked, around Prusa 2.6-2.9; unverified per key) |

Direction caveat: key presence cannot show which fork came up with a feature. Where Bambu has a key that Orca also has, some features started in Orca and were later taken up by Bambu. Orca's README claims Orca introduced the calibration tools, scarf seams and adaptive features (OrcaSlicer@09aa0114:README.md:244). `P~` also covers features Prusa adopted after the fork, such as arc fitting, scarf seams and overhang speeds; for those, `P~` means "equivalent", not "inherited".

The tables below follow OrcaSlicer's `Tab.cpp` layout: `TabPrint` (Quality, Strength, Speed, Support, Multimaterial, Others), `TabPrintPlate`, `TabFilament` (Filament, Cooling, Setting Overrides, Advanced, Multimaterial, Dependencies, Notes) and `TabPrinter` (Basic information, Machine G-code, Motion ability, Multimaterial, Extruder, Notes) (OrcaSlicer@09aa0114:src/slic3r/GUI/Tab.cpp:2980-3502, 4065, 4421-5063, 5428-6217). Rows are in Tab.cpp order. Bambu-only keys follow, grouped by Bambu's `Tab.cpp`. Keys that are not on any Tab page come last, grouped by preset list. Meanings are the option's label plus the first sentence of its tooltip, truncated.

#### OrcaSlicer

##### TabPrint

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| Quality / Layer height | `layer_height` P421 B1098 O1134 | Float | P | Layer height: This is the height for each layer. |
| Quality / Layer height | `initial_layer_print_height` B3459 O4061 | Float | P~ (first_layer_height) | First layer height: Height of the first layer. |
| Quality / Layer height | `enable_mixed_color_sublayer` B6243 O8231 | Bool | B | Mixed color sublayer: Enable mixed color sublayer splitting. |
| Quality / Line width | `line_width` B2446 O3018 | FloatOrPercent | P~ (extrusion_width) | Default: Default line width if other line widths are set to 0. |
| Quality / Line width | `initial_layer_line_width` B3439 O4049 | FloatOrPercent | P~ (first_layer_extrusion_width) | First layer: Line width of the first layer. |
| Quality / Line width | `outer_wall_line_width` B2236 O2690 | FloatOrPercent | P~ (external_perimeter_extrusion_width) | Outer wall: Line width of outer wall. |
| Quality / Line width | `inner_wall_line_width` B4739 O5932 | FloatOrPercent | P~ (perimeter_extrusion_width) | Inner wall: Line width of inner wall. |
| Quality / Line width | `top_surface_line_width` B6133 O8112 | FloatOrPercent | P~ (top_infill_extrusion_width) | Top surface: Line width for top surfaces. |
| Quality / Line width | `sparse_infill_line_width` B4105 O5007 | FloatOrPercent | P~ (infill_extrusion_width) | Sparse infill: Line width of internal sparse infill. |
| Quality / Line width | `internal_solid_infill_line_width` B5459 O6843 | FloatOrPercent | P~ (solid_infill_extrusion_width) | Internal solid infill: Line width of internal solid infill. |
| Quality / Line width | `support_line_width` B5734 O7439 | FloatOrPercent | P~ (support_material_extrusion_width) | Support: Line width of support. |
| Quality / Line width | `bridge_line_width` O1717 | FloatOrPercent | O | Bridge: Line width of the Bridge. |
| Quality / Seam | `seam_position` P2926 B5241 O6497 | Enum | P | Seam position: This is the starting position for each part of the outer wall. |
| Quality / Seam | `staggered_inner_seams` P2939 O6515 | Bool | P>O | Staggered inner seams: This option causes the inner seams to be shifted backwards based on thei... |
| Quality / Seam | `seam_gap` B5264 O6522 | FloatOrPercent | P~ (seam_gap_distance) | Seam gap: In order to reduce the visibility of the seam in a closed loop extrusion, the loop is... |
| Quality / Seam | `seam_slope_type` B5319 O6532 | Enum | P~ (scarf_seam_placement) | Scarf joint seam (beta): Use scarf joint to minimize seam visibility and increase seam strength... |
| Quality / Seam | `seam_slope_conditional` B5273 O6546 | Bool | B | Conditional scarf joint: Apply scarf joints only to smooth perimeters where traditional seams d... |
| Quality / Seam | `scarf_angle_threshold` B5280 O6553 | Int | B | Conditional angle threshold: This option sets the threshold angle for applying a conditional sc... |
| Quality / Seam | `scarf_overhang_threshold` O6565 | Percent | O | Conditional overhang threshold: This option determines the overhang threshold for the applicati... |
| Quality / Seam | `scarf_joint_speed` O6577 | FloatOrPercent | O | Scarf joint speed: This option sets the printing speed for scarf joints. |
| Quality / Seam | `seam_slope_start_height` B5333 O6600 | FloatOrPercent | P~ (scarf_seam_start_height) | Scarf start height: Start height of the scarf. |
| Quality / Seam | `seam_slope_entire_loop` B5290 O6611 | Bool | P~ (scarf_seam_entire_loop) | Scarf around entire wall: The scarf extends to the entire length of the wall. |
| Quality / Seam | `seam_slope_min_length` B5353 O6618 | Float | P~ (scarf_seam_length) | Scarf length: Length of the scarf. |
| Quality / Seam | `seam_slope_steps` B5297 O6627 | Int | B | Scarf steps: Minimum number of segments of each scarf. |
| Quality / Seam | `scarf_joint_flow_ratio` O6591 | Float | O | Scarf joint flow ratio: This factor affects the amount of material for scarf joints. |
| Quality / Seam | `seam_slope_inner_walls` B5305 O6635 | Bool | P~ (scarf_seam_on_inner_perimeters) | Scarf joint for inner walls: Use scarf joint for inner walls as well. |
| Quality / Seam | `role_based_wipe_speed` O6642 | Bool | O | Role based wipe speed: The wipe speed is determined by the speed of the current extrusion role. |
| Quality / Seam | `wipe_speed` B5362 O6698 | FloatOrPercent | B | Wipe speed: The wipe speed is determined by the speed setting specified in this configuration. |
| Quality / Seam | `wipe_on_loops` O6650 | Bool | O | Wipe on loops: To minimize the visibility of the seam in a closed loop extrusion, a small inwar... |
| Quality / Seam | `wipe_inward` O6657 | Bool | O | Wipe inward: Applies only to external walls, including hole boundaries. |
| Quality / Seam | `wipe_inward_distance` O6669 | FloatOrPercent | O | Wipe inward distance: The distance the wipe path is shifted away from the external perimeter, s... |
| Quality / Seam | `wipe_before_external_loop` O6687 | Bool | O | Wipe before external loop: To minimize visibility of potential overextrusion at the start of an... |
| Quality / Precision | `slice_closing_radius` P3288 B5573 O7267 | Float | P | Slice gap closing radius: Cracks smaller than 2x gap closing radius are being filled during the... |
| Quality / Precision | `resolution` P2752 B4901 O6090 | Float | P | Resolution: The G-code path is generated after simplifying the contour of models to avoid too m... |
| Quality / Precision | `enable_arc_fitting` B3662 O4426 | Enum | P~ (arc_fitting) | Arc fitting: Fit G2 and G3 arc moves to the toolpaths. |
| Quality / Precision | `xy_hole_compensation` B6533 O8528 | Float | B | X-Y hole compensation: Holes in objects will expand or contract in the XY plane by the set valu... |
| Quality / Precision | `xy_contour_compensation` B6543 O8536 | Float | P~ (xy_size_compensation) | X-Y contour compensation: Contours of objects will expand or contract in the XY plane by the se... |
| Quality / Precision | `elefant_foot_compensation` P396 B1089 O1102 | Float | P | Elephant foot compensation: This shrinks the first layer on the build plate to compensate for e... |
| Quality / Precision | `elefant_foot_layers_density` O1122 | Percent | O | Elephant foot layers density: Density of internal solid infill for Elephant foot layers compens... |
| Quality / Precision | `elefant_foot_compensation_layers` O1111 | Int | O | Elephant foot compensation layers: The number of layers on which the elephant foot compensation... |
| Quality / Precision | `precise_outer_wall` B3635 O1863 | Bool | B | Precise wall: Improve shell precision by adjusting outer wall spacing. |
| Quality / Precision | `precise_z_height` B3653 O4416 | Bool | B | Precise Z height: Enable this to get precise Z height of object after slicing. |
| Quality / Precision | `hole_to_polyhole` O8544 | Bool | O(SS) | Convert holes to polyholes: Search for almost-circular holes that span more than one layer and ... |
| Quality / Precision | `hole_to_polyhole_threshold` O8553 | FloatOrPercent | O(SS) | Polyhole detection margin: Maximum defection of a point to the estimated radius of the circle. |
| Quality / Precision | `hole_to_polyhole_twisted` O8566 | Bool | O(SS) | Polyhole twist: Rotate the polyhole every layer. |
| Quality / Precision | `hole_to_polyhole_max_edges` O8573 | Int | O | Maximum Polyhole edge count: Maximum number of polyhole edges This setting limits the amount of... |
| Quality / Ironing | `ironing_type` P2158 B4230 O5150 | Enum | P | Ironing type: Ironing uses a small flow to print at the same height of a surface to make flat s... |
| Quality / Ironing | `ironing_pattern` B4247 O5166 | Enum | B | Ironing Pattern: The pattern that will be used when ironing. |
| Quality / Ironing | `ironing_flow` B4260 O5178 | Percent | P~ (ironing_flowrate) | Ironing flow: This is the amount of material to be extruded during ironing. |
| Quality / Ironing | `ironing_spacing` P2180 B4272 O5189 | Float | P | Ironing line spacing: This is the distance between the lines used for ironing. |
| Quality / Ironing | `ironing_inset` B4282 O5199 | Float | B | Ironing inset: The distance to keep from the edges. |
| Quality / Ironing | `ironing_angle` O5218 | Float | O(SS) | Ironing angle offset: The angle of ironing lines offset from the top surface. |
| Quality / Ironing | `ironing_angle_fixed` O5228 | Bool | O | Fixed ironing angle: Use a fixed absolute angle for ironing. |
| Quality / Z contouring | `zaa_enabled` O5245 | Bool | O | Z contouring enabled: Enable Z-layer contouring (aka Z-layer anti-aliasing). |
| Quality / Z contouring | `zaa_minimize_perimeter_height` O5252 | Float | O | Minimize wall height angle: Reduce the height of top-surface perimeters to match the model edge... |
| Quality / Z contouring | `zaa_min_z` O5271 | Float | O | Minimum Z height: Minimum Z-layer height. |
| Quality / Z contouring | `zaa_dont_alternate_fill_direction` O5264 | Bool | O | Don't alternate fill direction: Disable alternating fill direction when using Z contouring. |
| Quality / Wall generator | `wall_generator` B6553 O8615 | Enum | P~ (perimeter_generator) | Wall generator: The classic wall generator produces walls with constant extrusion width and for... |
| Quality / Wall generator | `wall_transition_angle` P4028 B6593 O8651 | Float | P | Wall transitioning threshold angle: When to create transitions between even and odd numbers of ... |
| Quality / Wall generator | `wall_transition_filter_deviation` P4013 B6578 O8636 | Percent | P | Wall transitioning filter margin: Prevent transitioning back and forth between one extra wall a... |
| Quality / Wall generator | `wall_transition_length` P4002 B6567 O8627 | Percent | P | Wall transition length: When transitioning between different numbers of walls as the part becom... |
| Quality / Wall generator | `wall_distribution_count` P4041 B6606 O8664 | Int | P | Wall distribution count: The number of walls, counted from the center, over which the variation... |
| Quality / Wall generator | `initial_layer_min_bead_width` O8720 | Percent | O | First layer minimum wall width: The minimum wall width that should be used for the first layer ... |
| Quality / Wall generator | `min_bead_width` P4062 B6627 O8730 | Percent | P | Minimum wall width: Width of the wall that will replace thin features (according to the Minimum... |
| Quality / Wall generator | `min_feature_size` P4050 B6615 O8673 | Percent | P | Minimum feature size: Minimum thickness of thin features. |
| Quality / Wall generator | `min_length_factor` O8684 | Float | O | Minimum wall length: Adjust this value to prevent short, unclosed walls from being printed, whi... |
| Quality / Wall generator | `wall_maximum_resolution` O8697 | Float | O | Maximum wall resolution: This value determines the smallest wall line segment length in mm. |
| Quality / Wall generator | `wall_maximum_deviation` O8708 | Float | O | Maximum wall deviation: The maximum deviation allowed when reducing the resolution for the 'Max... |
| Quality / Walls and surfaces | `wall_sequence` B2280 O2756 | Enum | P~ (external_perimeters_first) | Walls printing order: Print sequence of the internal (inner) and external (outer) walls. |
| Quality / Walls and surfaces | `is_infill_first` B2294 O2779 | Bool | P~ (infill_first) | Print infill first: Order of wall/infill. |
| Quality / Walls and surfaces | `wall_direction` O2786 | Enum | O | Wall loop direction: The direction which the contour wall loops are extruded when looking down ... |
| Quality / Walls and surfaces | `print_flow_ratio` B2397 O2933 | Float | B | Flow ratio: The material may have volumetric change after switching between molten and crystall... |
| Quality / Walls and surfaces | `top_solid_infill_flow_ratio` B1575 O1744 | Floats | B | Top surface flow ratio: This factor affects the amount of material for top solid infill. |
| Quality / Walls and surfaces | `bottom_solid_infill_flow_ratio` O1756 | Float | O | Bottom surface flow ratio: This factor affects the amount of material for bottom solid infill. |
| Quality / Walls and surfaces | `set_other_flow_ratios` O1766 | Bool | O | Set other flow ratios: Change flow ratios for other extrusion path types. |
| Quality / Walls and surfaces | `first_layer_flow_ratio` O1773 | Float | O(SS) | First layer flow ratio: This factor affects the amount of material on the first layer for the e... |
| Quality / Walls and surfaces | `outer_wall_flow_ratio` O1783 | Float | O | Outer wall flow ratio: This factor affects the amount of material for outer walls. |
| Quality / Walls and surfaces | `inner_wall_flow_ratio` O1793 | Float | O | Inner wall flow ratio: This factor affects the amount of material for inner walls. |
| Quality / Walls and surfaces | `overhang_flow_ratio` O1803 | Float | O | Overhang flow ratio: This factor affects the amount of material for overhangs. |
| Quality / Walls and surfaces | `sparse_infill_flow_ratio` O1813 | Float | O | Sparse infill flow ratio: This factor affects the amount of material for sparse infill. |
| Quality / Walls and surfaces | `internal_solid_infill_flow_ratio` O1823 | Float | O | Internal solid infill flow ratio: This factor affects the amount of material for internal solid... |
| Quality / Walls and surfaces | `gap_fill_flow_ratio` O1833 | Float | O | Gap fill flow ratio: This factor affects the amount of material for filling the gaps. |
| Quality / Walls and surfaces | `support_flow_ratio` O1843 | Float | O | Support flow ratio: This factor affects the amount of material for support. |
| Quality / Walls and surfaces | `support_interface_flow_ratio` O1853 | Float | O | Support interface flow ratio: This factor affects the amount of material for the support interf... |
| Quality / Walls and surfaces | `only_one_wall_first_layer` B1618 O1892 | Bool | P~ (only_one_perimeter_first_layer) | Only one wall on first layer: Use only one wall on first layer, to give more space to the botto... |
| Quality / Walls and surfaces | `only_one_wall_top` O1870 | Bool | O | Only one wall on top surfaces: Use only one wall on flat top surfaces, to give more space to th... |
| Quality / Walls and surfaces | `min_width_top_surface` O1877 | FloatOrPercent | O(SS) | One wall threshold: If a top surface has to be printed and it's partially covered by another la... |
| Quality / Walls and surfaces | `reduce_crossing_wall` B1233 O1324 | Bool | P~ (avoid_crossing_perimeters) | Avoid crossing walls: This detours to avoid traveling across walls, which may cause blobs on th... |
| Quality / Walls and surfaces | `max_travel_detour_distance` B1247 O1331 | FloatOrPercent | P~ (avoid_crossing_perimeters_max_detour) | Avoid crossing walls - Max detour length: Maximum detour distance for avoiding crossing wall: T... |
| Quality / Walls and surfaces | `small_area_infill_flow_compensation` O5333 | Bool | O | Small area flow compensation (beta): Enable flow compensation for small infill areas. |
| Quality / Walls and surfaces | `small_area_infill_flow_compensation_model` O5340 | Strings | O(SS) | Flow Compensation Model: Flow Compensation Model, used to adjust the flow for small infill area... |
| Quality / Bridging | `bridge_flow` B1547 O1705 | Float | P~ (bridge_flow_ratio) | Bridge flow ratio: This value governs the thickness of the external (visible) bridge layer. |
| Quality / Bridging | `internal_bridge_flow` O1732 | Float | O | Internal bridge flow ratio: This value governs the thickness of the internal bridge layer. |
| Quality / Bridging | `bridge_density` O1670 | Percent | O | External bridge density: Controls the density (spacing) of external bridge lines. |
| Quality / Bridging | `internal_bridge_density` O1687 | Percent | O | Internal bridge density: Controls the density (spacing) of internal bridge lines. |
| Quality / Bridging | `thick_bridges` P3705 B2057 O2416 | Bool | P | Thick external bridges: If enabled, bridge extrusion uses a line height equal to the nozzle dia... |
| Quality / Bridging | `thick_internal_bridges` O2425 | Bool | O | Thick internal bridges: If enabled, internal bridge extrusion uses a line height equal to the n... |
| Quality / Bridging | `enable_extra_bridge_layer` O2434 | Enum | O | Extra bridge layers (beta): This option enables the generation of an extra bridge layer over in... |
| Quality / Bridging | `dont_filter_internal_bridges` O2465 | Enum | O | Filter out small internal bridges: This option can help reduce pillowing on top surfaces in hea... |
| Quality / Bridging | `counterbore_hole_bridging` B1557 O1926 | Enum | B | Bridge counterbore holes: This option creates bridges for counterbore holes, allowing them to b... |
| Quality / Overhangs | `detect_overhang_wall` B4704 O5896 | Bool | P~ (overhangs) | Detect overhang walls: This detects the overhang percentage relative to line width and uses a d... |
| Quality / Overhangs | `unsupported_wall_last` O5904 | Bool | O | Print unsupported walls last: Wall loops that lie entirely in mid air are printed once somethin... |
| Quality / Overhangs | `make_overhang_printable` O5867 | Bool | O | Make overhangs printable: Modify the geometry to print overhangs without support material. |
| Quality / Overhangs | `make_overhang_printable_angle` O5874 | Float | O | Make overhangs printable - Maximum angle: Maximum angle of overhangs to allow after making more... |
| Quality / Overhangs | `make_overhang_printable_hole_size` O5886 | Float | O | Make overhangs printable - Hole area: Maximum area of a hole in the base of the model before it... |
| Quality / Overhangs | `extra_perimeters_on_overhangs` P1153 O1898 | Bool | P>O | Extra perimeters on overhangs: Create additional perimeter paths over steep overhangs and areas... |
| Quality / Overhangs | `overhang_reverse` O1905 | Bool | O | Reverse on even: Extrude perimeters that have a part over an overhang in the reverse direction ... |
| Quality / Overhangs | `overhang_reverse_internal_only` O1913 | Bool | O | Reverse only internal perimeters: Apply the reverse perimeters logic only on internal perimeter... |
| Quality / Overhangs | `overhang_reverse_threshold` O1944 | FloatOrPercent | O | Reverse threshold: Number of mm the overhang need to be for the reversal to be considered usefu... |
| Strength / Walls | `wall_loops` B4759 O5955 | Int | P~ (perimeters) | Wall loops: This is the number of walls per layer. |
| Strength / Walls | `alternate_extra_wall` B4774 O5963 | Bool | B | Alternate extra wall: This setting adds an extra wall to every other layer. |
| Strength / Walls | `detect_thin_wall` B6116 O8078 | Bool | P~ (thin_walls) | Detect thin walls: This detects thin walls which can\u2019t contain two lines and uses a single... |
| Strength / Top/bottom shells | `top_shell_layers` B6152 O8134 | Int | P~ (top_solid_layers) | Top shell layers: This is the number of solid layers of top shell, including the top surface la... |
| Strength / Top/bottom shells | `top_shell_thickness` B6162 O8143 | Float | P~ (top_solid_min_thickness) | Top shell thickness: The number of top solid layers is increased when slicing if the thickness ... |
| Strength / Top/bottom shells | `top_color_penetration_layers` B6173 O8152 | Int | B | Top paint penetration layers: The number of layers, including the top surface layer, that take ... |
| Strength / Top/bottom shells | `top_surface_density` B2172 O2574 | Percent | B | Top surface density: Density of top surface layer. |
| Strength / Top/bottom shells | `top_surface_pattern` B2147 O2549 | Enum | P~ (top_fill_pattern) | Top surface pattern: This is the line pattern for top surface infill. |
| Strength / Top/bottom shells | `top_surface_fill_order` O2647 | Enum | O | Top surface fill order: Direction in which top surfaces are filled when using a center-based pa... |
| Strength / Top/bottom shells | `top_layer_direction` O3671 | Float | O | Top layer direction: Fixed angle for the top solid infill and ironing lines. |
| Strength / Top/bottom shells | `top_surface_expansion` O2586 | Float | O | Top surface expansion: Expands the top surfaces by this distance to connect distinct top surfac... |
| Strength / Top/bottom shells | `top_surface_expansion_margin` O2598 | Float | O | Top expansion wall margin: Using “Top surface expansion” may cause a surface that did not previ... |
| Strength / Top/bottom shells | `top_surface_expansion_direction` O2610 | Enum | O | Top expansion direction: Direction in which the top surface expansion grows. |
| Strength / Top/bottom shells | `bottom_shell_layers` B1432 O1525 | Int | P~ (bottom_solid_layers) | Bottom shell layers: This is the number of solid layers of bottom shell, including the bottom s... |
| Strength / Top/bottom shells | `bottom_shell_thickness` B1442 O1536 | Float | P~ (bottom_solid_min_thickness) | Bottom shell thickness: The number of bottom solid layers is increased when slicing if the thic... |
| Strength / Top/bottom shells | `bottom_color_penetration_layers` B6180 O1545 | Int | B | Bottom paint penetration layers: The number of layers, including the bottom surface layer, that... |
| Strength / Top/bottom shells | `bottom_surface_density` B2203 O2636 | Percent | B | Bottom surface density: Density of the bottom surface layer. |
| Strength / Top/bottom shells | `bottom_surface_pattern` B2194 O2627 | Enum | P~ (bottom_fill_pattern) | Bottom surface pattern: This is the line pattern of bottom surface infill, not including bridge... |
| Strength / Top/bottom shells | `bottom_surface_fill_order` O2666 | Enum | O | Bottom surface fill order: Direction in which bottom surfaces are filled when using a center-ba... |
| Strength / Top/bottom shells | `bottom_layer_direction` O3681 | Float | O | Bottom layer direction: Fixed angle for the bottom solid infill lines. |
| Strength / Top/bottom shells | `center_of_surface_pattern` O8175 | Enum | O | Center surface pattern on: Chooses where the centering point of centered top/bottom surface pat... |
| Strength / Top/bottom shells | `top_bottom_infill_wall_overlap` O5029 | Percent | O | Top/Bottom solid infill/wall overlap: Top solid infill area is enlarged slightly to overlap wit... |
| Strength / Infill | `sparse_infill_density` B3171 O3691 | Percent | P~ (fill_density) | Sparse infill density: Density of internal sparse infill, 100% turns all sparse infill into sol... |
| Strength / Infill | `fill_multiline` B3181 O3719 | Int | B | Fill Multiline: Using multiple lines for the infill pattern, if supported by infill pattern. |
| Strength / Infill | `sparse_infill_pattern` B3189 O3808 | Enum | P~ (fill_pattern) | Sparse infill pattern: This is the line pattern for internal sparse infill. |
| Strength / Infill | `adaptive_infill_mode` O3727 | Enum | O | Adaptive density (experimental): Grades the Gyroid and TPMS infill inside the object: its cells... |
| Strength / Infill | `adaptive_infill_interior_density` O3765 | Percent | O | Interior density: Density of the adaptive infill at the center of the object. |
| Strength / Infill | `adaptive_infill_gradient` O3775 | Enum | O | Adaptive gradient: How the density changes from the surface to the center of the object. |
| Strength / Infill | `gyroid_optimized` O3798 | Bool | O | Z-buckling bias optimization (experimental): Tightens the gyroid wave along the Z (vertical) ax... |
| Strength / Infill | `sparse_infill_smooth_factor` O3867 | Percent | O | Sparse infill smooth factor: Controls how strongly sparse infill corners are rounded. |
| Strength / Infill | `infill_direction` B3161 O3651 | Float | P~ (fill_angle) | Sparse infill direction: This is the angle for sparse infill pattern, which controls the start ... |
| Strength / Infill | `sparse_infill_rotate_template` O4745 | String | O | Sparse infill rotation template: Rotate the sparse infill direction per layer using a template ... |
| Strength / Infill | `skin_infill_density` B3880 O4783 | Percent | B | Skin infill density: The portion of the model's outer surface within a certain depth range is c... |
| Strength / Infill | `skeleton_infill_density` B3868 O4770 | Percent | B | Skeleton infill density: The remaining part of the model contour after removing a certain depth... |
| Strength / Infill | `infill_lock_depth` B3902 O4806 | Float | B | Infill lock depth: The parameter sets the overlapping depth between the interior and skin. |
| Strength / Infill | `skin_infill_depth` B3892 O4796 | Float | B | Skin infill depth: The parameter sets the depth of skin. |
| Strength / Infill | `skin_infill_line_width` B3912 O4816 | FloatOrPercent | B | Skin line width: Adjust the line width of the selected skin paths. |
| Strength / Infill | `skeleton_infill_line_width` B3921 O4826 | FloatOrPercent | B | Skeleton line width: Adjust the line width of the selected skeleton paths. |
| Strength / Infill | `symmetric_infill_y_axis` B4012 O4836 | Bool | B | Symmetric infill Y axis: If the model has two parts that are symmetric about the Y axis, and yo... |
| Strength / Infill | `infill_complete_top` O4844 | Bool | O | Fill pattern tops: Choose this option if you want to completely fill in the tops of the infill ... |
| Strength / Infill | `infill_shift_step` B3848 O4734 | Float | B | Infill shift step: This parameter adds a slight displacement to each layer of infill to create ... |
| Strength / Infill | `lateral_lattice_angle_1` O4886 | Float | O | Lateral lattice angle 1: The angle of the first set of Lateral lattice elements in the Z direct... |
| Strength / Infill | `lateral_lattice_angle_2` O4896 | Float | O | Lateral lattice angle 2: The angle of the second set of Lateral lattice elements in the Z direc... |
| Strength / Infill | `infill_overhang_angle` O4906 | Float | O | Infill overhang angle: The angle of the infill angled lines. |
| Strength / Infill | `lightning_overhang_angle` O4916 | Float | O | Lightning overhang angle: Maximum overhang angle for Lightning infill support propagation. |
| Strength / Infill | `lightning_prune_angle` O4926 | Float | O | Prune angle: Controls how aggressively short or unsupported Lightning branches are pruned. |
| Strength / Infill | `lightning_straightening_angle` O4937 | Float | O | Straightening angle: Maximum straightening angle used to simplify Lightning branches. |
| Strength / Infill | `infill_anchor_max` P1978 O4975 | FloatOrPercent | P>O | Maximum length of the infill anchor: Connect an infill line to an internal perimeter with a sho... |
| Strength / Infill | `infill_anchor` P1955 O4947 | FloatOrPercent | P>O | Sparse infill anchor length: Connect an infill line to an internal perimeter with a short segme... |
| Strength / Infill | `internal_solid_infill_pattern` B2217 O2681 | Enum | B | Internal solid infill pattern: Line pattern of internal solid infill. |
| Strength / Infill | `solid_infill_direction` O3661 | Float | O | Solid infill direction: Angle for solid infill pattern, which controls the start or main direct... |
| Strength / Infill | `solid_infill_rotate_template` O4759 | String | O | Solid infill rotation template: This parameter adds a rotation of solid infill direction to eac... |
| Strength / Infill | `gap_fill_target` O1556 | Enum | P~O (gap_fill_enabled) | Apply gap fill: Enables gap fill for the selected solid surfaces. |
| Strength / Infill | `filter_out_gap_fill` B3628 O4396 | Float | B | Filter out tiny gaps: Don't print gap fill with a length is smaller than the threshold specifie... |
| Strength / Infill | `separated_infills` O8163 | Bool | O | Separated infills: Centers the internal infill of each part on itself, as if it were sliced on ... |
| Strength / Infill | `infill_wall_overlap` B4114 O5019 | Percent | P~ (infill_overlap) | Infill/wall overlap: This allows the infill area to be enlarged slightly to overlap with walls ... |
| Strength / Advanced | `align_infill_direction_to_model` O3701 | Bool | O | Align directions to model: Aligns infill, bridge, ironing, and top/bottom surface directions to... |
| Strength / Advanced | `extra_solid_infills` O3710 | String | O | Insert solid layers: Insert solid infill at specific layers. |
| Strength / Advanced | `bridge_angle` P700 B1536 O1628 | Float | P | External bridge infill direction: External Bridging angle override. |
| Strength / Advanced | `internal_bridge_angle` O1646 | Float | O | Internal bridge infill direction: Internal Bridging angle override. |
| Strength / Advanced | `relative_bridge_angle` O1663 | Bool | O | Relative bridge angle: When enabled, the bridge angle values are added to the automatically cal... |
| Strength / Advanced | `minimum_sparse_infill_area` B5438 O6807 | Float | P~ (solid_infill_below_area) | Minimum sparse infill threshold: Sparse infill areas which are smaller than this threshold valu... |
| Strength / Advanced | `infill_combination` B3840 O4727 | Bool | P~ (infill_every_layers) | Infill combination: Automatically combine sparse infill of several layers to print together in ... |
| Strength / Advanced | `infill_combination_max_layer_height` O4852 | FloatOrPercent | O | Infill combination - Max layer height: Maximum layer height for the combined sparse infill. |
| Strength / Advanced | `detect_narrow_internal_solid_infill` B6731 O8966 | Bool | B | Detect narrow internal solid infills: This option will auto-detect narrow internal solid infill... |
| Strength / Advanced | `ensure_vertical_shell_thickness` P1069 B2101 O2530 | Enum | P | Ensure vertical shell thickness: Add solid infill near sloping surfaces to guarantee the vertic... |
| Speed / First layer speed | `initial_layer_speed` B3475 O4077 | Floats | P~ (first_layer_speed) | First layer: This is the speed for the walls and brim of the first layer. |
| Speed / First layer speed | `initial_layer_infill_speed` B3484 O4086 | Floats | P~ (first_layer_infill_speed) | First layer infill: This is the speed for the first layer except for walls and brim, such as in... |
| Speed / First layer speed | `initial_layer_travel_speed` O4095 | FloatsOrPercents | O | First layer travel speed: Travel speed of the first layer. |
| Speed / First layer speed | `slow_down_layers` O4106 | Int | O | Number of slow layers: The first few layers are printed slower than normal. |
| Speed / Other layers speed | `outer_wall_speed` B2245 O2702 | Floats | P~ (external_perimeter_speed) | Outer wall: This is the printing speed for the outer walls of parts. |
| Speed / Other layers speed | `inner_wall_speed` B4748 O5944 | Floats | P~ (perimeter_speed) | Inner wall: This is the speed for inner walls. |
| Speed / Other layers speed | `small_perimeter_speed` P3079 B2257 O2712 | FloatsOrPercents | P | Small perimeters: This separate setting will affect the speed of perimeters having radius <= sm... |
| Speed / Other layers speed | `small_perimeter_threshold` B2270 O2725 | Floats | B | Small perimeters threshold: This sets the threshold for small perimeter length. |
| Speed / Other layers speed | `sparse_infill_speed` B4123 O5042 | Floats | P~ (infill_speed) | Sparse infill: This is the speed for internal sparse infill. |
| Speed / Other layers speed | `internal_solid_infill_speed` B5468 O6855 | Floats | P~ (solid_infill_speed) | Internal solid infill: This is the speed for internal solid infill, not including the top or bo... |
| Speed / Other layers speed | `top_surface_speed` B6142 O8124 | Floats | P~ (top_solid_infill_speed) | Top surface: This is the speed for solid top surface infill. |
| Speed / Other layers speed | `gap_infill_speed` B3642 O4405 | Floats | P~ (gap_fill_speed) | Gap infill: This is the speed for gap infill. |
| Speed / Other layers speed | `ironing_speed` P2189 B4292 O5209 | Float | P | Ironing speed: This is the print speed for ironing lines. |
| Speed / Other layers speed | `support_speed` B5949 O7592 | Floats | P~ (support_material_speed) | Support: This is the speed for support. |
| Speed / Other layers speed | `support_interface_speed` B5883 O7520 | Floats | P~ (support_material_interface_speed) | Support interface: This is the speed for support interfaces. |
| Speed / Other layers speed | `small_support_perimeter_speed` O2735 | FloatsOrPercents | O | Small support perimeters: Same as "Small perimeters", but for supports. |
| Speed / Other layers speed | `small_support_perimeter_threshold` O2747 | Floats | O | Small support perimeters threshold: This sets the threshold for small support perimeter length. |
| Speed / Overhang speed | `enable_overhang_speed` B1624 O1959 | Bools | P~ (enable_dynamic_overhang_speeds) | Slow down for overhangs: Enable this option to slow down when printing overhangs. |
| Speed / Overhang speed | `slowdown_for_curled_perimeters` O1967 | Bools | O | Slow down for curled perimeters: Enable this option to slow down printing in areas where perime... |
| Speed / Overhang speed | `overhang_1_4_speed` B1632 O1991 | FloatsOrPercents | P~ (overhang_speed_3) | 10%: Speed for line of wall which has degree of overhang between 10% and 25% line width. |
| Speed / Overhang speed | `overhang_2_4_speed` B1644 O2004 | FloatsOrPercents | P~ (overhang_speed_2) | 25%: Speed for line of wall which has degree of overhang between 25% and 50% line width. |
| Speed / Overhang speed | `overhang_3_4_speed` B1656 O2017 | FloatsOrPercents | P~ (overhang_speed_1) | 50%: Speed for line of wall which has degree of overhang between 50% and 75% line width. |
| Speed / Overhang speed | `overhang_4_4_speed` B1667 O2030 | FloatsOrPercents | P~ (overhang_speed_0) | 75%: Speed for line of wall which has degree of overhang between 75% and 100% line width. |
| Speed / Overhang speed | `bridge_speed` P751 B1755 O2043 | Floats | P | External: Speed of the externally visible bridge extrusions. |
| Speed / Overhang speed | `internal_bridge_speed` O2056 | FloatsOrPercents | O(SS) | Internal: Speed of internal bridges. |
| Speed / Travel speed | `travel_speed` P3795 B6193 O8194 | Floats | P | Travel: This is the speed at which traveling is done. |
| Speed / Acceleration | `default_acceleration` P997 B1927 O2309 | Floats | P | Normal printing: This is the default acceleration for both normal printing and travel after the... |
| Speed / Acceleration | `outer_wall_acceleration` B3331 O3888 | Floats | P~ (external_perimeter_acceleration) | Outer wall: Acceleration of outer wall: using a lower value can improve quality. |
| Speed / Acceleration | `inner_wall_acceleration` B3340 O3898 | Floats | P~ (perimeter_acceleration) | Inner wall: Acceleration of inner walls. |
| Speed / Acceleration | `bridge_acceleration` P691 O2339 | FloatsOrPercents | P>O | Bridge: Acceleration of bridges. |
| Speed / Acceleration | `sparse_infill_acceleration` B3349 O3908 | FloatsOrPercents | P~ (infill_acceleration) | Sparse infill: Acceleration of sparse infill. |
| Speed / Acceleration | `internal_solid_infill_acceleration` O3919 | FloatsOrPercents | P~O (solid_infill_acceleration) | Internal solid infill: Acceleration of internal solid infill. |
| Speed / Acceleration | `initial_layer_acceleration` B3359 O3930 | Floats | P~ (first_layer_acceleration) | First layer: This is the printing acceleration for the first layer. |
| Speed / Acceleration | `initial_layer_travel_acceleration` B1959 O2329 | FloatsOrPercents | B | First layer travel: Travel acceleration of first layer. |
| Speed / Acceleration | `top_surface_acceleration` B3322 O3878 | Floats | P~ (top_solid_infill_acceleration) | Top surface: This is the acceleration of top surface infill. |
| Speed / Acceleration | `travel_acceleration` P1927 B1936 O2319 | Floats | P | Travel: Acceleration of travel moves. |
| Speed / Acceleration | `accel_to_decel_enable` B3368 O3940 | Bool | B | Enable accel_to_decel: Klipper's max_accel_to_decel will be adjusted automatically. |
| Speed / Acceleration | `accel_to_decel_factor` B3374 O3947 | Percent | B | accel_to_decel: Klipper's max_accel_to_decel will be adjusted to this % of acceleration. |
| Speed / Junction Deviation | `default_junction_deviation` O3968 | Floats | O | Junction Deviation: Marlin Firmware Junction Deviation (replaces the traditional XY Jerk settin... |
| Speed / Jerk(XY) | `default_jerk` B3383 O3958 | Floats | B | Default: Default jerk. |
| Speed / Jerk(XY) | `outer_wall_jerk` B3391 O3979 | Floats | B | Outer wall: Jerk of outer walls. |
| Speed / Jerk(XY) | `inner_wall_jerk` B3399 O3989 | Floats | B | Inner wall: Jerk of inner walls. |
| Speed / Jerk(XY) | `infill_jerk` B3407 O4009 | Floats | B | Infill: Jerk for infill. |
| Speed / Jerk(XY) | `top_surface_jerk` B3415 O3999 | Floats | B | Top surface: Jerk for top surface. |
| Speed / Jerk(XY) | `initial_layer_jerk` B3423 O4019 | Floats | B | First layer: Jerk for the first layer. |
| Speed / Jerk(XY) | `initial_layer_travel_jerk` O4039 | FloatsOrPercents | O | First layer travel: Travel jerk of first layer. |
| Speed / Jerk(XY) | `travel_jerk` B3431 O4029 | Floats | B | Travel: Jerk for travel. |
| Speed / Advanced | `max_volumetric_extrusion_rate_slope` O5623 | Float | O | Extrusion rate smoothing: This parameter smooths out sudden extrusion rate changes that happen ... |
| Speed / Advanced | `max_volumetric_extrusion_rate_slope_segment_length` O5644 | Float | O | Smoothing segment length: A lower value results in smoother extrusion rate transitions. |
| Speed / Advanced | `extrusion_rate_smoothing_external_perimeter_only` O5656 | Bool | O | Apply only on external features: Applies extrusion rate smoothing only on external perimeters a... |
| Support / Support | `enable_support` B5597 O7301 | Bool | P~ (support_material) | Enable support: This enables support generation. |
| Support / Support | `support_type` B5604 O7308 | Enum | P~ (support_material_auto) | Type: Normal (auto) and Tree (auto) are used to generate support automatically. |
| Support / Support | `support_style` B5959 O7602 | Enum | P~ (support_material_style) | Style: Style and shape of the support. |
| Support / Support | `support_threshold_angle` B6005 O7638 | Int | P~ (support_material_threshold) | Threshold angle: Support will be generated for overhangs whose slope angle is below the thresho... |
| Support / Support | `support_threshold_overlap` O7648 | FloatOrPercent | O | Threshold overlap: If threshold angle is zero, support will be generated for overhangs whose ov... |
| Support / Support | `raft_first_layer_density` P2723 B4870 O6059 | Percent | P | First layer density: This is the density of the first raft or support layer. |
| Support / Support | `raft_first_layer_expansion` P2733 B4880 O6069 | Float | P | First layer expansion: This expands the first raft or support layer to improve bed adhesion. |
| Support / Support | `support_on_build_plate_only` B5653 O7357 | Bool | P~ (support_material_buildplate_only) | On build plate only: This setting only generates supports that begin on the build plate. |
| Support / Support | `support_critical_regions_only` B5661 O7365 | Bool | B | Support critical regions only: Only create support for critical regions including sharp tail, c... |
| Support / Support | `support_remove_small_overhang` B5668 O7372 | Bool | B | Ignore small overhangs: Ignore small overhangs that possibly don't require support. |
| Support / Raft | `raft_layers` P2742 B4890 O6079 | Int | P | Raft layers: Object will be raised by this number of support layers. |
| Support / Raft | `raft_contact_distance` P2705 B4852 O6041 | Float | P | Raft contact Z distance: Z gap between raft and object. |
| Support / Raft | `raft_expansion` P2714 B4861 O6050 | Float | P | Raft expansion: This expands all raft layers in XY plane. |
| Support / Filament for Supports | `support_filament` B5718 O7423 | Int | P~ (support_material_extruder) | Support/raft base: Filament to print support base and raft. |
| Support / Filament for Supports | `support_interface_filament` B5750 O7458 | Int | P~ (support_material_interface_extruder) | Support/raft interface: Filament to print support interface. |
| Support / Filament for Supports | `support_interface_not_for_body` B5727 O7432 | Bool | B | Avoid interface filament for base: Avoid using support interface filament to print support base... |
| Support / Support ironing | `support_ironing` O7961 | Bool | O | Ironing Support Interface: Ironing is using small flow to print on same height of support inter... |
| Support / Support ironing | `support_ironing_pattern` B5811 O7969 | Enum | B | Support Ironing Pattern: The pattern that will be used when ironing. |
| Support / Support ironing | `support_ironing_flow` B5822 O7981 | Percent | B | Support Ironing flow: The amount of material to extrude during ironing. |
| Support / Support ironing | `support_ironing_spacing` B5834 O7993 | Float | B | Support Ironing line spacing: This is the distance between the lines used for ironing. |
| Support / Advanced | `support_top_z_distance` B5677 O7381 | Float | P~ (support_material_contact_distance) | Top Z distance: Z gap between the support\'s top and object. |
| Support / Advanced | `support_bottom_z_distance` B5696 O7400 | Float | P~ (support_material_bottom_contact_distance) | Bottom Z distance: Z gap between the object and the support bottom. |
| Support / Advanced | `tree_support_wall_count` B6058 O7945 | Int | B | Support wall loops: This setting specifies the count of support walls in the range of [0,2]. |
| Support / Advanced | `support_base_pattern` B5893 O7530 | Enum | P~ (support_material_pattern) | Base pattern: Line pattern of support. |
| Support / Advanced | `support_base_pattern_spacing` B5932 O7575 | Float | P~ (support_material_spacing) | Base pattern spacing: This determines the spacing between support lines. |
| Support / Advanced | `support_angle` B5643 O7347 | Float | P~ (support_material_angle) | Pattern angle: Use this setting to rotate the support pattern on the horizontal plane. |
| Support / Advanced | `support_interface_top_layers` B5760 O7468 | Int | P~ (support_material_interface_layers) | Top interface layers: This is the number of top interface layers. |
| Support / Advanced | `support_interface_bottom_layers` B5778 O7486 | Int | P~ (support_material_bottom_interface_layers) | Bottom interface layers: Number of bottom interface layers. |
| Support / Advanced | `support_interface_pattern` B5913 O7555 | Enum | P~ (support_material_interface_pattern) | Interface pattern: This is the line pattern for support interfaces. |
| Support / Advanced | `support_interface_spacing` B5792 O7500 | Float | P~ (support_material_interface_spacing) | Top interface spacing: Spacing of interface lines. |
| Support / Advanced | `support_bottom_interface_spacing` B5874 O7511 | Float | B | Bottom interface spacing: This is the spacing of bottom interface lines. |
| Support / Advanced | `support_expansion` B5941 O7584 | Float | B | Normal support expansion: Expand (+) or shrink (-) the horizontal span of normal support. |
| Support / Advanced | `support_object_xy_distance` B5621 O7325 | Float | P~ (support_material_xy_spacing) | Support/object XY distance: This controls the XY separation between an object and its support. |
| Support / Advanced | `support_object_first_layer_gap` B5632 O7336 | Float | B | Support/object first layer gap: XY separation between an object and its support at the first la... |
| Support / Advanced | `bridge_no_support` B2049 O2409 | Bool | P~ (dont_support_bridges) | Don't support bridges: This disables supporting bridges, which decreases the amount of support ... |
| Support / Advanced | `max_bridge_length` B2065 O2494 | Float | B | Max bridge length: This is the maximum length of bridges that don\'t need support. |
| Support / Advanced | `independent_support_layer_height` B5997 O7630 | Bool | B | Independent support layer height: Support layer uses layer height independent with object layer... |
| Support / Tree supports | `tree_support_tip_diameter` O7900 | Float | P~O (support_tree_tip_diameter) | Tip Diameter: Branch tip diameter for organic supports. |
| Support / Tree supports | `tree_support_branch_distance` B6026 O7853 | Float | P~ (support_tree_branch_distance) | Tree support branch distance: This setting determines the distance between neighboring tree sup... |
| Support / Tree supports | `tree_support_branch_distance_organic` O7863 | Float | O | Tree support branch distance: This setting determines the distance between neighboring tree sup... |
| Support / Tree supports | `tree_support_top_rate` O7873 | Percent | P~O (support_tree_top_rate) | Branch Density: Adjusts the density of the support structure used to generate the tips of the b... |
| Support / Tree supports | `tree_support_branch_diameter` B6036 O7911 | Float | P~ (support_tree_branch_diameter) | Tree support branch diameter: This setting determines the initial diameter of support nodes. |
| Support / Tree supports | `tree_support_branch_diameter_organic` O7935 | Float | O | Tree support branch diameter: This setting determines the initial diameter of support nodes. |
| Support / Tree supports | `tree_support_branch_diameter_angle` B6046 O7921 | Float | P~ (support_tree_branch_diameter_angle) | Branch Diameter Angle: The angle of the branches' diameter as they gradually become thicker tow... |
| Support / Tree supports | `tree_support_branch_angle` B6015 O7819 | Float | P~ (support_tree_angle) | Tree support branch angle: This setting determines the maximum overhang angle that the branches... |
| Support / Tree supports | `tree_support_branch_angle_organic` O7830 | Float | O | Tree support branch angle: This setting determines the maximum overhang angle that the branches... |
| Support / Tree supports | `tree_support_angle_slow` O7841 | Float | P~O (support_tree_angle_slow) | Preferred Branch Angle: The preferred angle of the branches, when they do not have to avoid the... |
| Support / Tree supports | `tree_support_auto_brim` O7887 | Bool | O | Auto brim width: Enabling this option means the width of the brim for tree support will be auto... |
| Support / Tree supports | `tree_support_brim_width` O7893 | Float | O | Tree support brim width: Distance from tree branch to the outermost brim line. |
| Multimaterial / Prime tower | `enable_prime_tower` B6251 O8239 | Bool | P~ (wipe_tower) | Enable: The wiping tower can be used to clean up residue on the nozzle and stabilize the chambe... |
| Multimaterial / Prime tower | `prime_tower_skip_points` B6469 O8433 | Bool | B | Skip points: The wall of prime tower will skip the start points of wipe path. |
| Multimaterial / Prime tower | `enable_tower_interface_features` B3082 O8443 | Bool | B | Enable tower interface features: Enable optimized prime tower interface behavior when different... |
| Multimaterial / Prime tower | `enable_tower_interface_cooldown_during_tower` O8449 | Bool | O | Cool down from interface boost during prime tower: When interface-layer temperature boost is ac... |
| Multimaterial / Prime tower | `prime_tower_enable_framework` B6258 O8245 | Bool | B | Internal ribs: Enable internal ribs to increase the stability of the prime tower. |
| Multimaterial / Prime tower | `prime_tower_width` B6411 O8326 | Float | P~ (wipe_tower_width) | Width: This is the width of prime towers. |
| Multimaterial / Prime tower | `belt_purge_tower_width` O7805 | Float | O | Belt purge tower width: Width (machine X, across the belt) of the purge prism that is automatic... |
| Multimaterial / Prime tower | `prime_volume` B6387 O8286 | Float | B | Prime volume: This is the volume of material to prime the extruder with on the tower. |
| Multimaterial / Prime tower | `prime_tower_brim_width` B6440 O8341 | Float | P~ (wipe_tower_brim_width) | Brim width: Brim width of prime tower, negative number means auto calculated width based on the... |
| Multimaterial / Prime tower | `prime_tower_infill_gap` B6492 O8455 | Percent | B | Infill gap: Infill gap. |
| Multimaterial / Prime tower | `wipe_tower_rotation_angle` B6419 O8334 | Float | B | Wipe tower rotation angle: Wipe tower rotation angle with respect to X axis. |
| Multimaterial / Prime tower | `wipe_tower_bridging` P3940 B6526 O8493 | Float | P | Maximal bridging distance: Maximal distance between supports on sparse infill sections. |
| Multimaterial / Prime tower | `wipe_tower_extra_spacing` P3905 O8500 | Percent | P>O | Wipe tower purge lines spacing: Spacing of purge lines on the wipe tower. |
| Multimaterial / Prime tower | `wipe_tower_extra_flow` P3914 O8509 | Percent | P>O | Extra flow for purging: Extra flow used for the purging lines on the wipe tower. |
| Multimaterial / Prime tower | `wipe_tower_max_purge_speed` O8362 | Float | O | Maximum wipe tower print speed: The maximum print speed when purging in the wipe tower and prin... |
| Multimaterial / Prime tower | `wipe_tower_wall_type` O8375 | Enum | O | Wall type: Wipe tower outer wall type. |
| Multimaterial / Prime tower | `wipe_tower_cone_angle` P3895 O8352 | Float | P>O | Stabilization cone apex angle: Angle at the apex of the cone that is used to stabilize the wipe... |
| Multimaterial / Prime tower | `wipe_tower_extra_rib_length` O8391 | Float | O | Extra rib length: Positive values can increase the size of the rib wall, while negative values ... |
| Multimaterial / Prime tower | `wipe_tower_rib_width` O8400 | Float | O | Rib width: Rib width is always less than half the prime tower side length. |
| Multimaterial / Prime tower | `wipe_tower_fillet_wall` O8409 | Bool | O | Fillet wall: The wall of prime tower will fillet. |
| Multimaterial / Prime tower | `wipe_tower_no_sparse_layers` P3280 B5565 O7193 | Bool | P | No sparse layers (beta): If enabled, the wipe tower will not be printed on layers with no tool ... |
| Multimaterial / Prime tower | `wipe_tower_sparse_layers_combination` O7203 | Bool | O | Combine sparse layers: If enabled, consecutive layers on which the prime tower has no filament ... |
| Multimaterial / Prime tower | `single_extruder_multi_material_priming` P3274 O7217 | Bool | P>O | Prime all printing extruders: If enabled, all printing extruders will be primed at the front ed... |
| Multimaterial / Filament for Features | `outer_wall_filament_id` O5914 | Int | O | Outer walls: Filament to print outer walls. |
| Multimaterial / Filament for Features | `inner_wall_filament_id` O5923 | Int | O | Inner walls: Filament to print inner walls. |
| Multimaterial / Filament for Features | `sparse_infill_filament_id` O4998 | Int | O | Infill: Filament to print internal sparse infill. |
| Multimaterial / Filament for Features | `internal_solid_filament_id` O6816 | Int | O | Internal solid infill: Filament to print internal solid infill. |
| Multimaterial / Filament for Features | `top_surface_filament_id` O6825 | Int | O | Top surface: Filament to print top surface. |
| Multimaterial / Filament for Features | `bottom_surface_filament_id` O6834 | Int | O | Bottom surface: Filament to print bottom surface. |
| Multimaterial / Filament for Features | `wipe_tower_filament` O8416 | Int | P~O (wipe_tower_extruder) | Wipe tower: The extruder to use when printing perimeter of the wipe tower. |
| Multimaterial / Ooze prevention | `ooze_prevention` P2540 B4689 O5854 | Bool | P | Enable: This option will drop the temperature of the inactive extruders to prevent oozing. |
| Multimaterial / Ooze prevention | `standby_temperature_delta` P3168 B5530 O6938 | Int | P | Temperature variation: Temperature difference to be applied when an extruder is not active. |
| Multimaterial / Ooze prevention | `preheat_time` O6950 | Float | O | Preheat time: To reduce the waiting time after tool change, Orca can preheat the next tool whil... |
| Multimaterial / Ooze prevention | `preheat_steps` O6960 | Int | O | Preheat steps: Insert multiple preheat commands (e.g. |
| Multimaterial / Flush options | `flush_into_infill` B6500 O8463 | Bool | P~ (wipe_into_infill) | Flush into objects' infill: Purging after filament change will be done inside objects\' infills... |
| Multimaterial / Flush options | `flush_into_objects` B6517 O8475 | Bool | P~ (wipe_into_objects) | Flush into this object: This object will be used to purge the nozzle after a filament change to... |
| Multimaterial / Flush options | `flush_into_support` B6509 O8469 | Bool | B | Flush into objects' support: Purging after filament change will be done inside objects\' suppor... |
| Multimaterial / Advanced | `interlocking_beam` P2108 B4180 O5095 | Bool | P | Use beam interlocking: Generate interlocking beam structure at the locations where different fi... |
| Multimaterial / Advanced | `toolchange_ordering` P3733 O7223 | Enum | P>O | Toolchange ordering: Determines the order of tool changes on each layer. |
| Multimaterial / Advanced | `toolchange_cyclic_order` O7239 | String | O | Cyclic order: Custom filament sequence used by the cyclic toolchange ordering, as filament numb... |
| Multimaterial / Advanced | `toolchange_cyclic_first_layer` O7250 | Bool | O | Apply cyclic order to first layer: Applies the cyclic toolchange order to the first layer as we... |
| Multimaterial / Advanced | `interface_shells` P2072 B4149 O5066 | Bool | P | Interface shells: Force the generation of solid shells between adjacent materials/volumes. |
| Multimaterial / Advanced | `mmu_segmented_region_max_width` P2081 B4159 O5075 | Float | P | Maximum width of a segmented region: Maximum width of a segmented region. |
| Multimaterial / Advanced | `mmu_segmented_region_interlocking_depth` P2090 B4168 O5084 | Float | P | Interlocking depth of a segmented region: Interlocking depth of a segmented region. |
| Multimaterial / Advanced | `interlocking_beam_width` P2115 B4187 O5102 | Float | P | Interlocking beam width: The width of the interlocking structure beams. |
| Multimaterial / Advanced | `interlocking_orientation` P2124 B4196 O5111 | Float | P | Interlocking direction: Orientation of interlock beams. |
| Multimaterial / Advanced | `interlocking_beam_layer_count` P2134 B4206 O5121 | Int | P | Interlocking beam layers: The height of the beams of the interlocking structure, measured in nu... |
| Multimaterial / Advanced | `interlocking_depth` P2142 B4214 O5129 | Int | P | Interlocking depth: The distance from the boundary between filaments to generate interlocking s... |
| Multimaterial / Advanced | `interlocking_boundary_avoidance` P2150 B4222 O5137 | Int | P | Interlocking boundary avoidance: The distance from the outside of a model where interlocking st... |
| Others / Skirt | `skirt_loops` B5419 O6768 | Int | P~ (skirts) | Skirt loops: This is the number of loops for the skirt. |
| Others / Skirt | `skirt_type` O6756 | Enum | O | Skirt type: Combined - single skirt for all objects, Per object - individual object skirt. |
| Others / Skirt | `min_skirt_length` P2472 O6786 | Float | P>O | Skirt minimum extrusion length: Minimum filament extrusion length in mm when printing the skirt... |
| Others / Skirt | `skirt_distance` P3031 B5378 O6710 | Float | P | Skirt distance: This is the distance from the skirt to the brim or the object. |
| Others / Skirt | `skirt_start_angle` O6719 | Float | O | Skirt start point: Angle from the object center to skirt start point. |
| Others / Skirt | `skirt_speed` O6777 | Float | O | Skirt speed: Speed of skirt, in mm/s. |
| Others / Skirt | `skirt_height` P3038 B5393 O6729 | Int | P | Skirt height: Number of skirt layers: usually only one |
| Others / Skirt | `draft_shield` P3045 B5402 O6743 | Enum | P | Draft shield: A draft shield is useful to protect an ABS or ASA print from warping and detachin... |
| Others / Skirt | `single_loop_draft_shield` O6737 | Bool | O | Single loop after first layer: Limits the skirt/draft shield loops to one wall after the first ... |
| Others / Brim | `brim_type` P880 B1775 O2116 | Enum | P | Brim type: This controls the generation of the brim at outer and/or inner side of models. |
| Others / Brim | `brim_width` P869 B1765 O2067 | Float | P | Brim width: This is the distance from the model to the outermost brim line. |
| Others / Brim | `leading_brim_length` O2077 | Float | O | Leading brim length: Belt printers only. |
| Others / Brim | `extra_brim_width` O2099 | Float | O | Extra brim width: Belt printers only. |
| Others / Brim | `brim_object_gap` B1804 O2141 | Float | B | Brim-object gap: This creates a gap between the innermost brim line and the object and can make... |
| Others / Brim | `brim_flow_ratio` O2151 | Float | O | Brim flow ratio: This factor affects the amount of material for brims. |
| Others / Brim | `brim_use_efc_outline` O2162 | Bool | O | Brim follows compensated outline: When enabled, the brim is aligned with the first-layer perime... |
| Others / Brim | `combine_brims` O2169 | Bool | O | Combine brims: Combine multiple brims into one when they are close to each other. |
| Others / Brim | `brim_ears_max_angle` O2183 | Float | O(SS) | Brim ear max angle: Maximum angle to let a brim ear appear. |
| Others / Brim | `brim_ears_detection_length` O2195 | Float | O(SS) | Brim ear detection radius: The geometry will be decimated before detecting sharp angles. |
| Others / Brim | `brim_ears_outer_only` O2206 | Bool | O | Brim ears outer only: Generate mouse ears only on the outer contour of the model, excluding hol... |
| Others / Special mode | `slicing_mode` P3298 B5583 O7277 | Enum | P | Slicing Mode: Use "Even-odd" for 3DLabPrint airplane models. |
| Others / Special mode | `print_sequence` B1870 O2264 | Enum | P~ (complete_objects) | Print sequence: This determines the print sequence, allowing you to print layer-by-layer or obj... |
| Others / Special mode | `print_order` O2275 | Enum | O | Intra-layer order: Order in which object instances are visited within a single layer, which con... |
| Others / Special mode | `spiral_mode` B5478 O6865 | Bool | P~ (spiral_vase) | Spiral vase: This enables spiraling, which smooths out the Z moves of the outer contour and tur... |
| Others / Special mode | `spiral_mode_smooth` B5486 O6871 | Bool | B | Smooth Spiral: Smooth Spiral smooths out X and Y moves as well, resulting in no visible seam at... |
| Others / Special mode | `spiral_mode_max_xy_smoothing` B5493 O6878 | FloatOrPercent | B | Max XY Smoothing: Maximum distance to move points in XY to try to achieve a smooth spiral. |
| Others / Special mode | `spiral_starting_flow_ratio` O6891 | Float | O | Spiral starting flow ratio: Sets the starting flow ratio while transitioning from the last bott... |
| Others / Special mode | `spiral_finishing_flow_ratio` O6902 | Float | O | Spiral finishing flow ratio: Sets the finishing flow ratio while ending the spiral. |
| Others / Special mode | `timelapse_type` B5505 O6913 | Enum | B | Timelapse: If smooth or traditional mode is selected, a timelapse video will be generated for e... |
| Others / Special mode | `enable_wrapping_detection` B3690 O4866 | Bool | B | Enable clumping detection |
| Others / Fuzzy skin | `fuzzy_skin` P1777 B3514 O4238 | Enum | P | Fuzzy skin: This setting makes the toolhead randomly jitter while printing walls so that the su... |
| Others / Fuzzy skin | `fuzzy_skin_mode` B3611 O4285 | Enum | B | Fuzzy skin generator mode: Fuzzy skin generation mode. |
| Others / Fuzzy skin | `fuzzy_skin_noise_type` B3560 O4309 | Enum | B | Fuzzy skin noise type: Noise type to use for fuzzy skin generation: Classic: Classic uniform ra... |
| Others / Fuzzy skin | `fuzzy_skin_point_distance` B3543 O4268 | Float | P~ (fuzzy_skin_point_dist) | Fuzzy skin point distance: The average distance between the random points introduced on each li... |
| Others / Fuzzy skin | `fuzzy_skin_thickness` P1789 B3533 O4258 | Float | P | Fuzzy skin thickness: The width of jittering: it\u2019s recommended to keep this lower than the... |
| Others / Fuzzy skin | `fuzzy_skin_scale` B3583 O4335 | Float | B | Fuzzy skin feature size: The base size of the coherent noise features, in mm. |
| Others / Fuzzy skin | `fuzzy_skin_octaves` B3593 O4345 | Int | B | Fuzzy Skin Noise Octaves: The number of octaves of coherent noise to use. |
| Others / Fuzzy skin | `fuzzy_skin_persistence` B3602 O4354 | Float | B | Fuzzy skin noise persistence: The decay rate for higher octaves of the coherent noise. |
| Others / Fuzzy skin | `fuzzy_skin_ripples_per_layer` O4363 | Int | O | Number of ripples per layer: Controls how many full cycles of ripples will be added per layer. |
| Others / Fuzzy skin | `fuzzy_skin_ripple_offset` O4371 | Percent | O | Ripple offset: Shifts the ripple phase forward along the print path by the specified percentage... |
| Others / Fuzzy skin | `fuzzy_skin_layers_between_ripple_offset` O4385 | Int | O | Layers between ripple offset: Specifies how many consecutive layers share the same ripple phase... |
| Others / Fuzzy skin | `fuzzy_skin_first_layer` B3553 O4278 | Bool | B | Apply fuzzy skin to first layer: Whether to apply fuzzy skin on the first layer. |
| Others / G-code output | `reduce_infill_retraction` O5848 | Bool | P~O (only_retract_when_crossing_perimeters) | Reduce infill retraction: Don\'t retract when the travel is entirely within an infill area. |
| Others / G-code output | `gcode_add_line_number` B3669 O4446 | Bool | B | Add line number: Enable this to add line number(Nx) at the beginning of each G-code line. |
| Others / G-code output | `gcode_comments` P1826 O4718 | Bool | P>O | Verbose G-code: Enable this to get a commented G-code file, with each line explained by a descr... |
| Others / G-code output | `gcode_label_objects` P1857 O4693 | Bool | P>O | Label objects: Enable this to add comments into the G-code labeling print moves with what objec... |
| Others / G-code output | `exclude_object` B3833 O4701 | Bool | B | Exclude objects: Enable this option to add EXCLUDE OBJECT command in G-code. |
| Others / G-code output | `exclude_object_tolerance` O4707 | Float | O | Outline tolerance: Maximum deviation of the object outline written to EXCLUDE_OBJECT_DEFINE fro... |
| Others / G-code output | `filename_format` B4697 O5860 | String | P~ (output_filename_format) | Filename format: Users can decide project file names when exporting. |
| Others / Change extrusion role G-code | `process_change_extrusion_role_gcode` O5985 | String | O | Change extrusion role G-code (process): This G-code is inserted when the extrusion role is chan... |
| Others / Post-processing Scripts | `post_process` P2653 B4814 O5972 | Strings | P | Post-processing Scripts: If you want to process the output G-code through custom scripts, just ... |
| Others / Slicing Pipeline Plugin | `slicing_pipeline_plugin` O6000 | Strings | O | Slicing Pipeline Plugin: Python plugins invoked at each slicing pipeline step to read and modif... |
| Others / Notes | `notes` P2482 O5736 | String | P>O | Configuration notes: You can put here your personal notes. |

##### TabPrintPlate

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| (none) / (none) | `curr_bed_type` B1367 O1449 | Enum | B | Bed type: Plate types supported by the printer |
| (none) / (none) | `first_layer_sequence_choice` B1401 O1494 | Enum | B | First layer filament sequence |
| (none) / (none) | `first_layer_print_sequence` B1385 O1478 | Ints | B | First layer print sequence |
| (none) / (none) | `other_layers_print_sequence` B1391 O1484 | Ints | B | Other layers print sequence |
| (none) / (none) | `other_layers_sequence_choice` B1412 O1505 | Enum | B | Other layers filament sequence |

##### TabFilament

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| Setting Overrides / Retraction | `filament_retraction_length` B62 O97 | (override of retraction_length) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_z_hop` B62 O97 | (override of z_hop) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_z_hop_types` B62 O97 | (override of z_hop_types) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_lift_above` B62 O97 | (override of retract_lift_above) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_lift_below` B62 O97 | (override of retract_lift_below) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_lift_enforce` O97 | (override of retract_lift_enforce) | O | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retraction_speed` B62 O97 | (override of retraction_speed) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_deretraction_speed` B62 O97 | (override of deretraction_speed) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_restart_extra` B62 O97 | (override of retract_restart_extra) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retraction_minimum_travel` B62 O97 | (override of retraction_minimum_travel) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_when_changing_layer` B62 O97 | (override of retract_when_changing_layer) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_wipe` B62 O97 | (override of wipe) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_wipe_distance` B62 O97 | (override of wipe_distance) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_before_wipe` B62 O97 | (override of retract_before_wipe) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retract_after_wipe` O97 | (override of retract_after_wipe) | O | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_long_retractions_when_cut` B62 O97 | (override of long_retractions_when_cut) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction | `filament_retraction_distances_when_cut` B62 O97 | (override of retraction_distances_when_cut) | B | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction when switching material | `filament_retract_length_toolchange` O97 | (override of retract_length_toolchange) | O | filament override: Filament-level override of the extruder option |
| Setting Overrides / Retraction when switching material | `filament_retract_restart_extra_toolchange` O97 | (override of retract_restart_extra_toolchange) | O | filament override: Filament-level override of the extruder option |
| Setting Overrides / Ironing | `filament_ironing_flow` O4191 | Percents | O | Ironing flow: Filament-specific override for ironing flow. |
| Setting Overrides / Ironing | `filament_ironing_spacing` O4203 | Floats | O | Ironing line spacing: Filament-specific override for ironing line spacing. |
| Setting Overrides / Ironing | `filament_ironing_inset` O4215 | Floats | O | Ironing inset: Filament-specific override for ironing inset. |
| Setting Overrides / Ironing | `filament_ironing_speed` O4227 | Floats | O | Ironing speed: Filament-specific override for ironing speed. |
| (none) / (none) | `enable_long_retraction_when_cut` B4943 O6137 | Int | B |  |
| Filament / Basic information | `filament_type` P1489 B2825 O3507 | Strings | P | Type: Filament material type |
| Filament / Basic information | `filament_vendor` P1551 B3154 O3644 | Strings | P | Vendor: Vendor of filament. |
| Filament / Basic information | `filament_soluble` P1518 B2867 O3521 | Bools | P | Soluble material: Soluble material is commonly used to print supports and support interfaces. |
| Filament / Basic information | `filament_is_support` B2928 O3535 | Bools | B | Support material: Support material is commonly used to print supports and support interfaces. |
| Filament / Basic information | `filament_change_length` B2912 O3527 | Floats | B | Filament ramming length: When changing the extruder, it is recommended to extrude a certain len... |
| Filament / Basic information | `required_nozzle_HRC` B2495 O3087 | Ints | B | Required nozzle HRC: Minimum HRC of nozzle required to print the filament. |
| Filament / Basic information | `default_filament_colour` B2472 O3053 | Strings | B | Default color: Default filament color. |
| Filament / Basic information | `filament_diameter` P1472 B2749 O3242 | Floats | P | Diameter: Filament diameter is used to calculate extrusion variables in G-code, so it is import... |
| Filament / Basic information | `filament_adhesiveness_category` B2791 O3320 | Ints | B | Adhesiveness Category: Filament category. |
| Filament / Basic information | `filament_density` P1480 B2817 O3499 | Floats | P | Density: Filament density, for statistical purposes only. |
| Filament / Basic information | `filament_shrink` B2769 O3295 | Percents | P~ (filament_shrinkage_compensation_xy) | Shrinkage (XY): Enter the shrinkage percentage that the filament will get after cooling (94% if... |
| Filament / Basic information | `filament_shrinkage_compensation_z` P1566 O3308 | Percents | P>O | Shrinkage (Z): Enter the shrinkage percentage that the filament will get after cooling (94% if ... |
| Filament / Basic information | `filament_cost` P1530 B3137 O3627 | Floats | P | Price: Filament price, for statistical purposes only. |
| Filament / Basic information | `temperature_vitrification` B3089 O3620 | Ints | B | Softening temperature: The material softens at this temperature, so when the bed temperature is... |
| Filament / Basic information | `idle_temperature` P4547 O8519 | Ints | P>O | Idle temperature: Nozzle temperature when the tool is currently not used in multi-tool setups. |
| Filament / Basic information | `nozzle_temperature_range_low` B6090 O8057 | Ints | B | Min |
| Filament / Basic information | `nozzle_temperature_range_high` B6098 O8065 | Ints | B | Max |
| Filament / Flow ratio and Pressure Advance | `pellet_flow_coefficient` O3275 | Floats | O | Pellet flow coefficient: Pellet flow coefficient is empirically derived and allows for volume c... |
| Filament / Flow ratio and Pressure Advance | `filament_flow_ratio` B2386 O2921 | Floats | P~ (extrusion_multiplier) | Flow ratio: The material may have volumetric change after switching between molten and crystall... |
| Filament / Flow ratio and Pressure Advance | `enable_pressure_advance` B2406 O2946 | Bools | B | Enable pressure advance: Enable pressure advance, auto calibration result will be overwritten o... |
| Filament / Flow ratio and Pressure Advance | `pressure_advance` B2411 O2951 | Floats | B | Pressure advance: Pressure advance (Klipper) AKA Linear advance factor (Marlin). |
| Filament / Flow ratio and Pressure Advance | `adaptive_pressure_advance` O2959 | Bools | O | Enable adaptive pressure advance (beta): With increasing print speeds (and hence increasing vol... |
| Filament / Flow ratio and Pressure Advance | `adaptive_pressure_advance_overhangs` O3000 | Bools | O | Enable adaptive pressure advance within features (beta): Enable adaptive PA whenever there are ... |
| Filament / Flow ratio and Pressure Advance | `adaptive_pressure_advance_bridges` O3008 | Floats | O | Static pressure advance for bridges: Static pressure advance value for bridges. |
| Filament / Flow ratio and Pressure Advance | `adaptive_pressure_advance_model` O2975 | Strings | O | Adaptive pressure advance measurements (beta): Add sets of pressure advance (PA) values, the vo... |
| Filament / Print chamber temperature | `activate_chamber_temp_control` O8003 | Bools | O | Activate temperature control: Enable this option for automated chamber temperature control. |
| Filament / Print chamber temperature | `chamber_temperature` P617 O8012 | Ints | P>O | Chamber temperature: For high-temperature materials like ABS, ASA, PC, and PA, a higher chamber... |
| Filament / Print chamber temperature | `chamber_minimal_temperature` P629 O8033 | Ints | P>O | Minimal: This is the chamber temperature at which printing should start, while the chamber cont... |
| Filament / Print temperature | `nozzle_temperature_initial_layer` B3493 O4116 | Ints | P~ (first_layer_temperature) | First layer: Nozzle temperature for printing the first layer with this filament |
| Filament / Print temperature | `nozzle_temperature` B6080 O8048 | Ints | P~ (temperature) | Other layers: Nozzle temperature after the first layer |
| Filament / Bed temperature | `supertack_plate_temp_initial_layer` B1317 O1396 | Ints | B | First layer: This is the bed temperature of the first layer. |
| Filament / Bed temperature | `supertack_plate_temp` B1267 O1342 | Ints | B | Other layers: This is the bed temperature for layers except for the first one. |
| Filament / Bed temperature | `cool_plate_temp_initial_layer` B1327 O1405 | Ints | B | First layer: This is the bed temperature of the first layer. |
| Filament / Bed temperature | `cool_plate_temp` B1277 O1351 | Ints | B | Other layers: This is the bed temperature for layers except for the first one. |
| Filament / Bed temperature | `textured_cool_plate_temp_initial_layer` O1414 | Ints | O | First layer: This is the bed temperature of the first layer. |
| Filament / Bed temperature | `textured_cool_plate_temp` O1360 | Ints | O | Other layers: This is the bed temperature for layers except for the first one. |
| Filament / Bed temperature | `eng_plate_temp_initial_layer` B1337 O1423 | Ints | B | First layer: This is the bed temperature of the first layer. |
| Filament / Bed temperature | `eng_plate_temp` B1287 O1369 | Ints | B | Other layers: This is the bed temperature for layers except for the first one. |
| Filament / Bed temperature | `hot_plate_temp_initial_layer` B1347 O1432 | Ints | P~ (first_layer_bed_temperature) | First layer: This is the bed temperature of the first layer. |
| Filament / Bed temperature | `hot_plate_temp` B1297 O1378 | Ints | P~ (bed_temperature) | Other layers: This is the bed temperature for layers except for the first one. |
| Filament / Bed temperature | `textured_plate_temp_initial_layer` B1357 O1440 | Ints | B | First layer: This is the bed temperature of the first layer. |
| Filament / Bed temperature | `textured_plate_temp` B1307 O1387 | Ints | B | Other layers: This is the bed temperature for layers except for the first one. |
| Filament / Volumetric speed limitation | `filament_adaptive_volumetric_speed` B2756 O3281 | Bools | B | Adaptive volumetric speed: When enabled, the extrusion flow is limited by the smaller of the fi... |
| Filament / Volumetric speed limitation | `filament_max_volumetric_speed` P1270 B2577 O3188 | Floats | P | Max volumetric speed: This setting is the volume of filament that can be melted and extruded pe... |
| Cooling / Cooling for specific layer | `close_fan_the_first_x_layers` B2021 O2399 | Ints | P~ (disable_fan_first_layers) | No cooling for the first: Turn off all cooling fans for the first few layers. |
| Cooling / Cooling for specific layer | `initial_layer_fan_speed` O4138 | Ints | O | First layer fan speed: Sets an exact fan speed for the first layer, overriding all other coolin... |
| Cooling / Cooling for specific layer | `full_fan_speed_layer` P1766 B3503 O4125 | Ints | P | Full fan speed at layer: Fan speed will be ramped up linearly from zero at layer "close_fan_the... |
| Cooling / Part cooling fan | `fan_min_speed` B4584 O5664 | Floats | P~ (min_fan_speed) | Fan speed: Minimum speed for part cooling fan. |
| Cooling / Part cooling fan | `fan_cooling_layer_time` B2462 O3044 | Floats | P~ (fan_below_layer_time) | Layer time: The part cooling fan will be enabled for layers where the estimated time is shorter... |
| Cooling / Part cooling fan | `fan_max_speed` B4540 O5605 | Floats | P~ (max_fan_speed) | Fan speed: The part cooling fan speed may be increased when auto cooling is enabled. |
| Cooling / Part cooling fan | `slow_down_layer_time` B5428 O6797 | Floats | P~ (slowdown_below_layer_time) | Layer time: The printing speed in exported G-code will be slowed down when the estimated layer ... |
| Cooling / Part cooling fan | `reduce_fan_stop_start_freq` B2456 O3030 | Bools | B | Keep fan always on: Enabling this setting means that part cooling fan will never stop entirely ... |
| Cooling / Part cooling fan | `slow_down_for_layer_cooling` B1881 O2304 | Bools | P~ (cooling) | Slow printing down for better layer cooling: Enable this option to slow printing speed down to ... |
| Cooling / Part cooling fan | `dont_slow_down_outer_wall` O3035 | Bools | O | Don't slow down outer walls: If enabled, this setting will ensure external perimeters are not s... |
| Cooling / Part cooling fan | `slow_down_min_speed` B4613 O5719 | Floats | P~ (min_print_speed) | Min print speed: The minimum print speed to which the printer slows down to maintain the minimu... |
| Cooling / Part cooling fan | `enable_overhang_bridge_fan` B1453 O1585 | Bools | B | Force cooling for overhangs and bridges: Enable this option to allow adjustment of the part coo... |
| Cooling / Part cooling fan | `overhang_fan_threshold` B1490 O1605 | Enums | B | Overhang cooling activation threshold: When the overhang exceeds this specified threshold, forc... |
| Cooling / Part cooling fan | `overhang_fan_speed` B1459 O1592 | Ints | P~ (bridge_fan_speed) | Overhangs and external bridges fan speed: Use this part cooling fan speed when printing bridges... |
| Cooling / Part cooling fan | `internal_bridge_fan_speed` O4168 | Ints | O(SS) | Internal bridges fan speed: The part cooling fan speed used for all internal bridges. |
| Cooling / Part cooling fan | `support_material_interface_fan_speed` O4155 | Ints | O(SS) | Support interface fan speed: This part cooling fan speed is applied when printing support inter... |
| Cooling / Part cooling fan | `ironing_fan_speed` B1469 O4179 | Ints | B | Ironing fan speed: This part cooling fan speed is applied when ironing. |
| Cooling / Auxiliary part cooling fan | `additional_cooling_fan_speed` B4593 O5673 | Ints | B | Fan speed: Speed of auxiliary part cooling fan. |
| Cooling / Exhaust fan | `activate_air_filtration` B1980 O2362 | Bools | B | Activate air filtration: Activate for better air filtration. |
| Cooling / Exhaust fan | `activate_air_filtration_during_print` O2369 | Bools | O | During print: Enable this to override the fan speed set in custom G-code during print. |
| Cooling / Exhaust fan | `during_print_exhaust_fan_speed` B1986 O2381 | Ints | B | Fan speed: Speed of exhaust fan during printing. |
| Cooling / Exhaust fan | `activate_air_filtration_on_completion` O2375 | Bools | O | On completion: Enable this to override the fan speed set in custom G-code after print completio... |
| Cooling / Exhaust fan | `complete_print_exhaust_fan_speed` B1995 O2390 | Ints | B | Fan speed: Speed of exhaust fan after printing completes. |
| Advanced / Filament start G-code | `filament_start_gcode` B5550 O6991 | Strings | P~ (start_filament_gcode) | Start G-code: G-code added when the printer starts using this filament |
| Advanced / Change extrusion role G-code | `filament_change_extrusion_role_gcode` O8103 | Strings | O | Change extrusion role G-code (filament): This G-code is inserted when the extrusion role is cha... |
| Advanced / Filament end G-code | `filament_end_gcode` B2092 O2521 | Strings | P~ (end_filament_gcode) | End G-code: Add end G-code when finishing the printing of this filament. |
| Multimaterial / Wipe tower parameters | `filament_minimal_purge_on_wipe_tower` P1377 B2610 O3401 | Floats | P | Minimal purge on wipe tower: After a tool change, the exact position of the newly loaded filame... |
| Multimaterial / Wipe tower parameters | `filament_tower_interface_pre_extrusion_dist` B3042 O3420 | Floats | B | Interface layer pre-extrusion distance: Pre-extrusion distance for prime tower interface layer ... |
| Multimaterial / Wipe tower parameters | `filament_tower_interface_pre_extrusion_length` B3050 O3428 | Floats | B | Interface layer pre-extrusion length: Pre-extrusion length for prime tower interface layer (whe... |
| Multimaterial / Wipe tower parameters | `filament_tower_ironing_area` B3058 O3436 | Floats | B | Tower ironing area: Ironing area for prime tower interface layer (where different materials mee... |
| Multimaterial / Wipe tower parameters | `filament_tower_interface_purge_volume` B3066 O3444 | Floats | B | Interface layer purge length: Purge length for prime tower interface layer (where different mat... |
| Multimaterial / Wipe tower parameters | `filament_tower_interface_print_temp` B3074 O3452 | Ints | B | Interface layer print temperature: Print temperature for prime tower interface layer (where dif... |
| Multimaterial / Multi Filament | `long_retractions_when_ec` B4964 O6156 | Bools | B | Long retraction when extruder change |
| Multimaterial / Multi Filament | `retraction_distances_when_ec` B4970 O6162 | Floats | B | Retraction distance when extruder change |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_loading_speed_start` P1308 O3335 | Floats | P>O | Loading speed at the start: Speed used at the very beginning of loading phase. |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_loading_speed` P1300 O3327 | Floats | P>O | Loading speed: Speed used for loading the filament on the wipe tower. |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_unloading_speed_start` P1325 O3351 | Floats | P>O | Unloading speed at the start: Speed used for unloading the tip of the filament immediately afte... |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_unloading_speed` P1316 O3343 | Floats | P>O | Unloading speed: Speed used for unloading the filament on the wipe tower (does not affect initi... |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_toolchange_delay` P1333 O3359 | Floats | P>O | Delay after unloading: Time to wait after the filament is unloaded. |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_cooling_moves` P1360 O3369 | Ints | P>O | Number of cooling moves: Filament is cooled by being moved back and forth in the cooling tubes. |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_cooling_initial_speed` P1369 O3393 | Floats | P>O | Speed of the first cooling move: Cooling moves are gradually accelerating beginning at this spe... |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_cooling_final_speed` P1388 O3460 | Floats | P>O | Speed of the last cooling move: Cooling moves are gradually accelerating towards this speed. |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_stamping_loading_speed` P1343 O3378 | Floats | P>O | Stamping loading speed: Speed used for stamping. |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_stamping_distance` P1351 O3385 | Floats | P>O | Stamping distance measured from the center of the cooling tube: If set to non-zero value, filam... |
| Multimaterial / Tool change parameters with single extruder MM printers | `filament_ramming_parameters` P1422 O3468 | Strings | P>O | Ramming parameters: This string is edited by RammingDialog and contains ramming specific parame... |
| Multimaterial / Tool change parameters with multi extruder MM printers | `filament_multitool_ramming` P1448 O3475 | Bools | P>O | Enable ramming for multi-tool setups: Perform ramming when using multi-tool printer (i.e. |
| Multimaterial / Tool change parameters with multi extruder MM printers | `filament_multitool_ramming_volume` P1456 O3483 | Floats | P>O | Multi-tool ramming volume: The volume to be rammed before the tool change. |
| Multimaterial / Tool change parameters with multi extruder MM printers | `filament_multitool_ramming_flow` P1464 O3491 | Floats | P>O | Multi-tool ramming flow: Flow used for ramming the filament before the tool change. |
| Dependencies / Compatible printers | `compatible_printers` P907 B1815 O2213 | Strings | P | Select printers |
| Dependencies / Compatible printers | `compatible_printers_condition` P913 B1828 O2226 | String | P | Condition: A Boolean expression using the configuration values of an active printer profile. |
| Dependencies / Compatible process profiles | `compatible_prints` P922 B1837 O2233 | Strings | P | Select profiles |
| Dependencies / Compatible process profiles | `compatible_prints_condition` P928 B1843 O2239 | String | P | Condition: A Boolean expression using the configuration values of an active print profile. |
| Notes / Notes | `filament_notes` P1261 B2419 O3069 | Strings | P | Filament notes: You can put your notes regarding the filament here. |

##### TabPrinter

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| (none) / (none) | `nozzle_diameter` P2508 B4621 O5728 | Floats | P | Nozzle diameter: The diameter of nozzle. |
| (none) / (none) | `printer_extruder_variant` B5151 O6386 | Strings | B | Printer's extruder variant: Printer's extruder variant. |
| Basic information / Printable space | `printable_area` B1052 O1021 | Points | P~ (bed_shape) | Printable area |
| Basic information / Printable space | `parallel_printheads_count` O1039 | Int | O | Parallel printheads count: Set the number of parallel printheads for machines like OrangeStorm ... |
| Basic information / Printable space | `bed_exclude_area` B1066 O1054 | Points | B | Excluded bed area: Unprintable area in XY plane. |
| Basic information / Printable space | `bed_exclude_volumes` O1063 | String | O | Toolhead collision volumes: Collision volumes used for model and generated-material exclusion, ... |
| Basic information / Printable space | `bed_exclude_volume_mode` O1073 | Enum | O | Collision volume behavior: Choose whether all nozzles use the same collision volumes, derive to... |
| Basic information / Printable space | `printable_height` B1106 O1142 | Float | P~ (max_print_height) | Printable height: This is the maximum printable height which is limited by the height of the bu... |
| Basic information / Printable space | `support_multi_bed_types` O4687 | Bool | O | Support multi bed types: Enable this option if you want to use multiple bed types. |
| Basic information / Printable space | `best_object_pos` B3748 O4525 | Point | B | Best object position: Best auto arranging position in range [0,1] w.r.t. |
| Basic information / Printable space | `z_offset` P3978 O7291 | Float | P>O | Z offset: This value will be added (or subtracted) from all the Z coordinates in the output G-c... |
| Basic information / Printable space | `preferred_orientation` O1160 | Float | O | Preferred orientation: Automatically orient STL files on the Z axis upon initial import. |
| Basic information / Advanced | `printer_structure` B3731 O4508 | Enum | B | Printer structure: The physical arrangement and components of a printing device. |
| Basic information / Advanced | `gcode_flavor` P1834 B3798 O4638 | Enum | P | G-code flavor: What kind of G-code the printer is compatible with. |
| Basic information / Advanced | `gcode_skip_config_block` O4672 | Bool | O | Skip G-code config block: Do not write the CONFIG_BLOCK (slicer configuration key/value pairs) ... |
| Basic information / Advanced | `pellet_modded_printer` O4681 | Bool | O | Pellet Modded Printer: Enable this option if your printer uses pellets instead of filaments. |
| Basic information / Advanced | `bbl_use_printhost` O1177 | Bool | O | Use 3rd-party print host: Allow controlling BambuLab's printer through 3rd party print hosts. |
| Basic information / Advanced | `printer_agent` O1192 | String | O | Printer Agent: Select the network agent implementation for printer communication. |
| Basic information / Advanced | `use_3mf` O1184 | Bool | O | Use 3MF instead of G-code: Enable this if the printer accepts a 3MF file as the print job. |
| Basic information / Advanced | `scan_first_layer` B3676 O4453 | Bool | B | Scan first layer: Enable this to allow the camera on the printer to check the quality of the fi... |
| Basic information / Advanced | `enable_power_loss_recovery` O4460 | Enum | O | Power Loss Recovery: Choose how to control power loss recovery. |
| Basic information / Advanced | `disable_m73` O6491 | Bool | O | Disable set remaining print time: Disable generating of the M73: Set remaining print time in th... |
| Basic information / Belt printer | `belt_printer` O7684 | Bool | O | Enable belt printing: Enable belt printer mode. |
| Basic information / Belt printer | `belt_printer_infinite_y` O7693 | Bool | O | Infinite Y axis: Enable infinite Y axis for belt printers. |
| Basic information / Belt printer | `belt_slice_rotation_angle` O7719 | Float | O | Belt tilt angle: Tilt angle of the belt surface, in degrees. |
| Basic information / Belt printer | `belt_slice_rotation` O7705 | Enum | O | Belt tilt axis: Axis the mesh is rotated about before slicing. |
| Basic information / Belt printer | `belt_support_floor_offset` O7784 | Float | O | Support Floor Z offset: Shifts the computed belt floor up or down (mm). |
| Basic information / Machine frame transforms | `gcode_remap_x` O7769 | Enum | O |  |
| Basic information / Machine frame transforms | `gcode_remap_y` O7772 | Enum | O |  |
| Basic information / Machine frame transforms | `gcode_remap_z` O7775 | Enum | O |  |
| Basic information / Machine frame transforms | `belt_frame_tilt_decouple` O7732 | Bool | O | Decouple machine-frame tilt: Expert override: set the machine-frame (G-code shear/scale) tilt a... |
| Basic information / Machine frame transforms | `belt_frame_tilt_angle` O7743 | Float | O | Machine-frame tilt angle: Tilt angle (degrees) used to derive the machine-frame shear (cot) and... |
| Basic information / Machine frame transforms | `thumbnails` P406 O8582 | String | P>O | G-code thumbnails: Picture sizes to be stored into a .gcode and .sl1 / .sl1s files, in the foll... |
| Basic information / Machine frame transforms | `thumbnails_format` P414 O8589 | Enum | P>O | Format of G-code thumbnails: Format of G-code thumbnails: PNG for best quality, JPG for smalles... |
| Basic information / Machine frame transforms | `use_relative_e_distances` P3820 B6213 O8606 | Bool | P | Use relative E distances: Relative extrusion is recommended when using "label_objects" option. |
| Basic information / Machine frame transforms | `use_firmware_retraction` P3813 B6220 O6478 | Bool | P | Use firmware retraction: This experimental setting uses G10 and G11 commands to have the firmwa... |
| Basic information / Machine frame transforms | `time_cost` O4605 | Float | O(SS) | Time cost: The printer cost per hour. |
| Basic information / Machine frame transforms | `build_plate_tilt_x` O7659 | Float | O | Build plate tilt X: Tilt angle of the build plate along the X axis. |
| Basic information / Machine frame transforms | `build_plate_tilt_y` O7672 | Float | O | Build plate tilt Y: Tilt angle of the build plate along the Y axis. |
| Basic information / Cooling Fan | `fan_speedup_time` O4552 | Float | O(SS) | Fan speed-up time: Start the fan this number of seconds earlier than its target start time (you... |
| Basic information / Cooling Fan | `fan_speedup_overhangs` O4565 | Bool | O(SS) | Only overhangs: Will only take into account the delay for the cooling of overhangs. |
| Basic information / Cooling Fan | `fan_kickstart` O4571 | Float | O(SS) | Fan kick-start time: Emit a max fan speed command for this amount of seconds before reducing to... |
| Basic information / Cooling Fan | `part_cooling_fan_min_pwm` O4583 | Int | O | Minimum non-zero part cooling fan speed: Some part-cooling fans cannot start spinning when comm... |
| Basic information / Extruder Clearance | `extruder_clearance_radius` P1181 O2840 | Float | P>O | Radius: Clearance radius around extruder: used for collision avoidance in by-object printing. |
| Basic information / Extruder Clearance | `extruder_clearance_dist_to_rod` B2335 O2815 | Float | B | Distance to rod: Horizontal distance of the nozzle tip to the rod's farther edge. |
| Basic information / Extruder Clearance | `extruder_clearance_height_to_rod` B2316 O2823 | Float | P~ (extruder_clearance_height) | Height to rod: Distance from the nozzle tip to the lower rod. |
| Basic information / Extruder Clearance | `extruder_clearance_height_to_lid` B2326 O2832 | Float | B | Height to lid: Distance from the nozzle tip to the lid. |
| Basic information / Adaptive bed mesh | `bed_mesh_min` O2856 | Point | O | Bed mesh min: This option sets the min point for the allowed bed mesh area. |
| Basic information / Adaptive bed mesh | `bed_mesh_max` O2868 | Point | O | Bed mesh max: This option sets the max point for the allowed bed mesh area. |
| Basic information / Adaptive bed mesh | `bed_mesh_probe_distance` O2880 | Point | O | Probe point distance: This option sets the preferred distance between probe points (grid size) ... |
| Basic information / Adaptive bed mesh | `adaptive_bed_mesh_margin` O2889 | Float | O | Mesh margin: This option determines the additional distance by which the adaptive bed mesh area... |
| Basic information / Accessory | `nozzle_hrc` O4499 | Int | O | Nozzle HRC: The nozzle\'s hardness. |
| Basic information / Accessory | `auxiliary_fan` B3754 O4531 | Bool | B | Auxiliary part cooling fan: Enable this option if machine has auxiliary part cooling fan. |
| Basic information / Accessory | `fan_direction` B3760 O4537 | Enum | B | Fan direction: Cooling fan direction of the printer |
| Basic information / Accessory | `support_chamber_temp_control` B3775 O4614 | Bool | B | Support controlling chamber temperature: This option is enabled if the machine supports control... |
| Basic information / Accessory | `support_air_filtration` B3782 O4621 | Bool | B | Support air filtration: Enable this if the printer supports air filtration G-code command: M106... |
| Basic information / Accessory | `cooling_filter_enabled` B3792 O4632 | Bool | B | Use cooling filter: Enable this if the printer supports a cooling filter |
| Machine G-code / File header G-code | `file_start_gcode` O6970 | String | O | File header G-code: G-code written at the very top of the output file, before any other content... |
| Machine G-code / Machine start G-code | `machine_start_gcode` B5541 O6982 | String | P~ (start_gcode) | Start G-code: G-code added when starting a print. |
| Machine G-code / Machine end G-code | `machine_end_gcode` B2074 O2503 | String | P~ (end_gcode) | End G-code: Add end G-code when finishing the entire print. |
| Machine G-code / Printing by object G-code | `printing_by_object_gcode` B2083 O2512 | String | B | Between Object G-code: Insert G-code between objects. |
| Machine G-code / Before layer change G-code | `before_layer_change_gcode` B1423 O1516 | String | P~ (before_layer_gcode) | Before layer change G-code: This G-code is inserted at every layer change before the Z lift. |
| Machine G-code / Layer change G-code | `layer_change_gcode` B4311 O5282 | String | P~ (layer_gcode) | Layer change G-code: This G-code is inserted at every layer change after the Z lift. |
| Machine G-code / Timelapse G-code | `time_lapse_gcode` B4320 O5291 | String | B | Timelapse G-code |
| Machine G-code / Clumping Detection G-code | `wrapping_detection_gcode` B4328 O5299 | String | B | Clumping detection G-code |
| Machine G-code / Change filament G-code | `change_filament_gcode` B6124 O8085 | String | P~ (toolchange_gcode) | Change filament G-code: This G-code is inserted when filament is changed, including T commands ... |
| Machine G-code / Change extrusion role G-code | `change_extrusion_role_gcode` O8094 | String | O | Change extrusion role G-code: This G-code is inserted when the extrusion role is changed. |
| Machine G-code / Pause G-code | `machine_pause_gcode` B4342 O5315 | String | P~ (pause_print_gcode) | Pause G-code: This G-code will be used as a code for the pause print. |
| Machine G-code / Template Custom G-code | `template_custom_gcode` P3259 B4351 O5324 | String | P | Custom G-code: This G-code will be used as a custom code. |
| Notes / Notes | `printer_notes` P2672 B2437 O6016 | String | P | Printer notes: You can put your notes regarding the printer here. |
| Motion ability / Advanced | `emit_machine_limits_to_gcode` O5307 | Bool | P~O (machine_limits_usage) | Emit limits to G-code: If enabled, the machine limits will be emitted to G-code file. |
| Motion ability / Resonance Compensation | `resonance_avoidance` O5531 | Bool | O | Resonance avoidance: By reducing the speed of the outer wall to avoid the resonance zone of the... |
| Motion ability / Resonance Compensation | `min_resonance_avoidance_speed` O5539 | Float | O | Min: Minimum speed of resonance avoidance. |
| Motion ability / Resonance Compensation | `max_resonance_avoidance_speed` O5547 | Float | O | Max: Maximum speed of resonance avoidance. |
| Motion ability / Resonance Compensation | `input_shaping_emit` O5556 | Bool | O | Emit input shaping: Override firmware input shaping settings. |
| Motion ability / Resonance Compensation | `input_shaping_type` O5562 | Enum | O | Input shaper type: Choose the input shaper algorithm. |
| Motion ability / Resonance Compensation | `input_shaping_freq_x` O5571 | Float | O | XAxis: Resonant frequency for the X axis input shaper. |
| Motion ability / Resonance Compensation | `input_shaping_freq_y` O5580 | Float | O | YAxis: Resonant frequency for the Y axis input shaper. |
| Motion ability / Resonance Compensation | `input_shaping_damp_x` O5589 | Float | O | XAxis: Damping ratio for the X axis input shaper. |
| Motion ability / Resonance Compensation | `input_shaping_damp_y` O5597 | Float | O | YAxis: Damping ratio for the Y axis input shaper. |
| Motion ability / Resonance Compensation | `machine_max_speed_x` B4392 O5375 | Floats | P~ (machine_max_feedrate_x) |  |
| Motion ability / Resonance Compensation | `machine_max_speed_y` B4392 O5375 | Floats | P~ (machine_max_feedrate_y) |  |
| Motion ability / Resonance Compensation | `machine_max_speed_z` B4392 O5375 | Floats | P~ (machine_max_feedrate_z) |  |
| Motion ability / Resonance Compensation | `machine_max_speed_e` B4392 O5375 | Floats | P~ (machine_max_feedrate_e) | Maximum speed %1%: Maximum speed of the %1% axis |
| Motion ability / Acceleration limitation | `machine_max_acceleration_extruding` P2352 B4502 O5495 | Floats | P | Maximum acceleration for extruding: Maximum acceleration for extruding (M204 P) |
| Motion ability / Acceleration limitation | `machine_max_acceleration_retracting` P2363 B4517 O5509 | Floats | P | Maximum acceleration for retracting: Maximum acceleration for retracting (M204 R) |
| Motion ability / Acceleration limitation | `machine_max_acceleration_travel` P2374 B4529 O5520 | Floats | P | Maximum acceleration for travel: Maximum acceleration for travel (M204 T), it only applies to M... |
| Motion ability / Jerk limitation | `machine_max_junction_deviation` P2322 O5431 | Floats | P>O | Maximum Junction Deviation: Maximum junction deviation (M205 J, only apply if JD > 0 for Marlin... |
| Motion ability / Jerk limitation | `imex_tools_per_gantry` O7041 | Int | O | Tools per Gantry: Number of independent toolheads per gantry along X. |
| Motion ability / Jerk limitation | `imex_gantry_count` O7033 | Int | O | Gantry Count: Number of independent Y-axis gantries. |
| Motion ability / Jerk limitation | `imex_tool_layout` O7049 | Enum | O | Tool 0 Position: Physical position on the bed where tool T0 (index 0) is located. |
| Multimaterial / Single extruder multi-material setup | `single_extruder_multi_material` P3268 B5559 O7000 | Bool | P | Single Extruder Multi Material: Use single nozzle to print multi filament. |
| Multimaterial / Single extruder multi-material setup | `manual_filament_change` O7140 | Bool | O | Manual Filament Change: Enable this option to omit the custom Change filament G-code only at th... |
| Multimaterial / Single extruder multi-material setup | `bed_temperature_formula` B2734 O3227 | Enum | B | Bed temperature type: This option determines how the bed temperature is set during slicing: bas... |
| Multimaterial / Wipe tower | `wipe_tower_type` O7148 | Enum | O | Wipe tower type: Choose the wipe tower implementation for multi-material prints. |
| Multimaterial / Wipe tower | `purge_in_prime_tower` O7159 | Bool | O | Purge in prime tower: Purge remaining filament into prime tower. |
| Multimaterial / Wipe tower | `enable_filament_ramming` O7165 | Bool | O | Enable filament ramming |
| Multimaterial / Wipe tower | `tool_change_on_wipe_tower` O7171 | Bool | O | Tool change on wipe tower: Force the toolhead to travel to the wipe tower before issuing the to... |
| Multimaterial / Wipe tower | `wait_for_temp_on_wipe_tower` O7181 | Bool | O | Wait for temperature on wipe tower: Pick up the new tool without waiting for it to reach printi... |
| Multimaterial / Belt purge tower | `enable_belt_purge_tower` O7794 | Bool | O | Enable belt purge tower: Belt-printer replacement for the wipe/prime tower. |
| Multimaterial / Single extruder multi-material parameters | `cooling_tube_retraction` P981 O5798 | Float | P>O | Cooling tube position: Distance of the center-point of the cooling tube from the extruder tip. |
| Multimaterial / Single extruder multi-material parameters | `cooling_tube_length` P989 O5806 | Float | P>O | Cooling tube length: Length of the cooling tube to limit space for cooling moves inside it. |
| Multimaterial / Single extruder multi-material parameters | `parking_pos_retraction` P2565 O5822 | Float | P>O | Filament parking position: Distance of the extruder tip from the position where the filament is... |
| Multimaterial / Single extruder multi-material parameters | `extra_loading_move` P2574 O5831 | Float | P>O | Extra loading distance: When set to zero, the distance the filament is moved from parking posit... |
| Multimaterial / Single extruder multi-material parameters | `high_current_on_filament_swap` P1878 O5814 | Bool | P>O | High extruder current on filament swap: It may be beneficial to increase the extruder motor cur... |
| Multimaterial / Advanced | `machine_load_filament_time` B2621 O3196 | Float | P~ (filament_load_time) | Filament load time: Time to load new filament when switch filament. |
| Multimaterial / Advanced | `machine_unload_filament_time` B2629 O3205 | Float | P~ (filament_unload_time) | Filament unload time: Time to unload old filament when switch filament. |
| Multimaterial / Advanced | `machine_tool_change_time` O3214 | Float | O | Tool change time: Time taken to switch tools. |
| Multimaterial / IDEX/IQEX Configuration | `is_imex` O7012 | Bool | O | IDEX/IQEX Printer: Enable parallel printing for printers with multiple independent carriages (I... |
| Multimaterial / IDEX/IQEX Configuration | `imex_firmware_managed_zones` O7022 | Bool | O | Firmware-managed zones: When enabled, the slicer emits G-code with the primary zone's contents ... |
| Multimaterial / IDEX/IQEX Configuration | `imex_nozzle_clearance_x` O7068 | Float | O | Nozzle Clearance X: Distance (mm) from the nozzle to the collision-side carriage edge in X. |
| Multimaterial / IDEX/IQEX Configuration | `imex_nozzle_clearance_y` O7076 | Float | O | Nozzle Clearance Y: Distance (mm) from the nozzle to the collision-side carriage edge in Y. |
| Multimaterial / IDEX/IQEX Configuration | `imex_carriage_margin` O7084 | Float | O | Safety Margin |
| Multimaterial / IDEX/IQEX Configuration | `imex_viz_theme` O7093 | Enum | O | Visualization Theme: Color theme for IDEX/IQEX bed zone visualization. |
| Multimaterial / IDEX/IQEX Configuration | `imex_mode_names` O7122 | Strings | O | IDEX/IQEX Mode Names: Display names for each user-defined IDEX/IQEX parallel print mode. |
| Multimaterial / IDEX/IQEX Configuration | `imex_mode_active_tools` O7128 | Strings | O | IDEX/IQEX Mode Active Tools: Tool role assignments for each mode. |
| Multimaterial / IDEX/IQEX Configuration | `imex_mode_gcodes` O7134 | Strings | O | IDEX/IQEX Mode G-codes: G-code or macro call to inject at print start for each mode. |
| Extruder / Basic information | `nozzle_type` O4480 | Enums | O | Nozzle type: The metallic material of the nozzle: This determines the abrasive resistance of th... |
| Extruder / Basic information | `nozzle_volume` B4653 O5789 | Floats | B | Nozzle volume: Volume of nozzle between the filament cutter and the end of the nozzle |
| Extruder / Basic information | `extruder_printable_height` B1115 O1151 | Floats | B | Extruder printable height: Maximum printable height of this extruder which is limited by mechan... |
| Extruder / Basic information | `extruder_printable_area` B1059 O1027 | PointsGroups | B | Extruder printable area |
| Extruder / Basic information | `extruder_bed_exclude_volumes` O1083 | Strings | O | Extruder collision volumes: Collision volumes used only by this extruder in individual mode. |
| Extruder / Layer height limits | `min_layer_height` P2455 B4603 O5710 | Floats | P | Min: The lowest printable layer height for the extruder. |
| Extruder / Layer height limits | `max_layer_height` P2392 B4550 O5614 | Floats | P | Max: The highest printable layer height for the extruder. |
| Extruder / Position | `extruder_offset` P1199 B2374 O2911 | Points | P | Extruder offset: If your firmware doesn't handle the extruder displacement you need the G-code ... |
| Extruder / Retraction | `deretraction_speed` B5232 O6457 | Floats | P~ (deretract_speed) | Deretraction speed: Speed for reloading filament into the nozzle. |
| Extruder / Retraction | `retract_after_wipe` O6113 | Percents | O | Retract amount after wipe: This is the length of fast retraction after wipe, relative to retrac... |
| Extruder / Retraction | `retract_before_wipe` P2782 B4918 O6105 | Percents | P | Retract amount before wipe: This is the length of fast retraction before a wipe, relative to re... |
| Extruder / Retraction | `retract_restart_extra` P2882 B5203 O6433 | Floats | P | Extra length on restart: When the retraction is compensated after the travel move, the extruder... |
| Extruder / Retraction | `retract_when_changing_layer` B4926 O6122 | Bools | P~ (retract_layer_change) | Retract on layer change: This forces a retraction on layer changes. |
| Extruder / Retraction | `retraction_length` B4933 O6128 | Floats | P~ (retract_length) | Length: Some amount of material in extruder is pulled back to avoid ooze during long travel. |
| Extruder / Retraction | `retraction_minimum_travel` B4910 O6098 | Floats | P~ (retract_before_travel) | Travel distance threshold: Only trigger retraction when the travel distance is longer than this... |
| Extruder / Retraction | `retraction_speed` B5223 O6449 | Floats | P~ (retract_speed) | Retraction speed: Speed for retracting filament from the nozzle. |
| Extruder / Retraction | `wipe` P3851 B6226 O8214 | Bools | P | Wipe while retracting: This moves the nozzle along the last extrusion path when retracting to c... |
| Extruder / Retraction | `wipe_distance` B6234 O8220 | Floats | B | Wipe distance: Describe how long the nozzle will move along the last path when retracting. |
| Extruder / Z-Hop | `retract_lift_above` P2863 B5003 O6189 | Floats | P | Z-hop lower boundary: Z-hop will only come into effect when Z is above this value and is below ... |
| Extruder / Z-Hop | `retract_lift_below` P2872 B5012 O6197 | Floats | P | Z-hop upper boundary: If this value is positive, Z-hop will only come into effect when Z is abo... |
| Extruder / Z-Hop | `retract_lift_enforce` O6243 | Enums | O | On surfaces: Enforce Z-Hop behavior. |
| Extruder / Z-Hop | `travel_slope` P2814 O6220 | Floats | P>O | Traveling angle: Traveling angle for Slope and Spiral Z-hop type. |
| Extruder / Z-Hop | `z_hop` B4991 O6180 | Floats | P~ (retract_lift) | Z-hop height: Whenever there is a retraction, the nozzle is lifted a little to create clearance... |
| Extruder / Z-Hop | `z_hop_types` B5022 O6205 | Enums | P~ (travel_ramping_lift) | Z-hop type: Type of Z-hop. |
| Extruder / Retraction when switching material | `retract_length_toolchange` P2804 B4979 O6171 | Floats | P | Retraction Length (Toolchange): When retraction is triggered before changing tool, filament is ... |
| Extruder / Retraction when switching material | `retract_restart_extra_toolchange` P2890 B5213 O6441 | Floats | P | Extra length on restart (Toolchange): When the retraction is compensated after changing tool, t... |
| Extruder / Retraction when switching material | `long_retractions_when_cut` B4947 O6141 | Bools | B | Long retraction when cut (beta): Experimental feature: Retracting and cutting off the filament ... |
| Extruder / Retraction when switching material | `retraction_distances_when_cut` B4955 O6148 | Floats | B | Retraction distance when cut: Experimental feature: Retraction length before cutting off during... |

#### Bambu Studio only (keys not in OrcaSlicer)

##### TabPrint

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| Quality / Line width | `initial_layer_infill_line_width` B3448 | Float | B-only | Initial layer infill: Line width of the infill of initial layer, including sparse infill, solid... |
| Quality / Seam | `seam_placement_away_from_overhangs` B5257 | Bool | B-only | Seam placement away from overhangs(experimental): Ensure seam placement away from overhangs for... |
| Quality / Seam | `override_filament_scarf_seam_setting` B5312 | Bool | B-only | Override filament scarf seam setting: Overrider filament scarf seam setting and could control s... |
| Quality / Seam | `seam_slope_gap` B5343 | FloatOrPercent | B-only | Scarf slope gap: In order to reduce the visiblity of the seam in closed loop, the inner wall an... |
| Quality / Seam | `role_base_wipe_speed` B5371 | Bool | B-only | Role-based wipe speed: The wipe speed is determined by speed of current extrusion role. |
| Quality / Precision | `enable_circle_compensation` B6264 | Bool | B-only | Auto circle contour-hole compensation: Expirment feature to compensate the circle holes and cir... |
| Quality / Precision | `circle_compensation_manual_offset` B6272 | Float | B-only | User Customized Offset: If you want to have tighter or looser assemble, you can set this value. |
| Quality / Ironing | `ironing_direction` B4301 | Float | B-only | ironing direction: Angle for ironing, which controls the relative angle between the top surface... |
| Quality / Advanced | `initial_layer_flow_ratio` B1587 | Float | B-only | Initial layer flow ratio: This factor affects the amount of material for the initial layer |
| Quality / Advanced | `top_one_wall_type` B1596 | Enum | P~-O (top_one_perimeter_type) | Only one wall on top surfaces: Use only one wall on flat top surface, to give more space to the... |
| Quality / Advanced | `top_area_threshold` B1609 | Percent | B-only | Top area threshold: The min width of top areas in percentage of perimeter line width. |
| Quality / Advanced | `smooth_speed_discontinuity_area` B4712 | Bool | B-only | Smooth speed discontinuity area: Add the speed transition between discontinuity area. |
| Quality / Advanced | `smooth_coefficient` B4719 | Float | B-only | Smooth coefficient: The smaller the number, the longer the speed transition path. |
| Quality / Advanced | `avoid_crossing_wall_includes_support` B1259 | Bool | B-only | Avoid crossing wall - Includes support: Including support while avoiding crossing wall. |
| Quality / Advanced | `z_direction_outwall_speed_continuous` B1240 | Bool | B-only | Smoothing wall speed along Z(experimental): Smoothing outwall speed in z direction to get bette... |
| Strength / Walls | `embedding_wall_into_infill` B4767 | Bool | B-only | Embedding the wall into the infill: Embedding the wall into parts where the wall loops are abse... |
| Strength / Top/bottom shells | `infill_instead_top_bottom_surfaces` B6187 | Bool | B-only | Use infill instead of top and bottom surfaces: Using infill instead of top and bottom surfaces. |
| Strength / Sparse infill | `conformal_infill` B3930 | Bool | B-only | Conformal infill: Make sparse infill follow each layer's outline instead of using one set of pa... |
| Strength / Sparse infill | `conformal_stagger` B3939 | Enum | B-only | Layer stagger: How neighboring layers are offset. |
| Strength / Sparse infill | `conformal_link_keep_layers` B3952 | Int | B-only | Forward layers: Number of consecutive layers that keep the forward zigzag. |
| Strength / Sparse infill | `conformal_link_flip_layers` B3964 | Int | B-only | Reverse layers: Number of consecutive layers that reverse the zigzag (start from the opposite r... |
| Strength / Sparse infill | `conformal_pole` B3976 | Enum | B-only | Radial center: Where the radial center comes from. |
| Strength / Sparse infill | `conformal_ray_count` B3991 | Int | B-only | Radial line count: How many radial lines around the center. |
| Strength / Sparse infill | `conformal_hub_radius` B4001 | Float | B-only | Center region radius |
| Strength / Sparse infill | `locked_skin_infill_pattern` B3240 | Enum | B-only | Skin infill pattern: Line pattern for skin |
| Strength / Sparse infill | `locked_skeleton_infill_pattern` B3281 | Enum | B-only | Skeleton infill pattern: Line pattern for skeleton |
| Strength / Sparse infill | `sparse_infill_lattice_angle_1` B4020 | Float | B-only | Lattice angle 1: The angle of the first set of 2D lattice elements in the Z direction. |
| Strength / Sparse infill | `sparse_infill_lattice_angle_2` B4030 | Float | B-only | Lattice angle 2: The angle of the second set of 2D lattice elements in the Z direction. |
| Strength / Sparse infill | `infill_rotate_step` B3858 | Float | B-only | Infill rotate step: This parameter adds a slight rotation to each layer of infill to create a c... |
| Strength / Sparse infill | `sparse_infill_anchor` B4040 | FloatOrPercent | P~-O (infill_anchor) | Length of sparse infill anchor: Connect a sparse infill line to an internal perimeter with a sh... |
| Strength / Sparse infill | `sparse_infill_anchor_max` B4068 | FloatOrPercent | P~-O (infill_anchor_max) | Maximum length of sparse infill anchor: Connect a sparse infill line to an internal perimeter w... |
| Strength / Advanced | `monotonic_travel_into_wall` B2184 | Percent | B-only | Monotonic line travel extend: Enable this option to extend the travel distance between lines, i... |
| Strength / Advanced | `sub_top_surface_pattern` B2226 | Enum | B-only | Sub-top surface pattern: Line pattern of the solid layer that supports a visible top surface. |
| Strength / Advanced | `detect_floating_vertical_shell` B2128 | Bool | B-only | Detect floating vertical shells: Detect overhang paths in vertical shells and slow them by brid... |
| Speed / Other layers speed | `vertical_shell_speed` B2116 | FloatsOrPercents | B-only | Vertical shell speed: Speed for vertical shells with overhang regions. |
| Speed / Other layers speed | `overhang_totally_speed` B1678 | Floats | B-only | 100%: Speed of 100% overhang wall which has 0 overlap with the lower layer. |
| Speed / Other layers speed | `enable_height_slowdown` B1690 | Bools | B-only | Slow down by height: Enable this option to slow printing down by height |
| Speed / Other layers speed | `slowdown_start_height` B1698 | Floats | B-only | Starting height: The height starts to slow down |
| Speed / Other layers speed | `slowdown_start_speed` B1708 | Floats | B-only | Speed at starting height |
| Speed / Other layers speed | `slowdown_start_acc` B1717 | Floats | B-only | Acceleration at starting height |
| Speed / Other layers speed | `slowdown_end_height` B1726 | Floats | B-only | Ending height: The height finishes slowing down, Ending height should be larger than Starting h... |
| Speed / Other layers speed | `slowdown_end_speed` B1737 | Floats | B-only | Speed at ending height |
| Speed / Other layers speed | `slowdown_end_acc` B1746 | Floats | B-only | Acceleration at ending height |
| Speed / Acceleration | `travel_short_distance_acceleration` P1936 B1946 | Floats | P-O | Short travel: Acceleration used for short travel moves near external perimeters. |
| Speed / Jerk(XY) | `max_volumetric_extrusion_rate_slope_positive` P2422 B4561 | Float | P-O | Max volumetric slope positive: This experimental setting is used to limit the speed of change i... |
| Speed / Jerk(XY) | `max_volumetric_extrusion_rate_slope_negative` P2434 B4572 | Float | P-O | Max volumetric slope negative: This experimental setting is used to limit the speed of change i... |
| Support / Support ironing | `enable_support_ironing` B5802 | Bool | B-only | Enable ironing support interface: Ironing is using small flow to print on same height of surfac... |
| Support / Support ironing | `support_ironing_speed` B5854 | Float | B-only | Support ironing speed: Print speed of ironing lines |
| Support / Support ironing | `support_ironing_inset` B5844 | Float | B-only | Support ironing inset: The distance to keep the from the edges of ironing line. |
| Support / Support ironing | `support_ironing_direction` B5863 | Float | B-only | Support ironing direction: Angle for ironing, which controls the relative angle between the top... |
| Support / Advanced | `top_z_overrides_xy_distance` B5988 | Bool | B-only | Z overrides X/Y: When top z distance overrides support/object xy distance, give priority to ens... |
| Others / Prime tower | `prime_tower_max_speed` B6426 | Float | B-only | Max speed: The maximum printing speed on the prime tower excluding ramming. |
| Others / Prime tower | `prime_tower_rib_wall` B6479 | Bool | B-only | Rib wall: The wall of prime tower will add four ribs and make its cross-section as close to a s... |
| Others / Prime tower | `prime_tower_extra_rib_length` B6451 | Float | B-only | Extra rib length: Positive values can increase the size of the rib wall, while negative values ... |
| Others / Prime tower | `prime_tower_rib_width` B6460 | Float | B-only | Rib width: Rib width is always less than half the prime tower side length. |
| Others / Prime tower | `prime_tower_fillet_wall` B6486 | Bool | B-only | Fillet wall: The wall of prime tower will fillet |
| Others / Advanced | `enable_order_independent_overlap_carving` B3696 | Bool | B-only | Order-independent overlap carving: When enabled, overlapping model parts are carved by bounding... |
| Others / Advanced | `sparse_infill_filament` B4096 | Int | P~-O (infill_extruder) | Sparse infill filament: Filament to print internal sparse infill. |
| Others / Advanced | `solid_infill_filament` B5447 | Int | P~-O (solid_infill_extruder) | Solid infill: Filament to print solid infill |
| Others / Advanced | `wall_filament` B4727 | Int | P~-O (perimeter_extruder) | Walls: Filament to print walls |
| Others / G-code output | `reduce_infill_retraction_mode` B4672 | Enum | B-only | Reduce infill retraction: Controls whether retraction is skipped when traveling within the infi... |
| Others / Notes | `process_notes` B2428 | String | B-only | Process notes: You can put your notes regarding the process here. |

##### TabPrintPart

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| Others / Modifier cycle | `periodic_modifier` B4781 | Bool | B-only | Periodic modifier: Apply this modifier on a repeating layer cycle. |
| Others / Modifier cycle | `periodic_modifier_skip_layers` B4787 | Int | B-only | Skip for: Number of consecutive layers on which this modifier is not applied. |
| Others / Modifier cycle | `periodic_modifier_apply_layers` B4797 | Int | B-only | Apply for: Number of consecutive layers in each cycle on which this modifier is fully applied. |
| Others / Modifier cycle | `modifier_ignore_infill` B4807 | Bool | B-only | Ignore infill settings: Do not apply this modifier's infill settings (pattern, density, conform... |

##### TabFilament

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| Setting Overrides / Speed | `override_process_overhang_speed` B6724 | Bools | B-only | Override overhang speed: Override the overhang speed in process page |
| Filament / Basic information | `impact_strength_z` B6111 | Floats | B-only | Impact Strength Z |
| Filament / Basic information | `filament_metal_stickiness` B2798 | Enums | B-only | Metal stickiness: Indicates how strongly the filament tends to stick to the metal nozzle and le... |
| Filament / Basic information | `filament_velocity_adaptation_factor` B2782 | Floats | B-only | Velocity Adaptation Factor: This parameter reflects the speed at which a material transitions f... |
| Filament / Print temperature | `chamber_temperatures` B6068 | Ints | B-only | Chamber temperature: Higher chamber temperature can help suppress or reduce warping and potenti... |
| Filament / Filament scarf seam settings | `filament_scarf_seam_type` B2873 | Enums | B-only | Scarf seam type: Set scarf seam type for this filament. |
| Filament / Filament scarf seam settings | `filament_scarf_height` B2886 | FloatsOrPercents | B-only | Scarf start height: This amount can be specified in millimeters or as a percentage of the curre... |
| Filament / Filament scarf seam settings | `filament_scarf_gap` B2895 | FloatsOrPercents | B-only | Scarf slope gap: In order to reduce the visiblity of the seam in closed loop, the inner wall an... |
| Filament / Filament scarf seam settings | `filament_scarf_length` B2904 | Floats | B-only | Scarf length: Length of the scarf. |
| Cooling / Part cooling fan | `first_x_layer_part_fan_speed` B2031 | Ints | B-only | Fan speed: Part cooling fan speed for the first few layers. |
| Cooling / Part cooling fan | `no_slow_down_for_cooling_on_outwalls` B1888 | Bools | B-only | Don't slow down outer walls: If enabled, this setting will ensure external perimeters are not s... |
| Cooling / Part cooling fan | `cooling_slowdown_logic` P961 B1899 | Enums | P-O | Cooling slowdown logic: Determines how the printer slows down when minimum layer time isn't rea... |
| Cooling / Part cooling fan | `cooling_perimeter_transition_distance` P973 B1914 | Floats | P-O | Perimeter transition distance: Distance in millimeters before the end of slowed perimeters wher... |
| Cooling / Part cooling fan | `overhang_threshold_participating_cooling` B1513 | Enums | B-only | Overhang threshold for participating cooling: Decide which overhang part join the cooling funct... |
| Cooling / Part cooling fan | `pre_start_fan_time` B1480 | Floats | B-only | Pre start fan time: Force fan start early(0-5 second) when encountering overhangs. |

##### TabPrinter

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
| Basic information / Advanced | `thumbnail_size` B3717 | Points | B-only | Thumbnail size: Decides the size of thumbnail stored in gcode files |
| Basic information / Advanced | `print_in_clockwise` B3683 | Bool | B-only | Print loops in clockwise: Print in clockwise when enabled, or counterclockwise when not enabled... |
| Basic information / Advanced | `machine_switch_extruder_time` B2697 | Float | B-only | Extruder switch time: Time to switch extruder. |
| Basic information / Extruder Clearance | `extruder_clearance_max_radius` B2351 | Float | B-only | Max Radius: Max clearance radius around extruder. |
| (none) / (none) | `default_ams_type` B2687 | Int | B-only | Default AMS type: The default AMS type used to estimate filament load/unload time, stored as th... |

##### Not on a Tab page (printer)

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
|  | `ams_filament_load_time_ams` B2639 | Float | B-only | AMS filament load time: Filament load time when printing with an AMS. |
|  | `ams_filament_load_time_ams_lite` B2647 | Float | B-only | AMS Lite filament load time: Filament load time when printing with an AMS Lite. |
|  | `ams_filament_load_time_n3f_s` B2655 | Float | B-only | N3F/N3S filament load time: Filament load time when printing with an N3F or N3S. |
|  | `ams_filament_unload_time_ams` B2663 | Float | B-only | AMS filament unload time: Filament unload time when printing with an AMS. |
|  | `ams_filament_unload_time_ams_lite` B2671 | Float | B-only | AMS Lite filament unload time: Filament unload time when printing with an AMS Lite. |
|  | `ams_filament_unload_time_n3f_s` B2679 | Float | B-only | N3F/N3S filament unload time: Filament unload time when printing with an N3F or N3S. |
|  | `bed_heat_soak_area` B1086 | Points | B-only |  |
|  | `silent_mode` P2219 B4336 | Bool | P-O | Supports silent mode: Whether the machine supports silent mode in which machine use lower accel... |

##### Not on a Tab page (print)

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
|  | `apply_scarf_seam_on_circles` B6279 | Bool | B-only | Scarf Seam On Compensation Circles: Scarf seam will be applied on circles for better dimensiona... |
|  | `internal_bridge_support_thickness` B2134 | Float | B-only | Internal bridge support thickness: When sparse infill density is low, the internal solid infill... |
|  | `prime_tower_lift_height` B6437 | Float | B-only |  |
|  | `prime_tower_lift_speed` B6434 | Float | B-only |  |
|  | `skirt_per_object` B5387 | Bool | B-only | Skirt per object: Generate independent skirt around each object in sequential printing mode. |

##### Not on a Tab page (filament)

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
|  | `circle_compensation_speed` B6285 | Floats | B-only | Circle Compensation Speed: circle_compensation_speed |
|  | `counter_coef_1` B6292 | Floats | B-only | Counter Coef 1: counter_coef_1 |
|  | `counter_coef_2` B6297 | Floats | B-only | Contour Coef 2: counter_coef_2 |
|  | `counter_coef_3` B6302 | Floats | B-only | Contour Coef 3: counter_coef_3 |
|  | `counter_limit_max` B6330 | Floats | B-only | Contour limit max: counter_limit_max |
|  | `counter_limit_min` B6324 | Floats | B-only | Contour limit min: counter_limit_min |
|  | `diameter_limit` B6348 | Floats | B-only | Diameter limit: diameter_limit |
|  | `hole_coef_1` B6308 | Floats | B-only | Hole Coef 1: hole_coef_1 |
|  | `hole_coef_2` B6313 | Floats | B-only | Hole Coef 2: hole_coef_2 |
|  | `hole_coef_3` B6318 | Floats | B-only | Hole Coef 3: hole_coef_3 |
|  | `hole_limit_max` B6342 | Floats | B-only | Hole limit max: hole_limit_max |
|  | `hole_limit_min` B6336 | Floats | B-only | Hole limit min: hole_limit_min |

##### Not on a Tab page (internal/project)

| Page / group | Key | Type | Origin | Meaning |
|---|---|---|---|---|
|  | `extruder_nozzle_stats_new` B5100 | Strings | B-only |  |

#### OrcaSlicer keys not placed on a Tab page

Set from the plate/object/device UI, filament-sync, project state, or internal. Grouped by preset list membership (`Preset.cpp`).

- **print** (14): `belt_purge_tower_object` (Bool, O) Belt purge tower object; `calib_flowrate_topinfill_special_order` (Bool, O) ; `enforce_support_layers` (Int, P~ (support_material_enforce_layers)) Enforce support for the first: Generate support material for...; `imex_head_filament_map` (String, O) IDEX/IQEX head filament map: Per-plate override mapping phys...; `imex_parallel_mode` (String, O) IDEX/IQEX Print Mode: Name of the active IDEX/IQEX parallel ...; `inherits` (String, P) Inherits profile: Name of parent profile.; `ironing_expansion` (Float, O) Ironing expansion: Expand or contract the ironing area.; `plugins` (Strings, O) Plugins Used; `prime_tower_flat_ironing` (Bool, B) ; `print_extruder_id` (Ints, B) Print extruder id: Print extruder id.; `print_extruder_variant` (Strings, B) Print's extruder variant: Print's extruder variant.; `support_interface_loop_pattern` (Bool, P~ (support_material_interface_contact_loops)) Loop pattern interface: This covers the top contact layer of...; `travel_speed_z` (Floats, P) Z travel: Speed of vertical travel along z axis.; `wiping_volumes_extruders` (Floats, O(SS)) Purging volumes - load/unload volumes: This vector saves req...
- **filament** (30): `additional_fan_full_speed_layer` (Ints, B) Full fan speed at layer: Auxiliary fan speed will be ramped ...; `close_additional_fan_first_x_layers` (Ints, B) For the first: Set special auxiliary cooling fan for the fir...; `filament_change_length_nc` (Floats, B) Hotend change: When changing the hotend, it is recommended t...; `filament_cooling_before_tower` (Floats, B) Wipe tower cooling: Temperature drop before entering the wip...; `filament_dev_ams_drying_ams_limitations` (Strings, B) ; `filament_dev_ams_drying_heat_distortion_temperature` (Floats, B) ; `filament_dev_ams_drying_temperature` (Floats, B) ; `filament_dev_ams_drying_time` (Floats, B) ; `filament_dev_chamber_drying_bed_temperature` (Floats, B) ; `filament_dev_chamber_drying_time` (Floats, B) ; `filament_dev_drying_cooling_temperature` (Floats, B) ; `filament_dev_drying_softening_temperature` (Floats, B) ; `filament_extruder_compatibility` (Ints, B) Filament-extruder compatibility: A single 32-bit int encodin...; `filament_extruder_variant` (Strings, B) Filament's extruder variant: Filament's extruder variant.; `filament_flush_temp` (Ints, B) Flush temperature: Temperature when flushing filament.; `filament_flush_temp_fast` (Ints, B) Flush temperature: Flush temperature used in fast purge mode...; `filament_flush_volumetric_speed` (Floats, B) Flush volumetric speed: Volumetric speed when flushing filam...; `filament_pre_cooling_temperature` (Ints, B) Extruder change: To prevent oozing, the nozzle temperature w...; `filament_pre_cooling_temperature_nc` (Ints, B) Hotend change: To prevent oozing, the nozzle temperature wil...; `filament_preheat_temperature_delta` (Floats, B) Preheat temperature delta: Temperature delta applied during ...; `filament_prime_volume` (Floats, B) Filament change: The volume of material required to prime th...; `filament_prime_volume_nc` (Floats, B) Hotend change: The volume of material required to prime the ...; `filament_printable` (Ints, B) Filament printable: The filament is printable in extruder.; `filament_ramming_travel_time` (Floats, B) Extruder change: To prevent oozing, the nozzle will perform ...; `filament_ramming_travel_time_nc` (Floats, B) Hotend change: To prevent oozing, the nozzle will perform a ...; `filament_ramming_volumetric_speed` (Floats, B) Extruder change: The maximum volumetric speed for ramming be...; `filament_ramming_volumetric_speed_nc` (Floats, B) Hotend change: The maximum volumetric speed for ramming befo...; `filament_retract_length_nc` (Floats, B) length when change hotend: When this retraction value is mod...; `first_x_layer_fan_speed` (Floats, B) Fan speed: Special auxiliary cooling fan speed, effective on...; `volumetric_speed_coefficients` (Strings, B) Max volumetric speed multinomial coefficients
- **printer** (58): `bed_custom_model` (String, P) Bed custom model; `bed_custom_texture` (String, P) Bed custom texture; `default_bed_type` (String, O) Default bed type: Default bed type for the printer (supports...; `default_nozzle_volume_type` (Enums, B) Default Nozzle Volume Type.: Default Nozzle volume type for ...; `default_print_profile` (String, P) Default process profile: Default process profile when switch...; `deretract_speed_extruder_change` (Floats, O) Deretraction speed (extruder change): Speed for reloading fi...; `enable_pre_heating` (Bool, B) ; `extruder_max_nozzle_count` (Ints, B) ; `extruder_type` (Enums, B) Type: This setting is only used for initial value of manual ...; `extruder_variant_list` (Strings, B) Extruder variant list: Extruder variant list.; `farthest_point_timelapse` (Bool, B) Farthest point timelapse: When enabled, the timelapse snapsh...; `flashforge_serial_number` (String, O) Serial Number: Flashforge local API requires the printer ser...; `grab_length` (Floats, B) Grab length; `group_algo_with_time` (Bool, B) ; `head_wrap_detect_zone` (Points, B) Head wrap detect zone; `host_type` (Enum, P) Host Type: Orca Slicer can upload G-code files to a printer ...; `hotend_cooling_rate` (Floats, B) ; `hotend_heating_rate` (Floats, B) ; `machine_bed_mass_Y` (Float, B) Bed mass of the Y axis: The machine bed mass load of Y axis; `machine_hotend_change_time` (Float, B) Hotend change time: Time to change hotend.; `machine_max_acceleration_e` (Floats, P) Maximum acceleration %1%: Maximum acceleration of the %1% ax...; `machine_max_acceleration_x` (Floats, P) ; `machine_max_acceleration_y` (Floats, P) ; `machine_max_acceleration_z` (Floats, P) ; `machine_max_force_Y` (Float, B) Maximum force of the Y axis: The allowed maximum output forc...; `machine_max_jerk_e` (Floats, P) Maximum jerk %1%: Maximum jerk of the %1% axis; `machine_max_jerk_x` (Floats, P) ; `machine_max_jerk_y` (Floats, P) ; `machine_max_jerk_z` (Floats, P) ; `machine_max_printed_mass` (Float, B) The allowed max printed mass: The allowed max printed mass o...; `machine_min_extruding_rate` (Floats, P) Minimum speed for extruding: Minimum speed for extruding (M2...; `machine_min_travel_rate` (Floats, P) Minimum travel speed: Minimum travel speed (M205 T); `machine_prepare_compensation_time` (Float, B) ; `master_extruder_id` (Int, B) Master extruder id: Default extruder id to place filament.; `nozzle_flush_dataset` (Ints, B) ; `nozzle_height` (Float, B) Nozzle height: The height of nozzle tip.; `parallel_printheads_bed_exclude_areas` (Strings, O) Parallel printheads bed exclude areas: Ordered list of bed e...; `physical_extruder_map` (Ints, B) Map the logical extruder to physical extruder: Map the logic...; `print_host` (String, P) Hostname, IP or URL: Orca Slicer can upload G-code files to ...; `print_host_webui` (String, B) Device UI: Specify the URL of your device user interface if ...; `printer_extruder_id` (Ints, B) Printer extruder id: Printer extruder id.; `printer_model` (String, P) Printer type: Type of the printer.; `printer_technology` (Enum, P) Printer technology: Printer technology.; `printer_variant` (String, P) Printer variant: Name of the printer variant.; `printhost_apikey` (String, P) API Key / Password: Orca Slicer can upload G-code files to a...; `printhost_authorization_type` (Enum, P) Authorization Type; `printhost_cafile` (String, P) HTTPS CA File: Custom CA certificate file can be specified f...; `printhost_password` (String, P) Password; `printhost_port` (String, P) Printer: Name of the printer.; `printhost_ssl_ignore_revoke` (Bool, P) Ignore HTTPS certificate revocation checks: Ignore HTTPS cer...; `printhost_user` (String, P) User; `support_cooling_filter` (Bool, B) ; `support_fast_purge_mode` (Bool, B) Support fast purge mode: Whether this printer supports fast ...; `support_object_skip_flush` (Bool, B) ; `support_parallel_printheads` (Bool, O) Support parallel printheads: Enable printer settings for mac...; `upward_compatible_machine` (Strings, B) upward compatible machine; `wrapping_detection_layers` (Int, B) Clumping detection layers: Clumping detection layers.; `wrapping_exclude_area` (Points, B) Probing exclude area of clumping: Probing exclude area of cl...
- **not in any preset list (project/internal)** (55): `adaptive_layer_height` (Bool, B) Adaptive layer height: Enabling this option means the height...; `bbl_calib_mark_logo` (Bool, O) Show auto-calibration marks; `brim_ears` (Bool, O(SS)) Brim ears: Only draw brim over the sharp edges of the model.; `compatible_machine_expression_group` (Strings, B) ; `compatible_process_expression_group` (Strings, B) ; `default_filament_profile` (Strings, P) Default filament profile: Default filament profile when swit...; `different_settings_to_system` (Strings, B) ; `enable_filament_dynamic_map` (Bool, B) Enable filament dynamic map: Enable dynamic filament mapping...; `extruder` (Int, P) Extruder: The extruder to use (unless more specific extruder...; `extruder_ams_count` (Strings, B) Extruder AMS count: AMS counts per extruder.; `extruder_colour` (Strings, P) Extruder Color: Only used as a visual help on UI.; `extruder_nozzle_count` (Ints, B) extruder nozzle count; `extruder_nozzle_stats` (Strings, B) Extruder nozzle stats: Physical nozzle counts per extruder, ...; `extruder_nozzle_volume_type` (Enums, B) Extruder nozzle volume type: Nozzle volume type per physical...; `filament_colour` (Strings, P) Color: Only used as a visual help on UI.; `filament_colour_type` (Strings, B) ; `filament_extruder_id` (Ints, B) Filament extruder id: Filament extruder id.; `filament_ids` (Strings, B) ; `filament_is_mixed` (Bools, B) Is mixed filament: Whether this filament slot is a mixed fil...; `filament_map` (Ints, B) Filament map to extruder: Filament map to extruder.; `filament_map_2` (Ints, B) Filament map plus for multi nozzle: Filament map to the inde...; `filament_map_mode` (Enum, B) filament mapping mode: Filament mapping mode used as plate p...; `filament_max_temperature_drop_when_ec` (Floats, O) ; `filament_mixed_components` (Strings, B) Mixed filament components: Comma-separated 1-based indices o...; `filament_mixed_gradient` (Bools, B) Mixed filament gradient: Enable Z-direction gradient mode fo...; `filament_mixed_gradient_curve` (Strings, B) Mixed filament gradient curve: Optional Photoshop-style cust...; `filament_mixed_gradient_per_part` (Bools, B) Mixed filament per-part gradient: When gradient mode is enab...; `filament_mixed_gradient_range` (Strings, B) Mixed filament gradient range: Start and end ratios for the ...; `filament_mixed_sublayer_ratios` (Strings, B) Mixed filament sublayer ratios: Comma-separated ratio values...; `filament_multi_colour` (Strings, B) ; `filament_nozzle_map` (Ints, B) ; `filament_self_index` (Ints, B) Filament self index: Filament self index.; `filament_settings_id` (Strings, P) ; `filament_volume_map` (Ints, B) ; `flush_multiplier` (Floats, B) Flush multiplier: The actual flushing volumes is equal to th...; `flush_multiplier_fast` (Floats, B) Flush multiplier (Fast mode): The flush multiplier used in f...; `flush_volumes_matrix` (Floats, P~ (wiping_volumes_matrix)) Purging volumes: This matrix describes volumes (in cubic mil...; `flush_volumes_vector` (Floats, B) Purging volumes - load/unload volumes: This vector saves req...; `handle_hotend_as_extruder` (Bool, O) ; `has_filament_switcher` (Bool, B) Has filament switcher: Printer has a filament switcher hardw...; `has_scarf_joint_seam` (Bool, B) ; `inherits_group` (Strings, B) ; `nozzle_volume_type` (Enums, B) Nozzle Volume Type: Nozzle volume type for extruders.; `other_layers_print_sequence_nums` (Int, B) The number of other layers print sequence; `preset_name` (String, P) Capabilities: Configuration for the plugin capabilities this...; `preset_names` (Strings, P) Printer preset names: Names of presets related to the physic...; `prime_volume_mode` (Enum, B) Prime volume mode: Selects how the wipe-tower prime and flus...; `print_compatible_printers` (Strings, B) ; `print_settings_id` (String, P) ; `printer_settings_id` (String, P) ; `spaghetti_detector` (Bool, B) Enable spaghetti detector: Enable the camera on printer to c...; `start_end_points` (Points, B) Start end points: The start and end points which are from th...; `tree_support_with_infill` (Bool, O) Tree support with infill: This setting specifies whether to ...; `wipe_tower_x` (Floats, B) Position X: X coordinate of the left front corner of a wipe ...; `wipe_tower_y` (Floats, B) Position Y: Y coordinate of the left front corner of a wipe ...

#### PrusaSlicer keys absent from both forks under that name

- **No fork equivalent** (69): `autoemit_temperature_commands`, `automatic_extrusion_widths`, `automatic_infill_combination`, `automatic_infill_combination_max_layer_height`, `avoid_crossing_curled_overhangs`, `bed_temperature_extruder`, `between_objects_gcode`, `binary_gcode`, `brim_separation`, `color_change_gcode`, `colorprint_heights`, `compatible_printers_condition_cummulative`, `compatible_prints_condition_cummulative`, `custom_parameters_filament`, `custom_parameters_print`, `custom_parameters_printer`, `duplicate_distance`, `enable_dynamic_fan_speeds`, `enable_pressure_advance_during_ramming`, `extrusion_axis`, `fan_always_on`, `filament_abrasive`, `filament_change_time`, `filament_flush_speed`, `filament_flush_volume`, `filament_infill_max_crossing_speed`, `filament_infill_max_speed`, `filament_purge_multiplier`, `filament_ramming_initial_delay`, `filament_ramming_temperature_delta`, `filament_spool_weight`, `first_layer_acceleration_over_raft`, `first_layer_solid_infill_speed`, `first_layer_speed_over_raft`, `gcode_substitutions`, `infill_only_where_needed`, `inherits_cummulative`, `max_print_speed`, `multimaterial_purging`, `nozzle_high_flow`, `over_bridge_speed`, `overhang_fan_speed_0`, `overhang_fan_speed_1`, `overhang_fan_speed_2`, `overhang_fan_speed_3`, `physical_printer_settings_id`, `prefer_clockwise_movements`, `printer_vendor`, `profile_vendor`, `profile_version`, `remaining_times`, `scarf_seam_max_segment_length`, `scarf_seam_only_on_smooth`, `seam_preferred_direction`, `seam_preferred_direction_jitter`, `solid_infill_every_layers`, `solid_layers`, `solid_min_thickness`, `stuck_filament_detection`, `support_material_closing_radius`, `support_material_synchronize_layers`, `support_material_with_sheath`, `support_tree_branch_diameter_double_wall`, `travel_lift_before_obstacle`, `travel_max_lift`, `use_volumetric_e`, `variable_layer_height`, `wipe_tower_acceleration`, `wiping_volumes_use_custom_matrix`
- **Renamed in the forks** (149): see the Origin column `P~ (prusa_key)` above.
- **SLA** (101 keys across the three; Bambu/Orca keep the inherited SLA definitions but expose no SLA tab in practice): `absolute_correction`, `area_fill`, `bottle_cost`, `bottle_volume`, `bottle_weight`, `default_sla_material_profile`, `default_sla_print_profile`, `delay_after_exposure`, `delay_before_exposure`, `display_height`, `display_mirror_x`, `display_mirror_y`, `display_orientation`, `display_pixels_x`, `display_pixels_y`, `display_width`, `elefant_foot_min_width`, `exposure_time`, `faded_layers`, `fast_tilt_time`, `gamma_correction`, `high_viscosity_tilt_time`, `hollowing_closing_distance`, `hollowing_enable`, `hollowing_min_thickness`, `hollowing_quality`, `initial_exposure_time`, `initial_layer_height`, `material_colour`, `material_correction`, `material_correction_x`, `material_correction_y`, `material_correction_z`, `material_density`, `material_notes`, `material_print_speed`, `material_type`, `material_vendor`, `max_exposure_time`, `max_initial_exposure_time`, `min_exposure_time`, `min_initial_exposure_time`, `pad_around_object`, `pad_around_object_everywhere`, `pad_brim_size`, `pad_edge_radius`, `pad_enable`, `pad_max_merge_distance`, `pad_object_connector_penetration`, `pad_object_connector_stride`, `pad_object_connector_width`, `pad_object_gap`, `pad_wall_height`, `pad_wall_slope`, `pad_wall_thickness`, `relative_correction`, `relative_correction_x`, `relative_correction_y`, `relative_correction_z`, `sla_archive_format`, `sla_material_settings_id`, `sla_output_precision`, `sla_print_settings_id`, `slow_tilt_time`, `support_base_diameter`, `support_base_height`, `support_base_safety_distance`, `support_buildplate_only`, `support_critical_angle`, `support_enforcers_only`, `support_head_front_diameter`, `support_head_penetration`, `support_head_width`, `support_max_bridge_length`, `support_max_bridges_on_pillar`, `support_max_pillar_link_distance`, `support_object_elevation`, `support_pillar_connection_mode`, `support_pillar_diameter`, `support_pillar_widening_factor`, `support_points_density_relative`, `support_points_minimal_distance`, `support_small_pillar_diameter_percent`, `support_tree_type`, `supports_enable`, `tilt_down_cycles`, `tilt_down_delay`, `tilt_down_finish_speed`, `tilt_down_initial_speed`, `tilt_down_offset_delay`, `tilt_down_offset_steps`, `tilt_up_cycles`, `tilt_up_delay`, `tilt_up_finish_speed`, `tilt_up_initial_speed`, `tilt_up_offset_delay`, `tilt_up_offset_steps`, `tower_hop_height`, `tower_speed`, `use_tilt`, `zcorrection_layers`

Not captured by the extractor: the three `print_`/`printer_`/`filament_plugin_config_overrides` keys, which are added in a loop over a variable (OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:1305), and Prusa's prefixed SLA support keys (`init_sla_support_params(prefix)`).

### 2. Multi-plate model (Bambu-originated; Orca inherits)

- **Plate object.** `PartPlate` (OrcaSlicer@09aa0114:src/slic3r/GUI/PartPlate.hpp:107) holds its own `DynamicPrintConfig m_config` (:211), a name, a lock flag, origin and size, and its own `Print*` and `GCodeProcessorResult*`. `PartPlateList` (:768) keeps `std::map<int, PrintBase*> m_print_list` (:775), one Print per plate, so every plate keeps its own slicing result. Limit: `MAX_PLATE_COUNT 36` (:59; BambuStudio@79df7ae:src/slic3r/GUI/PartPlate.hpp:36).
- **Plate operations.** `create_plate`, `duplicate_plate`, `delete_plate`, `select_plate`, `lock_plate`, `reload_all_objects(except_locked)` and `set_shapes` (OrcaSlicer@09aa0114:src/slic3r/GUI/PartPlate.cpp:6560, 6647, 6718, 6933, 7135, 7460, 8038). Plates own object instances through `add_instance`/`remove_instance`, and `check_outside`/`intersect_instance` test placement (PartPlate.hpp:525-574). Arrange and auto-orient work per plate; locked plates are skipped.
- **Plate settings.** `TabPrintPlate::build` exposes `curr_bed_type`, `skirt_start_angle`, `print_sequence`, `spiral_mode`, `first_layer_sequence_choice` and `other_layers_sequence_choice` (OrcaSlicer@09aa0114:src/slic3r/GUI/Tab.cpp:4065-4094). `PlateSettingsDialog` adds plate name, bed type, print sequence, first-layer filament order, per-layer-range filament order and spiral mode (OrcaSlicer@09aa0114:src/slic3r/GUI/PlateSettingsDialog.hpp:135-187). Per-plate state also covers the filament-to-extruder map and map mode for dual-nozzle printers (PartPlate.hpp:353-369).
- **Per-plate slicing.** `PartPlate::update_slice_context` binds the plate's Print into the single `BackgroundSlicingProcess` (PartPlate.cpp:5441). `BackgroundSlicingProcess::apply` then merges `*m_current_plate->config()` over the global config before `Print::apply` (OrcaSlicer@09aa0114:src/slic3r/GUI/BackgroundSlicingProcess.cpp:745; BambuStudio@79df7ae:src/slic3r/GUI/BackgroundSlicingProcess.cpp:735). So plate settings are a config layer above process/filament/printer and below object/part modifiers. The UI offers "Slice plate" and "Slice all" (OrcaSlicer@09aa0114:src/slic3r/GUI/MainFrame.cpp:2406-2423). The print dropdown offers Print all, Print plate, Export plate sliced file, Export all sliced file, Export G-code file, Send, Send all and Send to Multi-device (MainFrame.cpp:2153-2168).
- **Plate-level G-code.** `Model::plates_custom_gcodes` is a `map<plate_index, CustomGCode::Info>` (OrcaSlicer@09aa0114:src/libslic3r/Model.hpp:1743; BambuStudio@79df7ae:src/libslic3r/Model.hpp:1756). Layer-slider colour changes, pauses and custom G-code are therefore stored per plate, in `Metadata/custom_gcode_per_layer.xml` keyed by plate id (OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:244, 3437-3465). Each plate produces its own G-code file, `Metadata/plate_N.gcode` plus `.md5` (bbs_3mf.cpp:6811-6822). `plate_name` and `plate_number` are placeholders (OrcaSlicer@09aa0114:src/libslic3r/GCode.cpp:4017-4018).
- **3MF persistence.** `PlateData` (OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.hpp:77-125) stores objects and instances, G-code file and MD5, statistics, thumbnails (`plate_N.png`, `plate_no_light_N.png`, top and pick images), predicted time and weight, plate name, per-filament usage, skipped objects and the plate config.

### 3. Model-prep tools

| Tool | Prusa @30ef591 | Bambu @79df7ae | Orca @09aa0114 | Notes |
|---|---|---|---|---|
| Move / rotate / scale / flatten (lay on face) | yes | yes + `GizmoObjectManipulation` | yes | gizmo enums: PrusaSlicer@30ef591:src/slic3r/GUI/Gizmos/GLGizmosManager.hpp:71; BambuStudio@79df7ae:src/slic3r/GUI/Gizmos/GLGizmosManager.hpp:69; OrcaSlicer@09aa0114:src/slic3r/GUI/Gizmos/GLGizmosManager.hpp:85 |
| Cut | planar + connectors (2.6) | `GLGizmoAdvancedCut`: planar and dovetail modes (`CutMode`, BambuStudio@79df7ae:src/libslic3r/Model.hpp:244) | Prusa-style `GLGizmoCut` with Plug/Dowel/Snap connectors (OrcaSlicer@09aa0114:src/libslic3r/Model.hpp:262) and multiple dovetail cuts (GLGizmoCut.hpp:139) | cut state saved in `Metadata/cut_information.xml` (bbs_3mf.cpp:250) |
| Boolean | no | `GLGizmoMeshBoolean` | union / difference / intersection via mcut (OrcaSlicer@09aa0114:src/slic3r/GUI/Gizmos/GLGizmoMeshBoolean.cpp:309-317, 388) | Bambu-originated; `libslic3r/MeshBoolean.cpp` (CGAL + mcut) |
| Mesh repair | admesh on load | Windows-only repair via the Windows 10 SDK (`fix_through_netfabb` calls `fix_model_by_win10_sdk_gui`, BambuStudio@79df7ae:src/slic3r/GUI/GUI_ObjectList.cpp:6499, 6593) | cross-platform CGAL repair (`fix_through_cgal`, OrcaSlicer@09aa0114:src/slic3r/GUI/GUI_ObjectList.cpp:6301-6378; `libslic3r/MeshRepair.hpp:25` `repair_mesh`) | Orca replaced the Windows-only path |
| Support / seam / fuzzy-skin painting | yes | yes | yes | Prusa-originated (`FdmSupports`, `Seam`, `FuzzySkin`) |
| Colour / multimaterial painting | `MmSegmentation` | `MmuSegmentation` | `MmSegmentation` | Prusa-originated. Painter tools: Prusa BRUSH/BUCKET_FILL/SMART_FILL/HEIGHT_RANGE (PrusaSlicer@30ef591:src/slic3r/GUI/Gizmos/GLGizmoPainterBase.hpp:140); forks BRUSH/BUCKET_FILL/SMART_FILL/GAP_FILL (BambuStudio@79df7ae:src/slic3r/GUI/Gizmos/GLGizmoPainterBase.hpp:281; OrcaSlicer@09aa0114:src/slic3r/GUI/Gizmos/GLGizmoPainterBase.hpp:274). Both forks also have texture-to-colour (`libslic3r/TexturePainting.cpp`, `TextureToColor/`) |
| Texture displacement | no | no | `GLGizmoTextureDisplacement`: up to N displacement layers per volume, each with its own paint mask (OrcaSlicer@09aa0114:src/libslic3r/TextureDisplacement.hpp:41-54) | Orca-only |
| Modifiers | modifier / negative volume / support enforcer and blocker; layer-range modifiers | same, plus per-plate settings | same | Prusa-originated object list; layer ranges saved in `Metadata/layer_config_ranges.xml` (bbs_3mf.cpp:240) |
| Variable layer height | yes (`LayersEditing`) | yes | yes: adaptive and smooth (OrcaSlicer@09aa0114:src/slic3r/GUI/GLCanvas3D.hpp:247, 338-339; `libslic3r/Slicing.hpp:166,179`) | Prusa-originated; profile saved in `Metadata/layer_heights_profile.txt` |
| Text | `GLGizmoEmboss` | own `GLGizmoText` | Prusa `GLGizmoEmboss` | |
| SVG | `GLGizmoSVG` | yes | yes | Prusa 2.7-originated |
| Measure | yes (2.6) | yes, extended (assembly measuring) | yes | |
| Assembly view / alignment | no | `GLGizmoAssembly`, `GLGizmoAlignment`, `CanvasAssembleView` | yes (OrcaSlicer@09aa0114:src/slic3r/GUI/GLCanvas3D.hpp:628) | Bambu-originated |
| Simplify | yes | yes | yes | Prusa 2.4-originated |
| Brim ears | no | yes | yes, plus `brim_ears_*` keys shared with SuperSlicer | Orca/SuperSlicer-originated (direction unverified) |
| Auto-orientation | SLA only (unverified for 3.0) | `libslic3r/Orient.cpp` | same (OrcaSlicer@09aa0114:src/libslic3r/Orient.hpp:34, 60 overhang/bottom-area weights) | Bambu-originated |
| Arrange | libnest2d | extended `ArrangeSettings`: distance, rotation, multi-material plates, avoid calibration area, sequential, align to Y (OrcaSlicer@09aa0114:src/slic3r/GUI/GLCanvas3D.hpp:603-613); arranges across plates | same + `IMEXArrange.cpp` (IDEX/multi-gantry), `BeltBrim.cpp` | |

### 4. Calibration tools and how results reach profiles

The calibration framework originated in Orca and was later merged into Bambu. Orca's README credits Orca with "introducing advanced calibration tools" (OrcaSlicer@09aa0114:README.md:244). Bambu's `CalibMode` (BambuStudio@79df7ae:src/libslic3r/Calib.hpp:14-25) is the first ten entries of Orca's (OrcaSlicer@09aa0114:src/libslic3r/calib.hpp:23-37). PrusaSlicer 2.x shipped only static calibration models. PrusaSlicer 3.0 (alpha at 30ef591) adds built-in calibration as a Lua plugin, `resources/lua/com.prusa3d.slicer.calibration/`: a Flow Tower (menu "Calibration/Flow Tower", volumetric flow sweep, min/max flow rate and steps; PrusaSlicer@30ef591:resources/lua/com.prusa3d.slicer.calibration/flow_tower.lua:1-15) and a Temperature Tower ("Calibration/Temperature Tower", min/max temperature and steps; temp_tower.lua:1-12). The welcome text calls these "built-in calibration prints" (PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/App/WelcomeDialog.cpp:299-303). Prusa has no pressure-advance, flow-ratio, retraction, VFA or input-shaping generators.

| Test | Orca entry point (Plater.cpp @09aa0114) | What varies, and how (GCode.cpp @09aa0114) | Bambu | Result goes to |
|---|---|---|---|---|
| Temperature tower | `calib_temp` :17384 | `set_temperature` stepped 5 C per block (:6753-6766) | yes (menu "Temperature", BambuStudio@79df7ae:src/slic3r/GUI/MainFrame.cpp:3666) | `nozzle_temperature` in the filament profile, entered by hand ([wiki temp_calib](https://github.com/SoftFever/OrcaSlicer/wiki/temp_calib)) |
| Max volumetric speed | `calib_max_vol_speed` :17677 | `outer_wall_speed = start + z*step` (:6778-6781) | yes ("More... / Max flowrate") | `filament_max_volumetric_speed`; on Bambu printers the wizard writes it to a preset (OrcaSlicer@09aa0114:src/slic3r/GUI/CalibrationWizard.cpp:1785) |
| Pressure advance: line, pattern, tower, auto line | `calib_pa` :16840 | tower: `set_pressure_advance(interpolated)` (:6747-6751); line and pattern are generated paths (`CalibPressureAdvanceLine/Pattern`, calib.hpp:257, 309; GCode.cpp:3867-3878) | yes | filament `pressure_advance`, entered by hand ("update your Pressure Advance value in the filament settings", [wiki](https://github.com/SoftFever/OrcaSlicer/wiki/pressure_advance_calib)). On Bambu printers, K/N values are stored on the printer through `extrusion_cali_set`/`_sel`/`_get` (OrcaSlicer@09aa0114:src/slic3r/Utils/CalibUtils.cpp:640-644; src/slic3r/GUI/DeviceManager.cpp:1888, 1917; src/slic3r/GUI/DeviceCore/DevCalib.cpp:328-343) and chosen per AMS slot at print time. Orca also has `adaptive_pressure_advance_model` (PA as a function of flow and acceleration) |
| Flow ratio: YOLO linear and classic two-pass | `calib_flowrate` :17330, models `Orca-LinearFlow(_fine).3mf`, `flowrate-test-pass1/2.3mf` | per-object `print_flow_ratio` modifiers (Plater.cpp:17207, 17309-17311) | yes (Coarse/Fine) | `filament_flow_ratio`: `OldFlowRatio ± modifier` (YOLO) or `OldFlowRatio * (100 + modifier) / 100` (two-pass) ([wiki](https://github.com/SoftFever/OrcaSlicer/wiki/flow_ratio_calib)). The Bambu wizard writes it to a new filament preset (OrcaSlicer@09aa0114:src/slic3r/GUI/CalibrationWizard.cpp:1340-1346, 1428-1470) |
| Retraction tower | `calib_retraction` :17758 | `retraction_length = start + floor(z-0.4)*step`, with a comment per layer (:6783-6790) | yes | `retraction_length` (printer extruder, or `filament_retraction_length` override), by hand |
| VFA (vertical fine artifacts) | `calib_VFA` :17821 | `outer_wall_speed` per block (:6768-6776) | yes | user picks a speed band to avoid; Orca can enforce it with `resonance_avoidance`/`min_`/`max_resonance_avoidance_speed` |
| Input shaping: frequency, damping | `calib_input_shaping_freq` :17905, `_damp` :17973 | `set_input_shaping` per layer (:6792-6812) | no | printer firmware or Orca `input_shaping_*` printer keys (emitted when `input_shaping_emit` is on) |
| Cornering: jerk / junction deviation | menu (MainFrame.cpp:3659) | `set_junction_deviation` (Marlin with JD) or `set_jerk_xy` (:6814-6822) | no | `machine_max_junction_deviation` / jerk limits |
| Tolerance | handy model "Orca Tolerance Test" (OrcaSlicer@09aa0114:src/slic3r/GUI/GUI_Factories.cpp:640) | none; a static test model | no | user judgement only ([wiki Calibration](https://github.com/SoftFever/OrcaSlicer/wiki/Calibration) lists `tolerance_calib`) |

Bambu-printer wizards (`PressureAdvanceWizard`, `FlowRateWizard`, `MaxVolumetricSpeedWizard`, BambuStudio@79df7ae:src/slic3r/GUI/CalibrationWizard.hpp:39-165) run either automatically (on the printer) or manually. On save, they write to the printer's calibration table or to a user filament preset. For every other printer, results are always typed into the filament or printer profile by the user.

### 5. Multimaterial and the device panel

**Prime / wipe tower.** Bambu rewrote Prusa's tower as the "prime tower" (BambuStudio@79df7ae:src/libslic3r/GCode/WipeTower.cpp, rib and fillet walls, designed for printers with a filament cutter). Orca ships both: Bambu's as "Type 1" and Prusa's, re-imported as `WipeTower2.cpp`, as "Type 2". The choice is `wipe_tower_type`, default Type 2; its tooltip recommends Type 1 for Bambu and Qidi printers with a cutter and Type 2 for multi-tool and MMU printers (OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:7148-7157; Print.cpp:1524, 4480, 5241). The Prusa ramming dialog survives (OrcaSlicer@09aa0114:src/slic3r/GUI/WipeTowerDialog.cpp:137-187).

**Flush volumes.** Volumes come from a per-pair matrix (`flush_volumes_matrix`) times `flush_multiplier`. The matrix is auto-computed from filament colours by luminance (`FlushVolCalculator::calc_flush_vol_rgb`, OrcaSlicer@09aa0114:src/libslic3r/FlushVolCalc.cpp:24, 60) and a per-nozzle dataset (`nozzle_flush_dataset`). Orca raised the upper limit to 20000 mm³ from Bambu's 900 (FlushVolCalc.cpp:15). The dialog recalculates the matrix whenever filaments or colours change, suggests a range of [0, 700] and a multiplier in [0, 3] (WipeTowerDialog.cpp:421-430). Purge can go into infill, objects or support (`flush_into_infill`, `flush_into_objects`, `flush_into_support`) instead of the tower. On dual-nozzle printers, filaments are first grouped to extruders (`libslic3r/FilamentGroup.cpp`, `filament_map`, `filament_map_mode`).

**Filament change G-code.** The template is `change_filament_gcode`, Bambu's rename of Prusa's `toolchange_gcode` (BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:7449 handle_legacy maps `tool_change_gcode`). An empty template emits a plain `Tn`. Orca fills these placeholders: `previous_extruder`, `next_extruder`, `current/next_filament_id`, `current/next_hotend`, `current/next_nozzle_id`, `layer_num`, `layer_z`, `max_layer_z`, `toolchange_z`, `toolchange_count`, `old/new_filament_temp`, `old/new_retract_length(_toolchange)`, `old/new_filament_e_feedrate`, `first_flush_volume`, `second_flush_volume`, `flush_length_1..4`, `fan_speed`, `relative_e_axis`, `travel_point_1..3_x/y`, `x/y/z_after_toolchange`, `wipe_tower_center_pos_*`, `wipe_tower_wait_pos_*`, `old/new_extruder_variant`, `nozzle_volume_types`, `outer_wall_volumetric_speed` (OrcaSlicer@09aa0114:src/libslic3r/GCode.cpp:1222-1420; catalogue in PrintConfig.cpp:13661).

**AMS / filament mapping.**
- Send-time mapping: when sending, the user maps each project filament to an AMS slot, with left and right grids for dual nozzles (OrcaSlicer@09aa0114:src/slic3r/GUI/SelectMachine.cpp:506-547; `AmsMappingPopup.hpp:99-235`). The mapping goes in the print command as `ams_mapping` (src/slic3r/GUI/DeviceCore/DevMappingNozzle.cpp:118). Each entry is a `FilamentInfo` (type, colour, filament_id, ams_id, slot_id, mapping_result, nozzle volume type; src/libslic3r/ProjectTask.hpp:37).
- Reverse sync: "Sync AMS" copies the printer's loaded filaments into the project (`Sidebar::sync_ams_list`, Plater.cpp:6304, 6396; `SyncAmsInfoDialog`).
- Send options: timelapse, bed levelling, flow calibration, PA value, nozzle-offset calibration, use AMS (`m_checkbox_list` in SelectMachine.cpp).

**Device panel (Bambu printers, both forks).**
- Monitor tabs: Status, Storage, Firmware, Assistant (HMS) (OrcaSlicer@09aa0114:src/slic3r/GUI/Monitor.cpp:218-229). The footer shows the network plug-in version (:233).
- Status controls: pause, resume and abort; skip objects (`PartSkipDialog`); lamp; bed, nozzle and chamber temperatures; fans; XY/Z/E jog; nozzle select; AMS load, unload, switch, backup, settings and RFID refresh; humidity; filament edit; extrusion calibration (StatusPanel.hpp:592-768).
- Device model: `MachineObject` in DeviceManager.cpp plus `DeviceCore/Dev*` modules (fan, lamp, filament system, nozzle system, calibration, HMS, upgrade, storage, print options).

**Camera (code as of 2026-10).** For LAN, Bambu printers stream through Bambu's proprietary `BambuSource` plug-in. Two URL forms are used: `bambu:///local/<ip>.?port=6000&user=...&passwd=...` (JPEG over TCP 6000, P1/A1 class) and `bambu:///rtsps___user:pass@ip/streaming/live/1?proto=rtsps` (X1/H2 class) (OrcaSlicer@09aa0114:src/slic3r/GUI/MediaPlayCtrl.cpp:484-486). Remote viewing goes over TUTK P2P (:288). Orca adds generic HTTP, HTTPS, MJPEG-snapshot and RTSP camera URLs (:256-264), plus `WebRtcMediaController` and `WebMediaController` players.

**Print queue / multi-device.** The "Multi-device" tab (Bambu-originated; OrcaSlicer@09aa0114:src/slic3r/GUI/MainFrame.cpp:1575-1577) has sub-tabs Device, Task Sending and Task Sent (MultiMachinePage.cpp:114-116). It sends one plate to N printers (`SendMultiMachinePage`) and lists local and cloud tasks (`MultiTaskManagerPage`, `TaskManager`). For network print hosts, the queue is Prusa's upload queue (`PrintHostQueueDialog`, PrintHostDialogs.hpp:69).

**Non-Bambu printers (Orca).**
- Print hosts: Orca's `host_type` (OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:5746) lists prusalink, prusaconnect, octoprint, duet, ultimaker, flashair, astrobox, repetier, mks, esp3d, crealityprint, obico, flashforge, simplyprint, elegoolink, 3dprinteros and moonraker. Bambu keeps only Prusa's seven.
- Device tab: an embedded web UI (`PrinterWebView`, MainFrame.cpp:1558; `print_host_webui`).
- Native status agents: `IPrinterAgent` implementations (Moonraker, Creality, Qidi, Snapmaker, BBL) in `src/slic3r/Utils/`.

### 6. G-code post-processing, placeholders, export formats

**Post-processing.** `post_process` (Prusa key) runs each script on the finished G-code (OrcaSlicer@09aa0114:src/slic3r/GUI/PostProcessor.cpp:348). Scripts get `SLIC3R_PP_HOST` and `SLIC3R_PP_OUTPUT_NAME` (:283, 404, 407), plus every config key as a `SLIC3R_<KEY>` environment variable (`config.setenv_()`, :401). It is invoked from BackgroundSlicingProcess.cpp:292, 857; Bambu has the same in `libslic3r/GCode/PostProcessor.cpp:285-288`. Prusa's regex `gcode_substitutions` is in neither fork. Orca adds a slicing-pipeline plugin host (`plugins`, `slicing_pipeline_plugin`; `src/slic3r/plugin/host`) as a further extension point.

**Custom G-code templates.**
- Prusa keys, renamed: `machine_start_gcode`, `machine_end_gcode`, `before_layer_change_gcode`, `layer_change_gcode`, `change_filament_gcode`, `machine_pause_gcode`, `filament_start_gcode`, `filament_end_gcode`. Prusa key kept as is: `template_custom_gcode`.
- Bambu additions: `time_lapse_gcode`, `printing_by_object_gcode`, `wrapping_detection_gcode`.
- Orca additions: `file_start_gcode`, plus `change_extrusion_role_gcode` with process and filament variants.
- Origins and lines for all of these are in the settings tables. The macro language is Prusa's PlaceholderParser (conditionals, expressions, indexed vectors), and every config option is also a variable.

**Placeholder catalogue (Orca).** Orca carries Prusa's typed placeholder definitions, which back the "Edit custom G-code" dialog (`EditGCodeDialog.cpp`, Orca only; Bambu @79df7ae has neither the dialog nor these ConfigDefs). All are in OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:

| Group (line) | Placeholders |
|---|---|
| Read-only slicing state (:13296) | `zhop` |
| Read-write slicing state (:13305) | `position`, `e_retracted`, `e_restart_extra`, `e_position` |
| Other slicing state (:13328) | `current_extruder`, `current_object_idx`, `has_wipe_tower`, `initial_extruder`, `initial_tool`, `is_extruder_used`, `num_extruders`, `initial_filament_type`, `curr_bed_type`, `imex_mode*`, and more |
| Print statistics (:13377) | `extruded_volume`, `extruded_weight(_total)`, `total_toolchanges`, `total_layer_count`, `print_time`, `normal_print_time`, `silent_print_time`, `total_cost`, `total_weight`, `total_wipe_tower_cost`, `total_wipe_tower_filament`, `used_filament`, `used_filament_length`, `printing_filament_types`, `print_time_total_sec`/`day`/`hour`/`minute`/`sec` |
| Objects info (:13470) | `num_objects`, `num_instances`, `scale`, `input_filename(_base)`, `plate_name` |
| Dimensions (:13496) | `first_layer_print_convex_hull`/`min`/`max`/`size`, `print_bed_min`/`max`/`size`, `first_layer_center_no_wipe_tower`, `first_layer_height` |
| Temperatures (:13536) | `bed_temperature(_initial_layer)`, `chamber_temperature`, `chamber_minimal_temperature`, `overall_chamber_temperature`, `first_layer_bed_temperature`, `first_layer_temperature` |
| Timestamps (:13551) | `timestamp`, `year`, `month`, `day`, `hour`, `minute`, `second` |
| Other presets (:13578) | `print_preset`, `filament_preset`, `printer_preset`, `physical_printer_preset` |
| Per-template (:13661, 82 entries; template-to-placeholder map in `custom_gcode_specific_placeholders()` at :13656) | `layer_num`, `layer_z`, `max_layer_z`, `timelapse_pos_x`/`y`, `has_timelapse_safe_pos`, `flush_length*`, `flush_volumetric_speeds`, `flush_temperatures`, `extrusion_role`, `last_extrusion_role`, the tool-change set listed in section 5, and more |

**Export formats** (Orca File menu, OrcaSlicer@09aa0114:src/slic3r/GUI/MainFrame.cpp:3060-3120):
- 3MF project, and "Generic 3MF" (without the Bambu extensions).
- Plate sliced file and all plate sliced files (`.gcode.3mf`).
- G-code for the current plate.
- STL and Draco (`.drc`): all objects, one file or one per object.
- Toolpaths as OBJ (`Plater::export_toolpaths_to_obj`, Plater.cpp:20723).
- Configuration and preset bundle.
- Import: 3MF, STL, STEP, SVG, OBJ, AMF and ZIP.

**`.gcode.3mf`.** Written by `Plater::export_gcode_3mf` (OrcaSlicer@09aa0114:src/slic3r/GUI/Plater.cpp:19600, extension at :19630) with `SaveStrategy::Silence | SplitModel | WithGcode | SkipModel` (+`WithStatistics`) (:19664; flags in bbs_3mf.hpp:162-184). The archive carries `Metadata/plate_N.gcode` and its `.md5`, `plate_N.png` and `plate_no_light_N.png` thumbnails, `slice_info.config` (filaments used, prediction, weight), `model_settings.config` and `project_settings.config`, but no printable mesh (bbs_3mf.cpp:215-250, 6811-6822). This is the file Bambu printers print. A normal project 3MF uses the same writer without `SkipModel`; with `WithGcode` it can embed the sliced plates as well, which makes it a project with embedded G-code. Plain `.gcode` output adds `thumbnails`/`thumbnails_format` (PNG, JPG, QOI, BTT_TFT, ColPic; OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.hpp:597), `gcode_label_objects` / `exclude_object` for Klipper object exclusion (PrintConfig.cpp:4693, 4701), `gcode_comments` (:4718), `gcode_add_line_number` (:4446) and `filename_format` (:5860). Prusa's binary G-code (`binary_gcode`) is in neither fork.

## Comparison

| Area | PrusaSlicer (baseline) | Bambu Studio adds | OrcaSlicer adds |
|---|---|---|---|
| Settings | 386 FFF keys | renames most keys; 251 new keys kept by Orca, 100 that Orca lacks | 232 new keys (+18 shared with SuperSlicer); re-adds 43 Prusa keys Bambu dropped |
| Plates | single bed (Prusa 2.9+ added its own multi-bed, outside this fork line, unverified) | `PartPlate`, up to 36 plates, per-plate config, slice and print per plate, plate-level custom G-code | same; Orca-specific plate checks (spiral, mixed filament, IDEX maps) |
| Model prep | cut, painting, measure, emboss, SVG, simplify, variable layer height | boolean, advanced cut (dovetail), own text tool, assembly view, auto-orient, arrange across plates | Prusa cut and emboss restored, CGAL repair, texture displacement, IDEX arrange, belt printers |
| Calibration | 2.x: static models only; 3.0-alpha: Lua plugin with flow tower and temperature tower | wizards for Bambu printers (PA, flow, max volumetric speed) and the menu tests | origin of the menu tests; adds input shaping, cornering, YOLO flow, adaptive PA, tolerance model |
| Multimaterial | wipe tower with ramming, purge matrix | prime tower, colour-based flush calculation, AMS mapping and sync, dual-nozzle grouping | both tower types, 20000 mm³ flush cap, per-feature filament, mixed filaments |
| Device | print-host upload (OctoPrint and others) | Bambu cloud/LAN device tab, camera, HMS, firmware, multi-device queue | 17 host types, web device tab, printer agents, generic camera streams |
| G-code | post-processing scripts, substitutions, binary G-code, placeholders | `.gcode.3mf`, timelapse G-code, `printing_by_object_gcode` | placeholder catalogue and editor, role-change G-code, axis remap, plugins |

## Implications for VSSlicer

- **Settings schema.** Reuse the dump as the canonical key list for a profile and settings UI. Treat Orca's key names as the lingua franca, since Orca is a superset of Bambu except for about 100 Bambu-only keys. Note that Bambu and Orca are drifting apart: some keys have different names for the same feature. The settings UI could be generated from the extracted label, tooltip, type, page and group, but this needs enum values and min/max/default too, which the extractor does not collect yet (open question 1).
- **Plates.** Model plates as a config layer (global < plate < object < part/range) with a per-plate slicing result. This maps directly onto the Bambu 3MF `Metadata/plate_N.*` layout, which a 3MF reader/writer must understand anyway.
- **Calibration.** The tests are simple. Each is a model plus a per-layer parameter sweep (GCode.cpp:6746-6824), which is easy to reimplement independently of the AGPL code. The "feed back into profile" step is manual everywhere except Bambu printers, which use printer-side PA tables over MQTT. VSSlicer can improve on this by writing the picked value straight into the profile.
- **Multimaterial.** Flush-volume calculation from colours (about 100 lines in FlushVolCalc.cpp) and the change-filament placeholder set are the contract that existing printer profiles' G-code depends on. Keep the same placeholder names so imported profiles work.
- **Export.** Supporting `.gcode.3mf` (G-code + slice_info + thumbnails, no mesh) is required to print on Bambu printers. Generic printers need plain `.gcode` with thumbnails and object labels.
- **Device.** The Bambu camera path depends on the proprietary `BambuSource` plug-in. A VS Code extension would need its own RTSPS/JPEG client (see the camera card). Orca's generic HTTP/RTSP/WebRTC camera support is the model for other printers.

## Licence notes

- All three projects are AGPL-3.0 (BambuStudio@79df7ae:LICENSE, README.md:43; OrcaSlicer@09aa0114:LICENSE.txt; PrusaSlicer@30ef591:LICENSE). Copying any code, including `FlushVolCalc`, `calib.cpp`, `bbs_3mf.cpp`, or the tooltip and label strings verbatim, makes VSSlicer AGPL. Running the libraries as a separate process (for example a CLI slicer) keeps that obligation to the slicer component. Generating our own UI from extracted key names and types is low-risk. Copying tooltip text wholesale is copying, so write our own descriptions or accept AGPL.
- The Bambu networking plug-in and `BambuSource` are "based on non-free libraries" and optional (BambuStudio@79df7ae:README.md:51; OrcaSlicer@09aa0114:README.md:263). Do not redistribute them.
- Bundled calibration models (`resources/calib/*`, `handy_models/*`) are under the repositories' licences unless marked otherwise (unverified per file).

## Open questions

1. The extractor does not yet collect enum values, min/max, sidetext or defaults. These are needed if VSSlicer generates its settings UI from this data.
2. Per-key direction between Bambu and Orca (`B` keys that Orca originated) needs the git history of both projects. The clones are shallow, so this is unverified.
3. The Prusa baseline is the 3.0-alpha "Legacy" config. The exact key set Bambu forked from (Prusa about 2.4) was not checked out, so `P-only` mixes "dropped by Bambu" with "added by Prusa later".
4. The 151-pair rename map is a judgement. Some pairs are loose: `gap_fill_enabled` and `gap_fill_target`, `travel_ramping_lift` and `z_hop_types`, `infill_every_layers` and `infill_combination`, `complete_objects` and `print_sequence`.
5. Whether Bambu's auto calibrations (lidar flow, eddy PA) can be triggered on LAN-only firmware after the 2025 authorisation change is for the printer-API card.
