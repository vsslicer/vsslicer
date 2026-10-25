---
id: US69
title: "Add a Creality K2 printer on port 9999, with CFS"
status: reviewed
epic: VSS:E60
---

As an owner of a Creality K2 printer, I want to see status, upload, start prints and map CFS colours from VS Code, so that I can use the printer with vendor firmware that has no Moonraker.

## Acceptance criteria

- [ ] The Creality adapter passes the contract kit on recorded fixtures and is labelled `reverse engineered` everywhere it is shown
- [ ] Status comes from the `get` method on the WebSocket on port 9999; upload is HTTP `POST /upload/<name>`; start is `set opGcodeFile` with the `printprt:` path
- [ ] CFS boxes (`boxsInfo`), `colorMatch` and `multiColorPrint` map to the multi-material capability
- [ ] A firmware string the adapter does not know opens read-only
- [ ] DNS-SD names starting `Creality` followed by `GET /info` produce discovery results

## Out of scope

- Moonraker on 7125 (covered by `printer-moonraker`); camera; CFS firmware flashing.
