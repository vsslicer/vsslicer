---
id: E60
title: Add vendor protocol adapters in vsslicer.printers-unofficial
status: draft
initiative: I10
project: PRN
order: 12
depends_on: [E20, E22, E23]
rows: ["§11 Vendor protocols (Creality 9999, SDCP, Anycubic MQTT, Snapmaker SACP, AnkerMake)"]
---

Delivers `vsslicer.printers-unofficial`, an opt-in extension with adapters for vendor protocols:
Elegoo SDCP (official) and Repetier-Server (documented) first, then the reverse-engineered ones
(Creality K2 port 9999 and CFS, Elegoo CC2, Anycubic LAN MQTT, Snapmaker SACP), each labelled
"reverse engineered" (D3 item 4). It is for owners of those printers whose firmware has no Moonraker.

## Scope

In:
- SDCP V3.0.0: UDP `M99999` discovery, WebSocket 3030, chunked upload with MD5, start/pause/stop;
  may move into `vsslicer.printers` because it is official.
- Repetier-Server: WebSocket and HTTP actions, upload, jobs.
- Reverse-engineered adapters, one story each, ordered by owner request: Creality 9999/CFS, Elegoo
  CC2, Anycubic MQTT-TLS, Snapmaker SACP (ISC SDK vetted before use).
- Per-adapter label and a first-use consent dialog.

Out: AnkerMake (needs account secrets; fails the "no vendor secrets" rule,
`printer-connectivity.md` §2), any vendor cloud.

Code: our own TypeScript from protocol descriptions; Orca vendor agents (AGPL) may be ported under D2
with provenance lines.

## Feature-matrix rows

- §11 Vendor protocols (P2): done when SDCP and Repetier pass the contract kit on recorded fixtures,
  and each reverse-engineered adapter added passes on its own recorded fixtures.

## Acceptance criteria

- [ ] An owner decision schedules this I10 epic and names which vendor adapters to build.
- [ ] Contract kit passes per adapter on recorded fixtures; consent dialog test
- Hardware: none (D5); contributor checklists only.

## Dependencies

- Needs E20, E22, E23 (shared HTTP/WS harness and discovery).
- Exposes adapters to the registry.

## Risks and spikes

- Vendor firmware updates break reverse-engineered protocols without notice: adapters gate by
  firmware string and fail read-only.
- ToS review per vendor before shipping each reverse-engineered adapter (roadmap phase 10).

## Eng review

- Scope challenge: a bucket epic sized per adapter (about one sprint each); the owner picks which.
