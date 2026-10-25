---
id: E23
title: Add Moonraker, OctoPrint, PrusaLink and Duet adapters with discovery
status: reviewed
initiative: I4
project: PRN
order: 4
depends_on: [E20, E22]
rows: ["§11 Print-host upload (OctoPrint, PrusaLink, Duet, Moonraker...)", "§11 Printer discovery (mDNS, SSDP, UDP)"]
---

Delivers the open-ecosystem adapters in `vsslicer.printers` (Moonraker/Klipper, OctoPrint, PrusaLink
v1, Duet RRF and DSF) and LAN discovery (mDNS/DNS-SD, SSDP), so users of the most common non-Bambu
printers can upload, start and watch jobs. It proves the E20 API is generic (D3 item 3) and covers
the Klipper derivatives that expose stock Moonraker (Creality K1/K2 with root, Elegoo Neptune 4,
Rinkhals Anycubic; `printer-connectivity.md` Implications).

## Scope

In:
- Adapters (new TypeScript, written from the published API docs; Moonraker GPL-3.0, OctoPrint
  AGPL-3.0 and Prusa-Link-Web GPL-3.0 code is not needed and not copied):
  - Moonraker: REST and JSON-RPC WebSocket, `printer.objects.subscribe`, upload with `checksum` and
    `print=true`, job control, `virtual_sdcard.file_position` for live follow, API key and oneshot
    token, trusted-client mode.
  - OctoPrint: REST, SockJS push, upload `select`/`print`, AppKeys pairing (no key copying).
  - PrusaLink v1: `PUT /api/v1/files/{storage}/{path}` with `Print-After-Upload`, Digest auth with
    `X-Api-Key` fallback, status polling, legacy `api/files` fallback.
  - Duet: RRF `rr_*` with session key and `crc32` upload, DSF `/machine/*` with WebSocket patches,
    `M32` start; polling for RRF.
- Discovery: `Discoverer` implementations for `_moonraker._tcp`, `_octoprint._tcp`/`_http._tcp`
  and SSDP 239.255.255.250:1900, using `bonjour-service` (MIT); results feed "Add printer" with probe
  (`server/info`, `api/version`, `rr_connect`); manual entry always remains.
- Adapters run in the agent (E22) like Bambu.

Out: SDCP and Repetier (E60), serial (E59), Prusa Connect (E61), camera URLs beyond
returning them from `webcams()` (E38), file browser UI (E24), queue (E25, E47).

## Feature-matrix rows

- §11 Print-host upload (P0): done when each of the four families uploads, optionally starts, and
  reports progress through the registry, passing the contract kit on recorded fixtures.
- §11 Printer discovery (P1): done when Moonraker, OctoPrint and PrusaLink hosts on the LAN appear in
  "Add printer" without typing an address, with a test per discovery method.

## Acceptance criteria

- [ ] E20 contract kit passes for Moonraker, OctoPrint, PrusaLink, RRF and DSF against recorded
      HTTP and WebSocket fixtures derived from the published APIs (types re-derived, the PrusaLink
      `openapi.yaml` not vendored until its licence header conflict is resolved)
- [ ] OctoPrint's virtual printer runs in CI (Docker) for upload, start, pause, cancel; if not
      feasible in free CI minutes, a recorded-fixture fallback and a note in the epic
- [ ] Moonraker upload with `checksum`: a corrupted fixture returns 422 and surfaces as
      `PrinterError.fileRejected`
- [ ] PrusaLink: `Print-After-Upload: ?0` never starts a print (regression for the firmware bug
      PrusaSlicer works around, `printer-connectivity.md` §1)
- [ ] Discovery tests with `multicast-dns` responders in-process for each service type and an SSDP
      responder; discovery off under Remote sessions is explained, not empty
- [ ] Auth flows: OctoPrint AppKeys pairing against the virtual printer; Moonraker oneshot token for
      WebSocket; Duet session expiry and re-login
- [ ] A manual hardware checklist per family for contributors (no hardware here, D5)
- Verified only on fixtures, emulators and the OctoPrint virtual printer; the H2C does not cover
  these families (D5).

## Dependencies

- Needs E20 (API, kit, registry), E22 (agent hosting).
- Exposes adapters to E24 (`files`, `upload`), E25 (queue, live feed from
  `virtual_sdcard.file_position`), E38 (`webcams()` URL lists), E46 (Moonraker
  `history/list`), E47 (Moonraker job queue), E42 (Moonraker Spoolman proxy, if present).

## Risks and spikes

- OctoPrint virtual printer and a Moonraker simulator in CI are unverified (roadmap phase 4 test
  strategy): spike (1 day) each; fallback is recorded fixtures.
- Discovery from VS Code: UI-kind extension sees the LAN; Remote-SSH hosts do not (`printer-
  connectivity.md` §5). The agent runs on the UI machine, so discovery runs there.
- PrusaLink firmware matrix not published: adapter probes `/api/version` and falls back to legacy
  endpoints; unknown versions are logged with the response.

## Eng review

- Scope challenge: four families in one epic because they share the HTTP/WS client, fixtures
  harness and discovery; a split per family would repeat that harness. Estimated five to six sprints;
  if it runs long, Duet DSF moves to a follow-up story, not a new epic.
- Tests name the regression they catch (checksum, Print-After-Upload, session expiry).
- Blast radius: adapters run in the agent, so a hung HTTP request cannot block the extension host;
  every request has a timeout.
- Changed after review: discovery merged here (it is two small `Discoverer`s, not an epic).
