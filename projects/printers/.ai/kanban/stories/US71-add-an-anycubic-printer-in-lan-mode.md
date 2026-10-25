---
id: US71
title: "Add an Anycubic printer in LAN mode"
status: reviewed
epic: VSS:E60
---

As an owner of an Anycubic Kobra 3 or S1 with LAN mode on, I want status and job control from VS Code, so that I can use the printer without the Anycubic cloud.

## Acceptance criteria

- [ ] A spike settles the LAN-mode handshake (HTTP on port 18910, device certificate, mutual TLS on 9883, AES-CBC payload) and the upload procedure, or records that upload is not possible
- [ ] The adapter passes the contract kit on recorded MQTT fixtures; all keys and certificates stay in SecretStorage or memory and never in settings or logs
- [ ] It is labelled `reverse engineered`; enabling LAN mode disconnects the vendor cloud and the consent dialog says so

## Out of scope

- Rinkhals-rooted printers (they run Moonraker); Photon resin UDP protocol; ACE Pro addressing.
