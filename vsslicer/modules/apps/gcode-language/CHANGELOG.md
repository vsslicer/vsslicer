# Changelog

## 0.1.0

- GCP-46: catalogue entries for Marlin 2 and Prusa Buddy (46: every G/M code the corpus uses, Buddy-only codes marked unverified where unsure).
- GCP-45: the command catalogue: entry schema (code, parameters, flavours, our own description, source link), validator (sources: reprap.org G-code wiki, marlinfw.org, docs.duet3d.com, the Prusa Buddy and OrcaSlicer repositories, the Klipper reference; G/M/T or Klipper extended-command codes; no duplicate code per flavour), a loader over `catalogue/*.json`, and a lint test over the shipped catalogue.
- GCP-44: status-bar item with the detected G-code flavour of the active `gcode` document (`;FLAVOR:` / `; gcode_flavor =` in the first 64 KiB, last wins; `generic` when unknown), and the `vsslicer.gcode.flavourOverrides` setting (file path to flavour) to override it per file. Activates on `onLanguage:gcode`.
- GCP-43: the `gcode` language (`*.gcode`, `*.g`, `*.gco`, `*.nc`) with a language configuration and the `source.gcode` TextMate grammar: G/M/T codes, parameters, line numbers and checksums, `;` and `( )` comments, Klipper extended commands with `KEY=value` parameters and RepRapFirmware meta commands, `[var]` and `{expr}` placeholders. Declarative: no code runs. `[gcode]` configuration defaults keep large-file optimisations (tokenisation off past 20 MB) on.
