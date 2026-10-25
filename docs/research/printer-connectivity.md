# Printer connectivity: open ecosystems

Researched 2026-10-25. Scope: the printer APIs VSSlicer can support without vendor secrets or a vendor account, vendor Klipper derivatives, serial, export-to-storage, discovery, and a unified adapter proposal. Bambu Lab (authorisation firmware, cloud) is out of scope here (other card).

Sources and versions:

| Short name | What | Commit / version |
|---|---|---|
| `moonraker@b559b9a` | Arksine/moonraker incl. `docs/external_api/*.md` (commit date 2026-10-21) | b559b9a |
| `OctoPrint@64d8cd1` | OctoPrint/OctoPrint | 64d8cd1 |
| `Prusa-Link-Web@a67f306` | `spec/openapi.yaml` (PrusaLink API, version "1.0.0-draft") | a67f306 |
| `PrusaSlicer@30ef591` | host code now in `src/slic3r-shared/src/Slic3r/Biz/PrintHost/*` (moved out of `src/slic3r/Utils/`) | 30ef591 |
| `OrcaSlicer@09aa0114` | `src/slic3r/Utils/*` | 09aa0114 |
| `SDCP@f977215` | cbd-tech SDCP V3.0.0 EN doc (official, Elegoo/CBD) | f977215 |
| `ankermake@0007f4a` | Ankermgmt/ankermake-m5-protocol (last commit 2024-01-29) | 0007f4a |
| `Luban@db573f5` | Snapmaker/Luban (last commit 2025-05-27) | db573f5 |
| `Rinkhals@04c6900` | jbatonnet/Rinkhals (deprecated 2026-07-01, moved to rinkhals-community) | 04c6900 |
| `Marlin@2ef3ee6` | Marlin source and `docs/` | 2ef3ee6 |

Web pages are cited by URL. Pages read through WebFetch are summaries by a small model; claims resting only on those are marked `(web)`. Anything not confirmed is marked `(unverified)`.

## Findings

### 1. Open ecosystems

#### Moonraker / Klipper

Source: `moonraker@b559b9a:docs/external_api/*.md`, https://moonraker.readthedocs.io.

- Transport: HTTP REST, JSON-RPC 2.0 over WebSocket at `ws://host:port/websocket` (`introduction.md:151-160,308`), JSON-RPC over HTTP `POST /server/jsonrpc`, a unix socket (`<datapath>/comms/moonraker.sock`, no auth), and a `/klippysocket` bridge to Klippy. Default port 7125 (convention; Fluidd/Mainsail usually proxy through nginx on port 80) `(unverified in these docs)`.
- Auth: trusted client IP/CIDR list (`configuration.md:479`, `force_logins` at `:508`), `X-Api-Key` header, JWT bearer, and a oneshot token (`GET /access/oneshot_token`, `authorization.md:496`) for WebSocket and bridge connections that cannot send headers. Users via `/access/login`.
- Discovery: Zeroconf service `_moonraker._tcp.local.` with TXT `uuid`, `https_port`, `version`, `route_prefix` (`moonraker/components/zeroconf.py:35,106-111`), plus an SSDP responder (`:141`).
- Control: `POST /printer/print/start?filename=`, `/pause`, `/resume`, `/cancel` (`printer.md:592-654`); `/printer/emergency_stop`, `/printer/firmware_restart`, `POST /printer/gcode/script`.
- Telemetry: `POST /printer/objects/query` and, over WebSocket, `printer.objects.subscribe` followed by `notify_status_update` pushes. Objects: `print_stats`, `virtual_sdcard`, `toolhead`, `extruder`, `heater_bed`, `display_status` (`printer_objects.md:818,852`). Other notifications: `notify_gcode_response`, `notify_klippy_ready/shutdown/disconnected`, `notify_filelist_changed`, `notify_history_changed`, `notify_job_queue_changed` (`jsonrpc_notifications.md`).
- Files: `GET /server/files/list?root=gcodes`, `/server/files/metadata`, `/server/files/thumbnails`, `/server/files/directory`, move/copy/delete, `GET /server/files/{root}/{name}`. Upload `POST /server/files/upload` multipart with optional `root` (gcodes|config), `path`, `checksum` (SHA256, mismatch gives 422) and `print=true` (`file_manager.md:1043-1100`). Job queue `/server/job_queue/*`, history `/server/history/*`.
- Webcam: `GET /server/webcams/list` returns `stream_url`, `snapshot_url`, `service` (mjpegstreamer etc.), `flip_*`, `rotation`, `target_fps`, `uid` (`webcams.md:15-60`). URLs may be relative to the host.
- Client reference: PrusaSlicer/Orca call `server/info`, `server/files/roots`, `printer/print/start`, `server/files/upload` (`OrcaSlicer@09aa0114:src/slic3r/Utils/Moonraker.cpp:72,125,184,242`).

#### OctoPrint

Source: `OctoPrint@64d8cd1:src/octoprint/server/api/*`, `plugins/*`; PrusaSlicer client `PrusaSlicer@30ef591:.../PrintHostOctoPrint.cpp`.

- Transport: REST under `/api/*`; push via SockJS at `/sockjs` (`server/__init__.py:2039`). Port 5000 or 80 via HAProxy on OctoPi `(unverified)`.
- Auth: `X-Api-Key` or bearer token (`server/util/__init__.py:36,183`; `PrintHostOctoPrint.cpp:464`). The bundled AppKeys plugin gives user-approved pairing without copying a key: `GET /plugin/appkeys/probe`, `POST /plugin/appkeys/request`, poll `/request/<token>` (`plugins/appkeys/__init__.py:172-288`).
- Discovery: discovery plugin registers Zeroconf `_http._tcp` and `_octoprint._tcp`, and SSDP/UPnP on 239.255.255.250:1900 (`plugins/discovery/__init__.py:45-47,173-176,544-550`). PrusaSlicer resolves `.local` hosts by browsing `_octoprint._tcp` (`PrintHostOctoPrint.cpp:36-37`); PrusaLink answers the same query (`PrintHostPrusaLink.cpp:80-81`).
- Control: `POST /api/job` with `{"command": "start|restart|pause|cancel"}` (`api/job.py:18`), `GET /api/job`, `GET /api/printer`, `POST /api/printer/tool|bed|chamber|printhead|command`, `GET/POST /api/connection`.
- Files: `GET /api/files`, `GET /api/files/{local|sdcard}`, upload `POST /api/files/local` multipart (`file`, `path`, `select`, `print`) (`api/files.py:717,753-778`; client `PrintHostOctoPrint.cpp:280,322-327`), select/print `POST /api/files/{target}/{path}` (`files.py:993`), delete (`:1544`). Uploading while printing is refused for the active file (`files.py:801`).
- Telemetry: `GET /api/printer` + `/api/job` polling, or SockJS `current`/`history` messages and event bus (`PrinterStateChanged`, `PrintStarted`, ... `events.py:43,79`) `(message details unverified)`.
- Webcam: stream and snapshot URLs are in settings (`webcam.streamUrl`, `snapshotUrl`) `(unverified in code)`; plugins add webcam providers.

#### PrusaLink and Prusa Connect

Source: `Prusa-Link-Web@a67f306:spec/openapi.yaml`; `PrusaSlicer@30ef591:.../PrintHostPrusaLink.cpp`, `PrintHostPrusaConnect.cpp`.

- PrusaLink (local, on printer or Raspberry Pi): REST only, no WebSocket in the spec. Endpoints `/api/version`, `/api/v1/{info,status,job,job/{id},job/{id}/pause|resume|continue,storage,transfer,files/{storage}/{path},cameras,cameras/{id}/snap,update/{env}}` (`openapi.yaml:17-701`).
- Auth: HTTP Digest (`openapi.yaml:14-15,1700`); an `X-Api-Key` header is also supported for older firmware (`openapi-legacy.yaml:2306`; `PrintHostPrusaLink.cpp:37-39`).
- Upload: `PUT /api/v1/files/{storage}/{path}` with an `application/octet-stream` body and headers `Print-After-Upload: ?1`, `Overwrite: ?1` (RFC 8941 booleans) (`openapi.yaml:284-330`); `POST` on the same path starts a print (`:330`). Older firmware falls back to the OctoPrint-compatible `api/files` (`PrintHostPrusaLink.cpp:405,451`). PrusaSlicer notes a firmware bug where any `Print-After-Upload` value counted as true (`:524`).
- Status: `GET /api/v1/status` returns `printer` (state enum IDLE, BUSY, PRINTING, PAUSED, FINISHED, STOPPED, ERROR, ATTENTION, READY, `:1269`), and optional `job`, `transfer`, `storage`, `camera`. Polling only.
- Webcam: `/api/v1/cameras/{id}/snap` returns a JPEG; the spec also covers camera config and Connect registration (`:392-662`). Stream URL is not in the spec.
- Prusa Connect (cloud): PrusaSlicer uploads with an OAuth bearer token to `POST {host}/app/users/teams/{team_id}/uploads` then `PUT` of the body (`PrintHostPrusaConnect.cpp:138-199`). Needs a Prusa account; the cloud API is not publicly specified (`unverified` beyond PrusaSlicer's use). Prusa publishes a Connect local postman collection (`Prusa-Link-Web@a67f306:PrusaConnectLocalApi.postman_collection.json`). Treat Connect as optional/later; PrusaLink covers LAN.

#### Duet RepRapFirmware

Sources: https://github.com/Duet3D/RepRapFirmware/wiki/HTTP-requests (web), https://github.com/Duet3D/DuetSoftwareFramework/wiki/REST-API (web); client `PrusaSlicer@30ef591:.../PrintHostDuet.cpp`.

- Standalone RRF (Duet 2 WiFi/Ethernet, Duet 3 standalone): HTTP `rr_*`. `rr_connect?password=` (default `reprap`; `sessionKey=yes` and `X-Session-Key` header from RRF 3.5-b4), `rr_disconnect`, `rr_model?key=&flags=` (object model), `rr_gcode?gcode=`, `rr_reply`, `rr_upload?name=0:/gcodes/x&time=&crc32=` (POST raw body), `rr_download`, `rr_filelist?dir=&first=&max=` (`max` from 3.6.0-b2), `rr_files`, `rr_fileinfo`, `rr_thumbnail` (base64 chunks), `rr_delete`, `rr_move`, `rr_mkdir`. `rr_status`/`rr_config` deprecated, removal planned for 3.6. 401 without session, 503 when out of memory. Polling (`rr_model` with `key=seqs` to detect new `rr_reply`); no push.
- DSF (Duet 3 with SBC): `GET /machine/connect?password=` returns `sessionKey` (header `X-Session-Key`), `GET /machine/model`, `POST /machine/code`, `/machine/file/{path}` GET/PUT/DELETE, `/machine/fileinfo/{path}`, `/machine/directory/{dir}`, `POST /machine/file/move`, WebSocket `/machine?sessionKey=` sending full model then patches. A session lasts a few seconds idle; keep-alive `/machine/noop` (web).
- Start print: `M32 "0:/gcodes/<file>"` via `rr_gcode` or `machine/code`; upload target `0:/gcodes/` (`PrintHostDuet.cpp:197-205,271-280`). PrusaSlicer treats DSF upload success as HTTP 201 (`:49`).
- Webcam: configured in Duet Web Control settings, not in the standard object model `(unverified)`. Discovery: no standard service type found; hostname `.local` from M550 `(unverified)`.

#### Repetier-Server

Source: https://www.repetier-server.com/manuals/programming/API/index.html (web); client `PrusaSlicer@30ef591:.../PrintHostRepetier.cpp`.

- Port 3344. WebSocket `ws://host:3344/socket/?apikey=|sess=`; every command also over HTTP at `/printer/api/<slug>?a=<action>&data=<url-encoded JSON>` (events excluded). JSON `{action, data, printer, callback_id}`; server events `callback_id: -1`.
- Auth: session key from the WebSocket, `x-api-key` header (preferred over query), or `login` (MD5(sessionId + MD5(login + password))). `/printer/info` is unauthenticated and returns the API key when the server has no protection.
- Control: `listPrinter`, `stateList`, `send` (raw G-code), `move`, `emergencyStop`, `listModels`/`modelInfo`, `removeModel`, `copyModel` (to queue, `autostart`), `listJobs`, `startJob`, `stopJob`, `continueJob`; no pause action in the doc. Events `state`, `temp`, `jobStarted/Finished/Killed`, `jobsChanged`, `printqueueChanged`.
- Upload: multipart `POST /printer/model/<slug>?a=upload` with `name`, `group`, `filename` (and `overwrite=true` from 0.92.2) (`PrintHostRepetier.cpp:72-84`).
- Webcam: no action; URLs in `getPrinterConfig` `webcam.dynamicUrl|staticUrl`.
- Reference: the doc also points to prgdoc.repetier-server.com/v1/docs (not read). Repetier-Server is closed source and commercial; the API doc is the only source `(unverified licence terms)`.

### 2. Vendor Klipper derivatives and vendor protocols

| Vendor | Mechanism | Official? | Notes and dates |
|---|---|---|---|
| Creality K1 family | Moonraker 7125 + Fluidd/Mainsail after enabling root access; Orca sets `/usr/data/printer_data/gcodes` as gcode path (`OrcaSlicer@09aa0114:CrealityPrint.cpp:379`) | Root access toggle is vendor-offered per model (third-party guides: https://intercom.help/3DPrinterOS/en/articles/9681279, https://simplyprint.io/setup-guide/creality/k2-plus.md); Moonraker itself is stock Klipper | A K1C 2025 reports port 7125 answering but UI on 80 returning 404 (https://forum.creality.com/t/k1c-2025-orcaslicer-workarounds-for-missing-web-interface/47164); firmware updates may restore stock config (web, 2026-10) |
| Creality K2 (Plus/Pro) | Moonraker on 7125; Orca additionally uses HTTP `POST /upload/<name>` and a WebSocket on port 9999 with `{"method":"get\|set","params":{...}}`; print start = `set opGcodeFile "printprt:/mnt/UDISK/printer_data/gcodes/<f>"`; CFS via `boxsInfo`, `colorMatch`, `multiColorPrint` (`CrealityPrint.cpp:154,365,379-461`, `CrealityPrint.hpp:49`) | Port 9999 protocol is not documented by Creality; it comes from Orca's implementation (`unverified` who authored it) | Discovery: DNS-SD service names starting `Creality`, e.g. `_Creality-<id>._udp.local.`, then `GET http://ip/info` returns `model`, `mac` (`CrealityHostDiscovery.cpp:32,85-90`). Creality Cloud / Creality Print: closed, no public spec found (2026-10-25 search). A K2 Pro user reports Creality Print 7.3.0.6149 sends only via the cloud (log lines `cloud_register`, `oss_upload`, `moonrakerPort 0`; no URLs given), and 7.2.2.5483 still sent locally (https://forum.creality.com/t/creality-print-7-3-on-a-k2-pro-no-direct-printing-silent-failures-and-no-answer-from-support/54033, anecdotal). Official Creality wiki page for Creality Print returned no body text. Treat Creality Cloud as vendor-account, undocumented; the LAN path (Moonraker 7125, port 9999) is the supportable one. Firmware versions: not stated in any source read; Orca code at `09aa0114` (2026-10-25) is the version basis |
| Elegoo Centauri Carbon (CC) and resin (Saturn, Mars with SDCP) | SDCP V3.0.0 | Official, published by CBD-Tech (`SDCP@f977215`) | Details below |
| Elegoo Centauri Carbon 2 (CC2) | HTTP `GET /system/info` with `X-Token` (default `123456`), chunked `POST /upload` (`OrcaSlicer@09aa0114:ElegooLink.cpp:82,148,369-408,892`) | Not in the SDCP doc; reverse engineered or vendor-contributed to Orca `(unverified)` | Newer firmware, 2026 |
| Elegoo Neptune 4 etc. | Stock Klipper/Moonraker; Orca routes them to the OctoPrint/Moonraker class (`ElegooLink.cpp:466`) | Yes (Klipper) | |
| Anycubic Kobra 3/S1 stock | LAN mode: proprietary MQTT over TLS on port 9883 (mutual TLS using a device cert obtained from an HTTP handshake on port 18910, AES-CBC encrypted payload); topics under `anycubic/anycubicCloud/v1/{model_id}/{device_id}` (https://github.com/rvanderp3/kobra-connect, Apache-2.0, web) | Printer-side LAN mode is documented by Anycubic (https://wiki.anycubic.com/en/fdm-3d-printer/kobra-3-combo/kobra-3-series-lan-connection-guide); the protocol is reverse engineered. Enabling LAN mode disconnects the cloud (web search 2026-10) | Upload procedure not described in the sources read `(unverified)` |
| Anycubic Kobra 2 Pro/3/3 Max/S1/S1 Max/3 V2 with Rinkhals | Custom firmware adds Moonraker + Fluidd/Mainsail, SSH `root` (`Rinkhals@04c6900:README.md:31-39` table) | Community, MIT. Supported firmware: Kobra 3 `2.4.5`/`2.4.6.7`, S1 `2.6.0.0`/`2.7.0.9`, 3 Max `2.5.1.7`/`2.5.2.8`, 3 V2 `1.1.0.4`/`1.1.2.8`, S1 Max `2.6.6`/`2.6.9.3`, Kobra 2 Pro `3.1.2.3`/`3.1.4` | Kobra X (K4 base, signed updates) not supported; repo deprecated, moved to `rinkhals-community/Rinkhals` (README, 2026-05) |
| Anycubic Photon (resin), CBD-board generation | Plain-text G-code over UDP port 3000, no auth; detect with broadcast `M99999`; `M20` list, `M28`/`M29` upload, `M6030 '<file>'` start, `M24`/`M25` resume/pause, `M33 I5` abort, `M4000` status, `M4002` version (https://improwis.com/projects/sw_PhotonControl, web) | Reverse engineered (author tested a Photon with CBD board v1.4.1, firmware V4.2.19.3_LCD; network IP config needs 4.2.19+); same `M99999`/port 3000 as Elegoo SDCP, i.e. SDCP is the CBD-Tech successor | Photonsters' Universal Photon Network Controller was the reference. Not verified on current Photon Mono firmware |
| Anycubic Photon Mono X/X 6K/SE (uart-wifi) | Comma-separated text commands (`getstatus,end`, `getfile`, `goprint,<name>,end`, `gostop,end`, `sysinfo`, `getpreview1`...) via the `anycubic-python`/`uart-wifi` tooling; fake printer defaults to port 6000 (https://github.com/adamoutler/anycubic-python, web; transport TCP/UDP not stated, licence not captured) | Reverse engineered; tested on Mono X 6K, firmware not stated | A separate source says the Mono X 6K has no network and prints from USB only (https://xyzdims.com/3d-printers/msla-anycubic-photon-mono-x-6ks/, web, conflicting with the tool; unverified). No Anycubic cloud reverse-engineering repo was found |
| Snapmaker (J1, Artisan, Ray, A-series) | UDP broadcast `discover` to port 20054, replies `name@ip|key:value...` (`Luban@db573f5:src/server/services/machine/network-discover/BroadcastMachineFinder.ts`, `NetworkedMachineFinder.ts:9`); SACP binary protocol over TCP port 8888 (`constants/index.js:213`; `@snapmaker/snapmaker-sacp-sdk` 0.1.1 per `package.json:82`); legacy SSTP over HTTP `/api/v1/{connect,status,upload,prepare_print,start_print,pause_print,resume_print,stop_print,enclosure}` with `token` (`SstpHttpChannel.ts:171-901`) | Official (Snapmaker's own app source, AGPL-3.0). Snapmaker Orca agent for newer Klipper-based machines (U1) queries Moonraker (`/printer/objects/query`, `X-Api-Key`) (`OrcaSlicer@09aa0114:SnapmakerPrinterAgent.cpp:114-122`) | Snapmaker U1 being Klipper-based is `(unverified)` beyond that code |
| AnkerMake M5/M5C | Cloud MQTT (credentials from account `login.json`) for status/control, PPPP P2P (UDP) for LAN file transfer and video; `ankerctl pppp lan-search`, `pppp print-file`, `mqtt gcode` (`ankermake@0007f4a:README.md:155-170`, `specification/{mqtt,pppp}.stf`) | Reverse engineered, GPLv3, not endorsed by AnkerMake; last commit 2024-01-29; firmware level not stated | Needs the user's Anker account data (`user_id` acts like a password, README:105); fails the "no vendor secrets" rule. Treat as unsupported or plugin-only |

SDCP V3.0.0 detail (`SDCP@f977215`, doc dated per repo, firmware V1.0.0 in sample):

- Discovery: client broadcasts UDP `M99999` to port 3000; reply JSON `{Id, Data:{Name, MachineName, BrandName, MainboardIP, MainboardID, ProtocolVersion, FirmwareVersion}}`.
- Control: WebSocket `ws://IP:3030/websocket`, topics `sdcp/request|response|status|attributes|error|notice/<MainboardID>`. Commands: 0 status, 1 attributes, 128 start print `{Filename, StartLayer}`, 129 pause, 130 stop, 131 continue, 132 stop feeding, 133 skip preheat, 192 rename, 255 terminate transfer, 258 file list, 259 delete, 320/321 history, 386 video stream enable (RTSP), 387 timelapse.
- Upload: `POST http://IP:3030/uploadFile/upload` multipart in 1 MB packets with `S-File-MD5`, `Check`, `Offset`, `Uuid`, `TotalSize`, `File`.
- Orca streams the file then opens the WebSocket to start the print (`ElegooLink.cpp:649-859`).

Firmware / version basis, per finding (all researched 2026-10-25; vendors rarely publish firmware ranges, so absence is stated):

| Finding | Version it applies to | Basis |
|---|---|---|
| Moonraker API | Moonraker `b559b9a` (2026-10-21) | repo docs; API change history in `moonraker@b559b9a:docs/api_changes.md` |
| OctoPrint | `64d8cd1`; release number not read `(unverified)` | repo |
| PrusaLink v1 | OpenAPI "1.0.0-draft" at `a67f306`; firmware version matrix not published in spec | `openapi.yaml:9` |
| Duet RRF | `rr_*` 3.x; session keys 3.5-b4+, `max` 3.6.0-b2+, `rr_status` removal planned 3.6 | RRF wiki (web) |
| Elegoo SDCP | Protocol V3.0.0; repo last commit 2024-06-07 (`SDCP@f977215`); doc sample shows firmware `V1.0.0`, which is a placeholder; CC firmware that implements it not stated. CC2 token protocol appears in Orca at `09aa0114` (2026-10-25), firmware not stated | `SDCP` doc `:11-30`; `ElegooLink.cpp:82-148` |
| Creality K1/K2 | No firmware numbers in any source; K1 family list in `CrealityPrint.cpp:293-300` (models K1, K1 SE, K1C, K1_CFS-C ...), Orca `09aa0114`; Creality Print 7.2.2.5483 vs 7.3.0.6149 behaviour difference (anecdotal) | forum thread above |
| Snapmaker | Luban 4.15.2 (`Luban@db573f5`, 2025-05-27, `package.json:3`), SACP SDK 0.1.1 (published 2023-07-20); machine firmware minimum not found; Luban error text references updating firmware without a number | npm registry, `package.json` |
| AnkerMake | ankerctl 1.0.1 (2024-01-15; fixes MQTT errors after AnkerMake firmware upgrades), repo last commit 2024-01-29; no firmware number (`ankermake@0007f4a:CHANGELOG.md`) | repo |
| Anycubic LAN mode | Kobra 3 / S1 series, stock firmware, no version number published by kobra-connect; Rinkhals firmware list as in table (2026-05 README) | web; `Rinkhals@04c6900` |
| Photon CBD | firmware 4.2.19.3_LCD | improwis (web) |

Official vs reverse engineered summary: official docs exist for Moonraker, OctoPrint (docs.octoprint.org), PrusaLink (OpenAPI), Duet, Repetier, SDCP; Snapmaker's code is first-party. Reverse engineered: Creality port 9999, Elegoo CC2, Anycubic LAN MQTT, AnkerMake.

### 3. USB/serial direct printing

- Marlin serial protocol (`Marlin@2ef3ee6`): host sends lines, firmware answers `ok` (`core/language.h:115`); line-numbered mode `N<n> <cmd>*<xor checksum>` with `M110 N0` to reset the counter, errors answered by `Resend: <n>` followed by `ok` (`gcode/queue.cpp:273-280,481-509`); `echo:busy: processing` keepalives while busy (`core/language.h:137`, host keepalive feature); `ADVANCED_OK` adds buffer info (off by default, `Configuration_adv.h:2896`); `EMERGENCY_PARSER` handles M108/M112/M410/M876 out of band (`Configuration_adv.h:2862-2865`) so cancel works with a full buffer. A command buffer of 4 by default (`docs/Queue.md:62`), so streaming is send-one-per-ok (or counted-window).
- SD over serial: `M20` list, `M21` mount, `M23 <file>` select, `M24` start, `M25` pause, `M27` status, `M28/M29` write file, `M30` delete (`Marlin/src/gcode/sd/*`). Binary File Transfer protocol, packetised and little-endian, when built with `BINARY_FILE_TRANSFER` (`Marlin@2ef3ee6:docs/BinaryFileTransferProtocol.md`).
- Other firmware dialects exist (Prusa Buddy, Klipper over `klippy.sock`, RRF over USB); the Prusa Buddy and RRF behaviours were not researched `(unverified)`.
- Slicer precedent: PrusaSlicer and Orca `Serial.cpp` only enumerate ports and feed firmware flashing (`PrusaSlicer@30ef591:src/slic3r/Utils/Serial.cpp`); neither implements print streaming, so there is no code to reuse.
- Node feasibility: `serialport` (`@serialport/bindings-cpp`) is MIT, ships N-API prebuilt binaries chosen at install via prebuildify, works in Electron since v10 (https://serialport.io/docs/guide-installation, web; https://github.com/serialport/node-serialport). Limits for VS Code: a native module forces platform-specific VSIX packages (`vsce package --target win32-x64 ... darwin-arm64 linux-x64 ...`, universal fallback possible; https://code.visualstudio.com/api/working-with-extensions/publishing-extension); no use in a `web` extension host or vscode.dev; Remote-SSH/WSL/Dev Container workspaces run the extension on the remote host, so a USB printer attached to the local machine is invisible unless the extension runs as a UI-side extension; Linux users need `dialout` group membership; ARMv6/armhf coverage is thin (`unverified`); Electron ABI vs bundled VS Code Node version must be checked per VS Code release `(unverified)`. Alternatives: Web Serial API in a webview `(availability in VS Code webviews unverified)`; a small helper process spawned from the extension.

### 4. Export to storage

| Target | Convention | Source |
|---|---|---|
| Klipper virtual SD | `printer_data/gcodes` (Creality K1 `/usr/data/printer_data/gcodes`, K2 `/mnt/UDISK/printer_data/gcodes`); Moonraker root `gcodes`, subdirs via `path` | `CrealityPrint.cpp:379`, `file_manager.md:1043` |
| Duet | `0:/gcodes/<name>` on SD, `M32` to start | `PrintHostDuet.cpp:197-205,278` |
| Marlin SD over serial | `M28 <name>` / `M29` write, or BFT; filename length depends on firmware long-filename support `(unverified: 8.3 limits for builds without it)` | `Marlin@2ef3ee6:src/gcode/sd/M28_M29.cpp`, `BinaryFileTransferProtocol.md` |
| FlashAir wireless SD | `GET upload.cgi?WRITEPROTECT=ON&FTIME=<hex FAT time>`, `upload.cgi?UPDIR=<dir>`, then multipart `POST upload.cgi` | `PrintHostFlashAir.cpp:27,51-53` |
| MKS WiFi (Marlin clones) | `POST http://host/upload?X-Filename=<name>` raw body; start by TCP console on port 8080 with `M23 <file>` and `M24` | `PrintHostMKS.cpp:87-95,103-106` |
| AstroBox | OctoPrint-compatible `api/files/local` | `PrintHostAstroBox.cpp:30` |
| PrusaLink/Prusa USB | PrusaLink storage name in path (`/api/v1/files/{storage}/{path}`, storages from `/api/v1/storage`); Prusa Mini/MK4 prefer `.bgcode` (PrusaSlicer handles `.bgcode` in job data, `PrintHostJobData.cpp:12`) | `openapi.yaml:176-200` |
| Elegoo CC/resin | SDCP upload, 1 MB chunks with MD5; resin formats `.ctb` etc. | `SDCP@f977215` |
| Bambu | out of scope (FTPS/3MF) | |

File name limits, formats and metadata per firmware (sources are code at the cited commits unless marked web):

| Firmware | File system / name limit | What it reads from the file | Source |
|---|---|---|---|
| Marlin SD / USB flash | In-tree SdFat structures are FAT12/16/32 only; no exFAT code found (`Marlin@2ef3ee6:Marlin/src/sd/SdFatStructs.h`, `SdBaseFile.h:91-92`). Names are 8.3 by default; `LONG_FILENAME_HOST_SUPPORT` (M33, `M20 L`) and `LONG_FILENAME_WRITE_SUPPORT` (create/delete via M28, M30, binary transfer) are off by default (`Configuration_adv.h:1977-1978`); `MAX_VFAT_ENTRIES 20` covers 255-char LFN (`inc/Conditionals-5-post.h:3291`). Capability lines `LONG_FILENAME`, `LFN_WRITE`, `EXTENDED_M20` appear in M115 (web: Marlin commit notes) | Nothing; plain G-code. Thumbnails are for the LCD firmware (e.g. `.bgcode` / thumbnail comments) per vendor, not generic `(unverified)` | `Configuration_adv.h`; OctoPrint forum thread: hosts sometimes send 8.3 names even when LFN_WRITE is reported (https://community.octoprint.org/t/adding-support-for-m20-l/34402) |
| Klipper virtual_sdcard | Directory configured by `[virtual_sdcard] path`, usually `~/printer_data/gcodes`; Klipper registers M20, M21, M23, M24, M25, M26, M27 and `SDCARD_PRINT_FILE` (`klipper@ee2c6fb:klippy/extras/virtual_sdcard.py:38-48`); host file system limits apply (ext4), no 8.3 | Klipper itself nothing; Moonraker parses headers into metadata: slicer classes PrusaSlicer, Slic3r, Slic3rPE, BambuStudio, Cura, Simplify3D, KISSlicer, IdeaMaker, IceSL, KiriMoto (`moonraker@b559b9a:moonraker/components/file_manager/metadata.py:431-1151`), extensions `.gcode .g .gco .ufp .nc` (`file_manager.py:59`), fields `estimated_time`, `filament_total`, `object_height`, `first_layer_*`, `thumbnails` (`file_manager.md:222-271`) | cited |
| Moonraker, copying files by other means | Files placed by Samba/SCP/SFTP do not raise `notify_filelist_changed` (`moonraker@b559b9a:docs/api_changes.md:306`), and metadata is generated when scanning (`POST /server/files/metascan`, `file_manager.md:337`). A forum report shows a copied folder not appearing in Mainsail until uploaded via the GUI (https://klipper.discourse.group/t/unable-to-print-gcode-files/9060, web) | | |
| RepRapFirmware (Duet) | SD at `0:/gcodes`; `rr_upload` accepts optional `time` (sets modified time) and `crc32` (verification) and `rr_fileinfo` parses `height`, `layerHeight`, `printTime`, `filament`, `generatedBy`, `thumbnails` from the file (RRF wiki, web). Exact file name length limit not found `(unverified)` | G-code header comments of supported slicers, thumbnails as embedded comments | https://github.com/Duet3D/RepRapFirmware/wiki/HTTP-requests |
| PrusaLink (Prusa Mini/MK4/XL/Core) | Storage names from `/api/v1/storage` (e.g. USB); `.gcode` and `.bgcode`; names follow printer FAT USB (limit not documented) `(unverified)` | `.bgcode` metadata blocks (libbgcode), thumbnails | `openapi.yaml:176-200`; `PrintHostJobData.cpp:12` |
| Elegoo SDCP (CC, resin) | Names/path go in `Filename`; resin formats `.ctb`; error codes for MD5 mismatch, unknown format, invalid resolution, unknown model (`ElegooLink.cpp:69-76`) | Resin file header (model, resolution) checked by the printer | `SDCP@f977215`, Orca |
| Snapmaker | Upload via SACP/HTTP with machine-specific `.gcode`/`.cnc`/`.nc` types `(unverified)` | | `Luban@db573f5` |

Network shares and printer-side FTP/HTTP:

- HTTP upload is the supported path everywhere that has network access (rows in the table above and Finding 1). Host-side exports of the same kind: FlashAir `upload.cgi`, MKS `/upload?X-Filename=`, AstroBox/OctoPrint multipart (earlier table).
- SMB: no open printer firmware in this study exposes SMB natively. On Klipper SBC images a Samba share of the gcodes folder is a user-side setup (Mainsail docs describe `~/printer_data/gcodes`, https://docs.mainsail.xyz/setup/manual/; Samba steps `(unverified)`); caveat above about missing metadata and events. PrusaSlicer and Orca have no SMB code (searched `src` for samba/smb 2026-10-25).
- FTP: the only FTP code in `OrcaSlicer@09aa0114:src/slic3r/Utils` is Bambu's (FTPS to the printer; `bambu_networking.hpp`, `BBLNetworkPlugin.cpp`, `CalibUtils.cpp`), out of scope here; PrusaSlicer at `30ef591` has no FTP host. No FTP-capable open firmware was found in the sources read.
- Removable media (SD/USB): write the file to the mount and hint the user to eject; for FAT32 SD use short, ASCII names unless the firmware reports LFN support (Marlin `M115`). OS volume detection and eject APIs per OS are not researched `(unverified)`. Marlin binary transfer lets a host write to SD over USB serial with checksums (`docs/BinaryFileTransferProtocol.md`).

### 5. Discovery

| Method | Who | Evidence |
|---|---|---|
| mDNS/DNS-SD `_moonraker._tcp.local.` | Moonraker | `moonraker/components/zeroconf.py:35` |
| mDNS `_octoprint._tcp` (and `_http._tcp`) | OctoPrint; also answered by PrusaLink and used by PrusaSlicer/Orca for `.local` resolution | `plugins/discovery/__init__.py:173-176`; `PrintHostPrusaLink.cpp:81`; `OrcaSlicer@09aa0114:src/slic3r/GUI/BonjourDialog.cpp:138` |
| SSDP/UPnP multicast 239.255.255.250:1900 | OctoPrint, Moonraker | `discovery/__init__.py:45-47`; `zeroconf.py:141` |
| mDNS service prefix `Creality` | Creality K2 | `CrealityHostDiscovery.cpp:85-90` |
| UDP broadcast `M99999` to port 3000 | Elegoo SDCP | SDCP doc |
| UDP broadcast `discover` to port 20054 | Snapmaker | `Luban@db573f5:NetworkedMachineFinder.ts:9` |
| `pppp lan-search` (UDP) | AnkerMake | `ankermake@0007f4a:README.md:155` |
| HTTP port probe 18910 | Anycubic LAN mode (handshake endpoint) | kobra-connect (web) |
| None documented | Duet, Repetier (3344 fixed port), PrusaLink beyond `_octoprint._tcp` | `(unverified)` |

Implementation note: Node has no mDNS in core; options are `bonjour-service` 1.4.4 and `multicast-dns` 7.2.5 (pure JS, both MIT per the npm registry). VS Code Remote hosts do not see the user's LAN broadcasts, same caveat as serial. Manual host entry must always remain.

### 6. Unified adapter interface proposal

Derived from `IPrintHost` (`PrusaSlicer@30ef591:src/slic3r-shared/include/Slic3r/Biz/PrintHost/IPrintHost.hpp:29-66`: `test`, `perform` upload, `get_name`) and Orca's much larger `IPrinterAgent` (`OrcaSlicer@09aa0114:src/slic3r/Utils/IPrinterAgent.hpp`: discovery, subscribe, filament sync, camera mode), but split by capability so a thin Marlin-serial adapter is legal.

```ts
type Capability =
  | 'upload' | 'uploadAndStart' | 'start' | 'pause' | 'resume' | 'cancel' | 'emergencyStop'
  | 'listFiles' | 'deleteFile' | 'fileMetadata' | 'thumbnails'
  | 'telemetryPoll' | 'telemetryPush' | 'rawGcode' | 'temperatureControl' | 'motionControl'
  | 'webcamSnapshot' | 'webcamStream' | 'queue' | 'history' | 'filamentSync' | 'multiMaterial'
  | 'discovery' | 'pairing' | 'remoteWorkspaceSafe';

interface PrinterAdapter {
  readonly id: string;                       // 'moonraker' | 'octoprint' | 'prusalink' | 'duet-rrf' | 'duet-dsf' | 'repetier' | 'sdcp' | 'serial-marlin' | ...
  capabilities(): ReadonlySet<Capability>;   // may depend on connected firmware version
  connect(cfg: ConnectionConfig, secrets: SecretStore): Promise<Session>;
  probe(host: HostRef): Promise<ProbeResult>;     // cheap identify + firmware version (api/version, server/info, rr_connect, /info)
}
interface Session {
  info(): Promise<PrinterInfo>;                    // model, firmware, api version
  status(): Promise<PrinterStatus>;                // normalised: idle|printing|paused|error|busy; temps; job progress
  subscribe?(cb: (s: PrinterStatus) => void): Disposable; // WS where present, else adapter-internal polling
  upload?(file: Uri, opts: {dest?: string; start?: boolean; overwrite?: boolean; onProgress}): Promise<RemoteFile>;
  files?(path?: string): Promise<RemoteFile[]>;
  job?: { start(f: RemoteFile): Promise<void>; pause(): Promise<void>; resume(): Promise<void>; cancel(): Promise<void> };
  gcode?(line: string): Promise<string>;
  webcams?(): Promise<Webcam[]>;                   // {name, snapshotUrl?, streamUrl?, kind: 'mjpeg'|'webrtc'|'rtsp'|'jpeg-poll'}
  close(): Promise<void>;
}
interface Discoverer { scan(signal: AbortSignal): AsyncIterable<DiscoveredHost>; } // mdns, ssdp, udp-broadcast variants
```

Rules from the comparison: normalise state to a small enum and keep the vendor state string alongside (PrusaLink has 9 states, Moonraker uses `print_stats.state`); telemetry push is an optional capability and adapters poll internally otherwise (PrusaLink, RRF); auth is an adapter-declared scheme (`apikey`, `digest`, `session`, `bearer`, `token`, `pairing`) with secrets in VS Code SecretStorage; the adapter declares whether it is safe to run on a remote extension host; upload takes a stream and reports progress with cancel; vendor-only features (CFS, ACE, AMS) go behind `multiMaterial`/`filamentSync` extension interfaces rather than the core.

Suggested capability matrix:

| | Moonraker | OctoPrint | PrusaLink | RRF | DSF | Repetier | SDCP | Serial |
|---|---|---|---|---|---|---|---|---|
| upload+start | yes | yes | yes | yes (+M32) | yes | upload then copyModel | yes (+Cmd 128) | via SD M28 / stream |
| pause/resume/cancel | yes | yes | yes | M25/M24/M0 via gcode | same | start/stop/continue only | yes | yes (streaming host) |
| push telemetry | WS | SockJS | no | no | WS | WS | WS | stream |
| file list | yes | yes | yes | yes | yes | yes | Cmd 258 | M20 |
| webcam | URL list | settings URL | snapshot | none std | none std | config URL | RTSP | none |
| pairing | trusted IP/oneshot | AppKeys | digest | session | session | apikey | none | none |
| discovery | mDNS+SSDP | mDNS+SSDP | `_octoprint._tcp` | none | none | none | UDP 3000 | port enum |

## Comparison

See the per-ecosystem table in Finding 2, the storage table in Finding 4, the discovery table in Finding 5, and the capability matrix in Finding 6.

## Implications for VSSlicer

- Implement first in TypeScript, from the docs, not from slicer code: Moonraker (covers most Klipper derivatives, including Creality K1/K2, Rinkhals-rooted Anycubic, Elegoo Neptune, Snapmaker U1 `unverified`), OctoPrint (also covers AstroBox and PrusaLink legacy), PrusaLink v1, Duet RRF/DSF. These have public specs and need only `fetch` and `ws`.
- Second wave (Snapmaker SACP SDK is ISC, see licences): SDCP (official, small), Repetier, serial/Marlin (needs native module and platform VSIXs; ship as an optional extension so the core stays universal).
- Vendor-specific, plugin-only: Creality port 9999 and CFS, Elegoo CC2, Anycubic MQTT-TLS, Snapmaker SACP (npm SDK exists), AnkerMake (account data required, GPLv3 client). Gate them behind a "reverse engineered" label.
- Reuse model: wrap documented HTTP/WS APIs ourselves; skip copying slicer code (AGPL). Keep the interface capability-based so an adapter that cannot start prints (SD export only) still fits.
- Remote workspaces: LAN discovery and serial run on the extension host; put the connectivity extension as a UI extension (`extensionKind: ["ui"]`) so it sees the user's network `(needs verification against VS Code docs)`.
- Persist secrets in VS Code SecretStorage; prefer OctoPrint AppKeys and Moonraker oneshot/trusted-client flows over asking for keys.

## Licence notes

| Project | Licence | Consequence |
|---|---|---|
| Moonraker | GPL-3.0 (`moonraker@b559b9a:LICENSE`, first lines "GNU GENERAL PUBLIC LICENSE") | Talking to its HTTP API is fine; do not copy code |
| OctoPrint | AGPL-3.0 (`OctoPrint@64d8cd1:LICENSE`, header "GNU AFFERO GENERAL PUBLIC LICENSE") | Same; API clients are independent |
| Prusa-Link-Web | GPL-3.0 (`LICENSE`, `package.json:27`); `openapi.yaml` header says AGPLv3, an inconsistency to resolve before copying the spec | Re-derive types from the API, do not vendor the spec until clarified |
| PrusaSlicer, OrcaSlicer, Luban | AGPL-3.0 | Read for behaviour only; copying code makes VSSlicer AGPL |
| SDCP doc | no licence file in repo (`unverified`) | Implement from the protocol description; ask CBD-Tech if redistributing |
| ankermake-m5-protocol | GPL-3.0 | Plugin must not bundle if VSSlicer is not GPL-compatible |
| Rinkhals | MIT | Firmware helper; fine |
| kobra-connect | Apache-2.0 (web) | Can be studied and possibly reused |
| serialport / @serialport/bindings-cpp | MIT | Reusable |
| `@snapmaker/snapmaker-sacp-sdk` 0.1.1 | ISC per npm registry (https://registry.npmjs.org/@snapmaker/snapmaker-sacp-sdk, web); no repository field, last publish 2023-07-20 | Permissive but unmaintained and source location unknown; usable, vet the tarball before depending |
| `bonjour-service` 1.4.4, `multicast-dns` 7.2.5 | MIT (npm registry, web) | Reusable for mDNS discovery |
| `anycubic-python` / `uart-wifi` | licence not captured `(unverified)` | Do not copy until checked |
| Marlin | GPL-3.0 | Protocol use only |

## Open questions

- Creality Cloud wire protocol (only log keywords known) and what the K1/K2 root-access toggle covers per firmware.
- Anycubic LAN-mode upload procedure and ACE Pro addressing; Mono X transport (TCP vs UDP) and licence; whether current Photon firmware still speaks the CBD UDP G-code protocol; stock firmware ranges for LAN mode.
- Elegoo CC2 protocol provenance and firmware range; Elegoo Neptune on stock Klipper.
- Duet webcam and discovery conventions; DSF default port; Duet 3 RRF 3.6 stable changes.
- Repetier-Server full action list (prgdoc.repetier-server.com/v1/docs not read).
- Prusa Connect local/cloud API contract, Prusa Buddy USB serial specifics, and PrusaLink v1 stable-version matrix versus Prusa firmware versions.
- SD/USB export: Duet and PrusaLink file name length limits, OS volume detection and eject APIs, Samba setup conventions, thumbnail/metadata expectations for Marlin-family LCD firmware.
- Whether UI-side extensions can reach LAN broadcast from Remote sessions; Web Serial in VS Code webviews; serialport behaviour on current VS Code Electron.
- Moonraker default port and `printer.objects.subscribe` field set were taken from the docs structure and not run against a live instance.
