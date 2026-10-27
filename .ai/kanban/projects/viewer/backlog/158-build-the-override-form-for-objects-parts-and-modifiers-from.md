---
id: 158
title: "Build the override form for objects, parts and modifiers from the form model"
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [151, 148, 152, PRF-144]
created: 2026-10-25
---

A form generated from the `profiles` form model that lists only the allowed keys for the level, shows each value's source, validates input with the catalogue message and offers reset to inherited.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/overrides/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A key not allowed at the level is not listed and a search for it explains why
- [ ] An invalid value shows the validation message and sends no command
- [ ] Reset removes the override
- [ ] The form updates when the profile selection changes

## Tasks

- [ ] Form from the model
- [ ] Source badges
- [ ] Validation display

## Progress

Not started.
