---
id: 40
title: "Add the failure UI: no WebGL2, context lost, worker crash"
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US13
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [30]
created: 2026-10-25
---

The preview breaks alone; the host and other extensions are unaffected.

## Acceptance criteria

- [ ] Forced WebGL2 failure shows a message naming `disable-hardware-acceleration` and software rendering
- [ ] `WEBGL_lose_context` restores the view from cached buffers
- [ ] A killed worker shows the error panel with retry and other extensions keep working (test)

## Tasks

- [ ] WebGL2 probe message
- [ ] Context restore
- [ ] Worker crash panel
- [ ] Tests

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: the gcode-preview lane is full (one card per module at a time); after GCP-31, 32, 35, 38 at about 69 minutes, a fifth serial card breaks rule 5's 72-minute critical path. First to pull back in if the lane runs ahead.
