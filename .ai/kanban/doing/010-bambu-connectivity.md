---
id: 10
title: Bambu Lab connectivity
type: spike
priority: P0
effort: M
area: [printers, legal]
milestone: R1
owner: worker-sonnet
created: 2026-10-25
---

How Bambu printers can be reached today, what the 2025 authorisation changes did, and the legal exposure.

Report: `docs/research/bambu-connectivity.md`. Notes: `.reference/notes/VSS-10-bambu-connectivity.md`.

## Acceptance criteria

- [ ] LAN mode documented: MQTT over TLS (port 8883, topics, message schema for status and commands), FTPS (990) file transfer, camera stream ports, access code auth; firmware versions it applies to
- [ ] Cloud API documented as far as public knowledge goes: login/token flow, MQTT broker, device list, print start; dated
- [ ] The January 2025 authorisation/control firmware and Bambu Connect explained: what changed, Developer Mode (LAN-only), what third-party tools lost or kept, current state as of the research date
- [ ] Community projects analysed: ha-bambulab, bambu-farm, OrcaSlicer's network plugin (closed binary loaded by Orca) and the `bambu-connect`/`bambu-cli` reimplementations; licences and maintenance state
- [ ] Legal/ToS risk assessed: Bambu ToS and EULA clauses about third-party clients, the Bambu Connect certificate extraction episode, what posture is defensible for us
- [ ] Recommendation: which modes we support, in which order, and what we must not ship

## Tasks

- [ ] Read Bambu wiki pages, community repos' protocol docs
- [ ] Collect ToS/EULA text with dates
- [ ] Write the report

## Progress

Not started.
