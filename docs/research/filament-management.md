# Filament management

Researched 2026-10-25. Repos analysed (shallow clones in `.reference/repos/`): Spoolman@488eb74 (2026-10-23), OpenFilamentDatabase@eef61a50, OpenPrintTag@060e420, RFID-Tag-Guide@a26cf83 (2025-09-30), moonraker@b559b9a, ha-bambulab@0e027ff, BambuStudio@79df7ae, OrcaSlicer@09aa0114, PrusaSlicer@30ef591, klipper (existing clone). Web sources are linked inline; anything not read from code or a fetched page is marked `(unverified)`.

## Findings

### 1. Spoolman

**Data model** (`Spoolman@488eb74:spoolman/database/models.py`):

| Entity | Notable fields |
|---|---|
| Vendor | name, empty_spool_weight, comment, external_id, extra fields |
| Filament | name, vendor_id, material, price, density, diameter, weight (net), spool_weight, article_number, settings_extruder_temp, settings_bed_temp, color_hex, multi_color_hexes, multi_color_direction, external_id, tags, extra |
| Spool | filament_id, first_used, last_used, price, initial_weight, spool_weight, **used_weight (g)**, location (free string), lot_nr, archived, tags, extra |
| Tag | uid (unique, normalised), target_type (spool/filament/location), spool_id/filament_id/target_value, format (models.py:150-200, `tags.py`) |
| *_field | typed user-defined key/value extras on vendor/filament/spool |

Consumption is stored only as grams used; remaining = initial_weight - used_weight. Locations are plain strings, not a table.

**REST API** (`spoolman/api/v1/`): CRUD on `/vendor`, `/filament`, `/spool`; `PUT /spool/{id}/use` with exactly one of `use_weight` (g) or `use_length` (mm; converted via filament diameter and density, `database/spool.py:1161`); `PUT /spool/{id}/measure` (gross weight); `POST/DELETE /spool/{id}/tag`; `/tag/scan` and `/tag/reader` (NFC scan relay with 3 s debounce, `scanrelay.py`); `/export/{spools,filaments,vendors}`; `/external/filament[/search]`, `/external/material` (SpoolmanDB sync, default `https://donkie.github.io/SpoolmanDB/`, hourly, `externaldb.py`); `/field/{entity}`; `/setting`; `/search`; websockets for change events. No authentication by design; protection is origin/host checks (`security.py`). DB: SQLite, PostgreSQL, MySQL, CockroachDB (README).

**Moonraker integration** (`moonraker@b559b9a`): `[spoolman] server:, sync_rate: 5` (`docs/configuration.md:3603`). Moonraker holds one active spool id (persisted in its DB, set via `POST /server/spoolman/spool_id` or the `SET_ACTIVE_SPOOL ID=n` macro that calls the `spoolman_set_active_spool` remote method). `components/spoolman.py:261-280` subscribes to `toolhead.position[3]`, adds each increase over the highest E position seen to a pending total; every `sync_rate` seconds it sends `PUT /v1/spool/{id}/use {"use_length": mm}` (`:296-333`), re-queues on failure and clears the active spool on 404. It also proxies Spoolman at `/server/spoolman/proxy` and feeds `spool_ids`/`filament_used` into job history.

**Client ecosystem** (Spoolman README): built-in web UI with QR label designer; Moonraker plus Fluidd/Mainsail/KlipperScreen; [OctoPrint-Spoolman](https://github.com/mdziekon/octoprint-spoolman); OctoEverywhere; Home Assistant ([spoolman-homeassistant](https://github.com/Disane87/spoolman-homeassistant)); MCP server; Prometheus metrics. SimplyPrint documents a [Spoolman export script](https://help.simplyprint.io/en/article/how-to-export-your-filament-spools-from-spoolman-import-into-simplyprint-e61m3y/). `KNOWN_FORMATS` in `tags.py` lists openprinttag, opentag3d, ntag, bambu, tigertag, qidi, creality, prusa; Spoolman keys tags on hardware UID only and cannot read Bambu contents.

**Licence:** MIT (`Spoolman@488eb74:LICENSE`). SpoolmanDB also MIT ([LICENSE](https://raw.githubusercontent.com/Donkie/SpoolmanDB/main/LICENSE)).

### 2. Filament databases

| | Open Filament Database (OFD) | SpoolmanDB | 3D Filament Profiles | Bambu filament list | "Filament Hub" |
|---|---|---|---|---|---|
| Licence | MIT, data included (`OFD@eef61a50:LICENSE`, README) | MIT | Proprietary, no public API, no bulk export (claimed by competitor [SimplyPrint](https://simplyprint.io/alternatives/3d-filament-profiles); site returned 429, `(unverified)`) | Part of BambuStudio (AGPL-3.0), profile JSON | Not found `(unverified)` |
| Size (local count, 2026-10-25) | 179 brands, 2153 filaments, 15070 variants/sizes, 66 stores | flat list, one file `filaments.json` | "much larger" `(unverified)` | 86 distinct `filament_id` in `BambuStudio@79df7ae:resources/profiles/BBL/filament/` (1908 files incl. per-printer variants) | n/a |
| Schema | brand > material > filament > variant (colour) + `sizes.json` (weight, diameter, ean, article_number, spool dims, purchase links); JSON Schema draft-07 in `schemas/` | manufacturer, name, material, density, weight, spool_weight, spool_type, diameter, colour(s), temps, finish, pattern, translucent, glow (`spoolman/externaldb.py`) | n/a | slicer presets: `filament_id`, `setting_id`, temps, flow, PA | n/a |
| Slicer link | `filament.slicer_settings.{bambustudio,orcaslicer,elegooslicer,crealityprint,anycubicslicer}.{id,generic_id,profile_name}` and `slicer_ids` for prusaslicer/cura | none | none | is the slicer preset itself | n/a |
| API | static JSON `api/v1/...`, bulk `json/all.json[.gz]`, `all.ndjson`, `sqlite/filaments.db`, CSV, ready-made OrcaSlicer bundles ([api.openfilamentdatabase.org](https://api.openfilamentdatabase.org/)); no auth documented | GitHub Pages file | none | files in repo | n/a |
| Identity | UUIDv4 per entity assigned by CI, `moved_from` redirects, `uuid-index.json` (`docs/manual.md:39-51`); also path slugs | `id` string e.g. `polymaker_pla_polysonicblack_1000_175` | n/a | `GFAxx` | n/a |

Hosting: OFD is run by the Open Filament Collective, facilitated by SimplyPrint (OFD README). Sample entry: `data/bambu_lab/PLA/.../filament.json` carries `slicer_settings.bambustudio.id = "GFA16"` and `generic_id = "GFL99"`, and `sizes.json` carries `ean`, so one OFD record can be joined to a Bambu `tray_info_idx` and to a barcode.

### 3. Tag standards

**OpenPrintTag** (Prusa Research, [specs.openprinttag.org](https://specs.openprinttag.org), repo `OpenPrintTag@060e420`, MIT). Status: the spec site states it is "still work in progress" (`docs_src/README.md`); changelog has unreleased edits (withdrawn `*_v2` µm fields, new tags). Format: ISO 15693 NFC-V (designed for ICODE SLIX2 320 B), one NDEF record of MIME `application/vnd.openprinttag`, payload is CBOR maps with integer keys in three sections: meta (region offsets), main (static, <=512 B), auxiliary (dynamic, printer-writable) (`docs_src/nfc_data_format.md`). Main fields (`data/main_fields.yaml`): instance/package/material/brand UUIDs, gtin, brand_specific_*_id, material_class/type/name/abbreviation, brand_name, manufactured_date, nominal/actual_netto_full_weight, full_length, empty_container_weight, colours (RGBA/Lab/RAL, secondary 0-4), tags, certifications, density, filament_diameter, nozzle/print/bed/chamber/preheat temps, container dimensions, drying temp/time, SLA fields. Aux fields (`data/aux_fields.yaml`): `consumed_weight` (g), workgroup, storage_location, purchase_time/price/currency. UUIDs may be omitted and derived with UUIDv5 from brand name, material name, gtin or tag UID (`nfc_data_format.md` s3.2). Unknown keys must be preserved. No on-tag signature by design (`nfc_technical_details.md`), so tags are clonable. OFD UUIDs feed it (OFD README).

**Bambu RFID** (`RFID-Tag-Guide@a26cf83:BambuLabRfid.md`, README): MIFARE Classic 1K, 16 sectors. Sector keys are derived from the tag UID with HKDF-SHA256 using a fixed master secret (`deriveKeys.py`; derivable since 2024-11-19 per README), so any reader that can do MIFARE Classic auth can read the tag. Content is little-endian. Blocks: 1 = tray info index (material variant id + material id, e.g. `GFA00`), 2 = filament type, 4 = detailed type ("PLA Basic"), 5 = RGBA colour + spool weight (g) + diameter, 6 = drying/bed/hotend temps, 9 = tray UID, 10 = spool width, 12 = production date, 14 = filament length (uncertain), 16 = extra colours; sectors 10-15 hold an RSA-2048 signature. Printers reject tags with an invalid signature, so custom tags cannot be made without Bambu's private key; verbatim clones (including UID-changeable "magic gen2" cards) work (README FAQ). Licence of the guide: no LICENSE file in the repo (treat as all rights reserved; do not copy `parse.py` or the master key into VSSlicer without asking the maintainers). Firmware dates: findings reflect the repo as of 2025-09-30; later authorisation firmware effects on tags were not checked `(unverified)`.

**What AMS exposes via MQTT** (print.ams.ams[].tray[]; `BambuStudio@79df7ae:src/slic3r/GUI/DeviceCore/DevFilaSystem.cpp:831-901`, `ha-bambulab@0e027ff:custom_components/bambu_lab/pybambu/models.py:3245-3500`): `tag_uid` (all zeros if no Bambu tag; Bambu Studio treats all-zero as non-Bambu, `DevFilaSystem.cpp:502-511`), `tray_uuid`, `tray_info_idx` (= slicer `filament_id`, `GFL99` for generic), `tray_type`, `tray_sub_brands`, `tray_color` (RRGGBBAA), `cols`/`ctype` (multicolour), `tray_weight`, `tray_diameter`, `tray_temp`/`tray_time` (drying), `nozzle_temp_min/max`, `bed_temp`, `xcam_info`, `k`/`n`/`cali_idx` (pressure advance), `remain` (percent, -1 unknown) and, in newer Bambu Studio, `remain_g`. ha-bambulab only shows remaining when the printer supports it and `ams_calibrate_remaining` is set (`models.py:3454`). The command `ams_filament_setting` lets a client write `tray_info_idx`, `tray_color`, temps to a slot (`DeviceManager.cpp:1691-1725`); this is how non-RFID spools get a profile. Firmware/protocol dates: code as of the clone dates above; LAN access rules changed with Bambu's 2025 authorisation firmware (see VSS camera/printer research).

**`filament_id` mapping:** in Bambu Studio presets, `filament_id` (e.g. `GFA00`, `GFA16`, `GFL99`, `GFB00`, `GFG00`, `GFU01`) sits on the `@base` preset and is the same string as RFID block 1 and MQTT `tray_info_idx`; `setting_id` (`GFSA00`) identifies the concrete printer-specific preset (`Bambu PLA Basic @BBL X1C.json:6`). 86 distinct ids across the profile folder. OrcaSlicer uses `OGFxx` variants of the same ids in OFD data (`OGFA16`).

**Creality** (`RFID-Tag-Guide:CrealityRfid.md`): ASCII payload in blocks 4-6: batch (3 hex), mfg date YYMDD, supplier id, material id, `#RRGGBB`, spool id, unknown tail. Researched by community reverse-engineering from a Reddit thread; the guide marks fields as partly unknown. SimplyPrint claims read/write of "Creality CFS" tags ([SimplyPrint](https://simplyprint.io/features/filament-management)).

**Others:** OpenTag3D v2.0 (NTAG215/216, memory map public, site content GPLv3, supporters include OpenSpool, Polar Filament, 3D Fuel; [opentag3d.info](https://opentag3d.info/)); OpenSpool (JSON on NTAG215/216, per [SimplyPrint](https://help.simplyprint.io/en/article/openspool-nfc-standard-in-simplyprint-14b7ljb/), spec not read); TigerTag, QIDI: only names seen in Spoolman `tags.py`, formats not researched. SimplyPrint reads/writes OpenPrintTag, OpenSpool, OpenTag and Creality, and reads Bambu tags (SimplyPrint feature page above). Spoolman and nfc2klipper discussions on OpenPrintTag: [Spoolman#815](https://github.com/Donkie/Spoolman/discussions/815) (not read).

### 4. Consumption measurement

| Method | Source of truth | Accuracy and failure modes |
|---|---|---|
| Moonraker/Klipper extrusion | `toolhead.position[3]` E deltas, posted as `use_length` mm every 5 s (`moonraker spoolman.py:261-333`); Klipper `print_stats.filament_used` is similar (`klipper/klippy/extras/print_stats.py`) | Real extruded length incl. purge, failed and cancelled prints, manual extrusion. Retraction is not subtracted (only increases over the highest E counted). One active spool: multi-material needs macros per swap; forgetting to set a spool silently loses usage. mm->g depends on density and diameter being right. Klipper/Moonraker only. |
| Slicer G-code totals | Footer `; filament used [mm]/[cm3]/[g]`, `; total filament used [g]` (`PrusaSlicer PostProcessor.cpp:408-414`, `OrcaSlicer Print.cpp:5868-5876`); Moonraker metadata parses per slicer (`metadata.py`); Bambu 3MF `slice_info.config` has per-filament `used_m`/`used_g` (`bbs_3mf.cpp:227,281`) | Exact for a completed print, wrong for cancelled/failed ones (SimplyPrint deducts a proportional share, [help](https://help.simplyprint.io/en/article/how-does-simplyprint-track-filament-usage-1rdwu3f/)); ignores purge/wipe/prime not in G-code, flush on Bambu AMS swaps is in the totals only if the slicer counts it; independent of printer firmware, works for every adapter. Density from the profile, not the actual spool. |
| Bambu AMS `remain` / `remain_g` | AMS estimate: odometer of filament pulled plus RFID-tag passes per length, no scale (forum explanation, [thread](https://forum.bambulab.com/t/calculating-the-remains-on-a-spool/123429), `(unverified)` vendor behaviour) | Percent only (grams only on newer firmware), only for Bambu-tagged spools, coarse, can stick or lag (forum [report](https://forum.bambulab.com/t/filament-manager-recognising-but-not-updating-ams2-pro/255257)); -1 for non-RFID. Good as a cross-check, poor as the only source. SimplyPrint syncs it for RFID spools and falls back to G-code for others. |
| OpenPrintTag aux region | `consumed_weight` written by the printer to the tag | Authoritative on tag if the writer is trusted; needs a printer/reader that writes; clonable tags; last writer wins. |
| OctoPrint plugins | OctoPrint-FilamentManager (AGPL-3.0, OllisGit fork): software odometer of extruded filament, low-filament warning ([README](https://github.com/OllisGit/OctoPrint-FilamentManager)); SpoolManager: used length and remaining weight, forced spool selection, multi-tool listed, licence and method not stated in README `(unverified)` | Community threads report multi-extruder jobs only booked to spool 0 ([forum](https://community.octoprint.org/t/filament-manager-not-recording-filament-use-with-multiple-extruders/26815)); OctoPrint only. |
| Scale / `measure` | Spoolman `PUT /spool/{id}/measure` with gross weight | Most accurate absolute value; manual. |

### 5. Recommendation

**Data model (VSSlicer-owned, Spoolman-compatible superset).** Keep Spoolman's three levels but split brand-level data and instance data cleanly, and store grams as the canonical consumption unit:

- `Brand` (name, optional ofd_uuid) -> `Material` (OFD material class/type, density, temp ranges) -> `Filament` (colour variant: name, colour(s), diameter, net weight, empty spool weight, ean/article number, `ofd_uuid`, `slicer_ids` {bambu `filament_id`, orca, prusa, cura}, `external_id`) -> `Spool` (instance: initial_weight, used_weight g, location string, lot, price, archived, first/last_used, `tag_uids[]` with `format`, `last_remain_pct`/`last_remain_g` from AMS).
- `ConsumptionEvent` (spool_id, job_id, printer, source {gcode, extrusion, ams, tag, manual, scale}, grams, timestamp): append-only, so sources can disagree visibly and corrections are possible; `Spool.used_weight` is the sum plus scale corrections. Spoolman only keeps the running total, which hides this.
- Tag table keyed on normalised UID, many tags per spool (copied Prusa tags exist, `models.py` Tag docstring).
- Map to Spoolman 1:1 (Brand=Vendor, Filament+Material=Filament, Spool=Spool, extras as `extra`) so import/export and live sync with an existing Spoolman instance stay possible; sync via REST, using `use` for deltas.

**Import sources.** Primary: OFD (MIT, static files, UUIDs, slicer id mapping, EAN); fetch `json/all.json.gz` or the sqlite file and cache. Secondary: SpoolmanDB for gaps (MIT) and Spoolman instances via `/external` or direct. Bambu: derive presets from the already-cloned BambuStudio/Orca profiles for `filament_id` -> preset, since AMS `tray_info_idx` needs it (AGPL data: reading ids is fine, copying preset files has licence consequences, see below). Skip 3D Filament Profiles (no API or licence); revisit if they publish terms.

**Per-adapter tracking (default order of trust):**
1. Klipper/Moonraker: delegate to Moonraker's Spoolman component when the user has one; otherwise subscribe to `print_stats.filament_used` ourselves. Always reconcile against the slicer total at job end.
2. Bambu (MQTT/LAN or cloud): book the 3MF/slicer per-filament `used_g` mapped through the AMS mapping at job end; store `remain`/`remain_g` and `tag_uid` per tray as observations; match spools by `tag_uid`/`tray_uuid`, show `remain` as a hint, flag disagreement over a threshold. Auto-create spool from RFID metadata (read `tray_*` fields, no card reading needed).
3. OctoPrint/other: slicer G-code total, applied on completion, proportionally on cancel/fail (flag as estimate).
4. Tag-aware printers (OpenPrintTag): read `consumed_weight` and instance UUID, write back if supported.
5. Manual scale `measure` always wins and records a correction event.

**Tags.** Implement OpenPrintTag read/parse (CBOR, MIT, small) and keep tag UID matching generic; read Bambu data through the printer's MQTT, not by decrypting cards, to avoid the unlicensed key/derivation code and card hardware. Treat OpenTag3D and OpenSpool as later adapters.

## Comparison

See tables in findings 2 and 4. Summary of inventory tools: Spoolman (self-hosted, MIT, REST, grams-only, no Bambu tag parsing), SimplyPrint (hosted SaaS, free tier, G-code deduction + AMS sync + NFC multi-standard, uses OFD), OctoPrint FilamentManager/SpoolManager (OctoPrint-bound plugins, odometer/G-code, single-printer).

## Implications for VSSlicer

- Reuse: OFD data (MIT), SpoolmanDB (MIT), OpenPrintTag spec/parser design (MIT), Spoolman REST as an optional sync target, Moonraker spoolman for Klipper.
- Reimplement: inventory store and consumption event log (Spoolman's is MIT so its schema can be copied, but a VS Code extension should not require a server), Bambu `tray_*` parsing (protocol facts, from ha-bambulab MIT and BambuStudio AGPL read-only).
- Wrap: Moonraker `/server/spoolman/proxy` when present.
- Skip: reading Bambu MIFARE cards directly, 3D Filament Profiles scraping, Bambu tag writing.

## Licence notes

- Spoolman, SpoolmanDB, OFD (incl. data), OpenPrintTag, ha-bambulab: MIT, reusable with notice.
- Moonraker: GPL-3.0; OctoPrint-FilamentManager: AGPL-3.0; do not copy code, read behaviour only.
- BambuStudio/OrcaSlicer/PrusaSlicer: AGPL-3.0; filament preset JSON and `DevFilaSystem.cpp` are AGPL, so learn the field names but do not copy files. `filament_id` strings are identifiers/facts but bundled Bambu preset files should be fetched at run time or re-derived, a decision for the licence review.
- RFID-Tag-Guide: no licence file; the repo contains the Bambu master key in `deriveKeys.py`. Do not embed.
- OpenTag3D site content GPLv3 (spec reuse terms unclear `(unverified)`).

## Open questions

- 3D Filament Profiles data terms/API (site rate-limited our fetch); "Filament Hub" could not be identified.
- OpenPrintTag: stable release date and printer adoption (Prusa firmware) not verified; OpenSpool and TigerTag specs not read.
- AMS `remain_g` firmware versions and which AMS models report it; effect of Bambu's 2025 authorisation firmware on MQTT tray fields.
- Whether Bambu 3MF `used_g` includes AMS flush/purge volume.
- OctoPrint SpoolManager licence and tracking method (README silent).
