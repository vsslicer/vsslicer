---
id: US22
title: "Browse my spools by brand, location or printer"
status: reviewed
epic: VSS:E43
---

As a user, I want a Filament view that groups spools by brand and filament, by location, or by printer and tool, with colour swatches and remaining grams, so that I can see what is on the shelf and in the printer.

## Acceptance criteria

- [ ] Tree contents match a fixture inventory for each grouping; archived spools are hidden behind a filter
- [ ] Refresh with 2000 spools stays under 100 ms (measured)
- [ ] The tree is a native `TreeView`, no webview

## Out of scope

- Label printing, QR codes, cost reports
