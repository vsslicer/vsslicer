# Printer position fields for live preview follow

What Bambu (H2C), PrusaLink and Moonraker report about where a running print is, and the position
type the G-code preview's follow API takes. Researched 2026-10-26 (GCP-49). Raw notes:
`.reference/notes/GCP-49-position-fields.md`.

Sources: ha-bambulab@0e027ff (MIT), BambuStudio@79df7ae and OrcaSlicer@09aa0114 (AGPL-3.0),
Prusa-Firmware-Buddy@1ce23f33 (firmware 6.10.1, GPL-3.0), Prusa-Link@c42de4b ("Freeware" per setup.py),
Prusa-Link-Web@a67f306 (GPL-3.0), klipper@ee2c6fb and moonraker@b559b9a (GPL-3.0). Only field names
and semantics are used; no code is reused, so none of these licences reaches our code.

## Findings

### Bambu H2C (firmware 01.01.00.00)

The only H2C capture is ha-bambulab's recorded `pushall`, firmware `ota` 01.01.00.00
(ha-bambulab@0e027ff:custom_components/bambu_lab/pybambu/mock_data/MOCK-H2C.json:646-649). It is
of a failed job at layer 0 (:382, :439), so it shows which fields exist, not how they change.

- Reported: `layer_num` and `total_layer_num` (:439, :533, repeated under `3D`, :42-45),
  `mc_percent` (:462), `mc_remaining_time` (:466), `gcode_file` "/data/Metadata/plate_1.gcode" (:380).
- Not reported: a byte offset or a line number. `mc_print_line_number` appears in the A1, A2L and
  P1P captures (MOCK-A1.json:80, MOCK-A2L.json:49, MOCK-P1PNOAMS.json:77), not in H2C's. Bambu
  Studio parses it (BambuStudio@79df7ae:src/slic3r/GUI/DeviceManager.cpp:3099-3101) and never uses it.
- The H2C layer-change G-code emits `M73 L{layer_num+1}` (BambuStudio@79df7ae:resources/profiles/BBL/machine/Bambu Lab H2C 0.4 nozzle template layer_change_gcode.json:4)
  and the slicer writes `M73 P.. R..` (src/libslic3r/GCode/GCodeProcessor.cpp:1666). So `layer_num`
  is most likely 1-based and `mc_percent` time-based (unverified: needs a mid-print capture).
- The printed file is text `.gcode` from the 3MF; no source shows Bambu reading `.bgcode` (unverified).

### PrusaLink

- In firmware (MK4, XL, MINI, Core One, the `.bgcode` printers): `/api/v1/status` and `/api/v1/job`
  give `progress` (percent), `time_remaining`, `time_printing`, and `axis_z`; X and Y are dropped
  while printing (Prusa-Firmware-Buddy@1ce23f33:lib/WUI/nhttp/status_renderer.cpp:37-46, 69-73;
  lib/WUI/link_content/basic_gets.cpp:434-438). The legacy `/api/job` has no `filepos`
  (basic_gets.cpp:372-379).
- `progress` is the M73 P value, falling back to bytes executed over an estimated stream size,
  capped at 99 (src/common/marlin_server.cpp:3684-3692). The decoded-stream position exists inside
  the firmware but no API exposes it.
- Prusa-Link on a Raspberry Pi (MK3, text G-code only) hard-codes legacy `"filepos": 0`
  (Prusa-Link@c42de4b:prusa/link/web/main.py:503-511).
- So PrusaLink reports no byte offset into `.bgcode` (or `.gcode`), no layer and no line: only
  percent and Z. The v1 spec agrees (Prusa-Link-Web@a67f306:spec/openapi.yaml:1243-1258, 1480-1512).

### Moonraker (for comparison)

- `virtual_sdcard.file_position` is a byte offset into the text file, with `file_size` and
  `progress` (klipper@ee2c6fb:docs/Status_Reference.md:626-630). `print_stats.info.current_layer`
  only when the G-code calls `SET_PRINT_STATS_INFO` (:421-424).

## Comparison

| | byte offset | layer | Z | percent | line |
|---|---|---|---|---|---|
| Bambu H2C | no | `layer_num` (1-based, unverified) | no | `mc_percent` | no (A1/P1 only) |
| PrusaLink (Buddy) | no | no | `axis_z` | `progress` | no |
| Prusa-Link (Pi) | `filepos` always 0 | no | `axis_z` | `progress` | no |
| Moonraker | `file_position` | if `SET_PRINT_STATS_INFO` | via toolhead (unverified) | `progress` | no |
| OctoPrint | `filepos` | not researched | not researched | `completion` | no |
| RepRapFirmware | `filePosition` | not researched | not researched | not researched | no |

## Implications for VSSlicer

The follow API takes one serialisable type with optional fields, resolved in order of precision
(proposed decision D20):

```ts
interface PrintPosition {
  fileOffset?: number; // bytes in the decoded G-code text, the Move.fileOffset space
  layer?: number;      // 1-based, as printers report it
  z?: number;          // nozzle Z, mm
  percent?: number;    // printer's progress, 0..100
}
```

`fileOffset` gives the exact move; `layer` and `z` give a layer; `percent` is approximate. Exact
follow is possible where the printer reports a byte offset: Moonraker, and also OctoPrint
(`progress.filepos`, OctoPrint@64d8cd11:docs/api/job.rst:223, AGPL-3.0) and RepRapFirmware
(`job.filePosition`, RepRapFirmware@aebf6295:src/PrintMonitor/PrintMonitor.cpp:74, GPL-3.0); none on
Bambu or PrusaLink. (Added by reviewer gcp49-review; OctoPrint and RRF rows not otherwise researched.) Resolving `percent` well needs the M73 P values, which the
parser drops today (M73 is kept as a bare marker: vsslicer/modules/gcode-parser/src/domain/machine.ts:125).

## Open questions

- A mid-print H2C capture to confirm `layer_num` = `M73 L` and `mc_percent` = `M73 P` (asked on GCP-49).
- Whether Bambu's layer count matches our Z-derived layer table on a Bambu file.
