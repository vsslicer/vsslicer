---
id: 21
title: Add the manual Add printer command
type: feature
priority: P1
effort: M
model: sonnet
area: [api]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [17, 18, 19]
created: 2026-10-25
---

Pick a registered adapter, enter host and the auth fields the adapter declares, store the secret and add the printer.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The form fields come from the adapter's declared auth scheme; the secret goes to SecretStorage, the rest to settings
- [ ] A failed probe shows the typed error with a retry; the printer is not added silently
- [ ] Integration test with the fake adapter adds a printer end to end

## Tasks

- [ ] Command and quick pick
- [ ] Auth form
- [ ] Probe and error path

## Progress

Not started.
