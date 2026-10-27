---
id: 198
title: Slice two plates against two printers
type: feature
priority: P2
effort: S
model: sonnet
area: [plates]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP44"
depends_on: [196, 183, 184, SLC-42]
created: 2026-10-25
---

Slices each plate of the two-printer fixture with the presets of its own printer.

**Code:** `vsslicer/modules/apps/project/test/integration/mixed-printers/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Each plate's G-code carries its printer's bed size and start G-code
- [ ] Reopening the saved file keeps both references

## Tasks

- [ ] Harness
- [ ] Checks

## Progress

Not started.
