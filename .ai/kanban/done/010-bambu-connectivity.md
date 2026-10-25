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

- [x] LAN mode documented: MQTT over TLS (port 8883, topics, message schema for status and commands), FTPS (990) file transfer, camera stream ports, access code auth; firmware versions it applies to
- [x] Cloud API documented as far as public knowledge goes: login/token flow, MQTT broker, device list, print start; dated
- [x] The January 2025 authorisation/control firmware and Bambu Connect explained: what changed, Developer Mode (LAN-only), what third-party tools lost or kept, current state as of the research date
- [x] Community projects analysed: ha-bambulab, bambu-farm, OrcaSlicer's network plugin (closed binary loaded by Orca) and the `bambu-connect`/`bambu-cli` reimplementations; licences and maintenance state
- [x] Legal/ToS risk assessed: Bambu ToS and EULA clauses about third-party clients, the Bambu Connect certificate extraction episode, what posture is defensible for us
- [x] Recommendation: which modes we support, in which order, and what we must not ship

## Tasks

- [x] Read Bambu wiki pages, community repos' protocol docs
- [x] Collect ToS/EULA text with dates
- [x] Write the report

## Progress

Done. LAN MQTT/FTPS/camera protocol with firmware versions, cloud API as publicly known, the January 2025 authorisation firmware, Bambu Connect and Developer Mode, community projects and the closed network-plugin boundary (OpenBambuAPI cc383a2, ha-bambulab 0e027ff), ToS clauses quoted with dates, recommended support order. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: no printer to test against; per-model Developer Mode support and TLS client-cert need rest on community sources; whether the Bambu Connect certificate was rotated is unknown.
