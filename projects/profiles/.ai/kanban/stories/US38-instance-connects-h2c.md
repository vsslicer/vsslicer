---
id: US38
title: "A created instance connects to the H2C through getConnection"
status: reviewed
epic: VSS:E16
---

The owner creates or imports an instance for their H2C and a printer adapter connects to the real printer with the credential from `getConnection`.

## Acceptance criteria

- [ ] On the H2C (D5) a created and an imported `bambu-lan` instance connect; firmware version and date recorded in the test log
- [ ] A wrong access code gives a named authentication error
- [ ] The same flow passes against the fake MQTT broker fixture before hardware

## Out of scope

- Other printer families.
