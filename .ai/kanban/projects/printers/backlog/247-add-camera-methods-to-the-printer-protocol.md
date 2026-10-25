---
id: 247
title: Add camera methods to the printer protocol
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [168, 246]
created: 2026-10-25
---

The agent protocol methods the camera extension calls: `camera.registerSources`, `camera.list`, `camera.open` (returns the proxy URL and token for a stream), `camera.snapshot` and `camera.close`.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Methods and their schemas are added to the printer method catalogue; a client built from the schema calls each against the agent with a fake camera source
- [ ] `camera.open` on an unknown printer or camera returns a typed error; `camera.close` is idempotent
- [ ] Version skew test: an agent without the camera methods answers method-not-found and the client reports it

## Tasks

- [ ] Add the schemas
- [ ] Implement the handlers on the session host
- [ ] Write the protocol tests

## Progress

Not started.
