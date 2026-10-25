---
id: D15
title: Product defaults taken while writing the M2 to M6 cards
status: accepted
date: 2026-10-25
cards: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
---

## Context

While writing the stories and task cards for I2 to I11, the planner met questions only the owner
can settle. The planner did not wait for answers: each card is written around the default below.
Accept them all, or name the rows to change.

## Decision (proposed): recommended defaults

| # | Question | Default | Cards |
|---|---|---|---|
| 1 | SuperSlicer-only setting keys (D9 names `prusa.`, `cura.`, `bambu.`) | `superslicer.` prefix | PRF-16 |
| 2 | Orca/Bambu vendor data (2 GB class) inside `vsslicer.profiles`? | Separate module `profiles-data-orca`; the size spike PRF-22 decides how it ships | PRF-22, PRF-41 |
| 3 | `Application` string in 3MF files we write | `VSSlicer-<version>`, never another vendor's name; if Orca or Bambu Studio refuse the file, the owner chooses between interoperability and this rule | VWR-77 |
| 4 | Prusa 2.x and Cura project writers | None: those projects save as Bambu/Orca-shaped 3MF after confirmation, Save As by default | E31 cards |
| 5 | Bambu certificate CN check (CN equals serial when connecting by IP) | Mandatory; the connection test fails if it is skipped | E21 cards |
| 6 | Daemon (`useAgent`) on by default | Off during E22, on from `printers-extension@0.2.0` | PRN-82 |
| 7 | Where Fleet and History views live (epics say `vsslicer.fleet`) | In `printers-extension`; no separate extension | E46, E47 cards |
| 8 | Pushed camera frames: `<canvas>` (E38 scope) or `<img>` | Remux to MJPEG and show in `<img>` only, one path | PRN-294 |
| 9 | Time-estimate tolerance in the I5 exit criterion | 10 % against the engine's own estimate | SLC-28 |
| 10 | Pinned Orca has no H2C machine profile | Use the Bambu Studio CLI as a configured variant, decided in the Orca CI spike | SLC-16 |
| 11 | Embedded engine for E66 | CuraEngine WASM in a Node child process, unless the E66 decision card picks otherwise | SLC-243 to SLC-261 |
| 12 | Unofficial vendor adapters (E60) | All six; SDCP and Repetier first; AnkerMake excluded; consent dialog only for the four reverse-engineered protocols | PRN-379 to PRN-440 |
| 13 | Profile update-channel index host | Configurable URL, default GitHub Releases of the VSSlicer repository | PRF-157 |
| 14 | Bundle `printers-serial` and `printers-unofficial` in the VSSlicer build | Not bundled; installed from the marketplace | PLT-159 |
| 15 | Third-party uploads to the self-hosted registry | `vsslicer` namespace only | PLT-121 |
| 16 | Signing and hosting budget (D5) | None yet: signing and hosting cards stay blocked behind PLT-128, Linux unsigned builds only | PLT-128 to PLT-175 |
| 17 | Sprint pacing | `plan-sprints` places sprints back to back, around the clock. D11's 8 agent hours a day isn't applied, so the M2 to M6 dates are the earliest possible, not a calendar forecast | VSS-40 |

## Alternatives

Each row's alternative is the other option named in its question. The cards that change are
listed in the row.

## What changes if the owner picks differently

The listed cards are edited and re-planned with `board.py plan-sprints <milestone> --length 2h --apply`.
Rows 3, 11 and 16 can move a milestone; the others change cards inside it.
