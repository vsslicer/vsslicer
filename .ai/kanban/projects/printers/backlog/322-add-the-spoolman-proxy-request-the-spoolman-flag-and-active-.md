---
id: 322
title: "Add the Spoolman proxy request, the spoolman flag and active spool get and set"
type: feature
priority: P2
effort: M
model: sonnet
area: [moonraker]
story: "FIL:US37"
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [321, 199]
created: 2026-10-25
---

Exposes what `filament-spoolman` needs through Moonraker: a `spoolmanProxy(request)` method that posts to `/server/spoolman/proxy` shaped as `moonraker@b559b9a:components/spoolman.py` expects, a `spoolman` boolean from the `[spoolman]` component list, and `getActiveSpool()` / `setActiveSpool(id)`.

**Code:** `vsslicer/modules/printer-moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] Requests are shaped as the component expects, checked against the new fixtures (method, path, query, body, `use_v2_response`)
- [ ] `spoolman` is true only when the component is loaded; with it false the methods return a typed `unsupported` error
- [ ] Active spool get and set round-trip on the fixtures; verified on recordings only (D5)

## Tasks

- [ ] Proxy method
- [ ] Component flag
- [ ] Active spool calls
- [ ] Fixture tests

## Progress

Not started.
