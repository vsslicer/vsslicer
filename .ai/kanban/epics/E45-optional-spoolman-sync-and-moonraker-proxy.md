---
id: E45
title: Sync with an existing Spoolman, directly or through Moonraker's proxy
status: reviewed
initiative: I8
project: FIL
order: 6
depends_on: [E40, E42, E43, E23]
rows: []
---

Delivers the optional half of D6: users who already run Spoolman can import it once, then keep
VSSlicer's local inventory and their Spoolman in two-way sync, either by talking to Spoolman's
REST API directly or through Moonraker's `/server/spoolman/proxy` when their Klipper printer
already has one configured. The local store stays the store of record; nothing in FIL requires
Spoolman. Serves Klipper users and anyone sharing one Spoolman between Fluidd, Mainsail,
OctoPrint and VSSlicer.

## Scope

In (`vsslicer.filament`, written new against Spoolman's documented REST API; Spoolman is MIT,
Moonraker GPL read for behaviour only):
- Mapping 1:1 (`filament-management.md` §5): Brand = Vendor, Filament + Material = Filament,
  Spool = Spool, Tag = Tag, superset fields in `extra`; ids kept as `external_id` pairs.
- One-shot import from a Spoolman instance or its `/export` files.
- Live sync: pull via the websocket change events plus a periodic full reconcile; push entity
  edits with CRUD; push consumption as deltas with `PUT /spool/{id}/use {use_weight}` so usage
  from other clients adds up instead of being overwritten; scale readings as
  `PUT /spool/{id}/measure`. Changes to `used_weight` made by other clients arrive as
  `extrusion` events marked external.
- Conflicts: last writer wins per field, with a conflict list shown in the inventory view;
  deletes in Spoolman archive the local spool, never delete it.
- Moonraker: when a printer adapter (E23) reports a `[spoolman]` component, use its proxy as
  transport, read and set Moonraker's active spool id when the user assigns a spool to that
  printer, and tell E42 to skip its own extrusion booking for that printer (no double booking).
- Offline queue: pushes queue in the store while Spoolman is unreachable and replay in order;
  status bar item shows sync state.
- Settings: Spoolman URL (no credentials; Spoolman has none), sync on/off per instance. Warn when
  the URL is not a private or loopback address, because Spoolman has no authentication.

Out: Spoolman as the store of record (D6 alternative), Spoolman's label designer, QR scanning,
`/tag/scan` relay, SpoolmanDB sync through Spoolman (E41 fetches SpoolmanDB directly).

## Feature-matrix rows

None owned. This is the optional sync named in D6 and I8's outcome; it extends §14 Spool
inventory (E43) and §14 Consumption from printer feedback (E42) to a Spoolman.

## Acceptance criteria

- [ ] Spoolman REST contract tests against Spoolman in Docker in CI (image tag pinned and
      recorded; GitHub Actions Linux runners, free per D5): import, create, edit, `use`,
      `measure`, delete, websocket events.
- [ ] Two-client test: Spoolman receives `use` from VSSlicer and from a second simulated client;
      both deltas are in the final `used_weight` (catches absolute overwrite).
- [ ] Mapping round trip: export local inventory to Spoolman and import it into an empty store;
      superset fields survive through `extra`.
- [ ] Offline test: Spoolman stopped mid-session, three bookings queued, Spoolman restarted,
      queue replays once in order; no duplicate `use` calls (idempotency key in `extra`).
- [ ] Moonraker path on recorded fixtures (E23 recordings with `[spoolman]`): proxy requests
      shaped as `moonraker@b559b9a:components/spoolman.py` expects; active spool set on
      assignment; E42 books no extrusion for that printer.
- [ ] Conflict test: the same field edited on both sides between syncs appears in the conflict
      list with both values.
- [ ] Verified on Docker and fixtures only; no Klipper hardware (D5).

## Dependencies

- Needs E40 (store, event schema), E42 (booking switch per printer), E43 (inventory view for status
  and conflicts), E23 (Moonraker adapter exposing the `[spoolman]` component, proxy requests
  and active spool id).
- Exposes sync state through `Inventory` and nothing new to other projects.

## Risks and spikes

- Network from `vsslicer.filament`: the roadmap lists it as `workspace` kind while network access
  is a `ui` rule; resolved by E40's extension-kind decision (open question).
- Spoolman's Docker image and API version drift (the image was not checked in research): spike
  pins a tag and records the OpenAPI document as a fixture.
- Websocket support through Moonraker's proxy is unverified; fallback is polling on
  `sync_rate`.

## Eng review

- Scope challenge: direct REST and the Moonraker proxy share one client and differ only in
  transport, so one epic; it is last because it is optional (D6) and needs the UI for conflicts.
  Deliberately out: Spoolman as store of record, label tooling.
- Tests name regressions (overwritten usage, lost queued bookings, duplicate pushes, double
  booking with Moonraker, silent conflicts). Oracle: Spoolman in Docker, recorded Moonraker.
- Blast radius: a sync bug can corrupt the user's Spoolman, shared with other tools; first sync
  is dry-run with a summary the user confirms, and every push is logged.
- Reversibility: sync is off by default; turning it off leaves both stores intact.
- Zero silent failures: unreachable server, 404 spool, conflict and rejected write each surface
  in the status item and output channel, with tests.
