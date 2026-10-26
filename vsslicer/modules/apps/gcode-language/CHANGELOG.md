# Changelog

## 0.1.0

- GCP-44: status-bar item with the detected G-code flavour of the active `gcode` document (`;FLAVOR:` / `; gcode_flavor =` in the first 64 KiB, last wins; `generic` when unknown), and the `vsslicer.gcode.flavourOverrides` setting (file path to flavour) to override it per file. Activates on `onLanguage:gcode`.
- GCP-43: the `gcode` language (`*.gcode`, `*.g`, `*.gco`, `*.nc`) with a language configuration and the `source.gcode` TextMate grammar: G/M/T codes, parameters, line numbers and checksums, `;` and `( )` comments, Klipper extended commands with `KEY=value` parameters and RepRapFirmware meta commands, `[var]` and `{expr}` placeholders. Declarative: no code runs. `[gcode]` configuration defaults keep large-file optimisations (tokenisation off past 20 MB) on.
