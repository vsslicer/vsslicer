---
id: 110
title: "Import and export PrusaSlicer config bundles with [presets]"
type: feature
priority: P1
effort: M
model: sonnet
area: [importers, export]
story: US45
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [25, 52, 132, 136]
created: 2026-10-25
---

PrusaSlicer `.ini` config bundles including the `[presets]` section.

**Code:** `vsslicer/modules/profiles/prusa/src/adapters/bundles/prusa/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] The PrusaSlicer 2.9.6 fixtures (incl. the real saved bundle) import with expected counts and the selected presets from `[presets]`
- [ ] `import(export(x))` equals x; unmodified bundles re-export byte-equivalently

## Tasks

- [ ] Reuse the INI reader for bundles
- [ ] Write the `[presets]` handling
- [ ] Round-trip tests

## Progress

Not started.
