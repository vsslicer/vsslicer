---
id: E44
title: Identify spools by tag through the printer (Bambu AMS RFID, OpenPrintTag)
status: reviewed
initiative: I8
project: FIL
order: 5
depends_on: [E40, E41, E42, E20, E21]
rows: ["§14 RFID and NFC spool tags"]
---

Delivers spool identity from tags read by the printer: when a Bambu AMS reports a tagged spool,
the inventory finds the matching spool by tag UID or creates one from the tray's RFID metadata
and assigns it to the tray; when a printer exposes OpenPrintTag data, the tag's CBOR payload is
parsed into the same model. Users stop assigning spools by hand for tagged spools. Kept in I8,
not I10, because I8's outcome names it and its exit criterion ("the H2C's AMS spools appear in
the inventory") needs it; the Bambu path is verifiable on the H2C (D5).

## Scope

In (`vsslicer.filament`, written new):
- Bambu AMS: on tray reports from E21 (`tag_uid`, `tray_uuid`, `tray_info_idx`, `tray_type`,
  `tray_sub_brands`, `tray_color`, `cols`, `tray_weight`, `tray_diameter`, temps), match a spool
  by `tag_uid` then `tray_uuid`; if none, offer (setting: ask, always, never) to create a spool
  linked to the catalogue filament whose `slicer_ids.bambu` equals `tray_info_idx`, falling back
  to the tray fields. All-zero `tag_uid` means untagged (`DevFilaSystem.cpp:502-511` behaviour).
  Field facts from `ha-bambulab@0e027ff` (MIT) and BambuStudio (AGPL, read only).
- Tag table: many tags per spool, UID normalised, `format` from Spoolman's `KNOWN_FORMATS` list.
- OpenPrintTag: parser for the NDEF payload `application/vnd.openprinttag` (CBOR, integer keys,
  meta/main/aux regions; `OpenPrintTag@060e420:docs_src/nfc_data_format.md`, field tables in
  `data/main_fields.yaml`, `data/aux_fields.yaml`, MIT). Maps instance/material/brand UUIDs,
  GTIN, material, colours, weights, density, diameter, temps, and aux `consumed_weight` (booked
  as a `tag` observation via E42's rule). Unknown keys preserved. UUIDv5 derivation when UUIDs are
  omitted (§3.2 of the spec). CBOR decoding through a maintained MIT decoder (spike chooses).
- Printer path: consumes a PRN capability flag and event for tag payloads; no card reader code.

Out: reading or decrypting Bambu MIFARE cards, the RFID-Tag-Guide material and its key (no
licence), writing tags (Bambu tags cannot be written; OpenPrintTag aux write-back waits for a
printer that supports it), OpenTag3D, OpenSpool, TigerTag, Creality CFS (later adapters,
`filament-management.md` §3), desktop NFC readers, writing a profile to a non-RFID AMS slot
(`ams_filament_setting` is a PRN command; called only if E21 exposes it).

## Feature-matrix rows

- §14 RFID and NFC spool tags (P2): done when Bambu AMS tagged spools are matched or created and
  assigned automatically on the H2C, and OpenPrintTag payloads from a printer adapter (or
  fixtures) become spools with their consumed weight observed; tags are never decrypted.

## Acceptance criteria

- [ ] Recorded MQTT tray fixtures (from E21 recordings): tagged tray matches an existing spool
      by `tag_uid`; an unknown tag creates a spool linked to the `GFA00` catalogue filament;
      all-zero `tag_uid` creates nothing; a tray swap reassigns the slot (catches stale slots).
- [ ] OpenPrintTag parser passes the spec repository's example payloads (pinned at `060e420`)
      and a round trip that preserves unknown keys; malformed CBOR, oversize regions and missing
      main region return typed errors shown to the user (fuzz test with fast-check).
- [ ] Same physical tag on two spools (cloned tags are legal, §3) is flagged, not silently merged.
- [ ] H2C (firmware version and date recorded): inserting a Bambu-tagged spool into the AMS makes
      it appear assigned in the inventory within one status report. OpenPrintTag is verified on
      fixtures only (no capable printer in D5).
- [ ] Licence check: no file derived from RFID-Tag-Guide; MIT notices for OpenPrintTag and
      ha-bambulab facts present.

## Dependencies

- Needs E40 (Tag table), E41 (catalogue lookup by `slicer_ids`), E42 (slot assignment, observation
  rule), E20 (capability flag and tag payload event in the generic API), E21 (AMS tray
  fields).
- Exposes `Inventory.matchByTag(uid)` results and auto-assignment to E42 and E43, and the
  OpenPrintTag parser to any PRN adapter that wants to decode payloads itself.

## Risks and spikes

- Which printers expose OpenPrintTag over their API (Prusa Core One, MK4 with reader?) is
  unverified; spike reads Prusa firmware and PrusaLink docs. If none, the parser ships behind
  the capability flag and the row's OpenPrintTag half waits on PRN.
- OpenPrintTag is "work in progress" (spec site): pin the revision, keep unknown keys, fail soft.
- Bambu 2025 authorisation firmware may change tray fields; recorded on the H2C.

## Eng review

- Scope challenge: Bambu tag matching and OpenPrintTag share the Tag table and the
  match-or-create flow, so one epic; considered moving OpenPrintTag to I10, kept because it is a
  small parser and I8 names it. Deliberately out: card reading, writing, other tag formats.
- Tests name regressions (wrong spool, phantom spools from untagged trays, stale slots, clone
  merges, parser crashes on hostile payloads). Oracle: spec examples, recorded MQTT, the H2C.
- Blast radius: tag payloads are untrusted input from the printer; the parser is bounded and
  fuzzed; a bad payload rejects one tag, never the store.
- Reversibility: auto-create is a setting (default ask); created spools are ordinary spools.
