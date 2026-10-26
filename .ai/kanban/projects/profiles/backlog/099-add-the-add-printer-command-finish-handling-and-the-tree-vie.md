---
id: 99
title: "Add the add-printer command, finish handling and the tree view of selections"
type: feature
priority: P0
effort: M
model: sonnet
area: [wizard]
story: US40
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [98, 73, 61, 88, 144, 137, 138, 139]
created: 2026-10-25
---

The command that opens the wizard, creates the instance on finish and opens the resolved default process in the form; selected materials and the default process appear in the tree.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/wizard/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Finishing creates the instance and opens the resolved default process in the form (integration test per ecosystem fixture with the real adapters; `resolve` equals the tuple oracle)
- [ ] Selected materials and the default process are visible in the tree after finish
- [ ] Cancel from the command palette leaves no entity or secret

## Tasks

- [ ] Write the command and finish handler
- [ ] Tree entries
- [ ] Integration tests

## Progress

Not started.
