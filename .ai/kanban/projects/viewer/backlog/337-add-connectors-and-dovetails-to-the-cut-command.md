---
id: 337
title: Add connectors and dovetails to the cut command
type: feature
priority: P2
effort: S
model: sonnet
area: [editor, mesh]
story: US88
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [336, 334]
created: 2026-10-25
---

Extends the cut command payload with connector placements and the dovetail option; the cut result carries plugs and holes.

**Code:** `vsslicer/modules/apps/project/src/application/commands/cut/connectors.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A cut with each connector kind and with a dovetail gives two closed parts that fit (checked by the mesh-boolean fit measure)
- [ ] The payload round-trips through the command log
- [ ] Undo restores the original object

## Tasks

- [ ] Payload
- [ ] Apply
- [ ] Tests

## Progress

Not started.
