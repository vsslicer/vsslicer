---
id: US19
title: "A Klipper user uploads to Moonraker, starts and watches the job"
status: reviewed
epic: VSS:E23
---

As a Klipper user, I want to upload a G-code file to Moonraker, optionally start it, control the job and see progress, so that I can print from VS Code on Moonraker printers, including the Klipper derivatives that expose stock Moonraker.

## Acceptance criteria

- [ ] The contract kit passes for Moonraker against recorded HTTP and WebSocket fixtures (types re-derived from the published API; no Moonraker code copied)
- [ ] Upload with `checksum`: a corrupted fixture returns 422 and surfaces as `PrinterError.fileRejected`
- [ ] Auth: API key, oneshot token for the WebSocket and trusted-client mode
- [ ] Job control and `printer.objects.subscribe` status are mapped; every request has a timeout
- [ ] Verified on fixtures and emulators only (D5); a hardware checklist for contributors is in the module

## Out of scope

- Moonraker queue and history (E46, E47), Spoolman proxy, cameras beyond returning `webcams()`.
