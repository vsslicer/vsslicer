---
id: US5
title: "Read Bambu Studio and OrcaSlicer projects without loss"
status: reviewed
epic: VSS:E8
---

As a user with Bambu or Orca projects, I want plates, objects, parts, instances and per-object config read into one `Project` structure, so that nothing in my project is lost when it opens.

## Acceptance criteria

- [ ] `project_settings.config` JSON and embedded `*_settings_N.config` presets are returned as raw blobs
- [ ] `model_settings.config` plates, objects, parts and instances, `slice_info.config`, `plate_N.json`, `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt` and `cut_information.xml` are read; painting attributes are kept as raw per-triangle strings
- [ ] Plate, object, instance and per-object metadata match a JSON golden file hand-checked against the upstream GUI
- [ ] Ported code names its upstream (`OrcaSlicer@09aa0114`, `BambuStudio@79df7ae`: `src/libslic3r/Format/bbs_3mf.cpp`), keeps the notice and the `Ported from` line (D2)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Turning config into unified profiles (E12)
- Writing Bambu projects (E31)
