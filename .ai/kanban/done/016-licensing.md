---
id: 16
title: Licensing synthesis
type: spike
priority: P0
effort: M
area: [legal]
milestone: R1
depends_on: [1, 5, 10, 12]
owner: worker-sonnet
created: 2026-10-25
---

What each engine, library, profile set and vendor API does to our licence and distribution, in one place.

Report: `docs/research/licensing.md`. Notes: `.reference/notes/VSS-16-licensing.md`.

## Acceptance criteria

- [x] Licence of every project studied in R1 tabulated (from the other reports and LICENSE files), with the exact licence version and any exceptions
- [x] AGPL/GPL/LGPL implications spelled out for: linking libslic3r, spawning a slicer CLI, porting code, WASM-compiling an engine, bundling profiles; what triggers copyleft for a VS Code extension, a fork, and a hosted marketplace
- [x] Profile data licences and redistribution terms per vendor repo
- [x] Vendor API and ToS terms summarised: Bambu, Creality Cloud, Prusa Connect, Anycubic, Elegoo, Snapmaker, AnkerMake; marketplace and VS Code product terms (Microsoft marketplace ToS vs Open VSX)
- [x] Recommended licence for VSSlicer's own code and a per-component compatibility table
- [x] Open legal questions that need a human/lawyer decision listed

## Tasks

- [x] Collect licence files from `.reference/repos/`
- [x] Read the other R1 reports' licence notes
- [x] Read ToS pages (dated); write the report

## Progress

Done. Licence table scripted from 50 clones with hashes (CuraEngine confirmed AGPL-3.0-or-later), reconciliation with the other reports, copyleft triggers for CLI spawn, N-API, WASM, fork bundling, Open VSX distribution and in-process extension calls (contested; a process/file boundary is required), profile data, vendor and marketplace terms, recommended Apache-2.0 for our code with a compatibility table and direction rules, and the legal questions for a human. Reviewed twice (`.ai/local/reviews/VSS-16.md`); the four required fixes and a misquoted FAQ sentence were corrected. Open: Creality Cloud and Anycubic terms not found; Open VSX Publisher Agreement unread; klipper_estimator derivative status needs counsel.
