---
id: E43
title: Ship the inventory UI and link spools to material profiles
status: reviewed
initiative: I8
project: FIL
order: 4
depends_on: [E40, E41, E42, E13, E41, E20]
rows: ["§14 Spool inventory"]
---

Delivers the part of `vsslicer.filament` users see: a Filament view with the spool inventory,
catalogue search to add spools, a spool editor, printer slot assignment, consumption history
with disagreement flags, and the link from each spool to a material profile in
`vsslicer.profiles` through the filament's `slicer_ids`. Serves every user who wants to know
what is on the shelf and in the printer, without running Spoolman (D6).

## Scope

In (written new):
- Tree view in an activity-bar container: group by brand > filament > spool, by location, or by
  printer > tool/tray; colour swatch icons, remaining grams and percent in the description,
  archived spools hidden behind a filter. Native `TreeView`, no webview.
- Add spool: QuickPick over the E41 catalogue (search by brand, name, EAN), or a blank spool.
- Spool editor: one webview form (initial weight, empty spool weight, location, lot, price,
  extras, archive) using the CSP helper and message transport of `@vsslicer/webview-kit`
  (E41); labels and keyboard navigation for accessibility; writes go through `Inventory`.
- History panel per spool: booked events with source, job, printer, estimate and disagreement
  flags; actions "Measure on scale", "Correct", "Reassign to spool".
- Slot assignment: commands and tree actions to set the spool in a printer tool or AMS tray
  (printers listed through `PrinterRegistry`, E20); unassigned-bucket entries shown with an
  "Assign" action.
- Material profile link: for a spool, query `ProfileStore` (E13) for materials whose
  `external_ids` match the filament's `slicer_ids` (Bambu `filament_id`, Orca id, Prusa name,
  Cura GUID); one match links automatically, several or none ask the user; stored as
  `material_profile_id`. Exposed as `Inventory.materialFor(spoolId)` for SLC and PRN.
- Export and backup commands (JSON export in Spoolman's `/export` shape, restore from backup).

Out: Spoolman sync (E45), tag reading and auto-create (E44), label printing and QR codes, cost
reports, a custom editor for the store file.

## Feature-matrix rows

- §14 Spool inventory (P1): done when a user can add, edit, archive and locate spools, see
  remaining weight and consumption history, assign spools to printer slots and link each spool
  to a material profile, all without a Spoolman.

## Acceptance criteria

- [ ] Extension integration tests (`@vscode/test-electron`, E40 tooling): tree contents for
      each grouping on a fixture inventory; add from catalogue, edit, archive, restore.
- [ ] Profile link tests against E13 fixtures imported from Orca, Bambu, PrusaSlicer and Cura
      profiles: OFD Bambu PLA Basic links to the `GFA00` material, generic `GFL99` asks the user;
      a missing `ProfileStore` (profiles extension disabled) shows "Install VSSlicer Profiles" and
      leaves the link empty (catches hard coupling).
- [ ] Spool editor webview passes the CSP helper's policy test and an axe accessibility check;
      invalid input (negative weight, empty spool heavier than gross) is rejected with a message.
- [ ] Disagreement flags from E42 fixtures appear on the spool and clear after a scale correction.
- [ ] Export round trip: export then import into an empty store reproduces the inventory.
- [ ] Tree refresh with 2000 spools stays under 100 ms (measured).
- [ ] H2C: AMS trays appear under the printer grouping with their assigned spools (firmware
      version recorded); other printers on fixtures.

## Dependencies

- Needs E40 (store), E41 (catalogue), E42 (events, flags, slot assignments), E13
  (`ProfileStore` lookup by `external_ids`; PRF must confirm it holds Bambu, Orca, Prusa and Cura
  ids, FIL notes), E41 (CSP helper and transport), E20 (`PrinterRegistry` listing).
- Exposes `Inventory.materialFor(spoolId)` and the slot map to SLC (pick material for a sliced
  job) and PRN (show spools in AMS slot mapping at send).

## Risks and spikes

- PRF `external_ids` coverage and naming (`slicer_ids` vs `external_ids`): agree the key set with
  PRF before the link story starts.
- Single webview vs native forms: if the webview-kit transport is late, fall back to a sequence
  of InputBox prompts for the editor (behind the same command).

## Eng review

- Scope challenge: tree, editor, history and linking are one user-visible deliverable; splitting
  linking out would leave a 1-sprint epic. Deliberately out: labels, QR, cost reports.
- Tests name regressions (lost edits, wrong link, hard dependency on profiles, inaccessible form,
  slow tree). Oracle: fixture inventories, PRF fixtures, the H2C for AMS display.
- Blast radius: UI only writes through `Inventory`; a webview crash loses at most the unsaved
  form, which is kept as a draft in webview state.
- Reversibility: the material link is optional data; removing it changes nothing else.
- Dependencies named both ways; profiles reached only through `ProfileStore`, printers only
  through `PrinterRegistry`.
