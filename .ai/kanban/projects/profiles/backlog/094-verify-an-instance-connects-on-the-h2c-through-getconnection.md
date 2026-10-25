---
id: 94
title: Verify an instance connects on the H2C through getConnection against a real adapter
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US38
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [86, PRN-60]
created: 2026-10-25
---

The H2C criterion: an imported or created instance reaches the real printer through `getConnection` and the registered Bambu adapter; firmware version and date go in the test log (D5).

**Code:** `vsslicer/modules/profiles-extension/test/h2c/` (module: `profiles-extension`, layer: `presentation`, manual hardware test)

## Acceptance criteria

- [ ] On the H2C (D5): a created `bambu-lan` instance and an imported one both connect, with the credential coming only from `getConnection`; firmware version and date recorded in the test log
- [ ] A wrong access code gives a named authentication error and the instance stays intact
- [ ] Before hardware, the same flow passes against the fake MQTT broker fixture

## Tasks

- [ ] Run the hardware session
- [ ] Record firmware and result
- [ ] Keep the fake-broker variant

## Progress

Not started.
