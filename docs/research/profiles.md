# Printer, process and material profiles

Researched 2026-10-25 (VSS-12). Covers the profile formats of PrusaSlicer, OrcaSlicer, Bambu Studio and Cura: their inheritance and compatibility rules, where vendor profiles live and under what licence, and a unified schema proposal for VSSlicer. Raw notes: `.reference/notes/VSS-12-profiles.md`.

| Source | Revision analysed | Licence |
|---|---|---|
| PrusaSlicer `master` (3.0.0-alpha12, 2026-09-21) | `PrusaSlicer@30ef591` | AGPL-3.0 |
| PrusaSlicer 2.9.6 (sparse: `src/libslic3r`, `src/slic3r/{Utils,Config}`, `PresetArchiveDatabase`, `resources/profiles/PrusaResearch.*`) | `PrusaSlicer@b028299` (tag `version_2.9.6`) | AGPL-3.0 |
| PrusaSlicer-settings (legacy update channel) | `PrusaSlicer-settings@a40f669` | AGPL-3.0 (`License`) |
| OrcaSlicer `main` (2026-10-25) | `OrcaSlicer@09aa0114` | AGPL-3.0 |
| Bambu Studio (2.8.3 beta, 2026-10-13) | `BambuStudio@79df7ae` | AGPL-3.0 |
| Cura (5.15 line, 2026-10-09) | `Cura@5bea2f8` | LGPL-3.0 |
| fdm_materials | `fdm_materials@0c05969` | CC0-1.0 |

The card named `PrusaSlicer/src/libslic3r/Preset.cpp` and `resources/profiles/*.ini`. Neither exists at `30ef591`: PrusaSlicer `master` is the 3.0 alpha, which replaced INI bundles with YAML presets. The INI format, which every shipping PrusaSlicer release (up to 2.9.x) uses, is documented from the 2.9.6 tag. The 3.0 YAML format is documented separately, because it is where Prusa is heading and it models nozzles the way we want to.

Lineage: Slic3r → PrusaSlicer → Bambu Studio → OrcaSlicer. The JSON profile format began in Bambu Studio and Orca extended it. `inherits`, `compatible_printers(_condition)` and the placeholder-parser condition language began in Slic3r/PrusaSlicer and both JSON slicers kept them.

## Findings

### 1. PrusaSlicer INI bundles (2.9.6) and the 3.0 YAML successor

**Bundle structure.** One vendor is one INI file. `PrusaResearch.ini` has 42 247 lines with 1 `[vendor]`, 35 `[printer_model:*]`, 238 `[printer:*]`, 633 `[print:*]` and 6 069 `[filament:*]` sections, plus `sla_print`/`sla_material` (counted from `PrusaSlicer@b028299:resources/profiles/PrusaResearch.ini`).

- `[vendor]` holds `repo_id = prusa-fff`, `name`, `config_version = 2.4.14`, `config_update_url` and `changelog_url` (`PrusaResearch.ini:3-9`). `name` and `config_version` are required, and the version must be a semver (`PrusaSlicer@b028299:src/libslic3r/Preset.cpp:107-140`).
- `[printer_model:<ID>]` holds `name`, `variants` (the nozzle list, e.g. `HF0.4; HF0.5; ...; 0.4; 0.8`), `technology`, `family`, `bed_model`, `bed_texture`, `thumbnail` and `default_materials` (`PrusaResearch.ini:11-19`). These are parsed at `Preset.cpp:181-235`. A model with no variants is dropped (`Preset.cpp:233`).
- `[printer:<name>]` is one concrete printer *per nozzle*. For example, `Original Prusa MK4S 0.4 nozzle` inherits `Original Prusa MK4S HF0.4 nozzle; *MK4S_LFNOZZLE*` and sets `printer_variant = 0.4`, `default_print_profile` and `default_filament_profile` (`PrusaResearch.ini:41225-41229`).
- `[print:<name>]` and `[filament:<name>]` are named with an `@PRINTER NOZZLE` suffix, e.g. `[print:0.20mm SPEED @MK4S 0.4]` (`PrusaResearch.ini:5276`) and `[filament:Prusament PLA @MK4S]` (`:36455`).
- `[physical_printer:*]`, `[presets]` and `[obsolete_presets]` sections are also recognised (`PrusaSlicer@b028299:src/libslic3r/PresetBundle.cpp:1544-1588`).

**`inherits` and `*common*`.**
- `inherits = A; B` takes an ordered list of parents. Sections whose name is wrapped in `*` (e.g. `[print:*common*]` `:351`, `[filament:*common*]` `:8486`, `[filament:*PLA*]` `:8515`, `[printer:*common*]` `:39231`) are abstract: they exist only to be inherited and are deleted after flattening.
- `flatten_configbundle_hierarchy` (`PresetBundle.cpp:1311-1447`) builds a DAG, sorts it with Kahn's algorithm, reports cycles and unknown parents, then copies each parent key into the child only if the child lacks it.
- Parents are walked in reverse list order, so the **last-listed parent wins** and the child beats all parents. The MK4S example uses this to apply a `*MK4S_LFNOZZLE*` mixin last.
- Exceptions: `renamed_from` is never inherited, and `custom_parameters_*` JSON values are deep-merged rather than replaced (`:1415-1433`).
- System presets are stored fully flattened, and `inherits` is erased (`:1367`).
- User bundles may keep `inherits` pointing at **one** system preset (`:1366-1374`).
- Presets can be renamed with `renamed_from = "..."` (e.g. `PrusaResearch.ini:4298`) and given an `alias` (`Preset.cpp:1273-1298`, `1652-1670`).

**Compatibility conditions.**
- `compatible_printers` (an explicit name list) takes priority. When it is empty, `compatible_printers_condition` is evaluated by `PlaceholderParser::evaluate_boolean_expression` against the active printer config, plus `printer_preset` and `num_extruders` (`Preset.cpp:390-421`).
- If the expression fails to parse, the preset is treated as compatible (`:401-406`).
- A preset from a different vendor is incompatible unless that vendor is a `templates_profile` (`:392-394`).
- `compatible_prints_condition` links filaments to print presets the same way (`:367-388`).
- The bundle has 822 conditions. Typical forms:
  - `printer_model=="MK4" and nozzle_diameter[0]==0.4`
  - `printer_model=~/(MK4S|MK4SMMU3|MK3.9S|MK3.9SMMU3)/ and nozzle_diameter[0]!=0.8 and nozzle_diameter[0]!=0.6 and ! single_extruder_multi_material` (`PrusaResearch.ini:8593`)
  - keyword tests on free text, such as `printer_notes=~/.*PRINTER_VENDOR_PRUSA3D.*/`. Printer presets carry a `printer_notes` value that says "Don't remove the following keywords!" (`PrusaResearch.ini:39266`).
- The language offers `==`, `!=`, `<`, `>`, `=~ /re/`, `!~`, `and`, `or`, `!`, indexed vector access `[0]`, and the boolean config keys.
- Whether a printer preset is visible is decided separately: the user installs vendor/model/variant triples in the Config Wizard (`Preset.cpp:424-450`).

**Vendor index and update mechanism (2.9).**
- `<Vendor>.idx` is a line format (`PrusaSlicer@b028299:src/slic3r/Config/Version.cpp:125-200`):
  - `min_slic3r_version = X` / `max_slic3r_version = X` lines open a block.
  - Each following `<semver> <comment>` line is a config version that is valid for that app range. Example: `min_slic3r_version = 2.9.4-rc0` followed by `2.4.14 Updated FW version notification ...` (`PrusaResearch.idx:1-2`). The file has 438 lines of history.
- Since 2.8 the updater reads `ArchiveRepositoryManifest.json`. It lists four repositories (`prusa-fff`, `prusa-sla`, `non-prusa-fff`, `non-prusa-sla`) at `https://preset-repo-api.prusa3d.com/v1/repos/<id>/`, each with a `vendor_indices.zip` (`PrusaSlicer@b028299:resources/profiles/ArchiveRepositoryManifest.json`).
- `PresetUpdater::priv::sync_config` downloads the zip, unpacks the `.idx` files to the cache, picks the newest version compatible with the running app, then fetches `<vendor>/<version>.ini` (`PrusaSlicer@b028299:src/slic3r/Utils/PresetUpdater.cpp:302-460`). It snapshots the config before applying updates (`:176`).
- The older `files.prusa3d.com/.../PrusaSlicer-settings-master/live/<Vendor>/` URL still appears in `config_update_url` (`PrusaResearch.ini:7`). The GitHub `PrusaSlicer-settings` repository says it is "no longer used for PrusaSlicer 2.8.0 and newer". It points to four successor repositories and describes the legacy `live/<vendor>/<version>.ini` + `index.idx` layout (`PrusaSlicer-settings@a40f669:README.md`).

**Physical printers (2.9).**
- A physical printer is a connection that points at one or more printer presets. Its options are `preset_name(s)`, `printer_technology`, `host_type`, `print_host`, `printhost_apikey`, `printhost_cafile`, `printhost_port`, `printhost_authorization_type`, `printhost_user`, `printhost_password` and `printhost_ssl_ignore_revoke` (`Preset.cpp:1759-1773`).
- They are stored as INI files in `data_dir/physical_printer/` (`PresetBundle.cpp:194-202`, `334`).
- They are displayed as `<printer> * <preset>` (`Preset.cpp:1754`).
- Credentials therefore sit in plain INI files.

**PrusaSlicer 3.0 YAML (alpha, `PrusaSlicer@30ef591`).**
- Layout:
  - `resources/presets/RepositoryManifest.json`
  - `prusa-research-fff/PrusaResearch.idx` (new numbering `1.0.11`, `min_slic3r_version = 3.0.0-alpha0`)
  - a `PrusaResearch/` directory holding `vendor.yaml`, one `preset-<kind>-<name>.yaml` per preset (288 filament, 13 print, 11 printer, 12 tool) and `assets/`.
- Preset kinds: `printer`, `print`, `tool_print`, `filament` and the SLA kinds (`src/slic3r-shared/src/Slic3r/Biz/Preset/IO/PresetYamlDesc.hpp:7-16`).
- Every node has `condition`, `id`, `name`, `inherits`, `unconditional_inherits`, `values`, `features`, `match_mode` (`first_match`/`all_matches`) and a recursive list of `variants` (`:18-40`). One file therefore describes a preset tree: for example `0.20mm` print values for MK4S, with child variants for each nozzle diameter and for high-flow nozzles (`preset-print-mk4s.yaml`, `preset-printer-coreone.yaml:1-50`).
- `vendor.yaml` is a multi-document file whose kinds are `vendor`, `printer` (hardware definitions, 17), `printer_config` (32), `tool` (10), `feeder` (3) and `sheet` (6) (`src/slic3r-shared/src/Slic3r/Biz/Preset/IO/HwConfigLoader.cpp:172-212`).
  - A `printer_config` such as `xl-2t` combines a printer, `tool_count`, `tools: [{tool: '0.4'}]` and a `sheet`.
  - A `tool` declares `features.nozzle_diameter` and `nozzle_high_flow`, plus a `condition` saying which printers or feeders may use it.
  - Feature defaults are declared per namespace (`printer`, `tool`, `sheet`, `feeder`) in the `vendor` document.
- Conditions now refer to hardware namespaces instead of `printer_notes` text: `tool.nozzle_diameter == 0.4`, `tool.nozzle_high_flow`, `printer.base_model=~/(COREONE|MK4|XL)/`, `feeder.base_model=~/.*MMU.*/ and ! feeder.single_mode`. The most common are `tool.nozzle_high_flow` (1 534 occurrences) and `tool.nozzle_diameter == 0.4` (1 294).
- Physical printers become JSON. Host types are `prusalink`, `prusalink_storage`, `sl1`, `octoprint`, `moonraker`, `duet`, `flashair`, `astrobox`, `repetier` and `mks` (`src/slic3r-shared/src/Slic3r/Biz/PhysicalPrinter/PhysicalPrinterJson.cpp:20-45`).
- This is alpha code, and the YAML schema may still change (unverified beyond this commit).

### 2. OrcaSlicer / Bambu Studio JSON profiles

**Layout.**
- `resources/profiles/<Vendor>.json` is the vendor index. Orca has 70 vendor indices plus `OrcaFilamentLibrary.json` (`OrcaSlicer@09aa0114:resources/profiles/*.json`, excluding `blacklist.json`), Bambu Studio has 12 (`BambuStudio@79df7ae:resources/profiles/*.json`, excluding `blacklist.json`); counted with `ls *.json | grep -v blacklist`.
- The index holds `name`, `version` (four-part, e.g. `02.04.00.03`), `force_update`, `description` and four lists of `{name, sub_path}`: `machine_model_list`, `process_list`, `filament_list` and `machine_list` (`resources/profiles/Voron.json:3-243`). The keys are defined as `BBL_JSON_KEY_*` constants at `OrcaSlicer@09aa0114:src/libslic3r/Preset.hpp:55-93`.
- Files live in `resources/profiles/<Vendor>/{machine,process,filament}/*.json`, next to cover images and bed STL/SVG assets.
- Orca also ships `OrcaFilamentLibrary` (`02.04.00.16`), a cross-vendor filament library loaded before every other vendor (`OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:666-680`, `3570`).

**Machine / process / filament split.**
- `type: machine_model` describes the product: `name`, `model_id`, `nozzle_diameter: "0.4;0.15;..."`, `machine_tech`, `family`, `bed_model`, `bed_texture`, `hotend_model`, `default_materials` (`Voron/machine/Voron 2.4 250.json`).
- `type: machine` is one preset per nozzle. Example: `Voron 2.4 250 0.4 nozzle` with `inherits: fdm_klipper_common`, `from: system`, `setting_id`, `instantiation: "true"`, `printer_model`, `printer_variant: "0.4"` (`Voron/machine/Voron 2.4 250 0.4 nozzle.json:3-26`).
- `type: process` and `type: filament` are the print and material presets.

**`inherits`, `include`, `instantiation`.**
- `inherits` is a **single** parent name. An empty `inherits` is an error (`PresetBundle.cpp:8261-8270`).
- `include` is an ordered array of template names. They are layered over the parent before the preset's own keys: parent, then each include in order, then own keys (`PresetBundle.cpp:8272-8281`, `7597-7640`). G-code templates such as `Bambu Lab A1 0.4 nozzle template machine_start_gcode.json` are included this way.
- `instantiation` must be `"true"` or `"false"`. `"false"` marks an abstract base, the counterpart of PrusaSlicer's `*name*`. Files with no name, or with "gcode" in the name and no `instantiation`, are treated as include-only templates (`PresetBundle.cpp:8240-8253`).
- `renamed_from` is supported (`:8284`).

**IDs.**
- `setting_id` is the cloud and system ID of a preset (e.g. `GFSA00`).
- `filament_id` identifies a material family across printers (e.g. `OFoiVqVM` on `Bambu PLA Basic @base`). Children inherit it when they have none (`PresetBundle.cpp:7606-7618`). It is what AMS/RFID slot data and printer firmware report. Orca translates between Orca and Bambu filament IDs (`OrcaSlicer@09aa0114:src/slic3r/Utils/IPrinterAgent.hpp:471-472`).
- `filament_vendor` is an ordinary per-filament config key (`filament_vendor: ["Bambu Lab"]` in `BBL/filament/Bambu PLA Basic @base.json`).

**Per-extruder arrays and `nil`.**
- Filament values are arrays with one entry per extruder variant. `"nil"` means "do not override the printer value". The default filament preset sets every nullable filament override key to nil (`PresetBundle.cpp:507-516`; e.g. `filament_retraction_length: ["nil","0.4"]` in `BBL/filament/Bambu PLA Basic @BBL X1C.json:25-29`).

**Compatibility.**
- Same `compatible_printers` / `compatible_printers_condition` rules as PrusaSlicer, with three changes (`OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:909-941`):
  - Orca drops the same-vendor requirement, so profiles work across vendors.
  - OrcaFilamentLibrary presets can be excluded from specific printers through `m_excluded_from`.
  - A user printer is compatible with whatever its system parent is compatible with (`is_compatible_with_parent_printer`, `:899`, `:940`).
- In practice Bambu-derived profiles use explicit `compatible_printers` name lists, e.g. `Bambu PLA Basic @BBL X1C.json:59`. Library `@System` filaments use `[]`, which means all printers.

**`.orca_printer` / `.orca_filament` / `.orca_bundle`.**
- All three are zip files containing `bundle_structure.json` (`OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.hpp:32`).
- `bundle_structure.json` fields: `version`, `bundle_id` (`<user_id>_<name>_<time>` or `offline_<name>_<time>`), `bundle_type` (`printer config bundle` / `filament config bundle`), `printer_preset_name` or `filament_name`, the lists `printer_config`, `filament_config` and `process_config`, plus `printer_vendor` and `printer_asset` (`src/slic3r/GUI/CreatePresetsDialog.cpp:4032-4117`, `4157-4216`; `src/libslic3r/PresetBundle.cpp:2309-2349`). The listed preset JSON files sit alongside it in the zip.
- Writers: `.orca_printer` at `CreatePresetsDialog.cpp:4045`, `.orca_filament` at `:4168`, `.orca_bundle` at `src/slic3r/GUI/ExportPresetBundleDialog.cpp:91`, `359`.
- On import, files with `bundle_structure.json` go to `user/<id>/_local/<bundle_id>/`; files without it become loose user presets (`PresetBundle.cpp:2373-2530`). The import path is checked to stay inside the user folder (`:2428`).
- Bambu Studio's equivalents are `.bbscfg` (printer bundle) and `.bbsflmt` (filament bundle) (`BambuStudio@79df7ae:src/slic3r/GUI/CreatePresetsDialog.cpp:3576-3577`, `4078`, `4195`).

**User presets and sync.**
- User presets are stored as `data_dir/user/<user_id>/{machine,process,filament}/<name>.json` (`Preset.hpp:31-44`). Each stores its own keys and `inherits`.
- Each has an INI sidecar `<name>.info` with `sync_info` (`create`/`update`/`delete`/empty), `user_id`, `setting_id`, `base_id` and `updated_time` (`OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:670-700`, `Preset.hpp:329`).
- Bambu Studio syncs through the closed Bambu network plugin, using `get_user_presets`, `put_setting` and `get_setting_list` (`BambuStudio@79df7ae:src/slic3r/Utils/NetworkAgent.hpp:70-74`).
- Orca now runs its own cloud, `OrcaCloudServiceAgent`, with `https://api.orcaslicer.com`, `auth.` and `cloud.` (`OrcaSlicer@09aa0114:src/slic3r/Utils/OrcaCloudServiceAgent.cpp:87-89`). It provides `get_user_presets` (`:1102`) and `put_setting` with conflict detection on `updated_time` (`:1235-1275`).

**System profile updates.**
- Orca queries `https://check-version.orcaslicer.com/profile?vendor=<id>&orca_version=<v>` and `/new` for new vendors (`OrcaSlicer@09aa0114:src/libslic3r/AppConfig.cpp:62`; `src/slic3r/Utils/PresetUpdater.cpp:649-651`, `1419`). This is gated on `enable_ota`, which is false by default (`AppConfig.cpp:724-726`). Otherwise profiles update only with app releases.
- Bambu Studio stages OTA profile packages in `data_dir/ota` with a `<vendor>.changelog` (`BambuStudio@79df7ae:src/slic3r/Utils/PresetUpdater.cpp:338`, `786-816`). The download goes through the network plugin (unverified endpoint).

### 3. Cura

**Definitions.**
- `resources/definitions/*.def.json` (706 files) form a single-inheritance chain rooted at `fdmprinter.def.json`. That root holds the full setting tree: 17 categories and 740 settings (plus 31 settings in 4 categories in `fdmextruder.def.json`; counted by walking `settings`/`children` for nodes with `type` and `default_value`/`value`), each with `label`, `type`, `default_value`, `value` (a Python expression), `minimum_value`/`maximum_value`, `enabled`, `settable_per_extruder`/`settable_per_mesh`/`limit_to_extruder` and `resolve` (`Cura@5bea2f8:resources/definitions/fdmprinter.def.json`).
- Child definitions such as `ultimaker_s5.def.json` set `inherits: "ultimaker"` (`:4`) and metadata such as:
  - `exclude_materials` (`:18`)
  - `has_machine_quality` (`:32`)
  - `has_variants` (`:35`)
  - `machine_extruder_trains: {"0": "ultimaker_s5_extruder_left", ...}` (`:36`)
  - `preferred_quality_type` (`:49`)
  - `preferred_variant_name: "AA 0.4"` (`:51`)
  - an `overrides` map such as `"acceleration_print": {"value": "3500"}` (`:61-73`).

**`extruders/`.**
- `extruders/*.def.json` (544 files) inherit `fdmextruder` and carry `metadata.machine` and `position`, plus per-train overrides such as nozzle offsets and start/end positions (`resources/extruders/ultimaker_s5_extruder_left.def.json`).

**`variants/`.**
- `variants/*.inst.cfg` (1 741 files) are INI instance containers.
- `[general] definition = ultimaker_s5`, `name = AA 0.4`; `[metadata] hardware_type = nozzle` (or `buildplate`), `type = variant`, `setting_version = 27`; `[values]` such as `machine_nozzle_size = 0.4`, `machine_nozzle_id = AA 0.4` and `speed_wall = =math.ceil(speed_print * 30 / 70)` (`resources/variants/ultimaker_s5_aa04.inst.cfg`).
- A value that starts with `=` is an expression, evaluated by Uranium's `SettingFunction` (https://github.com/Ultimaker/Uranium/blob/main/UM/Settings/SettingFunction.py).

**`quality/` and `intent/`.**
- `quality/<machine>/*.inst.cfg` (6 011 files) are keyed by metadata `material` (a material `base_file` ID such as `generic_pla`), `variant` (`AA 0.4`), `quality_type` (`draft`/`fast`/`normal`/...) and `weight` (`resources/quality/ultimaker_s5/um_s5_aa0.4_pla_0.15mm.inst.cfg`).
- Global quality files (`global_quality = True`) carry the layer height (`resources/quality/normal.inst.cfg`).
- Machines without `has_machine_quality` fall back to `fdmprinter` quality (`cura/Machines/MachineNode.py:45-46`).
- `intent/<machine>/*.inst.cfg` (641 files) add `intent_category` (counts at this commit: engineering 242, visual 143, quick 139, solid 70, annealing 27, strong 7, highspeed 6, highspeedsolid 6) for a given material, `quality_type` and variant (`resources/intent/ultimaker_s5/um_s5_aa0.4_um-tough-pla_0.1mm_engineering.inst.cfg`).
- Variant, material and quality are selected through a container tree: Machine → Variant → Material → Quality → Intent (`cura/Machines/*Node.py`). Materials are resolved by `base_file` in increasing precedence: generic, then printer-specific, then variant-specific (`cura/Machines/VariantNode.py:57-60`).

**Stacks and machine instances.**
- An active machine is a `GlobalStack` plus one `ExtruderStack` per train, built by `CuraStackBuilder.createMachine` / `createExtruderStack` / `createGlobalStack` (`cura/Settings/CuraStackBuilder.py:22`, `141`, `190`).
- Each stack has eight fixed slots. Top wins: `user`, `quality_changes`, `intent`, `quality`, `material`, `variant`, `definition_changes`, `definition` (`cura/Settings/CuraContainerStack.py:409-431`).
- Instances persist under the configuration folder in `machine_instances/`, `extruders/`, `definition_changes/`, `quality_changes/`, `user/`, `variants/`, `materials/` and `intent/` (`cura/CuraApplication.py:383`, `461-470`).
- `MachineManager.addMachine`, `setVariant`, `setMaterial`, `setQualityGroup` and `setIntentByCategory` drive the selection (`cura/Settings/MachineManager.py:434`, `1587`, `1556`, `1607`, `1672`).

**`setting_version`.**
- Every container carries `setting_version`. The current value is `CuraApplication.SettingVersion = 27` (`cura/CuraApplication.py:145`).
- Containers with a different version are flagged as outdated (`cura/Settings/CuraContainerRegistry.py:96-99`). Imported profiles must match exactly (`:436-444`).
- Upgrades are chained plugins in `plugins/VersionUpgrade/` (31 at this commit). Each rewrites INI text: it renames and removes keys and remaps values. For example, `VersionUpgrade512to513` replaces `infill_randomize_start_location` with `infill_start_end_preference` and maps `travel_retract_before_outer_wall` from a boolean to an enum (`plugins/VersionUpgrade/VersionUpgrade512to513/VersionUpgrade512to513.py:14-63`).

**Materials.**
- Materials are `fdm_materials` XML (`fdmmaterial` v1.3). Each has a GUID, an integer `version`, brand/material/colour, `color_code`, `density` and `diameter`, and `<setting key="print temperature">` entries in human-readable key names.
- `<machine><machine_identifier .../>` blocks hold per-machine settings, nested `<hotend id="AA 0.4">` blocks hold per-nozzle overrides, and `hardware compatible` marks hardware support (`fdm_materials@0c05969:generic_pla.xml.fdm_material:1-130`).
- Cura maps the XML keys to setting keys in a table, e.g. `print temperature` → `default_material_print_temperature` (`Cura@5bea2f8:plugins/XmlMaterialProfile/XmlMaterialProfile.py:1148-1175`).

### 4. Nozzle / toolhead modelling compared

| Approach | Used by | How a nozzle change is expressed | Consequence |
|---|---|---|---|
| Printer preset per nozzle | PrusaSlicer ≤2.9 (`printer_model.variants`, `printer_variant`), Orca/Bambu (`machine_model.nozzle_diameter`, one `machine` JSON per nozzle) | A different printer preset; prints and filaments are duplicated per nozzle (`@MK4S 0.6`) or gated by `nozzle_diameter[0]==0.6` conditions | Combinatorial growth: 6 069 filament sections in one Prusa bundle; per-nozzle defaults hard-coded by name |
| Hardware entity + conditional variants | PrusaSlicer 3.0 (`tool`, `feeder`, `sheet`, `printer_config`) | Select a tool; presets carry `variants` with `condition: tool.nozzle_diameter == 0.6` | One preset file covers all nozzles; nozzle traits (diameter, high flow) are first-class features |
| Variant container in a stack | Cura (`variants/*.inst.cfg`, `hardware_type = nozzle`/`buildplate`) | The variant slot in each `ExtruderStack`; quality/intent are looked up by (machine, variant, material, quality_type) | Per-extruder nozzles come naturally; quality files multiply by variant × material (6 011 quality files) |
| Per-extruder variant arrays | Bambu Studio / Orca for H2D-class printers (`extruder_variant_list`, `printer_extruder_variant`, `filament_extruder_variant`, `nozzle_volume_type`) | Values are arrays indexed by (extruder, variant) where a variant is "Direct Drive Standard" / "High Flow" / "TPU High Flow" | Supports two heads with different nozzle flow types in one preset, but positional arrays are hard to diff and merge (`BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:5050-5180`; `resources/profiles/BBL/machine/Bambu Lab H2D 0.4 nozzle.json:47`, `364`) |
| Plain nozzle fields | All, as config keys: `nozzle_diameter`, Orca `nozzle_type`/`nozzle_hrc` (`OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:4480`, `4499`), Cura `machine_nozzle_size`/`machine_nozzle_id` | Edited in place | Simple, but other presets cannot reason about the nozzle except through conditions on these keys |

The build plate is modelled four different ways: a Cura `buildplate` variant, a PrusaSlicer 3.0 `sheet`, Orca/Bambu per-plate bed-temperature keys (`cool_plate_temp`, `eng_plate_temp`, `hot_plate_temp`, `textured_plate_temp`, `OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:1351-1387`), and nothing at all in PrusaSlicer 2.9.

### 5. Vendor profile repositories and licences

| Source | Where | Licence evidence | Redistribution |
|---|---|---|---|
| PrusaSlicer bundles (Prusa + other vendors, 35 `.ini` per `git ls-tree HEAD resources/profiles/` at `PrusaSlicer@b028299`) | https://github.com/prusa3d/PrusaSlicer/tree/version_2.9.6/resources/profiles | Repository is AGPL-3.0 (`https://github.com/prusa3d/PrusaSlicer/blob/master/LICENSE`). Third-party bundles name other upstreams: legacy `PrusaSlicer-settings@a40f669:live/Voron/1.0.4.ini:2` says "Source: https://github.com/slic3r/slic3r-profiles" (the 2.9.6 `resources/profiles/Voron.ini` header names https://github.com/VoronDesign/PrusaSlicer-settings-non-prusa-fff, read via `git show` from the 2.9.6 tree, which this sparse clone does not check out); `PrusaSlicer-settings@a40f669:live/RatRig/1.1.1.ini:3` says its bed SVG is CC-BY (Thingiverse 4861532) | Allowed under AGPL-3.0 with licence text and source; per-asset attributions must travel with them |
| PrusaSlicer-settings (legacy `live/`) | github.com/prusa3d/PrusaSlicer-settings | `License` is AGPL-3.0 (`PrusaSlicer-settings@a40f669:License`; GitHub API spdx `AGPL-3.0`) | As above; repository is frozen for ≥2.8 |
| PrusaSlicer-settings-prusa-fff / -non-prusa-fff (current channel) | github.com/prusa3d/PrusaSlicer-settings-prusa-fff, ...-non-prusa-fff (pushed 2026-10-22) | No LICENSE and no README (GitHub API `license` and `readme` both 404, 2026-10-25) | Unclear on its own; the same content ships inside the AGPL PrusaSlicer repository, so take it from there |
| Orca `resources/profiles` (70 vendors + OrcaFilamentLibrary) | OrcaSlicer repo | No separate licence in `resources/profiles`; repository LICENSE.txt is AGPL-3.0 (`OrcaSlicer@09aa0114:README.md:258-262`) | AGPL-3.0 |
| Bambu `resources/profiles` (12 vendors) | BambuStudio repo | Repository LICENSE is AGPL-3.0; README licence section does not single out profiles (`BambuStudio@79df7ae:README.md:42-49`) | AGPL-3.0 |
| Cura `resources/` (definitions, extruders, variants, quality, intent) | Cura repo | LGPL-3.0 (`Cura@5bea2f8:LICENSE`; README badge `README.md:18`) | Allowed under LGPL-3.0 with licence text; these are data files, so no linking question arises |
| fdm_materials | github.com/Ultimaker/fdm_materials | CC0-1.0 (`fdm_materials@0c05969:LICENSE`, `README.md:25-28`) | Unrestricted, no attribution required |

### 6. Unified profile schema proposal

The schema is JSON validated by a published JSON Schema, so VS Code's built-in JSON language service gives completion and diagnostics without an extra extension. One entity goes in each file. File and directory names never carry meaning; identity comes from `id`.

**Entities**

| Entity | Required fields | Optional fields | Replaces |
|---|---|---|---|
| `vendor` | `id`, `name`, `version` (semver), `license` (SPDX) | `update {url, channel}`, `source {format: prusa-ini\|prusa-yaml\|orca-json\|bambu-json\|cura, origin, commit}`, `attribution[]` | `[vendor]`, `<Vendor>.json`, `vendor.yaml` |
| `printer_model` | `id`, `vendor`, `name`, `technology` (`fff`), `bed {shape: [[x,y]...], max_height}`, `toolheads {count, kinematics}` | `family`, `assets {bed_model, bed_texture, thumbnail}`, `features {input_shaper: bool, chamber: bool, ...}`, `nozzles` (allowed nozzle ids or a condition), `surfaces` (allowed build surfaces), `defaults {process, materials[]}`, `firmware {flavor, gcode_templates}`, `settings {}` | `printer_model`, `machine_model`, PrusaSlicer 3.0 `printer`, Cura machine definition |
| `nozzle` | `id`, `diameter` | `flow` (`standard`\|`high_flow`), `material` (`brass`\|`hardened_steel`\|`ruby`\|...), `hrc`, `extruder_type` (`direct`\|`bowden`), `volume_type`, `settings {}` | Prusa 3.0 `tool`, Cura nozzle variant, Bambu extruder variant, per-nozzle printer presets |
| `surface` | `id`, `type` (`pei_smooth`, `pei_textured`, `cool`, `engineering`, `glass`...) | `settings {}` | Prusa 3.0 `sheet`, Cura buildplate variant, Orca plate-temperature keys |
| `feeder` | `id`, `slots` | `type` (`mmu`\|`ams`\|`toolchanger`), `settings {}` | Prusa 3.0 `feeder`, Bambu AMS |
| `material` | `id`, `vendor`, `name`, `type` (PLA, PETG...), `diameter` | `brand`, `color`, `density`, `cost {amount, currency, per: kg}`, `spool_weight`, `external_ids {cura_guid, bambu_filament_id, orca_filament_id, prusa_name}`, `settings {}` | `[filament:*]`, `type: filament`, fdm_material XML |
| `process` | `id`, `name`, `layer_height` | `intent` (`standard`\|`quality`\|`speed`\|`engineering`), `settings {}` | `[print:*]`, `type: process`, Cura quality + intent |
| `printer_instance` (user) | `id`, `model`, `toolheads: [{slot, nozzle}]` | `surface`, `feeder`, `connection {host_type, url, secret_ref}`, `settings {}` | Prusa physical printer, Cura machine instance + `definition_changes`, Orca user `machine` preset |

All profile entities except `vendor` share these fields: `id`, `inherits` (an ordered list), `abstract` (bool), `when` (a compatibility condition), `overrides` (a list of conditional blocks), `settings` (a map from unified key to value), `renamed_from[]` and `meta {created, updated, base_version}`. The `connection` block of a `printer_instance` holds only a `secret_ref` into VS Code SecretStorage, never the credential itself. PrusaSlicer 2.9's plain-text API keys are the anti-pattern here.

**Inheritance**
- `inherits: [a, b, c]` merges left to right and the child's own `settings` are applied last. This matches PrusaSlicer's "last parent wins" rule. Orca's `inherits` + `include` maps onto it as `[parent, ...include]`.
- `abstract: true` replaces both `*name*` and `instantiation: false`. Abstract entities are never selectable.
- Merging is per key. Map-valued keys are deep-merged, as PrusaSlicer does for `custom_parameters_*`. Arrays are replaced.
- Per-extruder values are keyed objects (`{"0": 0.4, "1": 0.6}`) or nozzle-scoped overrides, never positional arrays. `null` means "not set here, fall through", which is Orca's `nil`.
- Cycles and unknown parents are load errors and must not be ignored. PrusaSlicer only logs them (`PresetBundle.cpp:1356`, `1405`).
- User entities store only their diff, the parent `id` and the parent `version` they were based on. This lets an upgrade of a vendor profile be shown as a three-way change, the purpose Orca's `base_id`/`updated_time` serve.

**Conditions**
- `when` (is this entity compatible?) and `overrides[].when` (does this block apply?) share one expression language. It is a strict subset of PrusaSlicer's: literals, `== != < <= > >=`, `=~ /re/`, `!~`, `in [..]`, `and`/`or`/`not`, and parentheses. It has no function calls and no assignment, so it can be evaluated safely in a webview or the extension host.
- Identifiers live in namespaces: `printer.*` (model id, family, features, settings), `nozzle.*` (the nozzle of the extruder in question), `surface.*`, `feeder.*`, `material.*`, `process.*`.
- `overrides` work like PrusaSlicer 3.0's `variants`, with a `match` mode of `first` or `all`. For example: `{"when": "nozzle.diameter == 0.6 and nozzle.flow == 'high_flow'", "settings": {...}}`.
- Converting from each slicer:

| Source construct | Unified form | Fidelity |
|---|---|---|
| Prusa `nozzle_diameter[0]==0.4` | `nozzle.diameter == 0.4` | exact for single extruder; `[n]` maps to the extruder in question |
| Prusa `nozzle_high_flow[0]` | `nozzle.flow == 'high_flow'` | exact |
| Prusa `printer_model=="MK4"` / `=~/(MK4S\|MK3.9S)/` | `printer.model == 'MK4'` / `printer.model =~ /.../` | exact |
| Prusa `printer_notes=~/.*PRINTER_VENDOR_PRUSA3D.*/` | `printer.vendor == 'PrusaResearch'` or `'TAG' in printer.tags` | lossy: needs a per-vendor keyword-to-tag table |
| Prusa 3.0 `tool.*`, `feeder.*`, `printer.base_model` | `nozzle.*`, `feeder.*`, `printer.family` | exact |
| Orca/Bambu `compatible_printers: [names]` | `printer.id in [...]` after name-to-id mapping | exact if every name resolves |
| Cura quality metadata `definition`/`variant`/`material`/`quality_type` | `printer.model == X and nozzle.id == 'AA 0.4' and material.base == 'generic_pla'` on a process override | exact; Cura `=expr` values do not map (see table) |
| Cura `exclude_materials` | `when: "material.base not in [...]"` on the printer | exact |

**Key mapping (56 settings)**

Each key was checked against the definitions: PrusaSlicer `PrusaSlicer@b028299:src/libslic3r/PrintConfig.cpp`, Orca `OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp`, and Cura `Cura@5bea2f8:resources/definitions/fdmprinter.def.json` (or `fdmextruder.def.json` where marked). The numbers in brackets are the line of each key's `add(...)` or JSON definition. Every Orca key also exists in Bambu Studio's `PrintConfig.cpp`, with the two exceptions noted in the table. "-" means there is no equivalent. Cura material properties come from the material XML rather than from setting keys.

| Unified key | PrusaSlicer 2.9 | Orca / Bambu | Cura | Lossy / notes |
|---|---|---|---|---|
| `layer_height` | `layer_height` (444) | `layer_height` (1134) | `layer_height` (816) |  |
| `first_layer_height` | `first_layer_height` (1710) | `initial_layer_print_height` (4061) | `layer_height_0` (829) |  |
| `wall_loops` | `perimeters` (2627) | `wall_loops` (5955) | `wall_line_count` (1109) |  |
| `top_layers` | `top_solid_layers` (3757) | `top_shell_layers` (8134) | `top_layers` (1727) |  |
| `bottom_layers` | `bottom_solid_layers` (696) | `bottom_shell_layers` (1525) | `bottom_layers` (1758) |  |
| `infill_density` | `fill_density` (1616) | `sparse_infill_density` (3691) | `infill_sparse_density` (2210) |  |
| `infill_pattern` | `fill_pattern` (1642) | `sparse_infill_pattern` (3808) | `infill_pattern` (2238) |  |
| `top_surface_pattern` | `top_fill_pattern` (1107) | `top_surface_pattern` (2549) | `top_bottom_pattern` (1788) | Cura one pattern for top and bottom (`top_bottom_pattern`); lossy |
| `line_width` | `extrusion_width` (1249) | `line_width` (3018) | `line_width` (843) | Prusa allows % of nozzle and 0 = auto; Cura mm only; lossy |
| `outer_wall_line_width` | `external_perimeter_extrusion_width` (1136) | `outer_wall_line_width` (2690) | `wall_line_width_0` (872) | as above |
| `speed_outer_wall` | `external_perimeter_speed` (1148) | `outer_wall_speed` (2702) | `speed_wall_0` (3600) | Prusa accepts % of perimeter_speed; lossy |
| `speed_inner_wall` | `perimeter_speed` (2617) | `inner_wall_speed` (5944) | `speed_wall_x` (3614) |  |
| `speed_infill` | `infill_speed` (2040) | `sparse_infill_speed` (5042) | `speed_infill` (3571) |  |
| `speed_travel` | `travel_speed` (3777) | `travel_speed` (8194) | `speed_travel` (3836) |  |
| `speed_first_layer` | `first_layer_speed` (1720) | `initial_layer_speed` (4077) | `speed_layer_0` (3850) | Prusa accepts % ; Orca splits initial_layer_infill_speed |
| `accel_default` | `default_acceleration` (1021) | `default_acceleration` (2309) | `acceleration_print` (3970) |  |
| `support_enable` | `support_material` (3297) | `enable_support` (7301) | `support_enable` (5274) |  |
| `support_angle` | `support_material_threshold` (3554) | `support_threshold_angle` (7638) | `support_angle` (5616) | Prusa/Orca slope from horizontal, 0 = auto; Cura overhang angle, 0 = all. Convert 90-x; lossy |
| `support_style` | `support_material_style` (3530) | `support_type` (7308) | `support_structure` (5359) | enum sets differ (grid/snug/organic vs normal/tree vs normal/tree) |
| `brim_width` | `brim_width` (893) | `brim_width` (2067) | `brim_width` (7044) |  |
| `skirt_loops` | `skirts` (3046) | `skirt_loops` (6768) | `skirt_line_count` (6985) |  |
| `raft_layers` | `raft_layers` (2729) | `raft_layers` (6079) | `raft_surface_layers` (7530) | Cura raft is `adhesion_type = raft` plus base/middle/surface layer counts; lossy |
| `seam_position` | `seam_position` (2913) | `seam_position` (6497) | `z_seam_type` (1394) | enum values differ (aligned/nearest/rear/random vs back/sharpest_corner/shortest/random) |
| `ironing` | `ironing` (2093) | `ironing_type` (5150) | `ironing_enabled` (1913) | Prusa bool+ironing_type; Orca enum no_ironing/top/topmost/solid; Cura bool + ironing_only_highest_layer |
| `elephant_foot` | `elefant_foot_compensation` (419) | `elefant_foot_compensation` (1102) | `xy_offset_layer_0` (1357) | Cura uses negative horizontal expansion of layer 0; sign flip |
| `nozzle_temp` | `temperature` (3677) | `nozzle_temperature` (8048) | `material_print_temperature` (2740) |  |
| `nozzle_temp_first_layer` | `first_layer_temperature` (1753) | `nozzle_temperature_initial_layer` (4116) | `material_print_temperature_layer_0` (2756) |  |
| `bed_temp` | `bed_temperature` (631) | `hot_plate_temp` (1378) | `material_bed_temperature` (2835) | Orca/Bambu one key per plate type (cool/eng/hot/textured_plate_temp); Prusa single; Cura single. Lossy |
| `bed_temp_first_layer` | `first_layer_bed_temperature` (1686) | `hot_plate_temp_initial_layer` (1432) | `material_bed_temperature_layer_0` (2853) | same as bed_temp |
| `chamber_temp` | `chamber_temperature` (641) | `chamber_temperature` (8012); Bambu `chamber_temperatures` (BambuStudio PrintConfig.cpp:6068) | `build_volume_temperature` (2725) | key differs between Orca and Bambu |
| `fan_min` | `min_fan_speed` (2433) | `fan_min_speed` (5664) | `cool_fan_speed_min` (5113) | Prusa/Orca % ; Cura % |
| `fan_max` | `max_fan_speed` (2370) | `fan_max_speed` (5605) | `cool_fan_speed_max` (5127) |  |
| `fan_off_first_layers` | `disable_fan_first_layers` (1045) | `close_fan_the_first_x_layers` (2399) | `cool_fan_full_layer` (5183) | Cura gives the layer at which fan reaches full (cool_fan_full_layer); semantics differ |
| `min_layer_time` | `slowdown_below_layer_time` (3056) | `slow_down_layer_time` (6797) | `cool_min_layer_time` (5198) |  |
| `filament_diameter` | `filament_diameter` (1477) | `filament_diameter` (3242) | `material_diameter` (110) | Cura: from material XML `<diameter>`, setting is per-extruder |
| `filament_density` | `filament_density` (1485) | `filament_density` (3499) | - | Cura: material XML `<density>` only |
| `flow_ratio` | `extrusion_multiplier` (1239) | `filament_flow_ratio` (2921) | `material_flow` (3111) | Prusa/Orca ratio (0.98); Cura material_flow percent (98); scale x100 |
| `max_volumetric_speed` | `filament_max_volumetric_speed` (1294) | `filament_max_volumetric_speed` (3188) | - | no Cura setting; Cura derives speed caps from speed_* |
| `filament_type` | `filament_type` (1494) | `filament_type` (3507) | - | Cura: XML metadata `<material>` |
| `filament_vendor` | `filament_vendor` (1556) | `filament_vendor` (3644) | - | Cura: XML metadata `<brand>` |
| `filament_cost` | `filament_cost` (1535) | `filament_cost` (3627) | - | Cura: user preference, not a profile setting |
| `retract_length` | `retract_length` (2783) | `retraction_length` (6128) | `retraction_amount` (4712) | Prusa per-extruder on printer, filament_retract_length override; Orca filament_retraction_length override; Cura on extruder/material |
| `retract_speed` | `retract_speed` (2885) | `retraction_speed` (6449) | `retraction_speed` (4725) |  |
| `z_hop` | `retract_lift` (2841) | `z_hop` (6180) | `retraction_hop` (4983) | Cura needs retraction_hop_enabled too |
| `nozzle_diameter` | `nozzle_diameter` (2495) | `nozzle_diameter` (5728) | `machine_nozzle_size` (511) |  |
| `bed_shape` | `bed_shape` (404) | `printable_area` (1021) | `machine_width` (166) | Prusa/Orca polygon points; Cura machine_width/depth + machine_shape + machine_disallowed_areas; lossy for non-rectangles |
| `max_height` | `max_print_height` (453) | `printable_height` (1142) | `machine_height` (190) |  |
| `gcode_flavor` | `gcode_flavor` (1831) | `gcode_flavor` (4638) | `machine_gcode_flavor` (375) | enum sets differ (Cura RepRap (Marlin/Sprinter), Griffin, UltiGCode...) |
| `start_gcode` | `start_gcode` (3192) | `machine_start_gcode` (6982) | `machine_start_gcode` (66) | placeholder languages differ: Prusa/Orca `[var]`/`{expr}` macro language vs Cura `{setting}` substitution; not portable |
| `end_gcode` | `end_gcode` (1071) | `machine_end_gcode` (2503) | `machine_end_gcode` (76) | as start_gcode |
| `layer_gcode` | `layer_gcode` (2190) | `layer_change_gcode` (5282) | - | no Cura equivalent (post-processing plugin) |
| `toolchange_gcode` | `toolchange_gcode` (3703) | `change_filament_gcode` (8085) | `machine_extruder_start_code` (fdmextruder:209) | Cura per-extruder start/end code instead of one toolchange macro |
| `extruder_offset` | `extruder_offset` (1223) | `extruder_offset` (2911) | `machine_nozzle_offset_x` (fdmextruder:287) | Prusa/Orca `XxY` point per extruder; Cura x and y keys per extruder |
| `max_accel_x` | `machine_max_acceleration_x` (2271) | `machine_max_acceleration_x` (5393) | `machine_max_acceleration_x` (608) |  |
| `max_feedrate_x` | `machine_max_feedrate_x` (2254) | `machine_max_speed_x` (5375) | `machine_max_feedrate_x` (564) | Orca/Bambu name it machine_max_speed_* (Bambu PrintConfig.cpp:4392) |
| `pressure_advance` | - | `pressure_advance` (2951) | - | Orca filament key (with enable_pressure_advance); Prusa 2.9 none (G-code in filament start); Prusa 3.0 YAML has `pressure_advance` (unverified type); Cura none |

Places where conversion loses information, in addition to the notes above:
- **Cura expressions.** Cura values like `=math.ceil(speed_print * 30 / 70)` have no equivalent in the other slicers. Import has to either evaluate them to a value for the chosen printer, nozzle and material (losing the formula) or keep them as `{"expr": "..."}`, which only a Cura-compatible evaluator can use.
- **Prusa percentages.** PrusaSlicer accepts values relative to other settings (`external_perimeter_speed = 50%`, widths as % of nozzle). These must stay relative or be resolved at export.
- **G-code macros.** PrusaSlicer/Orca macros (`{if ...}`, `[layer_z]`) and Cura `{setting}` substitution use different languages. Custom G-code is the least portable part of any profile.
- **Positional arrays.** Bambu/Orca per-extruder-variant arrays need the printer's `printer_extruder_variant` list to be decoded.

## Comparison

| Aspect | PrusaSlicer 2.9 (INI) | PrusaSlicer 3.0 alpha (YAML) | Orca / Bambu (JSON) | Cura (JSON + INI) |
|---|---|---|---|---|
| Unit of distribution | one `.ini` per vendor | directory per vendor, one file per preset tree | vendor index + one file per preset | many files per entity type, shared namespace |
| Entities | printer_model, printer (per nozzle), print, filament, physical_printer | printer, printer_config, tool, feeder, sheet; print, tool_print, filament | machine_model, machine (per nozzle), process, filament | definition, extruder, variant (nozzle/buildplate), material (XML), quality, intent, quality_changes, definition_changes |
| Inheritance | multi-parent, last wins, `*abstract*` | multi-parent + `unconditional_inherits` + nested conditional `variants` | single parent + ordered `include` mixins, `instantiation` | single-parent definitions; runtime 8-slot stack |
| Compatibility | `compatible_printers` list or `compatible_printers_condition` | `condition` on nodes against hardware features | list (dominant in Bambu-derived files) or condition; cross-vendor allowed (Orca) | lookup by metadata keys (definition, variant, material, quality_type), `exclude_materials` |
| Value expressions | placeholder-parser macros in G-code only; `%` relatives | same | same | Python expressions in any setting |
| Nozzle model | printer preset per nozzle | `tool` entity with features | printer preset per nozzle; extruder-variant arrays (H2D) | variant container per extruder |
| IDs | names (+ `alias`, `renamed_from`) | random base64 `id` per node | names + `setting_id`, `filament_id`, `base_id` | container IDs, material GUID |
| Versioning | vendor `config_version` + `.idx` ranges | new `.idx` (`1.0.x`) | vendor `version` (4-part) | `setting_version` per container + upgrade plugins |
| Update channel | preset-repo-api.prusa3d.com zip of indices | local `RepositoryManifest.json` (test URLs) | check-version.orcaslicer.com (opt-in) / Bambu OTA via plugin | app releases + Marketplace packages |
| User sync | none built in (snapshots only) | not seen | Orca cloud / Bambu cloud via `.info` sidecar | none (Ultimaker account backups, unverified) |
| Portable bundle | config bundle `.ini` export | n/a in alpha | `.orca_printer`, `.orca_filament`, `.orca_bundle`; `.bbscfg`, `.bbsflmt` | `.curaprofile` (unverified), `.curapackage` |

## Implications for VSSlicer

1. **Read existing profiles; do not maintain a vendor library ourselves for R1.** Write importers that translate PrusaSlicer INI bundles, Orca/Bambu JSON trees and Cura definitions plus fdm_materials into the unified schema, either at install time or on demand. Writing these readers ourselves (they are parsers of data formats) avoids reusing AGPL code. The JSON and INI formats are simple enough to reimplement from this report.
2. **Use a hardware model shaped like PrusaSlicer 3.0's.** Its separation of printer, tool and feeder, with conditional variants, is the only model that avoids combinatorial preset growth. It also matches what the printer APIs report: Bambu AMS slots, Prusa MMU, toolchangers. The unified `nozzle`, `surface` and `feeder` entities follow it. Per-nozzle presets from other slicers are imported by splitting the per-nozzle printer into `printer_model` + `nozzle` + `overrides`.
3. **Implement the condition language once, as a small evaluator in TypeScript that is safe to run anywhere.** Prusa conditions translate by rewriting identifiers. Treat `printer_notes` keyword tests as tags.
4. **Keep the slicer-native form beside the unified one** (`source {format, origin, commit}` plus the original key/value map). Then a round-trip export to the engine we actually slice with (VSS-5, slicing engine embedding) is lossless. The unified layer serves editing, comparison and compatibility, not the engine's input.
5. **Bundle only fdm_materials (CC0) as seed material data.** Treat AGPL/LGPL profile sets as separately licensed data packages, downloaded or installed apart from the extension code. See the licence notes.
6. **Support `.orca_printer`/`.orca_filament`/`.bbscfg`/`.bbsflmt` import early.** Users share profiles this way, and the format is just a zip, one JSON manifest and the preset files.
7. **Store secrets for `printer_instance.connection` in VS Code SecretStorage.** Never put them in profile JSON.

## Licence notes

- **Profile sources:**
  - PrusaSlicer, PrusaSlicer-settings, OrcaSlicer and Bambu Studio profiles are distributed in AGPL-3.0 repositories with no separate data licence.
  - Cura resources are LGPL-3.0. fdm_materials is CC0-1.0.
  - The current Prusa profile repositories (`PrusaSlicer-settings-prusa-fff`, `-non-prusa-fff`) carry no licence file as of 2026-10-25, so the copies inside the AGPL PrusaSlicer repository are the ones with known terms.
- **AGPL / LGPL obligations:** redistributing AGPL or LGPL profile files means passing on the licence text, keeping notices and per-asset attributions (e.g. RatRig's CC-BY bed SVG), and making the files' source available. This is easiest if they ship as an unmodified, separately downloadable data package with a `LICENSE` and a `source.commit`.
- **Whether profile data is code:** it is unsettled whether profile data alone makes a program that reads it a covered work. The safe course is to keep importer code clean-room (written from format documentation such as this report, not from AGPL source) and to ship vendor data separately from extension code (unverified legal position; needs a licence decision by the project owner).
- **Bambu data:** Bambu profiles contain Bambu-assigned IDs (`setting_id`, `filament_id`) that the Bambu cloud and AMS rely on. Reusing them for interoperability is a data question rather than a code question, but Bambu's cloud terms may restrict using them against its services (unverified).
- **Third-party Prusa bundles:** non-Prusa vendor bundles credit other upstreams (slic3r-profiles, VoronDesign forks; see the table in Findings 5). Nobody has assessed the licences of those upstreams, so the AGPL label on PrusaSlicer's copies may not reflect the original terms.
- **Cura definitions:** many are contributed by printer vendors. The repository licence (LGPL-3.0) is the only stated term. No per-file headers were found in `resources/definitions` (`rg -il 'license|copyright'` returned nothing).

## Open questions

- What licences apply upstream to third-party PrusaSlicer bundles (github.com/slic3r/slic3r-profiles, the VoronDesign settings fork)? Not checked.

- Will PrusaSlicer 3.0 ship the YAML preset format, and the `tool`/`feeder`/`sheet` hardware model, unchanged? The 3.0 `RepositoryManifest.json` points at `localhost:8000`, so the production update endpoint for 3.0 is unknown.
- What is the licence of the `PrusaSlicer-settings-prusa-fff` / `-non-prusa-fff` repositories? Ask Prusa, or rely on the AGPL copies.
- Orca/Bambu cloud preset APIs: payload schema and authentication are only partly visible (Orca's agent is open, Bambu's plugin is closed). Do we sync user presets ourselves, or only import and export?
- Which engine's key set becomes canonical for `settings`? The mapping table uses descriptive unified keys, but the slicing engine decision may favour adopting Orca or Cura names directly.
- Cura `=expr` values: implement a Python-subset evaluator, or evaluate them at import for a fixed (printer, nozzle, material) tuple?
- Should `.3mf` project-embedded profiles (Orca/Bambu `Metadata/project_settings.config`, PrusaSlicer `Slic3r_PE.config`) be in this schema's scope? VSS-6 (3MF) covers storage. This card did not check those files.
