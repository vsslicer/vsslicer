---
id: E21
title: Control Bambu printers over Developer Mode LAN with vsslicer.bambu
status: reviewed
initiative: I4
project: PRN
order: 2
depends_on: [E20, E8]
rows: ["§11 Bambu LAN or cloud control", "§11 Printer health and error notifications (HMS)", "§5 AMS slot mapping at send, sync AMS to project"]
---

Delivers `vsslicer.bambu`, the first real adapter (D3): status, job control, `.gcode.3mf` send with
AMS slot mapping, and HMS notifications for Bambu printers in LAN mode with Developer Mode, starting
with the owner's H2C (D5). Printers not in Developer Mode get read-only status with an honest
prompt. It is built on the open-source Bambu networking implementation the owner named
("bamboo-networking plugin"), which the spike card PRN-1 (story US1) identifies.

## Scope

In:
- Spike first, carried by card PRN-1 (story US1; see Risks): identify the implementation, record licence and revision, decide depend,
  port or re-implement.
- `@vsslicer/printer-bambu` library (Node, runs in the extension host now and in the daemon after
  E22) and the `vsslicer.bambu` extension (`extensionKind: ["ui"]`) that registers it with
  `vsslicer.printers`.
- Mode A, Developer Mode LAN (`bambu-connectivity.md` §1, §3): MQTT over TLS 8883 (`bblp` + access
  code, Bambu CA bundle, CN = serial so connect-by-IP checks the CN explicitly), `pushing.pushall`
  and delta merging for P1-style partial pushes, `print.pause/resume/stop`, FTPS implicit TLS 990
  upload, `print.project_file` start with `ams_mapping` and the send options (timelapse, bed
  levelling, flow calibration, use AMS).
- AMS: read trays from `push_status`, map project filaments (from the `.gcode.3mf` plate via
  `@vsslicer/3mf`) to slots in a send dialog with a default by type and colour, and "Sync AMS to
  project" that returns the loaded filaments to the caller (the profile write is PRF's).
- HMS: decode `hms` entries into `PrinterStatus.notifications` with code, severity and a link to
  Bambu's public HMS wiki page; VS Code notifications for new errors.
- Mode F: read-only status when Developer Mode is off, detected from the `print.fun` flag; control
  commands disabled with a "requires Developer Mode" explanation.
- Mode B: hand-off to Bambu Connect through `bambu-connect://import-file` on macOS and Windows.
- Per-model, per-firmware capability table in `docs/`, starting with H2C and its firmware, dated.

Out: cloud mode (only after the spike says the chosen implementation offers it and an owner
decision opts in; then a separate story), the closed `libbambu_networking` (never redistributed,
D2 item 5), the leaked Bambu Connect certificate or any signing code, camera (E38), timelapse files
(E39), printer-side calibration (E61), cloud task history (I9 excludes it).

Code provenance: decided by the spike. Default if no plugin fits: re-implement in TypeScript from
ha-bambulab (MIT) and bambulan/bambu-rs (MIT); OpenBambuAPI (GFDL-1.3) for facts only, no prose.
AGPL or GPL code ported under D2 carries the original notices and a per-file provenance line.

## Feature-matrix rows

- §11 Bambu LAN or cloud control (P1): done when status, pause/resume/stop and send-and-start work
  on the H2C in Developer Mode and read-only status works with Developer Mode off.
- §11 Printer health and error notifications (HMS) (P1): done when HMS events from fixtures and the
  H2C appear as notifications and in the tree item with code and severity.
- §5 AMS slot mapping at send, sync AMS to project (P1): done when a multi-filament `.gcode.3mf`
  is sent with a user-confirmed mapping and the printer reports the mapped trays in use.

## Acceptance criteria

- [ ] Spike note (`.reference/notes/PRN-1-bamboo-networking-spike.md`) names the project, URL,
      licence (read from its LICENSE file), commit hash analysed, languages, ABI or protocol scope,
      whether it supports LAN, Developer Mode, cloud and the H2C, and the decision (depend, port,
      re-implement) with reasons; an owner decision records it if it changes D3's reading
- [ ] E20 contract kit passes against ha-bambulab `mock_data` fixtures and a fake MQTT broker
      (Aedes or mosquitto in CI) with a self-signed CA standing in for Bambu's
- [ ] Delta-merge tests: P1-style partial pushes merged over a full `pushall` give the same status
      as an X1-style full push (fixture pairs)
- [ ] FTPS upload tests against a local implicit-TLS FTP server: progress, abort, resume refusal,
      wrong access code gives `PrinterError.auth`
- [ ] `ams_mapping` built from fixture `.gcode.3mf` plates (E8 fixtures) matches the shape
      Orca sends (`bambu-connectivity.md` §1; checked field by field against the H2C's accepted
      command)
- [ ] Mode F: `fun` flag fixtures for enabled and disabled select the right capability set
- [ ] On the H2C (firmware version and date recorded in the capability table): connect, status,
      HMS, send a sliced two-colour `.gcode.3mf` with AMS mapping, pause, resume, stop; and with
      Developer Mode off, read-only status or a recorded failure mode
- [ ] Mode B URL scheme opens Bambu Connect on one of macOS or Windows (manual checklist, owner)
- [ ] No closed binary, key or certificate other than Bambu's public CA chain in the VSIX
      (CI step lists VSIX contents)

## Dependencies

- Needs E20 (API, registry), E8 (`@vsslicer/3mf` reading the Bambu `.gcode.3mf` layout:
  plates, `slice_info`, filament list). Sending a file sliced in VSSlicer also needs E27; I4 tests
  with files sliced in Bambu Studio or Orca.
- Exposes the Bambu adapter to E22 (hosted in the daemon), E25 (queued uploads, live feed
  from `mc_print_line_number` or progress), E38 (`ipcam` state for the camera), E39 (FTPS for
  timelapse files), E42 (`materials[]` with AMS `remain`), PRF (AMS sync result).

## Risks and spikes

- **Which "bamboo-networking plugin" (spike card PRN-1, story US1, 2-3 days).** Candidates found by web
  search on 2026-10-25, none verified: `open-bamboo-networking` (ClusterM,
  https://github.com/ClusterM/open-bamboo-networking; the name matches the owner's spelling), the SFC
  "baltobu" reverse-networking rewrite of `libbambu_networking`
  (https://f.sfconservancy.org/praveen/reverse-networking; licence reported as AGPL by search and MIT
  in `bambu-connectivity.md` §4, to be read), BB-Open and beambam. Decision rule: depend if it is a
  maintained library usable from Node without a native ABI per platform; port if it is AGPL/GPL/MIT
  code in another language (D2 allows it); re-implement from MIT references otherwise. If it is a
  drop-in for Bambu's DLL (C ABI), we port the protocol logic rather than load a native plugin.
- H2C Developer Mode and LAN behaviour are unrecorded (`bambu-connectivity.md` Open questions); the
  first H2C session records firmware, `fun` flag, CA file and accepted commands before code is final.
- Bambu firmware changes LAN behaviour: capability table gated by model and firmware; unknown
  firmware falls back to read-only with a warning.
- ToS exposure (`bambu-connectivity.md` §5): LAN only with the owner's access code, no identity
  spoofing, no cloud from our client; D2/D3 put the remaining risk on the owner.

## Eng review

- Scope challenge: smallest that delivers three P1 rows on the owner's hardware. Camera and cloud are
  out; mode B is one command and stays. Four to five sprints including the spike.
- Tests: each criterion names its oracle (mock_data, fake broker, local FTPS, H2C). The regression
  the delta-merge test catches: status flicker or lost fields on P1-class printers.
- Blast radius: MQTT reconnect loops must back off (cap 60 s) so a wrong access code does not spin
  the host; TLS and parse errors surface as `PrinterError`, never unhandled rejections.
- Reversibility: `vsslicer.bambu` is a separate extension; uninstalling it removes Bambu support only.
- Changed after review: moved AMS sync's profile write out (PRF owns profiles); added the VSIX
  contents check for secrets.

## Coordinator reconciliation

- Follow position shape (`{fileOffset}` or `{layer, percent}`) is confirmed on a recorded H2C capture together with the GCP live-follow epic. Cloud mode stays out until the spike shows the chosen implementation offers it and the owner decides.
