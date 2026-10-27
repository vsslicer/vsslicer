---
id: 136
title: Implement the WCAG contrast function
type: feature
priority: P3
effort: XS
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [132]
created: 2026-10-25
---

A pure relative-luminance and contrast-ratio function with alpha compositing over a background.

**Code:** `vsslicer/modules/apps/themes/src/domain/contrast.ts` (module: `themes`, layer: `domain`)

## Acceptance criteria

- [ ] Known pairs match the WCAG reference values (black/white 21, #777 on white 4.48) in unit tests
- [ ] Colours with alpha are composited over the given background before comparing
- [ ] Invalid colour strings throw a named error

## Tasks

- [ ] Write the function and tests

## Progress

Not started.
