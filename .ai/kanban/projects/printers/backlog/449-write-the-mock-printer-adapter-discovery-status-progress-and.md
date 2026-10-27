---
id: 449
title: "Write the mock printer adapter: discovery, status, progress and errors"
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US75
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [448, 14]
created: 2026-10-27
---

A `printer-api` adapter and discoverer that simulate printers, so the Printers view and Add printer work before any network adapter (D23). Unlike the test fake in `@vsslicer/printer-api/testing` (PRN-8), it runs in the product: it advances simulated jobs on a clock and is configured by the user, not by a test script. Reuse the fake's status types; don't copy its code.

**Code:** `vsslicer/modules/printer/mock/src/adapters/` (module: `printer-mock`, layer: `adapters`)

## Acceptance criteria

- [ ] Adapter id `mock`; its declared auth scheme is one optional "access code" field, so Add printer (PRN-21) shows a field and SecretStorage is exercised
- [ ] A scenario config (`{ printers: [{ name, model, behaviour: 'idle' | 'printing' | 'error' | 'offline' | 'flaky' }] }`, with a default of three printers) drives discovery results and status
- [ ] `printing` advances progress, layer and temperatures on an injected clock and finishes the job; `error` raises a `PrinterError` with a notification code; `flaky` drops and restores the connection; `offline` fails the probe with the typed error
- [ ] The adapter passes the printer-api contract kit (PRN-10, PRN-11) with a fake clock
- [ ] Unit tests drive each behaviour with the fake clock; no test waits on real time (rule 26)

## Tasks

- [ ] Scenario model and clock
- [ ] Adapter, session and discoverer
- [ ] Contract kit run and unit tests

## Progress

Not started.
