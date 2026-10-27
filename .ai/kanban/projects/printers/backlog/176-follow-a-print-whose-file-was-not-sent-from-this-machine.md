---
id: 176
title: Follow a print whose file was not sent from this machine
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US34
milestone: "VSS:M3"
sprint: "VSS:SP34"
depends_on: [175, 156]
created: 2026-10-25
---

Download via `printer://` with a size prompt, or degrade to progress only.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Test: unknown-origin file prompts and follows after download; declining shows progress only with a message

## Tasks

- [ ] Download path
- [ ] Degrade path

## Progress

Not started.
