# Spike: percent-or-absolute and Cura formula widgets (PRF-69)

Date: 2026-10-26. Throwaway widgets tried on ten catalogue keys before the generic widget set (PRF-70, PRF-181)
freezes. Running notes: `.reference/notes/PRF-69-widget-spike.md` (ignored).

Sources: the bundled catalogue (`vsslicer/modules/profile-api/src/domain/catalogue/data/*.json`, working tree of
2026-10-26), `OrcaSlicer@09aa0114`, `Cura@5bea2f8`. OrcaSlicer is AGPL-3.0, Cura LGPL-3.0; nothing here copies
their code, only the behaviour is described.

**Method and its limit.** The widgets were plain HTML and JS in a scratch directory, filled from the real catalogue
entries and rendered in VS Code's integrated browser; each key was tried with typical, edge and wrong inputs. No
outside users tried them: "what misleads" is the author's reading of the rendered widgets plus upstream
behaviour, and is unverified with real users.

## The ten keys

| Kind                | Key                                  | Why this one                                                          |
| ------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| percent-or-absolute | `outer_wall_line_width`              | % of nozzle; `0` means auto; Orca range 0..1000 with `max_literal` 10 |
| percent-or-absolute | `small_perimeter_speed`              | % of another speed; per extruder; `min` 1                             |
| percent-or-absolute | `internal_bridge_speed`              | default over 100 % (`150%`); short label "Internal"                   |
| percent-or-absolute | `seam_slope_start_height`            | % of layer height; `0` is a real value, not auto                      |
| percent-or-absolute | `infill_anchor`                      | % of a key that is itself a percentage (chain); `0` disables          |
| Cura formula        | `cura.speed_wall`                    | simple arithmetic: `speed_print / 2`                                  |
| Cura formula        | `cura.wall_thickness`                | conditional, references renamed keys                                  |
| Cura formula        | `cura.infill_line_distance`          | 475 characters, nested conditionals                                   |
| Cura formula        | `cura.machine_nozzle_temp_enabled`   | a `bool` whose default is a formula                                   |
| Cura formula        | `cura.initial_layer_inset_direction` | an `enum` whose default is a formula                                  |

Catalogue facts measured on the merged data: 137 `float_or_percent` keys (Orca 38, SuperSlicer 86, Prusa 9, Bambu
4); 290 keys whose default is a Cura `{expr}`, all `cura.`-prefixed and `native_only: cura`, 257 of them
`per_extruder`.

## Percent-or-absolute

**What users see.** One text field, a two-state `mm | %` (or `mm/s | %`) switch, and a line under it with the
resolved value: `= 0.42 mm (105% of Nozzle diameter)`, `= 1.8 mm (400% of Sparse infill of Nozzle diameter)`.

**What misleads.**

1. **The base is not in the catalogue.** Orca declares it as `ratio_over` on 38 options
   (`OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:2695` `outer_wall_line_width` over `nozzle_diameter`, `:2719`
   `small_perimeter_speed` over `outer_wall_speed`, `:2061` `internal_bridge_speed` over `bridge_speed`, `:6606`
   `seam_slope_start_height` over `layer_height`, `:4957` `infill_anchor` over `sparse_infill_line_width`). The
   catalogue keeps only the tooltip prose, so a widget built on the catalogue cannot show the resolved value. The
   spike hard-coded the five bases.
2. **The switch reinterprets the number.** Flipping `105 %` to `mm` gave "105 mm absolute": the number stays, the
   meaning changes by a factor of 250. Orca guards the same slip from the other side, asking "did you mean %?" when a
   unitless number exceeds `max_literal` (`OrcaSlicer@09aa0114:src/slic3r/GUI/Field.cpp:627`, `:667`).
3. **One range for two meanings.** The catalogue copies Orca's `max` (1000 for `outer_wall_line_width`, meant for
   the percentage) but drops `max_literal` (10 mm, `PrintConfig.cpp:2698`), so `42` (mm) passes validation.
   `internal_bridge_speed` has no `max` at all: `1500%` passes.
4. **Zero has no generic meaning.** For line widths `0` is "auto"; for `seam_slope_start_height` it is a real
   0 mm; for `infill_anchor` it disables anchoring; for `small_perimeter_speed` (`min` 1) it is invalid. The
   spike's generic "0 = automatic" hint was wrong for three of the five keys. Nothing in the catalogue says which.
5. **Labels are page-scoped.** Orca labels assume their page line: `internal_bridge_speed` is "Internal" and its
   base `bridge_speed` "External" (`PrintConfig.cpp:2057`), so "150% of External" is meaningless outside the Orca
   page. The resolved-value line must name the base by group plus label, or by key.
6. **Chains.** `infill_anchor` is a % of `sparse_infill_line_width`, itself a % of `nozzle_diameter`. The line must
   walk the chain (depth-bounded) and show each step, or users read 400 % as 400 % of the nozzle.

**Chosen behaviour.**

- The value stays **relative**: the widget stores what the user typed (`"105%"` or `0.42`), never the resolved
  number. The resolved number is display only, recomputed when the base changes, as Orca does when slicing.
- Toggling the unit **converts** the value through the resolved base (`105%` becomes `0.42`), and is disabled when
  the base cannot be resolved; typing a trailing `%` sets percent directly.
- Validation uses `min`/`max` for percentages and `max_literal` for absolutes, and repeats Orca's "did you mean
  %?" question for an absolute above `max_literal`.
- The meaning of `0` comes from the tooltip; the widget adds no generic "auto" text.
- A per-extruder key (`small_perimeter_speed`, `internal_bridge_speed`) uses this widget as its inner editor.

## Cura formula

**What users see.** A badge "calculated by Cura", the formula in a code block with every setting name a link to its
field (unified label on hover), long formulas collapsed to three lines with "show all", and a "Set a value" button.

**What misleads.**

1. **No number.** Nothing evaluates formulas yet (the AST parser is SLC-57, in backlog), and the catalogue keeps only
   the formula: Cura's literal `default_value` beside it is dropped (`speed_wall`: `default_value: 30`,
   `value: "speed_print / 2"`, `Cura@5bea2f8:resources/definitions/fdmprinter.def.json:3586-3596`). The field has
   no number at all, which reads as "unset". Cura's own UI shows only the computed number and hides the formula
   (the field binds the evaluated value, `Cura@5bea2f8:resources/qml/Settings/SettingTextField.qml:233`; a
   "restore the calculated value" button appears once a literal replaces it, `SettingItem.qml:343`).
2. **Native names, unified fields.** Formulas name Cura's keys; 51 distinct referenced names have another unified
   name (`wall_line_width_0` is `outer_wall_line_width`, `magic_spiralize` is `spiral_mode`, `infill_sparse_density`
   is `sparse_infill_density`). Replacing them by unified labels hides that ten of them hold a different unit or
   form in the unified profile: `material_flow` (unified = native x 0.01), `support_angle` (unified = 90 - native),
   `infill_sparse_density` and two overlaps (`percent`), and five line widths that may hold `"105%"` while the formula expects mm.
   A link that jumps to the unified field shows a value the formula never sees.
3. **Long formulas.** `cura.infill_line_distance` (475 characters) is unreadable on one line; collapsed to three
   lines it is skimmable, the full text on demand.
4. **Formulas sit behind `per_extruder`.** 257 of the 290 formula keys are `per_extruder`; the form model gives
   `per_extruder` priority (`vsslicer/modules/profiles/src/application/form-model/form-model.ts`, `refine`, and its
   test `kind('cura.machine_nozzle_temp_enabled')` = `per_extruder`). If the per-extruder editor picks its inner
   editor from `entry.type`, those keys show an empty number box, checkbox or select instead of the formula.
5. **Formulas are values, not only defaults.** `refine` looks at the default only. Cura's 8,391 bundled `.inst.cfg`
   files carry 15,782 `key = =formula` values on 86 catalogue keys whose default is a literal (13,301 on 62 unified
   keys, 2,481 on 24 `cura.` keys; 1,029 on `float_or_percent` keys, such as `line_width = =machine_nozzle_size`). Imported profiles keep them as `{ expr }`
   (`vsslicer/modules/profiles-cura/src/adapters/quality/read.ts:130`), so a percent-or-absolute or number field can
   hold a formula.

**Chosen behaviour.**

- The formula is **read-only** and shown in a **formula view**: badge, the formula text with Cura's own names kept,
  each name linked to its field with the unified label and any unit difference on hover, collapsed past three lines.
- "Set a value" replaces the formula by a literal through the type's widget, and a "restore formula" action puts
  the formula back, as Cura's revert does. Editing the formula text is not offered.
- Until formulas are evaluated, the view says "calculated by Cura when slicing" instead of showing a number; once
  SLC-57 lands it shows the number first and the formula beneath.
- The widget kind is picked **per value**: an `{ expr }` value (stored or default) gets the formula view whatever the
  key's type, and the per-extruder editor does the same for each extruder's inner value.

## Decision

Percent-or-absolute values stay relative: stored as typed, resolved only for display. Cura `{expr}` values are
read-only, shown in a formula view, replaceable by a literal and restorable; they are not edited as text.

## Follow-ups this needs (for the coordinator to card)

1. `profile-api` (domain, catalogue data): carry Orca's `ratio_over` and `max_literal` on `float_or_percent` entries
   (generator plus schema), and Cura's literal `default_value` beside `{expr}` defaults.
2. `profiles` (application, form model): choose the widget from the value as well as the default, and dispatch the
   per-extruder inner editor the same way.
3. `profiles-extension` (presentation): the percent-or-absolute widget and the formula view as chosen above.
