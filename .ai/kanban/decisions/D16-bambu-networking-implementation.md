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
   decision rule. The pure-Node libraries pass that rule but cover too little (see Alternatives).
3. **Never copied:** anything that holds or obtains Bambu secrets or signs commands, namely
   `research/10.02-secrets.md` (embedded client secrets, cert endpoint), `10.03-mqtt-field-encryption.md`,
   `10.04-mqtt-signing.md`, `10.05-http-pop.md` and `10.07-bearssl-crypto-island.md`, the matching
   signing, cert-endpoint and cloud-auth code in `src/`, and the `client_name = BambuStudio`
   setting. D2 item 5 already forbids Bambu private keys. `research/10.06-lan-tls-and-access-codes.md`
   is allowed: it is the LAN TLS trust model ported in item 1. Its CA bundle `printer.cer` (5 public
   CA certificates, no keys) is shipped in `BambuStudio@79df7ae:resources/cert/printer.cer` (AGPL-3.0);
   we take it from there with that provenance, not from upstream.
4. **Cross-checks and fixtures** come from MIT sources: ha-bambulab/pybambu (H2C model,
   `MOCK-H2C.json`) and OpenBambuAPI (docs, GFDL: paraphrase, don't copy text). HMS text tables
   are not MIT material: they are Bambu's own data, which ha-bambulab scrapes from
   `e.bambulab.com/query.php` and the Bambu wiki (`ha-bambulab@0e027ff:scripts/update_error_text.py:67,267`).
   `printer-bambu` fetches them at runtime from Bambu, or writes its own short descriptions; it
   never bundles the scraped tables.
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

- (a) **LAN only** (recommended). Keeps every point of `bambu-connectivity.md` §5.
- (b) **LAN plus read-only cloud** under an honest client name. This overrides §5 point 2 ("Do
  not touch Bambu's cloud servers from our own client", `bambu-connectivity.md:135`), keeping its
  second half (never present ourselves as Bambu Studio). Unverified that it works: the API sits
  behind Cloudflare, which bans some generic user agents (`Python-urllib` gets 403, error 1010)
  while `curl`'s default and `BambuStudio/…` pass
  (`open-bamboo-networking@922c3e9:research/06.06-cloud-rest.md:74`); whether an honest
  `VSSlicer/…` user agent passes sign-in and telemetry is not tested.
- (c) **Full cloud with user-supplied keys.** This breaks §5 points 2 and 3
  (`bambu-connectivity.md:135-136`): the client impersonates Bambu Studio (`X-BBL-Client-Name:
  BambuStudio`), and we would ship a signing implementation that uses Bambu's extracted slicer
  key. That is the DMCA s.1201 and ToS 3.5(5) circumvention exposure of the Jarczak episode. It
  also overrides D2 item 5 if any key handling ships with us. Not recommended.

## Alternatives

- **Depend on the native library** (load the `.so`/`.dll` through FFI, or require the user to
  install it): no protocol code of our own, but native builds for every platform, a Studio-shaped
  ABI, and its cloud code comes along.
- **Depend on an existing Node library** (re-tested after review; table in the PRN-1 note,
  features from READMEs and npm metadata, code not read, unverified):
  `bambu-js` (MIT, MQTT + FTP + camera frames, P1S and H2D, last publish 2025-08-17),
  `@taucad/bambu` (Apache-2.0, Developer-LAN MQTT + FTP, X1C and A1 mini only, 0.1.0-beta.5),
  `bambu-link` (MIT, MQTT only, tested on P1S, TLS verification off by default),
  `bambu-node` (MIT, MQTT only, repository archived) and `homebridge-bambu-labs` (ISC, MQTT
  status and light only). These do pass E21's "usable from Node" rule, so depend is not ruled
  out by the ABI argument above. They are rejected because none covers the :6000 file transfer,
  the RTSPS :322 camera, the H2C, or the CA-plus-leaf-pin TLS check (D15 row 5), and their
  MQTT/FTPS layer is a thin wrapper over the same `mqtt` and `basic-ftp` packages
  `printer-bambu` uses directly. `bambu-js` and `@taucad/bambu` are kept as permissive
  cross-references. Revisit `@taucad/bambu` if it leaves beta and adds the H2C.
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
- ToS posture: with cloud option (a), unchanged from `bambu-connectivity.md` §5: LAN with the
  owner's access code in Developer Mode, no spoofing, on the owner's responsibility (D2 item 5,
  D3). Option (b) overrides §5 point 2 and option (c) breaks §5 points 2 and 3 (see Cloud mode).

## Consequences for the plan

- E21 cards cite `open-bamboo-networking@922c3e9` paths as the protocol reference. The provenance
  rule applies to every ported file.
- H2C data is thin upstream: the author tests on P2S, P1S and X2D, and has two community H2C
  reports on firmware 01.02.00.00. The first H2C session (D14) must still record firmware,
  whether the camera answers on :322, and whether the leaf pin is needed.
- If the owner picks re-implement, E21's estimates grow (the :6000 and camera framing must be
  worked out from captures); nothing else moves.
