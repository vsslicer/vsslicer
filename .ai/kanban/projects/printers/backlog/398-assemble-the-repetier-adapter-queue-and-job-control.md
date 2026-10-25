---
id: 398
title: "Assemble the Repetier adapter: queue and job control"
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [396, 397]
created: 2026-10-25
---

Start copies the uploaded model to the queue with `autostart` and starts the job; stop uses `stopJob`, continue `continueJob`. The documentation lists no pause action, so `pause` is not offered.

**Code:** `vsslicer/modules/printer-unofficial-repetier/src/application/...` (module: `printer-unofficial-repetier`, layer: `application`)

## Acceptance criteria

- [ ] Upload then start reaches `printing` on the fixtures; stop reaches `idle`
- [ ] `pause` is absent from the capabilities and a call fails with `unsupported`
- [ ] `emergencyStop` and raw `send` are not exposed

## Tasks

- [ ] Descriptor
- [ ] Start, stop, continue
- [ ] Tests

## Progress

Not started.
