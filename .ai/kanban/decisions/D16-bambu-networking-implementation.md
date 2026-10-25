---
id: D16
title: "Bambu networking: port the LAN protocol of Open Bamboo Networking (ClusterM) into printer-bambu"
status: proposed
date: 2026-10-25
cards: [PRN-1]
question: Q3
---

## Context

D3 builds the Bambu adapter (E21, `printer-bambu`) on "the open source bamboo-networking plugin"
the owner named. Spike PRN-1 identified it and compared it with the other open Bambu
implementations. Candidate table and sources: `.reference/notes/PRN-1-bambu-networking.md`;
summary in `docs/research/bambu-connectivity.md` §6.

**Identified project:** Open Bamboo Networking, https://github.com/ClusterM/open-bamboo-networking,
AGPL-3.0-or-later, C++, studied at `922c3e9` (2026-10-25; release v2.2.0 of 2026-09-24). It is an
open drop-in replacement for Bambu's closed `libbambu_networking` and `libBambuSource` (same
`dlsym` ABI) for Bambu Studio and Orca, LAN-first by default, with a 79-file protocol write-up in
`research/`. Its name matches the owner's spelling exactly.

## Decision (proposed)

1. **Mode: port under D2.** The LAN protocol logic is ported to TypeScript in
   `vsslicer/modules/printer-bambu` (adapters layer), with a provenance line per file
   (`Ported from open-bamboo-networking@922c3e9:<path>`) and the upstream copyright notice. In
   scope: SSDP discovery (UDP 2021), MQTT/TLS 8883 (`bblp` + access code, CN = serial, leaf pin),
   FTPS 990 upload and `project_file` start, the TLS :6000 file-transfer framing, the camera
   paths (RTSPS :322 H.264 for the H2C, MJPEG-over-TLS :6000 for A1/P1) for E38.
2. **Not depended on.** Loading the native library from Node would need FFI per OS and CPU, a
   host-slicer callback ABI built for Studio, and its cloud and signing code. That fails E21's
   decision rule.
3. **Never copied:** anything that holds or obtains Bambu secrets or signs commands
   (`research/10.*`, signing, cert-endpoint and cloud-auth code), and the `client_name =
   BambuStudio` setting. D2 item 5 already forbids Bambu private keys.
4. **Cross-checks and fixtures** come from MIT sources: ha-bambulab/pybambu (H2C model,
   `MOCK-H2C.json`, HMS text tables) and OpenBambuAPI (docs, GFDL: paraphrase, don't copy text).
5. **Pinning.** `922c3e9` is the analysed revision. Moving to a newer upstream revision is a
   card of its own that re-reads the diff of the ported paths.

## Cloud mode (for the owner to decide separately)

What Open Bamboo Networking can do in the cloud, from its README (lines 214-241, 325-357):

- **Without Bambu secrets:** cloud sign-in (browser ticket flow), cloud MQTT telemetry
  (`us.mqtt.bambulab.com:8883`), user preset sync, the cloud filament catalogue.
- **Only with Bambu's private slicer certificate and key, which the user extracts:** signed MQTT
  commands on printers without Developer Mode, cloud print dispatch, MakerWorld print history,
  camera and file browser away from home over TUTK. Cloud print also needs the client to call
  itself `BambuStudio`, because the API returns HTTP 403 to an honest name.

Recommendation: no cloud in E21. If the owner wants it later, it becomes a separate opt-in story
limited to the first list (sign-in and read-only cloud telemetry under an honest client name).
The second list is identity spoofing with extracted keys, which is what Bambu acted on in the
2026 Jarczak episode (`bambu-connectivity.md` §5). The owner chooses one of:
(a) LAN only (recommended), (b) LAN plus read-only cloud, (c) full cloud with user-supplied keys,
which overrides D2 item 5.

## Alternatives

- **Depend on the native library** (load the `.so`/`.dll` through FFI, or require the user to
  install it): no protocol code of our own, but native builds for every platform, a Studio-shaped
  ABI, and its cloud code comes along.
- **Re-implement from MIT and GFDL references only** (ha-bambulab, bambulan, bambulabs_api,
  OpenBambuAPI): keeps `printer-bambu` licensable under permissive terms, but those projects
  cover less of the :6000 file transfer and camera framing and have less H2C data. It is only
  worth it if the owner wants that module re-licensed later.
- **persano/open-bambu-networking-plugin:** a repackaging of ClusterM that embeds a Bambu
  application client secret. Rejected.
- **SFC baltobu (MIT):** analysis of the Windows DLL only, with no implementation yet. Useful as
  a cross-reference.

## Licence implications

- **AGPL flag:** porting makes `printer-bambu` a derivative of AGPL-3.0-or-later code. That is
  compatible with VSSlicer's AGPL-3.0-or-later (D2) and adds no new obligation beyond D2 item 4
  (publish the source of every binary). It does mean the module can never be relicensed
  permissively without a rewrite.
- Upstream's `research/` text is in the same AGPL repository; quote it with attribution, or
  paraphrase it.
- ToS posture is unchanged from `bambu-connectivity.md` §5: LAN with the owner's access code in
  Developer Mode, no spoofing, on the owner's responsibility (D2 item 5, D3).

## Consequences for the plan

- E21 cards cite `open-bamboo-networking@922c3e9` paths as the protocol reference. The provenance
  rule applies to every ported file.
- H2C data is thin upstream: the author tests on P2S, P1S and X2D, and has two community H2C
  reports on firmware 01.02.00.00. The first H2C session (D14) must still record firmware,
  whether the camera answers on :322, and whether the leaf pin is needed.
- If the owner picks re-implement, E21's estimates grow (the :6000 and camera framing must be
  worked out from captures); nothing else moves.
