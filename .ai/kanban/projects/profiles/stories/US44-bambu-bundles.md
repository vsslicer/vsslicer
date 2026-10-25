---
id: US44
title: "A user imports and exports Bambu Studio .bbscfg and .bbsflmt files"
status: reviewed
epic: VSS:E18
---

A Bambu Studio user shares printer and filament bundles with VSSlicer and back.

## Acceptance criteria

- [ ] Bambu Studio@79df7ae fixtures including a real saved bundle import with expected counts; `setting_id` and `filament_id` land in `external_ids`
- [ ] Round trip as for Orca; no credentials or account ids in exports

## Out of scope

- Bambu cloud presets.
