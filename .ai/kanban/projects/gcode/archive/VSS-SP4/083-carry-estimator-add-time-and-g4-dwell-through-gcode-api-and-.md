---
id: 83
title: Carry ESTIMATOR_ADD_TIME and G4 dwell through gcode-api and the parser to the planners
type: feature
priority: P1
effort: L
model: opus
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-83-worker
depends_on: [20]
created: 2026-10-25
---

Module: gcode-api (contract) then gcode-parser (adapter). Split from GCP-20 (SP3 review): `; ESTIMATOR_ADD_TIME <s>` comments and the `G4 P/S` dwell length do not reach the planner, because the parser drops comments and keeps G4 as a bare marker. The Klipper planner already accepts macro time via `KlipperOptions.addTime`.

## Acceptance criteria

- [x] gcode-api carries a dwell/added-time value on the marker (contract change, minor version)
- [x] gcode-parser fills it from `G4 P<ms>`/`G4 S<s>` and `; ESTIMATOR_ADD_TIME` (tests)
- [ ] The Klipper planner adds both; Marlin and RRF add G4 dwell (harness case). Klipper and Marlin done; RRF moves to GCP-27

## Progress

Done (Klipper and Marlin parts of criterion 3; RRF dwell moves to GCP-27, which writes the RRF planner and should call `checkDwell` from the harness).

- gcode-api 0.5.0 (published): `Marker.seconds?: number`, seconds the command takes by itself, on `G4` (dwell as the flavour reads it, 0 when none) and the new `ESTIMATOR_ADD_TIME` marker. Additive. README, CHANGELOG, type-shape test.
- gcode-parser 0.9.0 (published, gcode-api ^0.5.0): `G4` dwell per flavour: Marlin and RRF `S` s over `P` ms (Marlin@2ef3ee6 G4.cpp:33-34, RepRapFirmware@aebf629 GCodes.cpp:3728), Klipper `P` only (klipper@ee2c6fb toolhead.py:567); none/negative/infinite = 0. Whole-line `; ESTIMATOR_ADD_TIME <s> [label]` becomes an `ESTIMATOR_ADD_TIME` marker (klipper_estimator@dbcff4a planner.rs:171-178); empty, negative or non-numeric values are ignored. Tests in `test/commands.test.ts`.
- gcode-planner (Unreleased, gcode-api ^0.5.0): Klipper adds G4 seconds and ESTIMATOR_ADD_TIME (full flush each, also after the last move); `addTime` option kept for macro time the caller knows of. Marlin/Buddy synchronize at G4 (queue drains, next block starts from safe speed, planner.cpp:2522/2693) and add the dwell. New `TimingBuilder.dwell`. Harness `checkDwell` (before first move, mid-file, after last move) run for Klipper, Marlin, Buddy; plus Klipper file-marker test and Marlin G4 stop test.
- Not done: M400 still does not synchronize the Marlin planner (out of scope). The parser reads ESTIMATOR_ADD_TIME only from whole-line comments (as the slicer tags), not trailing ones. A file parsed as Marlin but planned with Klipper keeps the Marlin reading of `G4 S`.

Verified: in each module `pnpm install && pnpm lint && pnpm test && pnpm build` (api 13, parser 291, planner 54 tests); parser and planner `CI=true npm_config_store_dir=$(mktemp -d) pnpm install --frozen-lockfile` and tests pass.

Files: vsslicer/modules/gcode-api/{src/domain/parsed-file.ts, test/types.test.ts, README.md, CHANGELOG.md, package.json}; vsslicer/modules/gcode-parser/{src/domain/machine.ts, src/domain/chunk-writer.ts, src/domain/slicer-tags.ts, test/commands.test.ts, README.md, CHANGELOG.md, package.json, pnpm-lock.yaml}; vsslicer/modules/gcode-planner/{src/domain/klipper.ts, src/domain/marlin.ts, src/domain/timing.ts, test/harness.ts, test/klipper.test.ts, test/marlin.test.ts, CHANGELOG.md, package.json, pnpm-lock.yaml}; .reference/notes/GCP-83-estimator-add-time-dwell.md.
