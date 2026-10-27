---
id: 224
title: "Pass project, plate and profile to PrinterRegistry.upload"
type: feature
priority: P1
effort: S
model: sonnet
area: [history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [179, 215]
created: 2026-10-25
---

An optional send context `{project, plateIndex, profileRef, thumbnail}` on the upload call, forwarded to the agent so the record can link back.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Documented and typed; a stub test shows the context in the recorded event
- [ ] Calls without a context still work and are recorded as unlinked

## Tasks

- [ ] Type
- [ ] Forward
- [ ] Stub test

## Progress

Not started.
