---
id: US32
title: "OpenPrintTag payloads become spools"
status: reviewed
epic: VSS:E44
---

As a user with an OpenPrintTag printer, I want the tag's CBOR payload parsed into the same model with its consumed weight observed, so that tagged spools from such printers work like Bambu ones.

## Acceptance criteria

- [ ] The parser passes the spec repository's example payloads (pinned at `060e420`) and a round trip that preserves unknown keys
- [ ] Malformed CBOR, oversize regions and a missing main region return typed errors (fuzz test)
- [ ] UUIDv5 derivation applies when UUIDs are omitted; aux `consumed_weight` is booked as a `tag` observation
- [ ] Verified on fixtures only (no capable printer, D5)

## Out of scope

- Writing tags, OpenTag3D, OpenSpool, TigerTag, Creality CFS
