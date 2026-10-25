---
id: 16
title: Licensing synthesis
type: spike
priority: P0
effort: M
area: [legal]
milestone: R1
depends_on: [1, 5, 10, 12]
created: 2026-10-25
---

What each engine, library, profile set and vendor API does to our licence and distribution, in one place.

Report: `docs/research/licensing.md`. Notes: `.reference/notes/VSS-16-licensing.md`.

## Acceptance criteria

- [ ] Licence of every project studied in R1 tabulated (from the other reports and LICENSE files), with the exact licence version and any exceptions
- [ ] AGPL/GPL/LGPL implications spelled out for: linking libslic3r, spawning a slicer CLI, porting code, WASM-compiling an engine, bundling profiles; what triggers copyleft for a VS Code extension, a fork, and a hosted marketplace
- [ ] Profile data licences and redistribution terms per vendor repo
- [ ] Vendor API and ToS terms summarised: Bambu, Creality Cloud, Prusa Connect, Anycubic, Elegoo, Snapmaker, AnkerMake; marketplace and VS Code product terms (Microsoft marketplace ToS vs Open VSX)
- [ ] Recommended licence for VSSlicer's own code and a per-component compatibility table
- [ ] Open legal questions that need a human/lawyer decision listed

## Tasks

- [ ] Collect licence files from `.reference/repos/`
- [ ] Read the other R1 reports' licence notes
- [ ] Read ToS pages (dated); write the report

## Progress

Not started.
