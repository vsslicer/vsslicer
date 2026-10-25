---
id: US4
title: "A user adds a printer and sees its status in the Printers view"
status: reviewed
epic: VSS:E20
---

As a printer owner, I want to add a printer by host and adapter, keep its secret out of my settings, and see its normalised status and progress in a Printers tree view, so that I can watch any printer family the same way.

## Acceptance criteria

- [ ] The registry lists registered adapters; a printer is added manually by host and adapter id and appears in the Printers tree view with state, progress and temperatures
- [ ] Its secret is stored in SecretStorage and never written to settings or logs (a test greps the settings file and the output channel)
- [ ] An adapter that throws inside the shared extension host becomes a `PrinterError` with a user-visible result; nothing heavy runs on the host thread
- [ ] Printer connections (non-secret) persist in settings and survive a reload

## Out of scope

- Discovery (US23), file browsing (US28), the daemon (US15).
