---
id: E34
title: Manage plates with per-plate settings, per-layer G-code and a printer per plate
status: reviewed
initiative: I6
project: VWR
order: 7
depends_on: [E32, E33, E54, E26, E32]
rows: ["§4 Multi-plate projects (plate as a first-class object)", "§4 Per-plate settings and per-plate custom G-code", "§4 Per-layer pause, colour change, custom G-code", "§4 Mixed printers in one project"]
---

The plate becomes an object the user edits: create, duplicate, rename, lock, delete and reorder plates, move objects between them, give each plate its own settings layer and custom G-code, add pauses, colour changes and custom G-code at layer heights, and pick a different printer for a plate. The plate is the unit SLC slices and PRN sends, so this epic defines that unit for the whole suite.

## Scope

In (`vsslicer.project`, `@vsslicer/3mf` model; written new, shaped like Orca's `PartPlate` metadata without copying it, `projects-and-fleet.md` Implications):
- Plate model: index, name, locked, bed type, print sequence, spiral mode, filament order and maps, instances; plate commands (create, duplicate, delete, lock, rename, reorder, move instance) through E32. Limit of 36 plates for Bambu/Orca compatibility (`MAX_PLATE_COUNT`).
- Plate layout in the viewer: plates side by side as Orca draws them, with the active plate highlighted; tree view grouping by plate.
- Config layering global < plate < object < part, shown in the override form with the source of each value (E54 resolve with a plate layer).
- Per-plate custom G-code and per-layer entries (pause, colour change, tool change, custom) stored in `custom_gcode_per_layer.xml` per plate. Entries are edited from a plate's layer list in the project editor, and from GCP's layer slider through a `ProjectModel` command that E32 calls.
- Mixed printers: a plate may reference a printer instance different from the project's; the plate's config layer then resolves against that printer. Written into our namespace and into the plate config where the dialect has a key; otherwise preserved in `Metadata/vsslicer/`.
- Plate state from slicing: valid, stale (contents changed since slicing), sliced artefacts in `.vsslicer/sliced/`, consumed from SLC.

Out: arrange across plates (E35); filament-to-extruder mapping UI for multi-material (SLC, §5); sending (PRN).

## Feature-matrix rows

- §4 Multi-plate projects (P1): done when plates can be created, edited and saved, and the Orca CLI slices each plate of a saved project into its own G-code with the expected objects.
- §4 Per-plate settings and per-plate custom G-code (P1): done when a plate setting (bed type, print sequence, spiral mode) and plate custom G-code appear in that plate's sliced G-code only.
- §4 Per-layer pause, colour change, custom G-code (P1): done when entries added in the editor or from the preview slider are stored per plate and the sliced G-code contains them at the right layer.
- §4 Mixed printers in one project (P2, taken into I6 by the initiative): done when two plates with different printer instances each resolve and slice against their own printer, and the file reopens with both.

## Acceptance criteria

- [ ] Plate invariants under property tests (I6 exit criterion): every instance on exactly one plate; locked plates unchanged by any command except unlock; delete then undo restores membership and order.
- [ ] Orca CLI oracle: a three-plate fixture with per-plate bed type and a pause at a layer slices, and E10 finds the pause on the right layer of the right plate only.
- [ ] Editing a sliced plate marks it stale in the tree and E31 removes its stale artefacts on save.
- [ ] Bambu Studio and Orca GUI manual matrix: plates, names, lock flags and per-layer entries survive.
- [ ] Mixed printers: a two-printer fixture resolves different bed sizes; an object outside the bed of its plate's printer is flagged.
- [ ] On the H2C: a two-plate project with a colour change on plate 2, sliced by the Orca CLI, prints plate 2 with the change at the right layer (firmware version recorded). Other printers: fixtures only (D5).

## Dependencies

- Needs E32, E33, E54 (resolve with a plate layer and per-plate printer), E26 (Orca CLI), E32 (layer slider calls our command), E10 (G-code checks).
- Exposes `Plate` and plate commands, `ProjectModel.addLayerGcode(plate, z, entry)`, plate state events to SLC (slice plate, slice all), PRN (send plate, queue items reference `project + plate`) and GCP.

## Risks and spikes

- Whether the Orca CLI slices one chosen plate of a multi-plate 3MF and which flag selects it; owned by E26, needed here for the oracle.
- Mixed printers have no Bambu/Orca key; Orca ignores our namespace part, so the second printer is lost when opened there. Recorded as a known interop limit in the save notice.
- Coupling with GCP over the layer slider: the only contract is the `ProjectModel` command; no shared state.

## Eng review

- Scope challenge: four rows, all on the plate object and its config layer, so one epic. Mixed printers is P2 but small once the plate config layer exists; deferring it would mean reopening the plate model in I10.
- Tests: invariant properties catch membership bugs; CLI fixtures catch layer and plate placement errors.
- Blast radius: a wrong plate assignment sends the wrong objects to a printer; stale marking and stale-artefact removal prevent sending outdated G-code.
- Reversibility: plate commands undo; files remain readable by Orca.
- Changed because of the review: made the slider integration a command API instead of shared state, and added stale marking.
