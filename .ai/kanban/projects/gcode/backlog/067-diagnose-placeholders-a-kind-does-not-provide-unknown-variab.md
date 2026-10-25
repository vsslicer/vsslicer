---
id: 67
title: "Diagnose placeholders a kind does not provide, unknown variables and unbalanced conditions"
type: feature
priority: P2
effort: M
model: opus
area: [language]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [65]
created: 2026-10-25
---

`validateTemplate(text, slicer, kind, options)` returns diagnostics: warning for a placeholder the kind does not provide (naming the kinds that do), hint for an unknown variable, error for unbalanced `{if}`/`{endif}`.

**Code:** `vsslicer/modules/gcode-templates/src/application/...` (module: `gcode-templates`, layer: `application`)

## Acceptance criteria

- [ ] A placeholder from another kind gives a warning whose message lists the providing kinds; a placeholder that is also a config option does not warn
- [ ] Unknown variables are hints, never warnings; unbalanced conditions are errors with a range
- [ ] Pure function, no `vscode` import; the same call returns the same result with and without the editor

## Tasks

- [ ] Rules
- [ ] Messages
- [ ] Tests

## Progress

Not started.
