---
id: US53
title: "Choose where purge goes: infill, objects or support"
status: reviewed
epic: VSS:E63
---

As a multi-material user, I want to choose per object whether flushed filament goes into infill, objects or support, so that waste is useful.

## Acceptance criteria

- [ ] `flush_into_infill`, `flush_into_objects` and `flush_into_support` toggles are editable per object and round trip
- [ ] Purge moves appear in the chosen role in the parsed G-code (effect test)
- [ ] The panel is disabled with a reason for an engine that does not support the key

## Out of scope

