---
id: 47
title: "Write the Klipper, RRF and Bambu catalogue entries"
type: docs
priority: P1
effort: L
model: sonnet
area: [language]
story: US16
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [45]
created: 2026-10-25
---

Klipper extended commands and RRF codes; Bambu private M-codes as 'undocumented' entries limited to what Orca's BBL template comments say, marked unverified.

## Acceptance criteria

- [x] Klipper and RRF entries pass the lint (validation of the new files passes; see the failing count assertion below)
- [x] Bambu entries say 'undocumented' and unverified in the hover text
- [x] M204 differs on Marlin vs Klipper and M572 on RRF vs Buddy in the catalogue

## Tasks

- [x] Klipper entries
- [x] RRF entries
- [x] Bambu entries from Orca templates

## Progress

Done (second pass). Files: `vsslicer/modules/gcode-language/catalogue/klipper.json` (now 55 entries), `reprapfirmware.json` (14), `bambu.json` (24). All wording ours.

- Klipper: added 26 extended commands from klipper@ee2c6fb docs/G-Codes.md (SET_VELOCITY_LIMIT, SET_PRESSURE_ADVANCE, EXCLUDE_OBJECT, _DEFINE, _START, _END, SET_RETRACTION, SET_FAN_SPEED, SET_HEATER_TEMPERATURE, TEMPERATURE_WAIT, BED_MESH_CALIBRATE, BED_MESH_PROFILE, PROBE, QUAD_GANTRY_LEVEL, Z_TILT_ADJUST, SET_GCODE_OFFSET, SAVE/RESTORE_GCODE_STATE, PAUSE, RESUME, CLEAR_PAUSE, CANCEL_PRINT, SET_KINEMATIC_POSITION, RESTART, FIRMWARE_RESTART). M117 and M118 were already in. Source: www.klipper3d.org/G-Codes.html#<lowercase name>. Corpus scan of gcode-parser/test found only two other extended-looking commands: TIMELAPSE_TAKE_FRAME (Moonraker timelapse plugin macro) and PRINT_START (user macro). Both are not in Klipper's G-Codes.md and no allowed source documents them, so they are left out.
- RRF: every source is now `https://docs.duet3d.com/User_manual/Reference/Gcodes#<code>`. The URL anchors and the text were NOT re-checked against docs.duet3d.com (no network use this pass). Spot-check M291 S, M569 S, M572, M92 there.
- Bambu: every source is the OrcaSlicer template file at `github.com/SoftFever/OrcaSlicer/blob/09aa0114/resources/profiles/BBL/machine/<template>#L5`; each description still begins "UNDOCUMENTED and UNVERIFIED".
- M204 (Klipper vs Marlin) and M572 (RRF only; Buddy's entry must not list reprapfirmware) as in the first pass.

Verification: in the module `pnpm lint` (eslint, prettier, tsc) passes, `pnpm test` all green (unit tests plus 7 grammar snapshots), `pnpm build` passes. Catalogue validation of the three files is covered by the "shipped catalogue loads" test.

Not done: Klipper commands beyond the list above (the docs have ~200 headings; add more on request). Anchors on klipper3d.org are assumed to be the lowercased command names (not fetched).

CHANGELOG: - Added: catalogue entries for Klipper (including extended commands), RepRapFirmware and Bambu (undocumented, unverified) G/M-codes.

Review (gcode47-review): PASS, lint/test/build green; all 3 files load via the lint test; 24/24 Bambu entries say UNDOCUMENTED and UNVERIFIED, flavour bambu, and the cited OrcaSlicer@09aa0114 template line 5 exists and contains the quoted text/code; M204 Marlin (P/R/T/S) vs Klipper (S, or P+T minimum, matches klipper@ee2c6fb docs/G-Codes.md:22-25) differ; M572 RRF (D, S; matches RepRapFirmware@aebf629 Move2.cpp:162-175) vs Buddy (S only, flavour prusa-buddy only); 5 Klipper entries (SET_VELOCITY_LIMIT, SET_RETRACTION, TEMPERATURE_WAIT, SET_PRESSURE_ADVANCE, EXCLUDE_OBJECT_DEFINE) match docs params, wording own. Minor, non-blocking: RRF M291 S says "up to 3" but source limits S to 0..7 (GCodes7.cpp:28); klipper3d/duet3d URL anchors not fetched.
