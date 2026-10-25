# Licensing synthesis

Researched 2026-10-25. Sources: LICENSE files in the 50 clones under `.reference/repos/` (scripted scan, short hashes below), the "Licence notes" of the other R1 reports in `docs/research/`, and vendor terms fetched on 2026-10-25 (URLs inline). Raw scan: `.reference/notes/VSS-16-licensing.md`. FSF GPL FAQ (https://www.gnu.org/licenses/gpl-faq.html) and the ASF GPL-compatibility page (https://www.apache.org/licenses/GPL-compatibility.html) were fetched on 2026-10-25 and quoted below; the legal readings built on them are the worker's, not counsel's opinion. Microsoft VS Code licence read from https://code.visualstudio.com/license (no revision date on the page).

## Findings

### 1. Licence of every studied project

"File" is the licence file found at the clone root; "Version" is the first line of its text. A bare name means the text matched the standard licence verbatim in its first lines only.

| Project | HEAD | File | Licence and version | Notes / exceptions |
|---|---|---|---|---|
| PrusaSlicer | 30ef591 | LICENSE | AGPL-3.0 (v3, 19 Nov 2007) | Calibration Lua plugin AGPL-3.0-only (features-prusaslicer report) |
| PrusaSlicer-2.9 | b028299 | none | unknown | Partial clone (only `resources/`, `src/`); use PrusaSlicer's LICENSE |
| PrusaSlicer-settings | a40f669 | License | AGPL-3.0 | Archived for 2.8+; `live/Anker/License.txt` also AGPL-3.0. Successors `-prusa-fff`, `-non-prusa-fff` have no licence file (profiles report, 2026-10-25) |
| SuperSlicer | 1f3d287 | LICENSE | AGPL-3.0 | |
| Slic3r | 026c138 | LICENSE | AGPL-3.0 | |
| BambuStudio | 79df7ae | LICENSE | AGPL-3.0 | README:51 "networking plugin is based on non-free libraries", optional |
| OrcaSlicer | 09aa0114 | LICENSE.txt | AGPL-3.0 | README:262 PA calibration pattern adapted from GPL-3.0 code (so that part is GPL-3.0, AGPL-compatible via GPL s13) |
| Snapmaker_Orca | 746dd8e | LICENSE.txt | AGPL-3.0 | Fork of Orca |
| ElegooSlicer | 2d507e39 | LICENSE.txt | AGPL-3.0 | Elegoo user agreement s7.2 confirms AGPL-3.0, reserves UI/data/graphics (see 4) |
| CrealityPrint | 59ae8cb | LICENSE.txt, license.rtf, license_en.rtf | AGPL-3.0 | RTF files are headed "Software Licensing and Terms of Service" then AGPL text; no extra clauses found by keyword grep |
| AnycubicSlicerNext | 6103ed8 | LICENSE.txt | AGPL-3.0 | |
| Luban | db573f5 | LICENSE | AGPL-3.0 | |
| libbgcode | d4da907 | LICENSE | AGPL-3.0 | |
| CuraEngine | 47b0388 | LICENSE | AGPL-3.0 (text v3); source headers say "AGPLv3 or higher" (`src/main.cpp:2`), `conanfile.py:18` says `AGPL-3.0` | Card assumption "LGPL" is wrong; confirmed AGPL |
| Cura | 5bea2f8 | LICENSE | LGPL-3.0 (29 June 2007) | Definitions/profiles under repo licence; no per-file headers found (profiles report) |
| Uranium | e65ccc1 | LICENSE | LGPL-3.0 | |
| Marlin | 2ef3ee6 | LICENSE | GPL-3.0 | |
| klipper | ee2c6fb | COPYING | GPL-3.0 | |
| moonraker | b559b9a | LICENSE | GPL-3.0 | Was "not checked" in projects-and-fleet; now verified |
| mainsail | 03a4d7b | LICENSE | GPL-3.0 | Was unverified in remote-camera; now verified |
| fluidd | b36a497 | LICENSE | GPL-3.0 | Same |
| OctoPrint | 64d8cd1 | LICENSE.txt | AGPL-3.0 | |
| Prusa-Link-Web | a67f306 | LICENSE | GPL-3.0 (`package.json:27`) | `spec/openapi.yaml:8-9` says AGPLv3: inconsistent, unresolved |
| ankermake-m5-protocol | 0007f4a | LICENSE | GPL-3.0 | Reverse engineered, unaffiliated |
| Rinkhals | 04c6900 | LICENSE | MIT | Header: "All my scripts / code is provided under" MIT; firmware blobs not covered (unverified) |
| OpenBambuAPI | cc383a2 | LICENSE.md | GFDL-1.3 (3 Nov 2008) | Documentation licence |
| ha-bambulab | 0e027ff | LICENSE | MIT | |
| Spoolman | 488eb74 | LICENSE | MIT | |
| OpenFilamentDatabase | eef61a50 | LICENSE | MIT (README:65: data free for commercial use) | |
| OpenPrintTag | 060e420 | LICENSE | MIT (Prusa Research 2025) | |
| fdm_materials | 0c05969 | LICENSE | CC0-1.0 | |
| RFID-Tag-Guide | a26cf83 | none | unlicensed (all rights reserved by default) | `deriveKeys.py` embeds Bambu master key; do not embed or vendor |
| SDCP V3.0.0 doc | f977215 | none | unlicensed | Elegoo/CBD-Tech protocol doc; implement from facts, do not copy text |
| gcode-preview | 9609c5b | LICENSE | MIT | |
| klipper_estimator | dbcff4a | LICENSE.txt | MIT (declared) | **Provenance contested**: `lib/src/planner.rs:399-421` (`apply_junction`) is a near line-by-line translation of GPL-3.0 `klipper@ee2c6fb:klippy/toolhead.py:66-95` (`calc_junction`): same variables and order of `min()` terms. Treat as GPL-3.0-derived; gcode-viewer-simulation.md already says do not port (found in VSS-16 review) |
| grid-apps (Kiri:Moto) | d138275 | license.md | MIT | slicing-engine report: 254 files carry "Copyright Stewart Allen -- All Rights Reserved" headers; treat as unconfirmed |
| vscode | 4ef6bab7 | LICENSE.txt | MIT | Microsoft's *product* builds are under a separate EULA (not in repo) |
| vscodium | be70704 | LICENSE | MIT | |
| openvsx | 373af42 | LICENSE | EPL-2.0 | |
| 3mf-spec-* (10 repos) | see scan | LICENSE | BSD-2-Clause (3MF Consortium) | Specs, not libraries |

Items not cloned, taken from other reports (not re-verified here): libArcus (repo sidebar LGPL-3.0, README AGPLv3: inconsistent), cura-wasm (engine AGPL-3+, wrapper LGPL-3+/MIT), @sindarius/gcodeviewer LGPL-3.0+, occt-import-js LGPL-2.1, lib3mf BSD-2, three.js/manifold-3d/Babylon (MIT/Apache-2.0), go2rtc MIT, camera-streamer/crowsnest GPL-3.0, Octolapse AGPL-3.0.

Reconciliation of earlier reports against files: no worker claim was contradicted except (a) card text "CuraEngine LGPL" (wrong, already corrected by the engine report), (b) the Prusa-Link-Web internal inconsistency, (c) licences marked "not checked" in remote-camera and projects-and-fleet (Mainsail, Fluidd, Moonraker, ha-bambulab, OpenBambuAPI) which are now confirmed as GPL-3.0, GPL-3.0, GPL-3.0, MIT, GFDL-1.3.

### 2. Copyleft triggers

Licence texts: AGPL-3.0 https://www.gnu.org/licenses/agpl-3.0.html ; GPL-3.0 https://www.gnu.org/licenses/gpl-3.0.html ; LGPL-3.0 https://www.gnu.org/licenses/lgpl-3.0.html ; FSF FAQ https://www.gnu.org/licenses/gpl-faq.html (anchors `#MereAggregation`, `#GPLPlugins`, `#LinkingWithGPL`, `#GPLInProprietarySystem`); AGPL purpose https://www.gnu.org/licenses/why-affero-gpl.html. Reading: GPL/AGPL obligations attach on *conveying* (distribution) a covered work or a work based on it (AGPL s5, s6) and, for AGPL only, on *remote network interaction with a modified version* (AGPL s13). Running a program privately triggers nothing.

| Scenario | What triggers copyleft | Consequence for VSSlicer | Confidence |
|---|---|---|---|
| (a) Extension spawns a slicer CLI (CuraEngine, PrusaSlicer, Orca) as a separate process | Not triggered by the spawn. FSF FAQ treats pipes/sockets/command-line between separate programs as normally separate works unless data exchange is intimate enough to make them one program (`#MereAggregation`). If the user installs the binary, we distribute nothing. If we *ship or host* the binary (VSIX, release asset, downloader that fetches from our server), we convey it: must supply licence text and corresponding source (AGPL s6), including any patches. s13 applies only if we *modify* it and let remote users interact with it (e.g. a hosted slicing service) | Extension keeps its own licence. Prefer "user installs / extension downloads from upstream release" over bundling. Keep protocol (CLI flags, JSON, 3MF files) generic | Medium: standard reading, never tested in court `(unverified)` |
| (b) Extension links libslic3r via N-API (`.node` addon) | Addon is a combined work with libslic3r: conveying it requires AGPL for the whole addon (s5(c)). FSF on bindings: "when the interpreter is extended to provide 'bindings' to other facilities ... the interpreted program is effectively linked to the facilities it uses through these bindings" (https://www.gnu.org/licenses/gpl-faq.html#IfInterpreterIsGPL); and "If the main program dynamically links plug-ins, and they make function calls to each other and share data structures, we believe they form a single combined program" (https://www.gnu.org/licenses/gpl-faq.html#GPLPlugins) | The JS that `require()`s the addon is, on the FSF view, linked to it: the VSIX must be AGPL-3.0 with a source offer; users of a modified version over a network (code-server, hosted VS Code) also get s13. Untested in court, but the FSF position is explicit | High for the addon; Medium-High for the JS host (FSF view explicit, unlitigated) |
| (c) WASM build of an engine in a worker | The `.wasm` is object code of the AGPL work. Serving it to browsers (web VS Code) conveys object code to every user, so AGPL s6 source duties apply even to an unmodified engine: "If you make object code available on a network server, you have to provide the Corresponding Source on a network server as well" (https://www.gnu.org/licenses/gpl-faq.html#AnonFTPAndSendSources). s13 is a separate, additional trigger that only concerns *modified* versions users interact with remotely (server-side execution). Combination question: "pipes, sockets and command-line arguments are communication mechanisms normally used between two separate programs ... But if the semantics of the communication are intimate enough, exchanging complex internal data structures, that too could be a basis to consider the two parts as combined" and "If modules are designed to run linked together in a shared address space, that almost surely means combining them into one program" (https://www.gnu.org/licenses/gpl-faq.html#MereAggregation). Packaging in the same VSIX/container does not itself combine works (https://www.gnu.org/licenses/gpl-faq.html#AggregateContainers) | A worker running the `.wasm` through a narrow message protocol (3MF/G-code in, G-code out) is the best case for "separate". But the engine report's design (`slicing-engine-embedding.md:165`, JS calling `callMain`/`FS` of the module) is in-process calling: whatever JS drives the module that way (the wrapper) must be AGPL; the rest of our extension stays separate only if it talks to the wrapper over serialised messages. Source offer needed in either case | Medium for separation; High for conveying duties |
| (d) VSCodium fork bundling our extensions | Fork code is MIT (`vscodium@be70704:LICENSE`, `vscode@4ef6bab7:LICENSE.txt`): no copyleft from the base. Bundling extensions in the same installer is "aggregate" if they remain separate programs (GPL s5 last paragraph; `#MereAggregation`). Each bundled extension keeps its own licence; AGPL/GPL ones bring the conveyance duties (licence text, source offer, installation information not relevant for non-User Products) | Build must ship a third-party notices file and a written offer / source link for every GPL-family component. Product name/icons: Microsoft trademarks must not be used (vscode-platform report). Microsoft-licensed extensions (C/C++, Remote, Live Share etc.) are not licensed for forks | High | Caveat: an AGPL extension running in the same extension host as ours is not a separate-process case (see scenario (f)).
| (f) Our Apache-2.0 extension calls an AGPL engine extension through VS Code `exports` / `executeCommand` (or hard `extensionDependencies`) | All extensions share one extension-host process; `exports`/commands are in-process JS calls passing live objects, i.e. modules "designed to run linked together in a shared address space", which the FSF says "almost surely means combining them into one program" (https://www.gnu.org/licenses/gpl-faq.html#MereAggregation) and plug-ins that "make function calls to each other and share data structures" (https://www.gnu.org/licenses/gpl-faq.html#GPLPlugins). A hard dependency strengthens the "designed to run together" reading | Treat as contested, probably combined. Only a real process or file boundary (child process/CLI, files, socket) with narrow serialised messages carries the separation argument (https://www.gnu.org/licenses/gpl-faq.html#GPLPlugins: "simple fork and exec ... does not establish intimate communication"). Exchanging an engine's full internal settings schema (Orca/Prusa config keys) pushes toward "complex internal data structures" | Medium-Low that in-process is safe |
| (g) VS Code product terms | Microsoft builds of VS Code are under the Microsoft Software License Terms (https://code.visualstudio.com/license, no revision date on page, read 2026-10-25): no sharing/publishing/renting the software or offering it standalone; no reverse engineering except as open-source terms require; telemetry consent; marketplace governed by separate terms; says VS Code source is on GitHub "under the MIT license". Code-OSS (`vscode@4ef6bab7:LICENSE.txt`) is MIT | Our fork must start from Code-OSS/VSCodium, not redistribute Microsoft-built binaries or assets, and cannot use Microsoft-licensed extensions or Marketplace (ToU above) | High |
| (e) Self-hosted Open VSX marketplace distributing the extensions | Open VSX server is EPL-2.0 (`openvsx@373af42:LICENSE`): weak, file-level copyleft; running it unmodified imposes nothing on hosted content; modified EPL files must be shared on distribution, and EPL-2.0 s3 has no network clause. Hosting extension VSIXs is *distribution by us*: for every GPL/AGPL/LGPL extension we host we must satisfy the conveyance terms (source reachable via offer or link, licence text). Open VSX requires a licence expression in each package.json ([FAQ](https://www.eclipse.org/legal/open-vsx-registry-faq/), fetched 2026-10-25) | The marketplace needs a rule: refuse extensions without a licence, store source link, and treat third-party uploads under notice-and-takedown. Our liability for others' uploads is a hosting-law question (DMCA/EU DSA) | Medium |
| Porting code (reading AGPL source and re-typing logic) | Derivative work if expression is copied or closely followed. Ideas, file formats, setting names and algorithms as such are not copyrightable; verbatim tooltips, UI `.ui` layouts and function bodies are (3mf, features-* reports) | Clean-room rule: write from our own reports; one person reads, another implements for risky pieces; no code snippets from clones in the repo | Medium-High |
| Bundling profiles | See section 3 | | |

LGPL specifics (Cura frontend, Uranium, @sindarius/gcodeviewer, occt-import-js): conveying a combined work requires that users can relink or replace the LGPL library and the licence text accompanies it (LGPL-3.0 s4, s5; https://www.gnu.org/licenses/lgpl-3.0.html). For JS/WASM bundled into one minified VSIX bundle, replaceability is hard to satisfy; keep LGPL components as separate loadable files. FSF note on LGPL static vs dynamic: https://www.gnu.org/licenses/gpl-faq.html#LGPLStaticVsDynamic.

### 3. Profile data licences and redistribution

| Source | Licence evidence | Redistribution consequence |
|---|---|---|
| Prusa current profile repos (`-prusa-fff`, `-non-prusa-fff`) | No licence file as of 2026-10-25 (profiles report) | Default copyright: all rights reserved. Do not redistribute; fetch from upstream at the user's request, or ask Prusa in writing. The copies in AGPL PrusaSlicer@30ef591 are AGPL |
| PrusaSlicer-settings@a40f669 (legacy) | AGPL-3.0 (`License`); `live/Anker/License.txt` AGPL | Redistributable under AGPL with notices; same file set is stale (<2.8) |
| OrcaSlicer, Bambu Studio, Snapmaker/Elegoo/Creality/Anycubic forks | Profiles live in AGPL-3.0 repos; no separate data licence (profiles report) | AGPL on the files as distributed; vendor-contributed files may be subject to the contributing vendor's rights (unverified). Bambu IDs (`setting_id`, `filament_id`) are interoperability data for Bambu cloud/AMS: ToS risk, not copyright |
| Cura `resources/definitions` | LGPL-3.0 repo licence, no per-file headers | Distribute as unmodified data package with LICENSE; modified ones need change notices |
| fdm_materials@0c05969 | CC0-1.0 | Free |
| OpenFilamentDatabase@eef61a50 | MIT, data explicitly free for commercial use | Free with notice |
| OpenPrintTag@060e420 | MIT | Free with notice |
| RFID-Tag-Guide@a26cf83 | No licence; includes Bambu master key | Do not vendor |
| OpenTag3D spec | GPLv3 site content, spec reuse terms unclear `(unverified)` | Implement from facts only |

Whether profile data makes a reading program a derivative is unsettled. Key/value numeric settings are thin or no copyright (facts, merger with function); names, descriptions, SVG/bed art, STL beds are expressive. Position adopted: ship importer code clean-room and permissive; ship vendor data as a separate, unmodified downloadable data package carrying its own LICENSE and `source.commit`, or download from upstream at run time.

### 4. Vendor API and ToS (all read 2026-10-25 unless noted)

| Vendor | Document | Date | Relevant clauses | Effect on a third-party client |
|---|---|---|---|---|
| Bambu | Terms of Use https://bambulab.com/en-us/policies/terms (read in a browser by the bambu-connectivity worker; returns 403 to WebFetch) | "Last updated 24 April 2024" | 3.1 (Bambu IP), 3.4 (no reverse engineering, derivatives), 3.5(5) circumvention. No clause names LAN protocols | Binds users; risk is account action and impersonation claims. Cloud use and the plugin are closed. See `docs/research/bambu-connectivity.md` s5 and the 2026 cease-and-desist episode |
| Creality | No Creality Cloud-specific ToS found by search. Related: laser-engraver user agreement https://wiki.creality.com/en/laser-engraver/user-agreement forbids reverse engineering/DRM circumvention of that software. CrealityPrint `license_en.rtf` is "Software Licensing and Terms of Service" over AGPL-3.0 (`CrealityPrint@59ae8cb`) | n/d | n/a | Cloud API terms unknown: open question. LAN port 9999 and CFS are reverse engineered (printer-connectivity report) |
| Prusa Connect / PrusaLink | https://www.prusa3d.com/fr/page/prusa-connect-prusa-link-terms-and-conditions_233705/ | Art 7.4: effective 01/01/2020 | 2.3 PrusaLink software under an open-source licence, use at own risk; 2.6 users responsible for access rights; 5.3 no scraping, no artificially inflated requests; 3.4 beta, may change or end; reverse engineering not addressed. Forum (2024, unofficial): Connect API mostly not public | PrusaLink local API: OK. Connect cloud: use only documented endpoints, rate-limit politely |
| Anycubic | No terms page found by search; wiki says first launch of the app shows a user agreement and privacy policy ([quick start](https://wiki.anycubic.com/it/software-and-app/anycubic-app/quick-start)); store news lists an "Anycubic Cloud security issue" | n/d | n/a | Unknown: open question. LAN MQTT is reverse engineered; Anycubic documents LAN mode itself (printer-connectivity report) |
| Elegoo | User Agreement https://www.elegoo.com/pages/elegoo-user-agreement (and /pages/terms) | Effective 2026-09-18 | 7.1(4) no reverse engineering/decoding of software "unless otherwise expressly licensed"; 7.1(5)(e) no DRM circumvention; 7.2 Elegoo Slicer built on OrcaSlicer, licensed AGPL-3.0, claims reserved on interface/data/graphics; 11.1(3), 11.2(8) no automated collection or bots on the platform without consent; 12.1 no copy/decompile of platform code; 12.5 APIs and material libraries may have extra third-party terms. No API licence granted. SDCP doc itself has no licence | Local SDCP/HTTP use against own printer is not addressed; Nexprint/cloud scraping prohibited. First 100k of 142k characters read; remainder unread |
| Snapmaker | Terms of Use https://www.snapmaker.com/terms-of-use | Last updated 2026-06-10 | s2 personal, non-commercial licence; 6.4.1-6.4.2 Luban/Orca/firmware are customised open-source subject to their licences; 6.4.5 no decompiling of proprietary components; 6.7.3 no scripts/automated programs to collect data from products or services; s13 no guarantee third-party G-code works | Local SACP use is not prohibited by text; commercial distribution of a product that talks to Snapmaker cloud is unclear. npm `@snapmaker/snapmaker-sacp-sdk` licence still unchecked |
| AnkerMake | Anker Terms of Service https://www.anker.com/my/policies/terms-of-service | Last modified 2023-07-03 | s8 no systematic/automated data collection, no probing; s12.2.3 AnkerMake uploads must be original or licensed; reverse engineering not mentioned; no AnkerMake-specific terms found | Account-cloud MQTT/PPPP clients (GPL-3.0 `ankermake-m5-protocol`) are unaffiliated; automated collection clause is the exposure |
| Microsoft Marketplace | Visual Studio Marketplace Terms of Use https://aka.ms/vsmarketplace-ToU (PDF, text extracted with pdftotext) | "Last Updated September 2025" | Offerings "are intended for use only with In-Scope Products and Services [Visual Studio, VS Code, Codespaces, Azure DevOps] ... you may not install, reverse-engineer, import or use Marketplace Offerings in products and services except for the In-Scope Products and Services"; scraping/spidering prohibited; Microsoft-published offerings may not be used elsewhere | A VSCodium fork or custom VS Code build may not use Microsoft Marketplace as its backend or mirror it. Publishing VSIX to Microsoft's marketplace is allowed for VS Code proper |
| Open VSX | Eclipse Open VSX FAQ https://www.eclipse.org/legal/open-vsx-registry-faq/ ; server repo EPL-2.0 | fetched 2026-10-25 | Anyone may consume; publishing requires the Eclipse Open VSX Publisher Agreement; every extension needs a licence expression in `package.json` (does not have to be OSI open); no fees. FAQ has no self-hosting statement and no terms text (footer terms not read) | Publishing to open-vsx.org is possible for any licence; self-hosting the server is EPL-2.0 compliance only |

## Comparison

Per-component compatibility, assuming VSSlicer's own code is licensed per the recommendation below (Apache-2.0 core, AGPL-3.0 only for any engine-bound package).

Direction of compatibility (ASF, https://www.apache.org/licenses/GPL-compatibility.html, fetched 2026-10-25): "Apache 2 software can therefore be included in GPLv3 projects ... However, GPLv3 software cannot be included in Apache projects"; Apache-2.0 is incompatible with GPL-2.0-only (same page). None of the components listed below was found to be GPL-2.0-only (Marlin headers GPL-3.0-or-later; Klipper, Moonraker "GPLv3"). So for every "Forces AGPL/GPL" row: our Apache-2.0 files may be combined into the work and stay Apache-2.0 as files, but the combined work as conveyed is AGPL/GPL-3.0, and anyone receiving it gets AGPL/GPL rights to the whole; our core cannot be shipped proprietary or under an incompatible licence in that combination, and the AGPL code can never be moved back into an Apache-only repo.

| Component | Licence | Use as separate process / network API | Link or bundle into VSIX | Port or copy code | Ship data/files |
|---|---|---|---|---|---|
| PrusaSlicer, Orca, Bambu Studio, forks, Slic3r, SuperSlicer, Luban, libbgcode, CuraEngine | AGPL-3.0 | Yes, user-installed or downloaded from upstream | Forces AGPL on the combined package | Forces AGPL on the receiving file/package | AGPL: ship with notices and source |
| Cura frontend, Uranium | LGPL-3.0 | Yes | Allowed with relink/replace rights; keep separable | LGPL on the ported file | LGPL: data package |
| Moonraker, Klipper, Marlin, Mainsail, Fluidd, Prusa-Link-Web, ankermake-m5-protocol | GPL-3.0 (Prusa-Link-Web spec AGPL) | Yes, HTTP/MQTT clients are independent | Forces GPL | Forces GPL | Same |
| OctoPrint | AGPL-3.0 | Yes (REST) | n/a | Forces AGPL | n/a |
| Spoolman, OFD, OpenPrintTag, ha-bambulab, Rinkhals, gcode-preview, vscodium, vscode (Code-OSS source) | MIT | Yes | Yes with notice | Yes with notice | Yes with notice |
| klipper_estimator | MIT declared, GPL-3.0-derived `planner.rs` (contested) | Yes as separate tool/oracle | Treat as GPL: no | No: do not port (see gcode-viewer-simulation.md) | n/a |
| Visual Studio Code (Microsoft build) | Microsoft Software License Terms | Run only | No redistribution | No | No |
| fdm_materials | CC0-1.0 | n/a | Yes | Yes | Yes |
| 3MF specs | BSD-2-Clause | n/a | Yes with notice | Yes with notice | Yes with notice |
| Open VSX server | EPL-2.0 | Yes (run it) | Modified EPL files must be shared on distribution | Same | n/a |
| Kiri:Moto (grid-apps) | MIT file, contradicting "All Rights Reserved" headers | Only if author confirms | No until confirmed | No until confirmed | No |
| OpenBambuAPI docs | GFDL-1.3 | Facts only | n/a | Do not copy text | n/a |
| RFID-Tag-Guide, SDCP doc, Prusa FFF profile repos | no licence | Facts only | No | No | No |
| Bambu network plugin, Bambu Connect keys | proprietary / off-limits | No redistribution | No | No | No |

## Implications for VSSlicer

1. **Recommended licence for VSSlicer's own code: Apache-2.0** (MIT is acceptable; Apache adds an express patent grant and contributor patent licence, useful given vendor patents). Rationale: the engine boundary can be a process boundary, so no AGPL code needs to enter our tree, provided the boundary is a real process or file boundary (not VS Code in-process `exports`/commands, scenario (f)). The base (MIT VS Code/VSCodium) and Open VSX (EPL-2.0 server) do not conflict.
2. **Architecture rule that keeps the licence:** engines (CuraEngine, PrusaSlicer/Orca CLIs) are separate programs, user-installed or downloaded unmodified from upstream with their own LICENSE and a source link; the extension talks to them over CLI/JSON/3MF. Do not ship them inside the VSIX unless we accept source-offer duties.
3. **If a native/WASM embedded engine is chosen later:** put it in its own repo and VSIX, licensed AGPL-3.0 (or-later where upstream allows), with source offer. Other extensions must reach it only across a process/file boundary with narrow serialised messages (child process, CLI, files, socket). Calling its `exports` or commands inside the shared extension host is contested and probably combines the works (scenario (f)); if that coupling is wanted, accept AGPL for the coupled extensions.
4. **Fork/marketplace:** Open VSX self-hosted, never Microsoft Marketplace (ToU Sept 2025). Add third-party notices, written source offer for every copyleft item, a publisher licence-check policy.
5. **Profiles:** build our own schema and importers clean-room; download vendor profile packs at the user's request from upstream; ship only CC0/MIT sources (fdm_materials, OFD) and our own data in the VSIX.
6. **Vendor ToS:** local LAN protocols are the lowest risk (no ToS binds a LAN client except through users' own accounts). Gate cloud/reverse engineered features behind opt-in with a "unofficial" label. No Bambu keys, plugin binaries, or Bambu Connect material.

## Licence notes

- Everything above about copyleft triggers is a reading of licence texts, not counsel's opinion; the FSF FAQ anchors cited (#MereAggregation, #GPLPlugins, #IfInterpreterIsGPL, #AggregateContainers, #AnonFTPAndSendSources) and the ASF compatibility page were fetched 2026-10-25. Only gnu.org licence texts themselves (AGPL s5, s6, s13; LGPL s4, s5) are cited from knowledge.
- Licence tags come from the first lines of each root licence file; SPDX "or-later" status was verified only for CuraEngine (source headers). Per-file headers elsewhere (including third-party code vendored inside slicers such as imgui, miniz, avrdude under `bundled_deps/`) were not audited.
- 3MF test suites and lib3mf were not cloned.

## Open questions

Decisions for a human or lawyer:

1. Is spawning an AGPL CLI that we download for the user (our server hosts the file, or we link to upstream release assets) conveying under AGPL s6? Hosting it ourselves needs source offers; linking to upstream may not.
2. Is a WASM engine used in a worker, communicating only by `postMessage`, a separate work from the extension? If we want a browser-only VS Code build, this decides AGPL vs Apache-2.0.
3. Does a profile data package (AGPL repos) become a covered work of a reader program? And can we redistribute vendor-contributed files whose rights may belong to the vendor?
4. Will Prusa grant written permission for `PrusaSlicer-settings-*-fff` redistribution (no licence file)?
5. Kiri:Moto: obtain written MIT confirmation from Stewart Allen or abandon.
6. Prusa-Link-Web spec: GPL-3.0 (package) vs AGPLv3 (openapi.yaml): ask Prusa which governs before vendoring the spec.
7. Creality Cloud, Anycubic: locate current terms; no dedicated pages found by search on 2026-10-25. Elegoo agreement unread beyond 100k characters (remainder 42k).
8. Reverse engineering clauses (Bambu 3.4, Elegoo 7.1/12.1, Snapmaker 6.4.5): enforceability for interoperability in the project's jurisdiction (e.g. EU Software Directive art 6 vs US DMCA s1201); and whether the project may publish client code for reverse engineered cloud APIs at all.
9. Hosting obligations of a self-run marketplace: notice-and-takedown, trademark use ("VS Code" names, Microsoft assets), and liability for third-party extensions.
10. Trademark/branding: product name and icons for the custom VSCodium build.
11. Contributor policy: CLA vs DCO, and who holds copyright of an Apache-2.0 core if later relicensing is wanted.
12. klipper_estimator: is `planner.rs` a GPL-3.0 derivative of Klipper's `calc_junction` despite its MIT file? Decide whether to use it only as an external oracle.
13. In-process coupling: is an Apache-2.0 extension that calls an AGPL engine extension via `exports`/commands in the shared extension host a combined work? If yes, the Apache plan needs a process/file boundary.
14. Does the Microsoft ToU for the Marketplace bar extension authors from *also* publishing the same VSIX to Open VSX? (No text forbids it found; confirm.)
