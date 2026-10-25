---
id: 25
title: Flatten Prusa sections into unified entities and golden counts
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US11
milestone: "VSS:M2"
depends_on: [24, 135, 10, 23, 136]
created: 2026-10-25
---

Turns parsed Prusa sections into unified entities (keys through the catalogue, conditions through the converters) with the native form kept beside each, and removes abstract sections after flattening.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/import/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Golden counts for `PrusaResearch.ini`: 1 vendor, 35 printer models, 238 printers, 633 prints, 6 069 filaments after flattening; no abstract section remains
- [ ] Every entity validates against the E11 JSON Schema; every native key is mapped or listed `native_only` in diagnostics, none dropped
- [ ] Cycle and unknown parent give a diagnostic and leave other entities importable
- [ ] A user-preset fixture (not from a vendor bundle) imports with `inherits` kept

## Tasks

- [ ] Map sections to entities
- [ ] Flatten multi-parent inheritance
- [ ] Attach the native form
- [ ] Add golden-count and schema tests

## Progress

Not started.
