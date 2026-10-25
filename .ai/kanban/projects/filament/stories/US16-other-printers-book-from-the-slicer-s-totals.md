---
id: US16
title: "Other printers book from the slicer's totals"
status: reviewed
epic: VSS:E42
---

As an owner of any other printer, I want the slicer's per-tool totals from the G-code header or footer used when the printer reports nothing, so that every adapter books something sensible.

## Acceptance criteria

- [ ] Fallback tests on Orca, PrusaSlicer, Bambu Studio and Cura outputs; multi-tool jobs book per tool, never everything to spool 0
- [ ] Missing data (no footer, unparseable file) books nothing and shows a warning with "Enter usage manually"

## Out of scope

- Purge accounting beyond what the slicer totals include
