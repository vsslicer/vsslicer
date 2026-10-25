---
id: E31
title: Write edited projects as Bambu/Orca-shaped 3MF and generic 3MF
status: reviewed
initiative: I6
project: VWR
order: 4
depends_on: [E8, E26, E54]
rows: ["§9 Generic 3MF export (no vendor extensions)"]
---

The model writer turns an edited `Project` back into a 3MF that Orca, Bambu Studio and the pinned Orca CLI open with the same plates, objects, parts and settings, while keeping every part VSSlicer did not change. It also exports a plain core 3MF for interchange. Every editor epic saves through it.

## Scope

In (`@vsslicer/3mf`):
- Model writer: core plus Production split model (`3D/Objects/object_N.model`), build items, transforms, components, UUIDs stable across saves.
- Bambu/Orca dialect writer: `model_settings.config` (objects, parts, per-volume config, plates, instances, assemble items), `project_settings.config` and embedded preset JSONs (content supplied by E54 `resolve(...).native('orca')`), `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt`, `cut_information.xml` written when the model holds that data.
- Our own namespace: `Metadata/vsslicer/*` parts with a MustPreserve relationship; `Application` is `VSSlicer-<version>`, never another vendor's (`3mf.md` Implications). Whether Orca and Bambu Studio still read the file as theirs with a non-Bambu `Application` is the first spike.
- Change tracking: parts whose source data did not change are copied as original bytes; changed parts are regenerated; stale plate artefacts (G-code, md5, plate thumbnails, `slice_info` entries) of plates whose content changed are removed and listed in a save notice.
- Dialect conversion on save: Prusa 2.x and Cura projects are saved in the Bambu/Orca shape after an explicit confirmation that names what is converted and what is kept only as preserved parts; the default for a foreign dialect is Save As.
- Generic 3MF export: core only, no vendor `Metadata/`, meshes with transforms baked or as build items.
- Ported code (D2): writer key order and plate serialisation follow `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0) with provenance notices.

Out: Prusa 2.x and Cura writers (a project stays readable in them only as core geometry; noted as an owner question); painting attributes (E52 extends the writer); the `.gcode.3mf` sliced layout (E27, through E8's part API).

## Feature-matrix rows

- §9 Generic 3MF export (P1): done when the export opens in lib3mf, three.js `3MFLoader`, PrusaSlicer and Cura with the right objects and positions, and contains no vendor parts.
- The write side of §9 "3MF project with own config dialect" (row owned by E8) is delivered here; it has its own criteria below.

## Acceptance criteria

- [ ] Property test: random `Project` values written then read by E8 compare equal (plates, objects, parts, instances, transforms, per-object config).
- [ ] Untouched parts stay byte-identical after an edit to one object (reuses E8's identity test).
- [ ] Every fixture project, edited by a scripted set of operations and saved, re-slices with the pinned upstream Orca CLI (E26) with the same plate count and object names in the output; this runs in CI.
- [ ] Manual matrix (recorded per release): saved files open in Orca and Bambu Studio GUIs with plates, objects and settings intact.
- [ ] The conversion dialog appears for Prusa 2.x and Cura sources and the original file is untouched unless the user confirms overwrite.
- [ ] Generic export passes lib3mf validation and the Consortium positive-case checks.
- [ ] Write failures (disk full, permission denied, file changed on disk since open) leave the original file intact: the writer writes to a temporary file and renames; each case tested.
- [ ] On the H2C: a VSSlicer-saved project, sliced by the Orca CLI and sent by E21, prints the expected plate (firmware version recorded). The rest is fixtures (D5).

## Dependencies

- Needs E8 (container, `Project` types), E26 (pinned Orca CLI as the oracle), E54 (native preset JSON for embedded presets; until it lands, the original embedded presets are preserved unchanged).
- Exposes `writeProject(project, pkg, {dialect})` and `exportGeneric(project)` to E32 (save), E27 (writes the 3MF it passes to the engine) and E52 to E54 (painting, cut, layer-height parts).

## Risks and spikes

- Detection by Bambu Studio and Orca relies on `Application` starting `BambuStudio-` (`3mf.md` §4). Spike: save with `VSSlicer-` and check whether each GUI and the Orca CLI still load plates and settings; if not, the owner decides between interop and the "never claim another vendor" rule (open question in the notes).
- Atomic rename semantics differ on Windows network drives; covered by the temp-file test on all three CI platforms.

## Eng review

- Scope challenge: one writer shape (Bambu/Orca) plus generic, as I6 says; per-dialect writers for Prusa and Cura were left out because the plan of record does not ask for them. Painting persistence is left to E52 so this epic stays within three sprints.
- Tests: round-trip property test catches writer and reader asymmetry; Orca CLI re-slice catches interop breaks; byte identity catches needless regeneration.
- Blast radius: this is the one epic that writes user files. Temp-file plus rename and the foreign-dialect Save As default guard against data loss.
- Reversibility: the editor feature flag (E32) can return a user to read-only; files already written remain valid 3MF.
- Changed because of the review: added stale-artefact removal with a notice (stale plate G-code would otherwise be sent to a printer) and the conversion confirmation.
