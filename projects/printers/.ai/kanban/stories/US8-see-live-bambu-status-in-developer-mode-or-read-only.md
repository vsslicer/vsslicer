---
id: US8
title: "A Bambu owner sees live status of the H2C, or read-only status when Developer Mode is off"
status: reviewed
epic: VSS:E21
---

As a Bambu owner, I want connect-by-IP over MQTT/TLS with my access code to show state, progress, temperatures and AMS trays, and a read-only mode with an honest prompt when Developer Mode is off, so that I can watch my printer without trusting anything beyond my LAN.

## Acceptance criteria

- [ ] The E20 contract kit passes against ha-bambulab `mock_data` fixtures and a fake MQTT broker with a self-signed CA standing in for Bambu's
- [ ] Delta-merge tests: P1-style partial pushes merged over a full `pushall` give the same status as an X1-style full push (fixture pairs)
- [ ] MQTT reconnect backs off to a cap of 60 s; a wrong access code does not spin the host; TLS and parse errors surface as `PrinterError`, never unhandled rejections; connect-by-IP checks the certificate CN against the serial explicitly
- [ ] Mode F: `fun` flag fixtures for enabled and disabled select the right capability set; control commands are disabled with a 'requires Developer Mode' explanation
- [ ] `vsslicer.bambu` registers the adapter with `vsslicer.printers`
- [ ] Verified on fixtures here; the H2C session is in US14

## Out of scope

- Cloud mode, camera.
