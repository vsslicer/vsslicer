---
id: US8
title: "A new upstream key cannot be silently dropped from the catalogue"
status: reviewed
epic: VSS:E11
---

A maintainer bumping a pinned slicer version sees a failing coverage test the moment an upstream key has no catalogue entry, and every key sits in one of the 14 groups.

## Acceptance criteria

- [ ] The coverage test fails when any key of the pinned lists is unassigned (deleting an entry makes it red); zero unassigned keys today
- [ ] Group counts match the epic table within the documented `hidden` keys; a report lists hidden keys with reasons
- [ ] Multi-material, special and plate groups (P1) exist as schema and pass-through

## Out of scope

- A dedicated UI for P1 groups beyond the generated form.
