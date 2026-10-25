---
id: E50
title: Add the placeholder catalogue and G-code template editor
status: draft
initiative: I10
project: GCP
order: 6
depends_on: [E6, E11, E13]
rows: ["§7 Placeholder catalogue and G-code template editor"]
---

For users who write custom start, end, layer-change and tool-change G-code in their printer and
filament profiles: a template language in `vsslicer.gcode` that completes and explains every
placeholder the target slicer fills in (`[layer_z]`, `{next_extruder}`, the tool-change set,
every config option as a variable), per template kind and per slicer, replacing PrusaSlicer's
2.9 "Edit custom G-code" dialog and Orca's editor with VS Code completion and hovers.

## Scope

In:
- A `gcode-template` language (or an embedded mode in profile files) on top of E6's grammar:
  `[var]`, `{expr}`, `{if}`/`{elsif}`/`{endif}`, indexed vectors.
- Placeholder catalogue as data per slicer and template kind: Orca's typed placeholder
  definitions **ported** as data from OrcaSlicer@09aa0114 `src/libslic3r/PrintConfig.cpp`
  (`custom_gcode_specific_placeholders()` at :13656 and the per-template entries at :13661,
  AGPL-3.0) and PrusaSlicer's placeholder-only definitions (PrusaSlicer@30ef591), with
  provenance; config options as variables from E11's schema.
- Completion, hover (type, meaning, which templates fill it), and a warning for a placeholder the
  template kind does not provide.
- Opening a profile's template field from the PRF settings form into this editor.

Out: evaluating the macro language (PRF §7 Placeholder macro language), Cura's `{setting}`
substitution beyond completion of setting names, a preview of the rendered template.

## Feature-matrix rows

- **§7 Placeholder catalogue and G-code template editor (P2).** Done when every placeholder in
  the ported catalogues completes and hovers in the right template kinds, for Orca and Prusa
  profiles.

## Acceptance criteria

- [ ] To be written when the epic is reviewed; oracle: the Orca and Prusa catalogues themselves
      and imported fixture profiles from E12 whose templates must produce no false warnings

## Dependencies

- Needs E6 (grammar, command catalogue), E11 (schema for config-option variables), E13
  (opening template fields from the profile store), and PRF's placeholder macro language epic
  for the expression grammar it defines.
- Exposes the catalogue to PRF (validation of imported templates) and SLC (pass-through checks).

## Risks and spikes

- Ownership: I1 and the E6 anchor put "the language side" of this row in I1; this epic puts
  the whole row in I10 because it needs PRF. The coordinator accepted this.
- Orca's catalogue moves between releases; regenerate from source per Orca release.

## Eng review

- Draft: reviewed only for scope. Smallest form is data plus two providers on E6's language,
  about 2 sprints; no new renderer or webview.
