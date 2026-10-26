---
id: 70
title: Generate the form model from the catalogue
type: feature
priority: P0
effort: M
model: opus
area: [form]
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 118]
created: 2026-10-25
---

A pure function from catalogue to groups, subgroups, fields and widget kinds; the layout comes from data so a new key appears without UI code.

**Code:** `vsslicer/modules/profiles/src/application/form-model/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [x] A snapshot of the form model (groups, fields, widget kinds) for the full catalogue; a catalogue change shows as a reviewed snapshot diff
- [x] A key added to a catalogue fixture appears in the model without a code change (test)
- [x] Every type in the catalogue has a widget kind; a missing one fails the snapshot test
- [ ] Percent-or-absolute, per-extruder, gcode and `{expr}` fields get their widget kinds

## Tasks

- [x] Choose widget kind per type
- [x] Build groups and ordering
- [x] Snapshot and data-driven tests

## Progress

Not started.

2026-10-26 PRF-70-worker: criteria 1-3 done (criterion 4 is PRF-181). `buildFormModel(catalogue)` in `src/application/form-model/form-model.ts`: pure; groups in `GROUPS` order (all 14 kept for navigation), one subgroup per home entity in the group's `homes` order (the catalogue has no subgroup field, so home is the data-driven subgroup; empty ones dropped), fields in catalogue order with `key`, `label` (key when unlabelled), `widget`, `entry`. Base kinds in `WIDGET_KINDS: Record<SettingType, WidgetKind>` (compile fails on a new type without a kind; float_or_percent and gcode are `text` until PRF-181 adds kinds to the union and map, list/per_extruder flags stay on `entry`). Runtime throws `FormModelError` on a type with no kind, or a group/home outside the schema; refuses over `MAX_FORM_FIELDS` (20000) keys before walking.
Tests: `test/form-model.test.ts`, 7 tests (module 18/18): full-catalogue outline (orca+bambu+prusa+superslicer+cura, 1930 keys) as file snapshot `test/__snapshots__/form-model.txt` (1965 lines, key + widget + list/per_extruder/hidden flags), each key once, fixture key appears, ordering, unknown type fails (also fails the snapshot test since the build throws), bad home fails, oversize refused. pnpm test, lint, build and `node scripts/run.mjs checks` pass.
Files: src/application/form-model/form-model.ts, src/application/form-model/index.ts, test/form-model.test.ts, test/__snapshots__/form-model.txt.
For the coordinator: `src/application/index.ts` (or `src/index.ts`) add `export * from './form-model/index.ts';` (resp. `'./application/form-model/index.ts'`). CHANGELOG Unreleased: `- Form model generated from the settings catalogue: groups, per-entity subgroups, fields and base widget kinds (PRF-70).` No new dependency.


Review (sp8-reviewer-4, 2026-10-26 07:40): FAIL (criteria 1-3; 4 is PRF-181)
Checked: pure application code (only import is `@vsslicer/profile-api`, no I/O, no VS Code); home-as-subgroup is fine (US29 and docs/research/profiles.md name no subgroup field). Snapshot recomputed independently from the five catalogues: 804+103+122+279+622 = 1930 keys, no key overlap in the merge, all 1930 field lines match the entry's type->widget, list/per_extruder/hidden flags, group and home, in GROUPS order. Fixture-key test and unknown-type test are real. Ran pnpm test (18/18), pnpm lint, pnpm build, `node scripts/run.mjs checks` (exit 0).
1. `src/application/form-model/form-model.ts:68`: the widget lookup reads inherited properties, so a type of `constructor`, `toString` or `__proto__` (probe: cast-from-JSON entry) gets a function/object as its widget instead of throwing; criterion 3 ("a missing one fails") does not hold for those. Fix: `const widget = Object.hasOwn(WIDGET_KINDS, entry.type) ? WIDGET_KINDS[entry.type] : undefined;` (or a null-prototype map), and add `constructor` to the "no widget kind fails" test.
2. (process, not code) `package.json`/`pnpm-lock.yaml` gain `@vsslicer/profile-api ^0.1.0`, which only this card's files import, while Progress says "No new dependency". Workers do not edit package.json or the lockfile: coordinator to own/confirm that edit and the note corrected.

Review (sp8-reviewer-8, 2026-10-26 07:52): PASS (re-review after fix round 1)
1. Fixed: `form-model.ts:72` uses `Object.hasOwn(WIDGET_KINDS, entry.type)`; `test/form-model.test.ts:88` covers `matrix`, `constructor`, `toString`, `__proto__`. Probe also threw for `hasOwnProperty` and `valueOf`. A JSON catalogue with a `__proto__` key builds without prototype effects.
2. package.json/lockfile `@vsslicer/profile-api` edit: confirmed by the coordinator as theirs.
Note (non-blocking): a non-string JSON `type` such as `["int"]` coerces to `"int"` and is accepted; the catalogue is our own shipped data, so not a finding.
Ran: profiles `pnpm test` (23 pass), `pnpm lint`, `pnpm build`; `node scripts/run.mjs checks` (exit 0).
