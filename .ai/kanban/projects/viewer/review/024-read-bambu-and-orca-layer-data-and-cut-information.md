---
id: 24
title: Read Bambu and Orca layer data and cut information
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [22]
created: 2026-10-25
---

Reads `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt` and `cut_information.xml` into the Project; unknown attributes stay raw.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Each file on the fixtures yields the golden structure; a missing file is fine
- [x] Notice and `Ported from` line present

## Tasks

- [x] Four readers
- [x] Golden checks

## Progress

Done by sp11-vwr-24. Files: `src/adapters/bambu/readLayerData.ts` (new, notice and `Ported from` line present), wired in `readBambu.ts`;
`src/domain/project/project.ts` gains `customGcodes`, `layerRanges`, `layerHeightProfiles`, `cuts` (default `[]`) and their types; tests in `test/readLayerData.test.ts`.

Fixtures: pa_pattern.3mf (custom_gcode_per_layer.xml with 4 layers, cut_information.xml) and auto_pa_line_single.3mf (4 cut objects) are real goldens.
No fixture holds layer_config_ranges.xml or layer_heights_profile.txt for Bambu/Orca, so those two are tested on synthetic parts that follow the upstream parser (:3053, :2991).
A bad part is a notice and is kept in `preserved`, never a throw. Bounds: 16 MB per part, 200k elements/profile values per part, depth 64, notices capped at 20.

Verification (macOS; CI gate runs ubuntu): `pnpm lint` ok, `pnpm build` ok, `pnpm test` 20 files / 309 tests ok, `node scripts/run.mjs checks` ok.

Mutation probes (each made the named test fail): legacy gcode mapping, plate without plate_info, profile `<= 4`, profile odd count, notice cap, element cap, depth cap, equal-bounds range merge, part size cap, duplicate cut object, profile value budget, connector unknown-attribute split, loose-layer drop when plates exist (found by a first survivor, test added).

Release lines:
- CHANGELOG: `Bambu and Orca projects expose custom G-code per layer (per plate), layer config ranges, layer height profiles and cut information (Project.customGcodes, layerRanges, layerHeightProfiles, cuts).`
- index.ts exports: `export type { CustomGcode, PlateCustomGcodes, LayerRange, LayerHeightProfile, CutConnector, CutInfo } from './domain/project/project.ts';`
- Note: `test/support/projectJson.ts` was not extended (shared with card 023's golden); the layer data is checked in `test/readLayerData.test.ts`.

**Carried to SP12 (sp11-coordinator, 14:26):** built and in review, but no reviewer could be dispatched (the permission classifier refused the review dispatches, Q29). The unreviewed work is parked, untracked, under `.ai/local/wip/SP11/` at the same paths; copy it back before the review. Its release lines above still apply. Nothing of it is committed.
