---
id: E41
title: Import the filament catalogue from OFD with SpoolmanDB filling gaps
status: reviewed
initiative: I8
project: FIL
order: 2
depends_on: [E40]
rows: ["§14 Filament database import"]
---

Delivers the filament catalogue: brands, materials and colour variants imported from the Open
Filament Database (OFD) on request, cached locally and refreshed on demand, with SpoolmanDB
entries filling what OFD lacks. Users pick a catalogue filament when adding a spool instead of
typing densities and weights; the OFD `slicer_settings` ids become each filament's `slicer_ids`,
which E43 uses to link spools to material profiles and E44 uses to match Bambu `tray_info_idx`.

## Scope

In:
- Importer in `vsslicer.filament` (pure module, written new) for OFD's bulk JSON
  (`json/all.json.gz` from api.openfilamentdatabase.org, `filament-management.md` §2): brand >
  material > filament > variant plus `sizes.json` (weight, diameter, EAN, article number, spool
  dimensions). The SQLite export is not used (native module).
- `slicer_ids` from OFD `filament.slicer_settings.{bambustudio,orcaslicer}.{id,generic_id}` and
  `slicer_ids` for prusaslicer and cura.
- Identity by OFD UUID with `moved_from` redirects (`OFD@eef61a50:docs/manual.md:39-51`);
  re-import updates catalogue records in place and never overwrites fields the user edited
  (local override marker). Upstream deletions mark records stale; records referenced by a spool
  are kept.
- SpoolmanDB `filaments.json` (MIT) as a secondary source: an entry is added only when no OFD
  record matches by EAN, else by (brand, material, name, diameter, net weight) after
  normalisation; matches are recorded, not merged silently.
- Download on request only (command and first-run prompt), with a pinned default URL and a
  setting to override; cache in `globalStorageUri` with the source revision and date; offline use
  from cache.
- Licence notices: OFD and SpoolmanDB are MIT (data included); attribution in the extension's
  third-party notices and in the catalogue's source field.
- Parsing in a `worker_threads` worker (15070 variants; keeps the extension host responsive).

Out: Cura fdm_materials (imported as material profiles by E12, not duplicated here); 3D
Filament Profiles (no API or licence); bundled snapshot in the VSIX; Bambu preset files (AGPL,
D2 allows them, but ids come from OFD and PRF already). Catalogue browsing UI is E43.

## Feature-matrix rows

- §14 Filament database import (P1): done when a user can download OFD, see SpoolmanDB gaps
  filled, re-import without losing edits, and every imported filament carries its `slicer_ids`.

## Acceptance criteria

- [ ] Importer test against a pinned, trimmed OFD snapshot fixture (recorded commit and date):
      counts of brands, materials, filaments and variants match the fixture's own index; the
      Bambu PLA sample carries `slicer_ids.bambu = "GFA16"` and generic `GFL99` (§2).
- [ ] Records validate against OFD's JSON Schema (`schemas/`, draft-07) before import; invalid
      records are skipped and listed in a report, never half-imported.
- [ ] Re-import of a second fixture revision: changed upstream fields update, user-edited fields
      survive, `moved_from` redirects keep spool references, deleted records referenced by a spool
      are marked stale (catches silent loss of a user's spools' catalogue link).
- [ ] SpoolmanDB merge test: an entry duplicating an OFD record by EAN or by normalised key is not
      added; a unique entry is.
- [ ] Network failures (offline, 404, truncated gzip, wrong content type) leave the previous cache
      intact and show an error with a retry action; tested with a local HTTP fixture server.
- [ ] Import of the full current OFD bulk file runs in the worker and does not block the
      extension host for more than 50 ms at a time (measured).
- [ ] Verified on fixtures and the live OFD URL in a non-blocking nightly job; no hardware.

## Dependencies

- Needs E40 (catalogue entities, store).
- Exposes catalogue queries (`Inventory.catalogue.search(text)`, by EAN, by `slicer_ids`) to E43
  and E44. No cross-project dependency.

## Risks and spikes

- OFD bulk format stability: OFD is young; pin the schema revision and fail closed on an unknown
  major version (spike: diff two OFD revisions a month apart).
- Size of `all.json.gz` and memory peak in the worker; spike measures it, fallback is the
  `all.ndjson` stream.
- Whether OFD's Orca ids (`OGFxx`) match what PRF imports from Orca profiles; checked with E12
  fixtures in E43.

## Eng review

- Scope challenge: one importer pipeline, two sources. SpoolmanDB could be dropped, but the
  matrix row and I8 name it, and it is a single flat file; kept. Out: fdm_materials, scraping.
- Could merge with E40? E40 is the anchor and is testable alone; merging would make an epic of
  about 5 sprints mixing storage and network. Kept separate.
- Tests: each names the regression (count drift, edit loss, broken redirects, duplicates, cache
  corruption on failed download). Oracle: the pinned OFD snapshot and its own JSON Schema.
- Blast radius: a bad import pollutes the catalogue, not spools; imports are transactional
  (write new catalogue file, swap on success).
- Reversibility: the previous catalogue file is kept; a "revert last import" command restores it.
- Zero silent failures: invalid records, network errors and merge decisions are all reported.
