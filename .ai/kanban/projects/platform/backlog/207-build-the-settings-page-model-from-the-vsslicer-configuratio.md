---
id: 207
title: Build the settings page model from the VSSlicer configuration schemas
type: feature
priority: P0
effort: M
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [206]
created: 2026-10-27
---

The pure model behind the VSSlicer settings page (D23 step 2): from the `contributes.configuration` blocks of the `vsslicer.*` extensions, build sections, fields, defaults, current values and validation. The page is generated from our schema; nothing is hand-listed.

**Code:** `vsslicer/modules/apps/workbench/src/application/settings-model.ts` (module: `workbench-extension`, layer: `application`)

## Acceptance criteria

- [ ] Input: a list of `{extensionId, configuration}` (plain JSON, read by the presentation layer); output: sections per extension and `title`, fields with type (`boolean`, `string`, `enum`, `number`, `integer`, `array`, `object`), default, description (markdown kept as text), `order` and `scope`
- [ ] `validate(field, value)` honours `minimum`, `maximum`, `pattern`, `enum`; `object` and `array` fields fall back to "Edit in settings.json"
- [ ] Only extension ids starting `vsslicer.` are included; a malformed block is skipped and reported, the rest still show
- [ ] Unit tests on the real `package.json` configuration blocks of `apps/printers`, `apps/profiles` and `apps/project` copied as fixtures

## Tasks

- [ ] Model and validation
- [ ] Unit tests

## Progress

Not started.
