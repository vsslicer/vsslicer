---
id: US23
title: "A user finds Moonraker, OctoPrint and PrusaLink printers on the LAN without typing an address"
status: reviewed
epic: VSS:E23
---

As a printer owner, I want 'Add printer' to list the hosts found by mDNS and SSDP and probed for their family, so that I do not have to look up IP addresses.

## Acceptance criteria

- [ ] Discovery tests with `multicast-dns` responders in-process for `_moonraker._tcp`, `_octoprint._tcp`/`_http._tcp`, and an SSDP responder
- [ ] Results are probed (`server/info`, `api/version`, `rr_connect`) before they are offered; manual entry always remains
- [ ] Discovery runs in the agent on the UI machine; in a Remote session the 'Add printer' list explains this instead of showing nothing

## Out of scope

- Vendor-specific discovery (Creality K2 and others), UDP broadcast protocols.
