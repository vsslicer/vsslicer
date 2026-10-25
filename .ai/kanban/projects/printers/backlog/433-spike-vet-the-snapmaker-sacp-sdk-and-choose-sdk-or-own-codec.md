---
id: 433
title: "Spike: vet the Snapmaker SACP SDK and choose SDK or own codec"
type: spike
priority: P2
effort: M
model: opus
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [432]
created: 2026-10-25
---

The research found `@snapmaker/snapmaker-sacp-sdk` 0.1.1 (ISC, no repository field, last published 2023-07-20). Vet the tarball and decide whether to depend on it or write our own SACP codec from `Luban@db573f5` (AGPL-3.0, port under D2 with provenance if used).

**Code:** `vsslicer/modules/printer-unofficial-snapmaker/docs/sacp.md` (module: `printer-unofficial-snapmaker`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] The tarball is unpacked and read: licence text, install scripts, network calls, bundled code and its dependencies are listed
- [ ] A decision states SDK or own codec with the reasons; if the SDK is used, the pin and the integrity hash are recorded
- [ ] The SACP frame layout, the discover reply `name@ip|key:value...` and the upload and start sequence are documented from `Luban` (`BroadcastMachineFinder.ts`, `constants/index.js:213`) with what is unverified
- [ ] Written to `vsslicer/modules/printer-unofficial-snapmaker/docs/sacp.md`

## Tasks

- [ ] Unpack and read the tarball
- [ ] Read the Luban source
- [ ] Write the decision

## Progress

Not started.
