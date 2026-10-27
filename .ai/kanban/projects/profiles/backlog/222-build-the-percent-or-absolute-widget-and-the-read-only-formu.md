---
id: 222
title: Build the percent-or-absolute widget and the read-only formula view
type: feature
priority: P1
effort: M
model: sonnet
area: [form]
story: US29
milestone: "VSS:M2"
created: 2026-10-26
---

From the PRF-69 spike decision (`vsslicer/modules/apps/profiles/docs/widget-spike.md`): percent-or-absolute values are stored as typed and resolved only for display; the unit toggle converts rather than reinterprets (105% must not become 105 mm); `max_literal` prompts "did you mean %?"; Cura `{expr}` formulas show in a read-only formula view that can be replaced by a literal and restored.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The toggle converts through `ratioOver`, with a test that 105% of a 0.4 mm base becomes 0.42 mm
- [ ] A literal over `maxLiteral` shows the hint; the formula view replaces and restores a formula
- [ ] Keyboard reachable, with an axe-core check

## Progress

Not started.
