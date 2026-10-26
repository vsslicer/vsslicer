---
id: 92
title: Add the Moonraker proxy transport and the active-spool calls
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US37
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [83, PRN-325]
created: 2026-10-25
---

A `SpoolmanTransport` that sends requests through Moonraker's `/server/spoolman/proxy`, shaped as `moonraker@b559b9a:components/spoolman.py` expects, plus get and set of Moonraker's active spool id. The module takes the Moonraker request function from the caller, so it depends on no connector.

UNRESOLVED: needs printer-moonraker: a proxy request method, the `[spoolman]` component flag and active spool get/set, and a recorded session with `[spoolman]`.

**Code:** `vsslicer/modules/filament-spoolman/src/adapters/...` (module: `filament-spoolman`, layer: `adapters`)

## Acceptance criteria

- [ ] Proxy requests are shaped as the component expects, checked against recorded fixtures with `[spoolman]`
- [ ] The REST client contract suite passes over this transport on the recorded fixtures
- [ ] Verified on recorded fixtures only (D5)

## Tasks

- [ ] Write the transport
- [ ] Active spool calls
- [ ] Fixture tests

## Progress

Not started.
