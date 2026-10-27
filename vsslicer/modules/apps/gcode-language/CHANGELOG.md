# Changelog

## 0.2.4

- The grammar snapshot test quotes its glob with double quotes, so it runs on Windows (PLT-216).

## 0.2.3

- Repository URL points at github.com/vsslicer/vsslicer (PLT-214).

## 0.2.2

- Moved to `vsslicer/modules/apps/gcode-language`; the repository URL follows (PLT-204).

## 0.2.1

- PRF-179: the 36 Bambu catalogue entries no longer quote OrcaSlicer BBL template comments (AGPL-3.0-only); their descriptions are our own wording, so the module stays AGPL-3.0-or-later. PROVENANCE.md says so and is published with the package.

## 0.2.0

- GCP-103: files over 4 MB are scanned for unknown commands on open and save, not after every edit.
- GCP-106: README and PROVENANCE describe the shipped features, the setting and the catalogue's sources and licences.
- GCP-104: the catalogue lint rejects unknown flavours, leading-zero codes and duplicates across files (M104 is no longer listed for klipper in reprap.json).
- GCP-99: the base firmware comes from gcode-api's `flavourFromName` (depends on ^0.7.0), so Cura's `RepRap` uses the RepRapFirmware catalogue, falling back to Marlin entries it lacks.
- GCP-100: the flavour is read from the last 64 KiB too (head wins), so PrusaSlicer, SuperSlicer and Orca files with the config block at the end are no longer generic; Klipper G21 and the Prusa-Firmware codes G80, M403, M702, M862.1 and M862.3 (for Marlin) added.
- GCP-98: Bambu Lab files (Bambu Studio, Orca) use the Bambu catalogue, and Prusa Buddy printers the Buddy one, both falling back to Marlin, so standard and Bambu codes no longer warn as unknown; added G17, M105, M114, M117, M220, M400, T1 and 12 Bambu codes; `bambu` and `prusa-buddy` can be chosen in `flavourOverrides`.

## 0.1.0

- GCP-48: hover, completion and unknown-command warnings from the catalogue (filtered by the status-bar flavour, warnings only when it is known), slicer tag hovers, and for files over 50 MB (which VS Code does not give extensions) a message with "Open in preview"; activates on startup finished to see them. Integration tests per flavour on VS Code 1.100.0 and stable.
- GCP-47: catalogue entries for Klipper (55, extended commands included), RepRapFirmware (14) and Bambu (24, undocumented and unverified, cited from OrcaSlicer@09aa0114 BBL templates).
- GCP-46: catalogue entries for Marlin 2 and Prusa Buddy (46: every G/M code the corpus uses, Buddy-only codes marked unverified where unsure).
- GCP-45: the command catalogue: entry schema (code, parameters, flavours, our own description, source link), validator (sources: reprap.org G-code wiki, marlinfw.org, docs.duet3d.com, the Prusa Buddy and OrcaSlicer repositories, the Klipper reference; G/M/T or Klipper extended-command codes; no duplicate code per flavour), a loader over `catalogue/*.json`, and a lint test over the shipped catalogue.
- GCP-44: status-bar item with the detected G-code flavour of the active `gcode` document (`;FLAVOR:` / `; gcode_flavor =` in the first 64 KiB, last wins; `generic` when unknown), and the `vsslicer.gcode.flavourOverrides` setting (file path to flavour) to override it per file. Activates on `onLanguage:gcode`.
- GCP-43: the `gcode` language (`*.gcode`, `*.g`, `*.gco`, `*.nc`) with a language configuration and the `source.gcode` TextMate grammar: G/M/T codes, parameters, line numbers and checksums, `;` and `( )` comments, Klipper extended commands with `KEY=value` parameters and RepRapFirmware meta commands, `[var]` and `{expr}` placeholders. Declarative: no code runs. `[gcode]` configuration defaults keep large-file optimisations (tokenisation off past 20 MB) on.
