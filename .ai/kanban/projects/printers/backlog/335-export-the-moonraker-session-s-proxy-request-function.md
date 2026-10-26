---
id: 335
title: "Export the Moonraker session's proxy request function"
type: feature
priority: P2
effort: S
model: sonnet
area: [moonraker]
story: "FIL:US38"
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [179, 325]
created: 2026-10-25
---

A versioned export (and a command fallback) that returns, for a Moonraker printer, the `spoolmanProxy` request function and the `spoolman` flag, so `filament-extension` needs no connector.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] For a Moonraker fixture printer with `[spoolman]` the export returns a working function; other printers and Moonraker without the component return `undefined`
- [ ] With the agent on, the function goes through the agent; exports and types are versioned and additive

## Tasks

- [ ] Add the export
- [ ] Command fallback
- [ ] Stub extension test

## Progress

Not started.
