---
id: US37
title: "Use Moonraker's Spoolman proxy without double booking"
status: reviewed
epic: VSS:E45
---

As a Klipper owner whose Moonraker already has a `[spoolman]` section, I want VSSlicer to use its proxy as transport, set its active spool when I assign one, and stop booking that printer's extrusion itself, so that usage is counted once.

## Acceptance criteria

- [ ] Proxy requests are shaped as `moonraker@b559b9a:components/spoolman.py` expects, on recorded fixtures with `[spoolman]`
- [ ] Active spool is set on assignment; E42 books no extrusion for that printer
- [ ] Websocket through the proxy is checked; fallback is polling on `sync_rate`
- [ ] Verified on recorded fixtures only (no Klipper hardware, D5)

## Out of scope

- Moonraker's own Spoolman settings
