# Upstream CLIs as an oracle for profile resolution (PRF-21)

Spike, 2026-10-26. Question: can the upstream slicer CLIs print a fully resolved preset config
(the result of `inherits`/`include` flattening), so each adapter module's tuple tests have an
oracle? Raw notes: `.reference/notes/PRF-21-cli-oracle.md`.

All runs used fixture copies of the vendor trees in a scratch directory, ran from that
directory with `timeout 120`, and passed a scratch `--datadir` and `--outputdir`. Nothing was
written to `~/Library/Application Support` or inside a clone. No GUI window opened: passing
any action (here `--export-settings`) skips the GUI start (`OrcaSlicer@09aa0114:src/OrcaSlicer.cpp:1424`).

Licence: both CLIs and every profile tree used are AGPL-3.0 (`docs/research/profiles.md:341-342`).
Running a CLI as a test oracle does not link its code. Golden files that the CLI generates from
AGPL profile data are profile data and need the same handling as the profiles
(`docs/research/profiles.md:345-346`).

## OrcaSlicer: yes, fully resolved for system presets

- **Version:** installed `/Applications/OrcaSlicer.app`, `CFBundleShortVersionString`
  2.5.0-dev (binary built 2026-10-06); `--help` prints `OrcaSlicer-2.5.0-dev`. The source was
  read at `OrcaSlicer@09aa0114` (2.5.0-dev, 2026-10-25).
- **Command** (fixture: the `Voron` and `OrcaFilamentLibrary` trees plus their `Voron.json` and
  `OrcaFilamentLibrary.json` manifests, copied from `OrcaSlicer@09aa0114:resources/profiles/`
  into `<scratch>/profiles/`):

  ```sh
  OrcaSlicer --datadir <scratch>/datadir --outputdir <scratch>/out \
    --load-settings "<scratch>/profiles/Voron/machine/Voron 2.4 250 0.4 nozzle.json;<scratch>/profiles/Voron/process/0.20mm Standard @Voron.json" \
    --load-filaments "<scratch>/profiles/OrcaFilamentLibrary/filament/Generic PLA Matte @System.json" \
    --export-settings -        # or a file path
  ```

  Exit 0, no model needed. `-` writes the JSON to stdout and refuses to combine with any other
  action that writes there (`src/OrcaSlicer.cpp:1405-1422`, `src/libslic3r/PrintConfig.cpp:12898-12902`).
- **Resolved:** yes. A `--load-settings` file that has a non-empty `inherits` and
  `from: system` is resolved by locating the nearest ancestor directory with a sibling
  `<vendor>.json` manifest. Orca then loads that whole vendor tree with its normal vendor loader,
  library inheritance included, and takes the flattened preset whose file path matches the
  input file (`src/OrcaSlicer.cpp:2074-2113`, `src/libslic3r/PresetBundle.cpp:555-668`).
  The resolver reads the fixture tree, not the app's bundled profiles. To prove it, I changed
  `retraction_length` in the fixture's grandparent `fdm_klipper_common.json` to `4.321`, and
  the export showed `["4.321"]`.
- **Compared with a hand merge** (an inherits/include chain merge, child wins, over the fixture
  tree, key by key):
  - Machine `Voron 2.4 250 0.4 nozzle`: 55 of 57 merged keys equal.
  - Process `0.20mm Standard @Voron`: 106 of 109 equal.
  - Filament `Generic PLA Matte @System`: all of its values equal at slot 0, but the
    per-filament vectors are repeated once per slot.
  - The residual differences are all systematic (next list).
- **How to read it:** the output is one flat JSON object, `name: "project_settings"`,
  `from: "project"`, with 727 keys. It holds machine, process and filament together, plus the
  defaults for every key no preset sets. Normalise these before comparing:
  - Numbers are re-serialised (`"0.10"` becomes `"0.1"`), scalars stay strings, and vectors
    stay string arrays.
  - `printer_settings_id`, `print_settings_id` and `filament_settings_id` are set to the preset
    names; `inherits` is dropped and `inherits_group` is `["",""]`.
  - Bookkeeping keys such as `compatible_printers` are dropped (`src/OrcaSlicer.cpp:3106`).
  - Legacy keys are translated: `wall_infill_order` is missing and appears as `wall_sequence`
    (`src/libslic3r/PrintConfig.cpp:9841`).
  - Filament vectors have one entry per slot; read index 0.
  - Compare only the keys the hand merge (or the adapter) produces. The export cannot tell an
    inherited value from a default.
- **Limits:**
  - User presets (`from: User`) resolve only through a bundle loaded from `data_dir`. With an
    empty scratch datadir the run fails: `datadir/system` is missing, exit 251. With
    `datadir/system` and `datadir/user/default/process/` filled by hand, the user preset still
    failed with "Preset was not found in the loaded bundle". I did not pursue this further.
    A user preset is its system parent plus its own keys, so the system-preset oracle covers
    the hard part.
  - This resolver is new code. Orca releases before the installed 2.5.0-dev nightly were not
    tested (unverified whether they resolve).
  - The Voron chain does not exercise `include`.

## Bambu Studio: no, the export is not resolved

- **Version:** installed `/Applications/BambuStudio.app`, 02.08.02.61 (binary 2026-08-20);
  `--help` prints `BambuStudio-02.08.02.61`. The source was read at `BambuStudio@79df7ae3`
  (02.08.04.57).
- **Command** (fixture: `BBL/` and `BBL.json` copied from `BambuStudio@79df7ae3:resources/profiles/`):

  ```sh
  BambuStudio --datadir <scratch>/datadir --outputdir <scratch>/out \
    --load-settings "<scratch>/profiles/BBL/machine/Bambu Lab X1 Carbon 0.4 nozzle.json;<scratch>/profiles/BBL/process/0.20mm Standard @BBL X1C.json" \
    --export-settings <scratch>/out/x1c.json
  ```

  Exit 0. Bambu's `--export-settings` takes a file only, with no `-` for stdout
  (`src/BambuStudio.cpp:6414-6418`).
- **Resolved:** no. `load_config_file` reads the single JSON with `load_from_json` and never
  follows `inherits` (`src/BambuStudio.cpp:2296-2345`). Every key the file does not set
  itself takes the `FullPrintConfig` default.
  - Machine: 81 of 107 hand-merged keys equal, the file's own keys. For example
    `printable_height` came out `100` (the default), not the inherited `250`;
    `printable_area` came out 200x200, not 256x256; and `machine_start_gcode` was the generic
    default.
  - Process: 138 of 192 equal.
- **Why:** the CLI expects system presets already flattened into `profiles/BBL/machine_full/`,
  `process_full/` and `filament_full/` (`src/BambuStudio.cpp:2397`, `:2816`, `:2886`). Neither
  the clone nor the installed app ships those directories. They come from a build or cloud
  step outside the repository (unverified).
- **Cross-check through Orca:** running the Orca CLI on the same Bambu `BBL` tree resolves
  it.
  - Machine: 100 of 107 keys equal.
  - Process: 135 of 192 equal.
  - The misses are Bambu-only keys that Orca does not know and drops (for example
    `enable_circle_compensation`, `prime_tower_lift_speed`), plus enum values Orca substitutes
    (`support_ironing_pattern` `zig-zag` becomes `rectilinear`).

## PrusaSlicer: probably yes (from source reading only, unverified)

Not installed on this machine, so this section is from source reading only and is unverified.

- **2.9 (released):** the options are `--datadir`, `--printer-profile`, `--print-profile`,
  `--material-profile` and `--save <file>` ("Save configuration to the specified file")
  (`PrusaSlicer-2.9@b028299c:src/libslic3r/PrintConfig.cpp:5990-6003`, `:6056-6059`, `:6207`).
  Expected command:

  ```sh
  prusa-slicer --datadir <scratch-with-vendor/PrusaResearch.ini> \
    --printer-profile "Original Prusa MK4S 0.4 nozzle" --print-profile "<print>" \
    --material-profile "<filament>" --save <scratch>/out.ini
  ```

  System presets are stored flattened when the bundle loads (`docs/research/profiles.md:36`).
  The saved config of a selected system preset should therefore be fully resolved, with
  `*common*` parents applied in "last parent wins" order. The 2.9 clone has no CLI source
  (`src/PrusaSlicer.cpp` is absent), so I could not check how `--save` handles the selected
  profiles.
- **3.0.0-alpha12 (`PrusaSlicer@30ef5919`):** the same option names
  (`src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp:5862-5880`, `:5932-5935`,
  `:6083`).
  - `--save` writes JSON, not INI: preset metadata plus "configuration boxes", the project JSON
    format stored in 3MF, built from the selected config container
    (`src/slic3r-app-cli/src/Slic3r/App/CLI/ProcessActions.cpp:660-700`).
  - The profiles are selected by name when `has_full_config_from_profiles` is true
    (`src/slic3r-app-cli/src/Slic3r/App/CLI/LoadPrintData.cpp:235-250`, `:419-465`).
  - The vendor data is the 3.0 YAML tree, so the format does not match the 2.9 INI importer.

## Decision: which oracle each tuple test uses

| Ecosystem | Tuple-test oracle | How |
|---|---|---|
| Orca | **CLI export**, checked in as golden files | A maintainer runs the command above against the vendored fixture tree and commits the normalised result with the Orca version and fixture commit. The test compares only the keys the adapter resolves, after the normalisation listed above. CI never runs Orca. |
| Bambu | **Hand-checked expectations** citing `docs/research/profiles.md:94-102` (single `inherits`, ordered `include`, `instantiation`, `filament_id` inheritance) | The Bambu CLI cannot resolve. The Orca CLI export may serve as a second check, but only for keys both slicers know. Bambu-only keys and enum values stay hand-checked. |
| PrusaSlicer | **Hand-checked expectations** citing `docs/research/profiles.md:31-37` (ordered multi-parent `inherits`, last parent wins, `*abstract*` sections removed, `renamed_from` never inherited, `custom_parameters_*` deep-merged) | No binary to verify against. Use `--save` from 2.9 as a golden-file generator once a PrusaSlicer install is available (unverified until then). |
