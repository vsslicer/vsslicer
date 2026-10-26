---
id: 49
title: "Spike: Bambu push_status and PrusaLink position fields"
type: spike
priority: P1
effort: S
model: opus
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [PLT-2, PLT-8]
created: 2026-10-25
---

The position type must not freeze on guesses. Needs a recorded H2C `push_status` capture from the printers project (PRN), which may not exist yet; if so, ask the owner on the board for a capture or freeze `{layer, percent?}` as unverified.

## Acceptance criteria

- [x] A note in `.reference/notes/` records which fields Bambu reports (H2C firmware version recorded) and whether PrusaLink reports byte offsets into `.bgcode`
- [x] The note proposes the final position type, recorded as a decision on the VSS board if it changes the plan

## Tasks

- [x] Read ha-bambulab and PrusaLink docs
- [x] Inspect the recorded capture
- [x] Write the note

## Progress

Done (gcp49-worker, 2026-10-26). Research only, no code in `vsslicer/`.

- Bambu H2C: used ha-bambulab's recorded H2C pushall (MOCK-H2C.json, ota fw 01.01.00.00, a failed
  job at layer 0). Reports `layer_num`/`total_layer_num` (also under `3D`), `mc_percent`,
  `mc_remaining_time`, `gcode_file` (plain `.gcode` from the 3MF). No byte offset, no line number
  (`mc_print_line_number` only in A1/A2L/P1P captures; Studio parses it and never uses it).
  `layer_num` is most likely the 1-based `M73 L` value: unverified, needs a mid-print capture.
- PrusaLink: Buddy firmware 6.10.1 (the `.bgcode` printers) reports no byte offset into `.bgcode`
  or `.gcode`, no layer, no line: only `progress` (M73 P, else estimated byte ratio) and `axis_z`.
  Prusa-Link on the Pi hard-codes legacy `filepos: 0`.
- Moonraker: `virtual_sdcard.file_position` (bytes into text G-code), `progress`, optional layer.
- Proposed type (D20): `PrintPosition { fileOffset?, layer? (1-based), z?, percent? }`, resolved
  fileOffset > layer > z > percent. Changes GCP-50's plan (was file offset only / `{layer, percent?}`).
  Suggested follow-up card: keep M73 P/L values in gcode-parser/gcode-api.
- Asked the owner for a mid-print H2C capture: Q17 (not blocking).
- Cloned for this card: `.reference/repos/Prusa-Firmware-Buddy` @1ce23f33, `.reference/repos/Prusa-Link` @c42de4b.
- Licences: Bambu Studio/Orca AGPL-3.0, Buddy GPL-3.0, ha-bambulab MIT; nothing reused.

Verified by reading sources (citations in the report); no build or tests apply.
Not done: live Bambu semantics (waits on Q17). No CHANGELOG lines (no module changed).

Files created:
- `.reference/notes/GCP-49-position-fields.md`
- `docs/research/printer-position-fields.md`
- `.ai/kanban/decisions/D20-print-position-type.md`

Review (gcp49-review): PASS. All repo@commit:path:line citations checked against .reference/repos at the stated commits (ha-bambulab MOCK-H2C.json fw/fields/lines, MOCK-A1/A2L/P1P line numbers, BambuStudio DeviceManager.cpp/.hpp, H2C layer_change template M73 L{layer_num+1}, GCodeProcessor.cpp:1666, Buddy status_renderer/basic_gets/marlin_server/gcode_reader_interface/render.cpp, Prusa-Link main.py:503-511/:594, setup.py:129, Prusa-Link-Web specs, klipper Status_Reference/virtual_sdcard.py, moonraker simplyprint.py, OrcaSlicer MoonrakerPrinterAgent.cpp) and our parsed-file.ts / machine.ts:125 (M73 falls to the bare-marker default); all say what is claimed. Unverified Bambu semantics marked; Q17 is in the inbox; licences noted; D20 follows from the evidence; nothing for D16 / Bambu LAN started. Doc-only fixes made in place: (1) docs/research/printer-position-fields.md said "Exact follow is only possible on Moonraker", contradicted by OctoPrint@64d8cd11:docs/api/job.rst:223 (`progress.filepos`) and RepRapFirmware@aebf6295:src/PrintMonitor/PrintMonitor.cpp:74 (`job.filePosition`); sentence corrected, two table rows added marked "not researched", Moonraker Z marked unverified. (2) D20 named a non-existent package `@vsslicer/gcode`; corrected to `@vsslicer/gcode-api`. Open for the coordinator: whether PrintPosition belongs in gcode-api (printer adapters then depend on it) or printer-api; Elegoo SDCP `CurrentLayer` and other ecosystems not covered (out of this card's scope).
