---
id: US27
title: "A user inspects a resolved profile and exports it"
status: reviewed
epic: VSS:E14
---

A user opens a read-only resolved view with each key's provenance, exports to PrusaSlicer, Orca, Bambu or Cura, and jumps to a parent.

## Acceptance criteria

- [ ] The resolved view equals `ProfileStore.resolve` for the E13 tuple fixtures, with provenance
- [ ] Each export command writes what `ProfileStore.export` produces and asks before overwriting
- [ ] Reveal parent selects the parent in the tree

## Out of scope

- Bundle files (E18).
