# Changelog

## 0.1.0

- GCP-43: the `gcode` language (`*.gcode`, `*.g`, `*.gco`, `*.nc`) with a language configuration and the `source.gcode` TextMate grammar: G/M/T codes, parameters, line numbers and checksums, `;` and `( )` comments, Klipper extended commands with `KEY=value` parameters and RepRapFirmware meta commands, `[var]` and `{expr}` placeholders. Declarative: no code runs. `[gcode]` configuration defaults keep large-file optimisations (tokenisation off past 20 MB) on.
