---
id: 172
title: Keep failed items visible with an action
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US32
milestone: "VSS:M3"
sprint: "VSS:SP34"
depends_on: [170]
created: 2026-10-25
---

Failed items stay with their error until dismissed.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `auth` offers 'fix credentials'; `fileRejected` shows the printer's reason; dismiss removes the item (tests)

## Tasks

- [ ] Error rows
- [ ] Actions
- [ ] Tests

## Progress

Not started.
