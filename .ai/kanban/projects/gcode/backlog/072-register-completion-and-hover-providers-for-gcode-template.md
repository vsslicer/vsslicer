---
id: 72
title: Register completion and hover providers for gcode-template
type: feature
priority: P2
effort: M
model: sonnet
area: [language]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [71, 48, 70]
created: 2026-10-25
---

Thin providers over `@vsslicer/gcode-templates` that reuse the G-code command catalogue providers for plain G-code lines and add the placeholder completions and hovers; the slicer and template kind come from the document's metadata.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] `@vscode/test-electron`: completion and hover work in a template opened for an Orca kind and for a Prusa kind, and a placeholder outside its kinds is not offered as a placeholder
- [ ] Command hovers from the G-code language still work inside templates
- [ ] A document with no slicer metadata offers option variables only and says why

## Tasks

- [ ] Providers
- [ ] Metadata
- [ ] Integration tests

## Progress

Not started.
