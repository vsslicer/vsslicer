---
id: US70
title: "Add an Elegoo Centauri Carbon 2 printer"
status: reviewed
epic: VSS:E60
---

As an owner of an Elegoo Centauri Carbon 2, I want to upload and start prints from VS Code, so that I can use the printer on its newer token-based protocol.

## Acceptance criteria

- [ ] A spike records the CC2 command set that the cited Orca source shows, with a statement of what is unverified
- [ ] The adapter passes the contract kit on recorded fixtures: `GET /system/info` with `X-Token`, chunked `POST /upload`, status and start
- [ ] It is labelled `reverse engineered`, gated by firmware string, and read-only on an unknown one

## Out of scope

- SDCP (US67); CC2 firmware update.
