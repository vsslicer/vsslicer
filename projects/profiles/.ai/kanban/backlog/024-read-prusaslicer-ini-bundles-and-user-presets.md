---
id: 24
title: Read PrusaSlicer INI bundles and user presets
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US11
milestone: "VSS:M2"
depends_on: [135, 119]
created: 2026-10-25
---

Parses `[vendor]`, `[printer_model:*]`, `[printer:*]`, `[print:*]`, `[filament:*]` and `*abstract*` sections, multi-parent `inherits`, `renamed_from`, `alias` and `compatible_*_condition` into a native section tree with line numbers.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/ini/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Parses `PrusaResearch.ini@b028299` into 1 vendor, 35 printer models, 238 printers, 633 prints and 6 069 filaments before flattening
- [ ] A malformed line yields a diagnostic with file and line and parsing continues
- [ ] The native text of every key is kept verbatim (number formatting, key order)

## Tasks

- [ ] Write the tokenizer and section reader
- [ ] Keep native text and order
- [ ] Write the tests against the pinned pack

## Progress

Not started.
