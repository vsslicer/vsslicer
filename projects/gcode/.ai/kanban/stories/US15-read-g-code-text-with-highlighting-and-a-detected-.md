---
id: US15
title: "Read G-code text with highlighting and a detected flavour"
status: reviewed
epic: VSS:E6
---

As someone who edits G-code by hand, I want a `gcode` language with a good grammar and a visible flavour, so start scripts and macros are readable.

## Acceptance criteria

- [ ] Grammar snapshot tests over corpus excerpts and hand-written Klipper and RRF macros fail on retokenising
- [ ] Comments, line numbers, checksums, parameters, strings, Klipper `NAME KEY=value`, and `[var]` and `{expr}` placeholders are highlighted
- [ ] Flavour is detected from E3's header detection, overridable by a setting, shown in the status bar (generic when unknown)

## Out of scope

- Placeholder catalogue (E50)
