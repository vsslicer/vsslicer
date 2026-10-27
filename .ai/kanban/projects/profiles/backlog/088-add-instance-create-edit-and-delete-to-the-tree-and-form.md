---
id: 88
title: "Add instance create, edit and delete to the tree and form"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US34
milestone: "VSS:M2"
sprint: "VSS:SP22"
depends_on: [61, 144, 73]
created: 2026-10-25
---

Tree items and form fields for a `printer_instance`: model, nozzle per toolhead, surface, feeder and connection fields, with the credential entered through an input box and never shown.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/instances/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Create, edit and delete an instance from the tree; the entity file has `secret_ref` and no credential
- [ ] A deleted instance disappears from the tree and its secret from the vault
- [ ] A 'credential missing' instance shows a warning with a Re-enter action

## Tasks

- [ ] Tree items and commands
- [ ] Form fields
- [ ] Integration test

## Progress

Not started.
