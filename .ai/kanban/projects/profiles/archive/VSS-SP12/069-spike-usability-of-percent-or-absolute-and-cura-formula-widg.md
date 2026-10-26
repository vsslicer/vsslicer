---
id: 69
title: "Spike: usability of percent-or-absolute and Cura formula widgets"
type: spike
priority: P1
effort: S
model: opus
area: [form]
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [135, 57]
created: 2026-10-25
---

Tries five percent-or-absolute keys and five Cura formula keys in a throwaway widget before the generic widget set freezes.

**Code:** `vsslicer/modules/profiles-extension/docs/widget-spike.md` (module: `profiles-extension`, layer: n/a (spike notes))

## Acceptance criteria

- [x] A written result per widget kind: what users see, what misleads, the chosen behaviour
- [x] Decision: percent-or-absolute stays relative; Cura `{expr}` read-only with a formula view

## Tasks

- [x] Build the throwaway widgets
- [x] Try with the ten keys
- [x] Write the decision

## Progress

2026-10-26, sp12-prf-69. Report: `vsslicer/modules/profiles-extension/docs/widget-spike.md` (new). Notes and the
throwaway widgets (HTML + JS, probe script): `.reference/notes/PRF-69-widget-spike.md` and
`.reference/notes/PRF-69-widget-spike/`. Sources: OrcaSlicer@09aa0114, Cura@5bea2f8, catalogue working tree.

- Widgets built in scratch, rendered in VS Code's integrated browser, driven with typical, edge and wrong inputs on
  the ten keys (5 Orca percent-or-absolute, 5 Cura formula: arithmetic, conditional, 475-char, bool, enum).
  Limit: no outside users tried them; the "misleads" findings are marked as the author's reading.
- Criterion 1 (result per widget kind): the report has "What users see", "What misleads" (6 for percent, 5 for
  formula) and "Chosen behaviour" for each kind. Check: each finding was reproduced by the probe or in the
  browser (e.g. the unit toggle turning `105%` into "105 mm absolute"; the generic "0 = auto" hint wrong for 3 of 5
  keys; 257 of 290 formula keys hidden behind `per_extruder`; 15,782 `=formula` values in Cura's 8,391 `.inst.cfg`
  on 86 literal-default keys).
- Criterion 2 (decision): "Decision" section: percent-or-absolute stored as typed, resolved for display only;
  Cura `{expr}` read-only in a formula view, replaceable by a literal and restorable, not text-edited.
- Mutation probes: n/a, no code or tests (spike notes only, layer n/a).
- Verification: `prettier --check docs/widget-spike.md` clean; `node scripts/run.mjs checks` exit 0, 84/84 runner
  tests pass (macOS; CI gate runs on ubuntu-latest).

Follow-up cards proposed (coordinator to create):

1. PRF, `profile-api` domain/catalogue data: carry Orca `ratio_over` and `max_literal` on `float_or_percent`
   entries and Cura's literal `default_value` beside `{expr}` defaults.
2. PRF, `profiles` application/form-model: pick the widget from the value as well as the default; the per-extruder
   inner editor dispatches the same way (else 257 Cura formula keys show an empty editor).
3. PRF, `profiles-extension` presentation: the percent-or-absolute widget (converting unit toggle, `max_literal`
   "did you mean %?") and the formula view as chosen.

Release lines: none (docs only).

**Review passed (sp12-rev-prf-69)**

- Scope: docs-only spike (`vsslicer/modules/profiles-extension/docs/widget-spike.md`, untracked), no code or tests,
  so pnpm install/lint/build/test and mutation probes do not apply. `prettier --check` clean.
  `node scripts/run.mjs checks`: 84/84 runner tests pass; `check-licence` fails on one problem in
  `modules/3mf/src/adapters/bambu/readPlates.ts:15` (untracked, another card's work, not this card's).
- Criterion 1 (result per widget kind): both kinds have "What users see", "What misleads" (6 and 5) and "Chosen
  behaviour". Probe: re-read the throwaway `probe.mjs`/`widgets.js` and recounted every catalogue fact with an
  independent script (`/tmp/prf69rev.mjs`): 137 `float_or_percent` (orca 38, superslicer 86, prusa 9, bambu 4), 290
  `{expr}` defaults, all `cura.` and `native_only: cura`, 257 `per_extruder`; the ten keys' types, labels, min/max
  and defaults as stated (`internal_bridge_speed` has no `max`, `outer_wall_line_width` max 1000 and no
  `max_literal`). Upstream lines checked at OrcaSlicer@09aa0114 (`PrintConfig.cpp:2695, 2719, 2061, 6606, 4957`
  `ratio_over`; `:2698` `max_literal = 10`; `:2057` label "Internal"; 38 `ratio_over` lines; `Field.cpp:627, 667`
  and the "Is it %s%% or %s %s?" question at `:653`) and Cura@5bea2f8 (`fdmprinter.def.json:3586-3596`). Repo code
  cited: `form-model.ts:70-71` `refine` puts `per_extruder` first; `form-model.test.ts:106`; `read.ts:130` keeps
  `=` values as `{ expr }`. Inst.cfg recount (`/tmp/prf69rev3.mjs`): 8,391 files, 25,787 `= =` values, 15,782 on
  literal-default keys, 1,029 on `float_or_percent`.
- Criterion 2 (decision): the "Decision" section says exactly the card's rule (relative, stored as typed; `{expr}`
  read-only in a formula view, replaceable and restorable). Matches the criterion, no different rule derived.
- Licence: OrcaSlicer AGPL-3.0 and Cura LGPL-3.0 named; behaviour only, no code copied. The scratch widgets in
  `.reference/notes/` are ignored and were not run by me.
- Fixed in place (docs wording, no behaviour): (1) the "86 unified keys" are 62 unified plus 24 `cura.`-only keys
  (13,301 + 2,481 values), now stated; (2) `support_angle` is `90 - native` (`factor -1, offset 90` in the
  catalogue), not a plain sign flip; (3) "Cura shows only the computed number" was cited to the revert tooltip
  (`SettingItem.qml:343`), which says the opposite case; now cites the field binding the evaluated value
  (`SettingTextField.qml:233`) and keeps `:343` for the restore button.
