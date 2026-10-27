---
id: 341
title: "Add Union, Difference and Intersection to the object menu with progress and refusals"
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, viewer]
story: US86
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [157, 335]
created: 2026-10-25
---

The menu entries for the boolean tools on a multi-selection: operand order for difference, progress with cancel, and the refusal message when an operand is not manifold.

**Code:** `vsslicer/modules/apps/project/src/presentation/menus/boolean.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The entries are enabled only for two or more selected objects or parts
- [ ] Difference lets the user pick which selection is subtracted
- [ ] A non-manifold operand shows the refusal message with a Repair offer
- [ ] Cancel stops the work and changes nothing

## Tasks

- [ ] Menu entries
- [ ] Operand order
- [ ] Progress and errors
- [ ] Harness test

## Progress

Not started.
