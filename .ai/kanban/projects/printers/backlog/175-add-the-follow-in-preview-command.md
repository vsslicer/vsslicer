---
id: 175
title: Add the Follow in preview command
type: feature
priority: P1
effort: M
model: sonnet
area: [daemon]
story: US34
milestone: "VSS:M3"
sprint: "VSS:SP31"
depends_on: [174, GCP-50, GCP-55]
created: 2026-10-25
---

Command that opens the file in the preview and calls `GcodePreview.follow(uri, offset)` as events arrive (never imports GCP code).

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the GCP preview installed the command starts follow for the selected printer; on feed stop it calls `stopFollow`
- [ ] Without the preview extension the command explains what is missing

## Tasks

- [ ] Command
- [ ] Feed to follow bridge
- [ ] Tests

## Progress

Not started.
