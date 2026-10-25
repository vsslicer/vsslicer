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
sprint: "VSS:SP4"
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
