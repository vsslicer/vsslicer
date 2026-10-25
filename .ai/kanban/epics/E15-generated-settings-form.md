---
id: E15
title: Generate the settings form from the schema, with search and comparison
status: reviewed
initiative: I3
project: PRF
order: 5
depends_on: [E14, E12]
rows: ["§13 Data-driven settings layout", "§13 Settings search and comparison"]
---

A webview settings form in `vsslicer.profiles`, generated entirely from E11's catalogue: pages per schema group, widgets per type, inherited and overridden values shown apart, search over every key, and a side-by-side comparison of two profiles. Users edit any of the 800-odd settings of a process, material or printer without opening JSON, and find a setting by its label, tooltip or its PrusaSlicer, Orca or Cura name. The layout comes from data, so a new catalogue key appears in the form without UI code.

## Scope
- In (written new on `@vsslicer/webview-kit`, E12): a custom editor or panel for one entity at a time; navigation by the schema groups of E11 (`layers` ... `plate`), subgroups and order from the catalogue; widgets for bool, int, float with unit, enum, percent-or-absolute values (Prusa `%` relatives kept relative), keyed per-extruder tables, and multiline G-code with its dialect badge (text only; the template editor is E16).
- In: each field shows its effective value, where it comes from (own, parent name, override block) and a "reset to parent" action; Cura `{"expr"}` values shown as formulas, read-only; hidden keys behind a toggle.
- In: search across unified key, label, tooltip and every native name; filters "modified only" and "differs from parent"; comparison of two entities or of an entity and its parent, as a two-column view of differing keys; "open as text diff" hands the two files to VS Code's diff editor.
- In: edits go to `ProfileStore.save` in the host through the transport; the webview holds no state of record; theme colours from VS Code tokens; full keyboard navigation and labelled controls.
- Out: the add-printer wizard (E17, reuses these components), editing printer connections (E16), intent picker (E57), SLA and milling pages (E58).

## Feature-matrix rows
- §13 Data-driven settings layout (P0): done when every catalogue key of the fourteen FFF groups renders with a widget chosen from its type, and a key added to the catalogue fixture appears without code changes.
- §13 Settings search and comparison (P1): done when search finds keys by label, tooltip and native name, and two profiles can be compared in the form and as a text diff.

## Acceptance criteria
- [ ] Snapshot test of the generated form model (groups, fields, widget kinds) for the full catalogue; a catalogue change shows as a reviewed snapshot diff.
- [ ] Search fixtures: `perimeters` (Prusa), `wall_loops` (Orca) and `wall_line_count` (Cura) find the same field; a tooltip word finds its key.
- [ ] Editing a field in the form writes only that key to the entity file (E13 edit-diff test reused end to end); reset to parent removes the key.
- [ ] Comparison of two Orca processes lists exactly the keys whose resolved values differ (oracle: `ProfileStore.resolve` on both).
- [ ] Opening a process with every catalogue key set renders within 500 ms in the webview test harness (virtualised list).
- [ ] Keyboard-only walk through a page and search reaches every control; an axe-core pass on the rendered form reports no violations.
- [ ] Webview transport errors (host restart, stale entity version) show a banner and reload, never drop an edit silently (test with a forced host restart).
- [ ] Fixtures only (D5).

## Dependencies
- Needs E14 (store access, commands), E12 (webview transport, CSP helper), E11 (catalogue as the layout source).
- Exposes the form components to E17 and E57, and `vsslicer.profiles.openForm(entityId)` to SLC (process picker) and FIL (material view).

## Risks and spikes
- Labels and tooltips: ported from Orca/Prusa/Cura text with provenance (D2) or written new. Proposal: port, since D2 allows it; the catalogue holds the text, the form does not care.
- Percent-or-absolute values and Cura formulas are the widgets most likely to mislead; usability spike with five keys of each before the generic widget set is frozen.

## Eng review
- Scope: about 3-4 sprints; one UI deliverable. Search and comparison stay in this epic: both are views over the same form model and the comparison is two instances of it.
- Tests catch: missing widget for a type (snapshot), wrong key written (edit-diff), slow render (timing test), accessibility regressions (axe).
- Blast radius: webview only; a webview crash loses no data because edits are saved per field through the host.
- Reversibility: the form can be disabled by a setting, leaving JSON editing (E14) as the fallback.
- Zero silent failures: transport loss, stale version and save errors each surface in the form.
