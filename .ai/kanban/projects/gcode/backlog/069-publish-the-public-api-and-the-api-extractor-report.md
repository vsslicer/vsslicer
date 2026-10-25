---
id: 69
title: Publish the public API and the api-extractor report
type: chore
priority: P2
effort: S
model: sonnet
area: [language]
story: US46
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [66, 67]
created: 2026-10-25
---

One entry point exports the catalogue loader, the tokenizer, `complete`, `hover`, `validateTemplate` and the option-variable adapter, with versioned types.

**Code:** `vsslicer/modules/gcode-templates/src/application/...` (module: `gcode-templates`, layer: `application`)

## Acceptance criteria

- [ ] A consumer test imports the package from its built tarball in plain Node and validates a template
- [ ] The api-extractor report is checked in and CI fails on an unreviewed change
- [ ] No `vscode` import anywhere in the package (lint)

## Tasks

- [ ] Entry point
- [ ] API report
- [ ] Consumer test

## Progress

Not started.
