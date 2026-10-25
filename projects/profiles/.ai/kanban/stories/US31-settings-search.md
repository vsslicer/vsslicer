---
id: US31
title: "A user finds a setting by its label, tooltip or any slicer's name for it"
status: reviewed
epic: VSS:E15
---

A user types `perimeters`, `wall_loops` or `wall_line_count` and lands on the same setting, or searches a word from a tooltip.

## Acceptance criteria

- [ ] The three native names find the same field; a tooltip word finds its key
- [ ] Search over all keys runs in under 20 ms; `/` focuses search and Enter opens the first result

## Out of scope

- Searching profile names.
