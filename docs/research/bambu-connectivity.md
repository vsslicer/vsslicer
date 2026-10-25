# Bambu Lab connectivity

Researched 2026-10-25. Sources: Bambu wiki and blog (URLs inline), Bambu ToS read in a browser on 2026-10-25, and code at
OpenBambuAPI@cc383a2 (last commit 2026-08-07, GFDL-1.3), ha-bambulab@0e027ff (last commit 2026-09-21, MIT),
BambuStudio@79df7ae (AGPL-3.0), OrcaSlicer@09aa0114 (AGPL-3.0). Bambu's own docs are marketing-grade and several protocol facts come only from
community reverse engineering (OpenBambuAPI); those are marked. Firmware numbers are those cited by sources, not independently tested: we had no printer.
Raw notes: `.reference/notes/VSS-10-bambu-connectivity.md`.

## Findings

### 1. LAN mode (MQTT, FTPS, camera, access code)

All of this is community-documented, not a Bambu-published spec.

| Item | Detail | Source |
|---|---|---|
| Auth | username `bblp`, password = 8-char LAN access code (`dev_access_code`, shown on the printer screen) | OpenBambuAPI@cc383a2:mqtt.md:20-30 |
| MQTT | TLS on 8883; subscribe `device/{DEV_ID}/report`, publish `device/{DEV_ID}/request`; JSON, `sequence_id` string echoed in replies | OpenBambuAPI@cc383a2:mqtt.md:37-75 |
| TLS | printer cert chains to a Bambu CA (bundled in OpenBambuAPI `examples/ca_cert.pem`, ha-bambulab `pybambu/certs/`); CN = printer serial, so connecting by IP needs SNI or manual CN check; Python 3.13 strict mode needs a workaround; newer models ship additional CA files (P2S, H2C, X2C) | OpenBambuAPI@cc383a2:tls.md; ha-bambulab@0e027ff:custom_components/bambu_lab/pybambu/bambu_client.py:891-915 |
| FTPS | implicit TLS on 990, same `bblp` + access code | OpenBambuAPI@cc383a2:ftp.md; ha-bambulab@0e027ff:.../bambu_client.py:762 |
| Camera X1, P2S | RTSPS `rtsps://IP:322/streaming/live/1`, `bblp` + code | OpenBambuAPI@cc383a2:video.md |
| Camera H2S, H2D (fw 01.02.00.00 observed) | same URL but off by default; enable "LAN Only Liveview" on the printer, then `push_status.ipcam.rtsp_url` carries the URL | OpenBambuAPI@cc383a2:video.md; ha-bambulab@0e027ff:docs/setup.mdx:37 |
| Camera A1, P1 | TLS TCP 6000, 80-byte auth packet (type 0x3000, user and code, 32 bytes each), then 16-byte header + one JPEG per frame (1280x720) | OpenBambuAPI@cc383a2:video.md; ha-bambulab@0e027ff:.../bambu_client.py:95-177 |
| TCP 6000 file tunnel | on some models (not A1/P1) a framed JSON protocol for list/upload/download/delete; `LIST_INFO` retired on H2S 01.02.00.00 | OpenBambuAPI@cc383a2:lan-file-tunnel.md |

Message schema (OpenBambuAPI@cc383a2:mqtt.md):

- Requests are `{"<class>": {"sequence_id": "N", "command": "...", ...}}`, with class `info`, `pushing`, `print`, `system`, `camera`, `xcam`, `upgrade`.
  Reports echo the request plus `result` and `reason`.
- Status: send `pushing.pushall` (line 137) for the full object. `print.push_status` is unsolicited (line 1095): X1 always sends the full object, P1 sends only deltas.
- Commands: `print.pause/resume/stop` (517-577), `print.print_speed` (699), `print.gcode_line` (743), `print.project_file` (819; a `.3mf` already on the printer, `ams_mapping`, calibration flags, `project_id/profile_id/task_id` = "0" for local prints), `print.gcode_file` (723), `print.skip_objects` (912), `system.ledctrl` (959), `camera.ipcam_record_set` (1030), `info.get_version` (79).
- Print start over LAN is therefore: FTPS upload of the sliced `.3mf`, then MQTT `print.project_file` with `url` `ftp:///name.3mf` (mqtt.md:819-857).

Firmware applicability. This is the pre-January-2025 model and still works on any printer in LAN mode plus Developer Mode (section 3), and on old firmware.
ha-bambulab states the authorization lock-down arrived with X1C 01.08.05.00, P1 01.08.02.00 and A1 01.05.00.00
(ha-bambulab@0e027ff:docs/index.mdx:10-14). Bambu's first beta was X1 01.08.03.00 on 2025-01-17
(https://blog.bambulab.com/firmware-update-introducing-new-authorization-control-system-2). The same docs say an earlier restriction appeared around P1 01.07.00.00:
in "hybrid" mode (cloud-connected printer, local client) only the light was controllable (ha-bambulab docs/index.mdx:22).
Developer Mode can be detected from the `print.fun` bitfield: `3EC1AFFF9CFF` disabled, `3EC18FFF9CFF` enabled
(ha-bambulab@0e027ff:.../pybambu/const.py:282-285; community-derived).

### 2. Cloud API

Fully reverse-engineered, undocumented by Bambu except a developer-partner programme. Snapshot from OpenBambuAPI@cc383a2 (last commit 2026-08-07):

- Base `https://api.bambulab.com` (CN `api.bambulab.cn`, per OrcaSlicer@09aa0114:src/slic3r/GUI/GUI_App.cpp:1326-1350). Every call needs `Authorization: Bearer <accessToken>`.
- Login: `POST /v1/user-service/user/login` with `{account, password}` or `{account, code}`. Response has `accessToken`, `refreshToken`, `expiresIn: 7776000` (about 3 months), and `loginType: "verifyCode"` when an emailed code is required. A separate TFA flow is at `https://bambulab.com/api/sign-in/tfa` (ha-bambulab@0e027ff:.../pybambu/const.py:306-307). The refresh endpoint now returns only 401 (cloud-http.md:13-38,180).
- Device list: `GET /v1/iot-service/api/user/bind` returns `dev_id`, `name`, `online`, `dev_model_name`, and the LAN access code `dev_access_code` for each bound printer (cloud-http.md:438-470). The user id for MQTT comes from `GET /v1/design-user-service/my/preference`.
- Cloud MQTT: `us.mqtt.bambulab.com:8883` (also `cn.mqtt.bambulab.com`), username `u_{USER_ID}`, password = access token, same topics and payloads as LAN (mqtt.md:7-18; cloud-http.md:1147).
- Print start from the cloud uses the same MQTT `print.project_file`, but the `.3mf` goes to an object store via the slicer-side upload flow, not FTPS; this upload flow is partly documented (`cloud-http.md` task/ticket endpoints) and we did not verify it (unverified).
- Camera in cloud mode: TUTK/Agora P2P relay (OpenBambuAPI@cc383a2:cloud-video.md, not analysed in depth); Bambu says the stream is peer-to-peer with server forwarding only as fallback (https://blog.bambulab.com/updates-and-third-party-integration-with-bambu-connect/).
- Post-2025 cloud-mode control is signed (section 3). So third-party cloud use is read-oriented unless the client is the genuine Bambu plugin.
- Cloud load: Bambu claimed "30 million unauthorized requests per day" from unofficial clients as a motive (blog, 2025-01-16). Treat as Bambu's claim.

### 3. January 2025 authorization firmware, Bambu Connect, Developer Mode

What changed (https://blog.bambulab.com/firmware-update-introducing-new-authorization-control-system-2, 2025-01-16, updated 01-17 and 01-20; https://wiki.bambulab.com/en/software/third-party-integration):

- Operations needing "authorization" in both cloud mode and normal LAN mode: bind/unbind, remote video via the plugin, firmware upgrade from software (microSD upgrade unaffected), starting a print from anything but Bambu Studio (needs Bambu Connect), and control of motion, temperature, fans, AMS, calibration.
- Unaffected: MQTT status push (Home Assistant read), SD-card prints, LED control, microSD updates.
- Rollout: X1 first (beta 01.08.03.00, 2025-01-17; full release planned 2025-01-23), P and A series later; "All future Bambu Lab printer models will integrate authorization control technology as standard." No date was given for P/A series; ha-bambulab cites P1 01.08.02.00 and A1 01.05.00.00.
- Mechanism (community RE, observed on Bambu Handy and Studio plugin 02.07.x, P1S/H2S firmware; OpenBambuAPI@cc383a2:cloud-x509-auth.md):
  - The app fetches a per-printer X.509 cert and key from `GET /v1/iot-service/api/user/applications/{appToken}/cert?aes256=...&ver=1`. Leaf CN is the printer serial, chains to the Bambu CA, validity about 10 years.
  - Every `print.*` MQTT publish gets a `header` object: `sign_ver v1.0`, `sign_alg RSA_SHA256`, `cert_id`, `payload_len`, and `sign_string` = RSA-PKCS1v15-SHA256 over canonical JSON (sorted keys, no whitespace). Unsigned or malformed publishes fail with `err_code 0x05024007` / `0x05024009`.
  - `gcode_line` additionally replaces `param` with `param_enc`, encrypted with the printer's RSA public key.
  - The doc's claim that `pushing.*`, `system.*` and `camera.*` need the client certificate in the TLS handshake is labelled "best guess" by its author; ha-bambulab connects in Developer Mode with user and code only (bambu_client.py:844-847), consistent with the cert being required only outside Developer Mode (unverified).
- Closed plugin gate: the plugin Authenticode-verifies the host exe and `BambuStudio.dll` against a pinned Bambu publisher before it will sign `print.*`; otherwise `BAMBU_NETWORK_SIGNED_ERROR` (-26) (OpenBambuAPI@cc383a2:client-plugin-internals.md; Studio only defines the error code, BambuStudio@79df7ae:src/slic3r/Utils/bambu_networking.hpp:42, the gate itself lives in the closed binary). Community-written, Windows only, plugin 02.07.00.x.

Bambu Connect (wiki, retrieved 2026-10-25): a separate desktop app (Windows 10+ x86_64, macOS 13+, Linux "in development") that does cloud login, LAN discovery, imports a sliced file via URL scheme `bambu-connect://import-file?path=<enc>&name=<enc>&version=1.0.0`, sends it, and offers basic controls. Liveview was "not yet supported" on that page. Third-party slicers hand over a file and lose the device tab. Orca's maintainer declined to integrate it (https://all3dp.com/2/bambu-connect-easy-to-use-but-a-step-backward/; secondary).
The Bambu Connect certificate and key were extracted from its Electron `main.js` within days (https://hackaday.com/2025/01/19/bambu-connects-authentication-x-509-certificate-and-private-key-extracted/). Whether Bambu rotated them is not established by any source we found (unverified).

Developer Mode (https://blog.bambulab.com/updates-and-third-party-integration-with-bambu-connect/, 2025-01-20; https://wiki.bambulab.com/en/knowledge-sharing/enable-developer-mode, retrieved 2026-10-25):

- Optional, enabled on the printer screen after LAN Only mode, with a risk acknowledgement. Announced for X1, P1, A1, A1 mini; the wiki now has sections for X, P1, A1 and H2 series / P2S.
- "Enabling this will open the MQTT channel, live stream, and FTP." It "functions the same as in previous firmware versions and does not require authorization verification" and "will not allow the printer to be connected to Bambu Cloud."
- Bambu: no customer support, "users ... assume full responsibility."
- Third-party tools "continue to work without any modifications" (wiki). Home Assistant, SimplyPrint, Octoprint-style connectors rely on it.

Current state at 2026-10-25, with sources:

| Path | Works | Lost |
|---|---|---|
| Developer Mode (LAN only) | the full section 1 protocol, unsigned | cloud, Handy, remote monitoring; Bambu Connect (All3DP, secondary) |
| Normal LAN or cloud, genuine Studio plugin | everything, including remote video | requires Bambu's signed binaries |
| Normal LAN or cloud, third-party app | read-only status; Orca can use the downloaded plugin for firmware update, Live View and downloads (wiki) | print start, motion, temperature, AMS (needs Connect) |
| Old firmware | full, unsigned | security fixes |

No source reports the lock being relaxed. The OpenBambuAPI changelog shows continuing work on H2S, H2D, P2S firmware (video.md, lan-file-tunnel.md), which implies Developer Mode still works on 2026 models; we could not test it (unverified for X2D, H2C).

### 4. Community projects

| Project | What | Licence | State (gh api, 2026-10-25) |
|---|---|---|---|
| ha-bambulab | Home Assistant integration, LAN (user+code) and cloud modes, camera, FTP, filament | MIT | last push 2026-09-21, 2386 stars; docs say write needs LAN + Developer Mode |
| OpenBambuAPI | protocol docs, examples | GFDL-1.3 (docs; check before copying text) | 2026-08-07, 704 stars |
| bambu-farm, bambu-cli (davglass) | multi-printer web UI and Node CLI | NOASSERTION / none | archived, last push 2025-01-28; pre-lockdown; announced https://forum.bambulab.com/t/new-web-app-and-command-line-tools/42938 |
| bambu-connect (PyPI, mattcar15) | Python LAN library; unrelated to Bambu's Connect app | "other" | 0.3.1, last push 2025-06-28 |
| bambu-rs (sksat) | Rust CLI/library, LAN + Developer Mode | MIT | 2026-10-24, 4 stars |
| bambulan (gonzalop) | Go library: MQTT, FTPS, camera frames | MIT | 2026-10-16, 8 stars |
| bambu-printer-manager (synman) | REST wrapper over MQTT | WTFPL | 2026-09-30 |
| bambu-mcp (schwarztim) | MCP server using the extracted Bambu Connect cert | MIT | 2026-09-29; do not copy: embeds the leaked key |
| Bambu-Lab-Cloud-API (coelacant1) | cloud RE docs + "legacy API without developer mode" shim | AGPL-3.0 | 2025-10-29 |
| OctoPrint-BambuConnector | OctoPrint 2.0 connector | AGPL-3.0 | 2026-05-25 |
| baltobu reverse-networking (Frix-x mirror) | clean-room RE of `bambu_networking.dll` | MIT | 2026-05-20; Windows DLL only so far |

The closed plugin (code):

- Studio loads `libbambu_networking` (.dll/.dylib/.so) from `<datadir>/plugins` by `dlsym` of about 100 `bambu_network_*` entry points: `create_agent`, `connect_printer`, `send_message_to_printer`, `start_local_print`, `start_local_print_with_record`, `start_send_gcode_to_sdcard`, `connect_server` and others (BambuStudio@79df7ae:src/slic3r/Utils/NetworkAgent.cpp:195-347). On Windows it refuses a plugin not signed by the same publisher as the host exe (`IsSamePublisher`, NetworkAgent.cpp:202-264, CertificateVerify.cpp). Camera uses a second closed library behind `Printer/BambuTunnel.h` (GUI/MediaPlayCtrl.cpp:14).
- Bambu's README: "The bambu networking plugin is based on non-free libraries. It is optional to the Bambu Studio" (BambuStudio@79df7ae:README.md:51).
- Orca keeps a compatible ABI table (latest 02.08.04, 02.03.00, legacy) and downloads the plugin metadata from `api.bambulab.com/v1/iot-service/api/slicer/resource?slicer/plugins/cloud=<version>` (OrcaSlicer@09aa0114:src/slic3r/Utils/bambu_networking.hpp:434-440; GUI_App.cpp:1384-1420). It has no same-publisher check (rg found none). Its `NetworkAgentFactory.cpp` also registers Orca, Qidi, Snapmaker, Moonraker and Creality agents, plus a Python printer-agent plugin capability (`src/slic3r/plugin/pluginTypes/printerAgent`).
- Whether Orca's downloaded plugin can sign control commands depends on Bambu's server-side/plugin-side checks. A secondary 2026 blog claims Orca 2.3.2 restored full LAN control via the plugin (unverified); Tom's Hardware (2026-04-29) says Orca in LAN mode "continues to work" while cloud use requires Studio or Connect (comment text, not article text).

### 5. Legal and ToS exposure

Bambu Terms of Use (https://bambulab.com/en-us/policies/terms, "Last updated as of 24 April, 2024", read 2026-10-25). The page returns 403 to curl and WebFetch; a browser is needed.

- 1.1: "The Product under these Terms means the Bambu Lab device, and the software contained therein."
- 3.1: "You may not use Bambu Lab technology or Bambu Lab intellectual property to develop software or design, develop, manufacture, sell, or licence third-party devices/accessories associated with Bambu Lab Product without Bambu Lab's prior consent."
- 3.4: "... you shall not ... modify, discoder [sic], copy, reverse engineer, publish, publicly disseminate, decompile, export codes, disassemble or create derivatives of the Product in any way."
- 3.5(5): no attempt "to destroy, bypass, change, invalidate or escape from the Product and/or any digital rights management system"; 3.5(3): no "deceptive" use.
- 11.1: breach "MAY RESULT IN THE DEACTIVATION OF YOUR ACCOUNT AND LOSS OR RESTRICTION OF ACCESS TO THE CONTENT ASSOCIATED WITH THE PRODUCT."
- Closing: "additional terms ... that may apply when you use or purchase open source software, third-party content, or other Bambu Lab services."
- No clause names LAN protocol clients, MQTT or APIs. The binding risk is for users (account deactivation) and for anyone using Bambu IP (3.1) or reverse engineering the firmware/software (3.4). The "Fleet Hub" and "#BambuLetsMakeIt" agreements have stricter wording (reverse-engineering server transmissions) per search snippets; not read in full and not applicable unless we use those services (unverified).
- We did not obtain the Studio EULA or privacy policy text; the Studio EULA is not in the BambuStudio repo at 79df7ae (not searched exhaustively).

Episodes:

- Certificate/key extraction (2025-01-19, above): Bambu's public response (2025-01-20 blog) was Developer Mode, not legal action; the blog denies bricking, killswitch and backdoor claims.
- OrcaSlicer-BambuLab fork (2026): Pawel Jarczak's Orca fork restored cloud access without Bambu Connect. Per Tom's Hardware (2026-04-29) Bambu sent a cease and desist alleging reverse engineering to impersonate Bambu Studio, ToS violation and bypass of authorization control; he withdrew it. Bambu's blog statement, quoted by Jarczak (README update 09.05.2026), described "falsified identity metadata", "pretended to be the official Bambu Studio client" and "bypassing a technical limitation". Bambu reportedly invoked DMCA s.1201 (https://www.pcgameshardware.de/3D-Drucker-Hardware-261773/News/Bambu-Lab-OrcaSlicer-Abmahnung-Community-Reaktion-1534753/, secondary, unverified). We could not retrieve Bambu's statement itself.
- Software Freedom Conservancy (2026-05-18, https://sfconservancy.org/news/2026/may/18/bambu-studio-3d-printer-agpl-violation-response/): alleges AGPLv3 violation (closed, dynamically linked networking library; further restrictions contrary to AGPL s.10). Launched "baltobu" clean-room RE of the plugin, an Orca fork and a Studio fork. This is an advocacy position, untested in court; Bambu's position is that cloud services are private and governed by its terms.

Defensible posture for us:

1. Talk only to the printer on the LAN with the owner's own access code, in Developer Mode. The user enables it with Bambu's documented, supported switch; no Bambu secret is used; Bambu's wiki says third-party software "will continue to work".
2. Do not touch Bambu's cloud servers from our own client, and never present ourselves as Bambu Studio (User-Agent, signatures, publisher identity). The 2026 dispute turned on cloud access and impersonation, not on LAN protocol use.
3. Do not ship, embed or fetch the extracted Bambu Connect certificate/key, per-printer certs obtained by memory-scanning the plugin, or any signing implementation of the closed plugin (potential DMCA s.1201 / ToS 3.5(5) circumvention claim, and clearly not "ours").
4. Do not redistribute `libbambu_networking`. Bambu distributes it to users via Studio/Orca; our extension can at most let the user bring their own installation (see below). Redistribution is covered by 3.3/3.5(2) risks.
5. Write our own protocol client from public documentation (OpenBambuAPI is GFDL: facts are not copyrightable but copy no prose; ha-bambulab is MIT).[^p5]
6. Not legal advice; the Bambu ToS binds users, enforceability of reverse-engineering clauses against interoperability varies by jurisdiction (unverified).

### 6. Open Bamboo Networking (PRN-1, researched 2026-10-25)

The "bamboo-networking plugin" named by the owner (D3) is https://github.com/ClusterM/open-bamboo-networking, studied at `922c3e9` (2026-10-25; release v2.2.0, 2026-09-24). The full candidate table is in `.reference/notes/PRN-1-bambu-networking.md`, and the proposed choice is D16.

- Licence: AGPL-3.0-or-later (open-bamboo-networking@922c3e9:LICENSE:1-13). GitHub reports NOASSERTION because a project header sits above the licence text.
- What it is: a C++ drop-in for `libbambu_networking` with the same `dlsym` ABI, file name and install location, for Studio ABI 02.03.00 to 02.08.04 and Orca 2.3.2 and later (README.md:93-99, 128-175). It credits OpenBambuAPI, bambulabs_api, ha-bambulab and MITM captures (README.md:101-105). `research/` holds 79 protocol notes (research/INDEX.md).
- LAN, Developer Mode, no keys: SSDP on UDP 2021, MQTT/TLS 8883, FTPS 990 with `project_file`, the TLS :6000 file transfer, RTSPS :322 H.264 (X1, P2S, H-series, X2D) and MJPEG over TLS :6000 (A1, P1) (README.md:185-212, 324-357). TLS is verified against Studio's CA bundle plus a per-device leaf pinned on first contact, with CN = SNI = serial; N7/P2S firmware sends only the leaf (STATUS.md:245-258).
- Cloud: sign-in, cloud MQTT and preset/filament sync work without secrets. Signed commands, cloud print, MakerWorld records and TUTK remote camera need the user's own extracted Bambu slicer key plus `client_name = BambuStudio`, because the API returns HTTP 403 to an honest name (README.md:214-241, 327-340, 357). `research/10.02-secrets.md` documents Bambu's embedded client secrets. Point 3 above applies: copy none of 10.02, 10.03 (field encryption), 10.04 (signing), 10.05 (HTTP PoP) or 10.07 (crypto). 10.06 (LAN TLS and access codes) is the LAN trust model and may be ported; its `printer.cer` CA bundle is public and comes from BambuStudio@79df7ae:resources/cert/printer.cer (AGPL-3.0). D16's cloud option (b) would override point 2, and option (c) breaks points 2 and 3.
- HMS text: ha-bambulab's tables are scraped from Bambu (ha-bambulab@0e027ff:scripts/update_error_text.py:67,267), so they are Bambu's data, not MIT: fetch at runtime or paraphrase.
- Node libraries (bambu-js MIT, @taucad/bambu Apache-2.0, bambu-link MIT, bambu-node MIT archived, homebridge-bambu-labs ISC) are usable from Node but cover only MQTT, FTP and at most camera frames, with no :6000 transfer, H2C or leaf-pin TLS (READMEs and npm metadata, 2026-10-25; unverified). bambuddy (AGPL-3.0, Python) and OctoPrint-BambuConnector (AGPL-3.0, Python) are applications, not libraries. Table in the PRN-1 note.
- H2C: the author has no H2C. There are two community reports on firmware 01.02.00.00 in LAN-only mode, about :6000 `LIST_INFO`/`SUB_FILE` without a USB stick (research/09.06-commands.md:58, 149). H2C camera support rests on the "H-series" row and is untested (unverified).
- D2 now allows porting AGPL code, so point 5 above ("write our own client") becomes "port the LAN parts of this project with provenance lines" if D16 is accepted.

[^p5]: Superseded if D16 is accepted: the LAN client is ported from Open Bamboo Networking under D2 with provenance lines (§6, `.ai/kanban/decisions/D16-bambu-networking-implementation.md`).

## Comparison

| Mode | Auth | Print start | Control | Camera | Cloud | Risk to us |
|---|---|---|---|---|---|---|
| A. LAN + Developer Mode, own client | access code | FTPS + MQTT `project_file` | full | RTSPS (X1, P2S, H2 with Liveview toggle) or TCP 6000 JPEG (A1, P1) | no | low |
| B. LAN, normal, hand-off to Bambu Connect | Bambu Connect | URL scheme `bambu-connect://import-file` | Connect UI only | none from us | Connect's own login | low, but unusable on Linux (no Connect build) and poor UX |
| C. LAN/cloud, user-supplied Bambu plugin loaded as in Orca | signed by plugin | via plugin | restricted to what the plugin allows for non-Studio hosts | via closed BambuSource | yes | medium: AGPL/plugin ABI churn (Orca tracks 3 ABIs), host-identity checks |
| D. Cloud, own client | bearer token | no signed control | read only | P2P (closed) | yes | high: cloud ToS, impersonation claims |
| E. Old firmware, unsigned | access code | as A | full | as A | optional | firmware not updatable |
| F. Read-only status on normal LAN | access code | no | no | Bambu-dependent | no | low (HA proves it) |

## Implications for VSSlicer

1. Support order: (1) mode A (Developer Mode LAN) as the primary integration, implemented natively in a VS Code extension host (Node: `mqtt`, `basic-ftp` with implicit TLS, an RTSP or TCP-6000 reader). (2) Mode F read-only status for printers not in Developer Mode, with a clear "enable Developer Mode for control" prompt using the `fun` flag to detect the state. (3) Mode B hand-off through the Bambu Connect URL scheme, on macOS and Windows only, as a convenience for users who stay on authorization firmware. (4) Optionally later: mode C as a user-installed, off-by-default bridge, after legal review.
2. Must not ship: the Bambu Connect cert/key or any signing code derived from it; cloud login or token handling against `api.bambulab.com` with a spoofed Studio identity; a copy of `bambu_networking`; any code or tooling that memory-scans another process for keys.
3. Camera: RTSPS for X1, P2S and H2 (user must toggle LAN liveview on H2), JPEG-over-TLS for A1 and P1; both are straightforward in Node. Cloud P2P (TUTK/Agora) is out of scope.
4. Reuse: ha-bambulab (MIT) and bambulan/bambu-rs (MIT) are safe to read and port as references; do not copy OpenBambuAPI prose (GFDL-1.3); AGPL projects (Orca, Studio, Coelacant, OctoPrint-BambuConnector) only as read-only references unless we choose AGPL.
5. Treat the protocol as unstable: gate by model and firmware, keep a per-model capability table (fun flag, `ipcam.rtsp_url`, `get_version`), and test against `mock_data` in ha-bambulab.
6. Product statement for users: Bambu control requires LAN mode plus Developer Mode on authorization firmware and costs them Bambu Cloud/Handy; surface this honestly.

## Licence notes

- OpenBambuAPI: GNU Free Documentation License 1.3 (docs only). Quoting short facts is fine; copying text brings invariant/copyleft duties.
- ha-bambulab, bambulan, bambu-rs, bambu-mcp: MIT. bambu-printer-manager: WTFPL. bambu-farm: NOASSERTION; bambu-cli: no licence (do not reuse).
- BambuStudio, OrcaSlicer: AGPL-3.0. The Bambu plugin is proprietary, shipped separately, and subject to the SFC dispute; do not redistribute.
- Extracted Bambu Connect credentials: not licensed to anyone; treat as off-limits.
- Bambu ToS clauses 3.1 and 3.4 restrict use of Bambu IP and reverse engineering by users.

## Open questions

- Which model/firmware combos currently support Developer Mode and what it exposes on X2D, H2C, P2S and later (wiki lists series but not firmware numbers; no hardware here).
- Whether Bambu rotated the Bambu Connect cert after January 2025.
- Does non-Developer normal LAN mode still permit unsigned MQTT subscribe with only user and code (OpenBambuAPI says TLS client cert is required; ha-bambulab docs say reads work)? Needs a printer test.
- Bambu's May 2026 blog statement text, the Studio EULA text, and the Fleet Hub/partner SDK ("Bambu Local Server") terms: not obtained.
- Whether Orca's downloaded plugin currently signs control commands for non-Studio hosts (secondary sources conflict).
- Outcome of the SFC investigation and any Bambu legal action beyond the one C&D.
