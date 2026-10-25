---
id: 33
title: Read the PrusaSlicer 3.0 YAML tree behind the experimental flag
type: feature
priority: P1
effort: L
model: opus
area: [importers]
story: US14
milestone: "VSS:M2"
depends_on: [119, 135, 10]
created: 2026-10-25
---

Reads `vendor.yaml` kinds and `preset-*.yaml` trees with `variants`, pinned to `PrusaSlicer@30ef591`; off unless `experimental` is set.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/yaml/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Golden counts at @30ef591: 288 filament, 13 print, 11 printer, 12 tool presets; `vendor.yaml` 17 printers, 32 printer_configs, 10 tools, 3 feeders, 6 sheets
- [ ] Without the flag the reader returns a diagnostic and no entities
- [ ] Tests are tagged `pinned-30ef591` so a format change shows as a failing pinned test

## Tasks

- [ ] Read vendor.yaml
- [ ] Read preset trees and variants
- [ ] Pin and tag the tests

## Progress

Not started.
