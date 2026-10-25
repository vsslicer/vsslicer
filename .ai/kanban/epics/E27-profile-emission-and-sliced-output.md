---
id: E27
title: Emit engine presets from resolved profiles and write .gcode.3mf with thumbnails and labels
status: reviewed
initiative: I5
project: SLC
order: 2
depends_on: [E26, E13, E8, E10, E3]
rows: ["§7 `.gcode.3mf` sliced output", "§7 Thumbnails in G-code (PNG, JPG, QOI, BTT TFT, ColPic)", "§7 Object labels, exclude object"]
---

Turns a resolved VSSlicer profile and a project plate into the files the Orca CLI reads, and turns the engine's plain G-code into what printers want: a Bambu `.gcode.3mf` (G-code, MD5, `slice_info.config`, thumbnails, no mesh) or plain `.gcode` with injected thumbnails and object labels. It is for Bambu users (D3: the H2C prints `.gcode.3mf`) and for Klipper and Prusa users who need thumbnails and cancel-object.

## Scope

In:
- Preset emission in `vsslicer.slicer`: take `ProfileStore.resolve(printerInstance, material[], process).native("orca")` (E13) and write `machine.json`, `process.json` and one filament JSON per slot; apply plate and per-run overrides as `--key=value` where Orca accepts them, else in the JSON (Orca refuses 43 keys on the command line, ENG §1). Strip `post_process` (E29 runs scripts). Custom G-code templates and placeholders pass through byte for byte; the engine evaluates them (the macro language row is PRF's).
- Plate input: the plate's 3MF from `ProjectModel` (E10), sliced with `--slice <plate>`.
- `.gcode.3mf` assembly with `@vsslicer/3mf` (E8): `Metadata/plate_N.gcode` and `.md5`, `plate_N.png` and `plate_no_light_N.png`, `slice_info.config`, `model_settings.config`, `project_settings.config` (layout from `features-bambustudio-orcaslicer.md` §6). Thumbnails rendered by `vsslicer.project` `renderThumbnail(plate)`, not by the engine (Orca needs GL for them, ENG Implications).
- Plain G-code: thumbnail blocks in the formats the printer profile's `thumbnails_format` names (PNG, JPG, QOI, BTT TFT, ColPic); object labels by enabling `gcode_label_objects` and `exclude_object` in the emitted preset when the firmware flavour supports them.
- Encoders for QOI, BTT TFT and ColPic are written new; ColPic and BTT TFT may be ported from OrcaSlicer (AGPL-3.0, D2) with provenance lines if the spec text is insufficient.

Out: Cura emission (E28 flattens the Cura stack itself), Prusa INI or JSON emission (E65), binary G-code (E65), reading or previewing the output (GCP), sending (PRN).

## Feature-matrix rows

- §7 `.gcode.3mf` sliced output (P1): done when our assembled archive is accepted by the H2C and is structurally equal (same part list, same `slice_info` keys) to Orca's own `--export-3mf` output for the fixture plates.
- §7 Thumbnails in G-code (P1): done when each of the five formats is written, decodes back to the rendered image (lossless formats) and is read by `@vsslicer/gcode`'s thumbnail extraction.
- §7 Object labels, exclude object (P1): done when labelled output carries one label per object instance and `EXCLUDE_OBJECT_DEFINE` for Klipper flavour, checked by E3's label reader.

## Acceptance criteria

- [ ] Snapshot tests of emitted preset JSON for every fixture profile tuple from PRF's fixture set (regression: a renamed or dropped key changes the snapshot)
- [ ] Round trip: emitting then running Orca `--export-settings` returns the same values for every emitted key (pinned Orca in CI)
- [ ] Start and end G-code templates in the emitted presets are byte-identical to the imported profile's templates
- [ ] An override that Orca refuses on the command line is written into the JSON instead; a test per refused key class
- [ ] Assembled `.gcode.3mf` for each fixture plate passes `@vsslicer/3mf` validation and matches Orca's own archive structure; MD5 entries match the G-code
- [ ] Thumbnail encoders: per-format decode tests; ColPic and BTT TFT against fixture files produced by Orca
- [ ] Object labels present and matched to objects for Klipper, Marlin and RRF flavours on fixtures
- [ ] Missing thumbnail renderer (viewer not installed or webview fails) produces a warning and an archive without thumbnails, never a failed slice
- [ ] On the H2C (firmware version and date recorded): one fixture plate as `.gcode.3mf` is accepted and starts printing via E21; everything else on fixtures only (D5)

## Dependencies

- Needs E26 (adapter), E13 (`resolve` with the Orca native form), E8 (3MF writer), E10 (`ProjectModel`, `renderThumbnail`), E3 (thumbnail and label readers as oracle).
- E21 for the H2C acceptance check.
- Exposes the emitter (`emitOrcaPresets(resolved, overrides)`) and the output assembler (`writeSlicedOutput(plate, gcode, format)`) to E29, E62, E63, E64 and E65.

## Risks and spikes

- Spike: which `slice_info.config` fields the H2C firmware requires (filament list, prediction, weight, nozzle info); compare with an archive exported by Bambu Studio for the same plate. Firmware version recorded.
- Risk: PRF's unified schema may not round-trip every Orca key (Bambu and Orca drift, BO Implications). Mitigation: emission falls back to the original imported native JSON for keys the schema does not model, and logs which.
- Risk: thumbnail size and count per printer come from the printer profile; profiles that omit them get a default (one 300x300 PNG) with a warning.

## Eng review

- Scope challenge: considered splitting `.gcode.3mf` from thumbnails and labels; kept together because all three are the same "post-engine output assembly" step with one oracle (Orca's own export) and splitting would duplicate the writer plumbing.
- Explicit over clever: we assemble `.gcode.3mf` ourselves instead of trusting Orca's `--export-3mf` so thumbnails come from our renderer and the result is the same on headless CI; Orca's export stays as the oracle.
- Blast radius: a bad archive could fail on the printer mid-job; the H2C check and MD5 validation guard it. Emission bugs change print results silently, so the snapshot and `--export-settings` round trip are mandatory.
- Zero silent failures: unknown keys and fallback-to-native keys are logged per slice and shown in the slice report.

## Coordinator reconciliation

- Writes the VSSlicer job id into sent files at send time in PRN, not here; this epic only guarantees templates reach the engine byte for byte (the macro language row is PRF's).
