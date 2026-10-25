---
id: US11
title: "Search the catalogue by text, EAN and slicer id"
status: reviewed
epic: VSS:E41
---

As a consumer of the inventory (the add-spool flow, tag matching), I want catalogue queries by text, EAN and `slicer_ids`, so that I can find the right filament quickly.

## Acceptance criteria

- [ ] `Inventory.catalogue.search(text)`, by EAN and by `slicer_ids` return the expected records on the pinned snapshot
- [ ] A 15,000-variant catalogue answers a text search in under 50 ms (measured)

## Out of scope

- Search UI
