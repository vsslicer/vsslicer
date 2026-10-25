---
id: US32
title: "A user compares two profiles in the form and as a text diff"
status: reviewed
epic: VSS:E15
---

A user compares two entities, or an entity and its parent, as a two-column list of differing keys, and opens the two files in VS Code's diff editor.

## Acceptance criteria

- [ ] Comparing two Orca processes lists exactly the keys whose resolved values differ (oracle: `ProfileStore.resolve` on both)
- [ ] 'Open as text diff' opens VS Code's diff editor for the two files

## Out of scope

- Three-way vendor upgrade comparison (E57).
