---
id: D7
title: "Seven project boards: platform, gcode, viewer, profiles, printers, slicer, filament"
status: accepted
date: 2026-10-25
cards: [20]
---

## Context

The owner wants the work split into separate projects, each with its own board and ticket key
(examples: filament management, the 3D viewer, the slicer, slicer/G-code preview). Umbrella
initiatives, milestones and decisions stay on VSS; epics, stories and tasks go on the project
that delivers them. The roadmap's extension and library table ("Extension boundaries") is the
natural seam: each project owns whole extensions and the libraries only they publish.

## Decision (proposed)

| Key | Board | Owns (extensions and libraries) | Initiatives |
|---|---|---|---|
| PLT | `projects/platform/.ai/kanban` | monorepo, CI, test tooling, publishing to Open VSX and the Microsoft marketplace, the `vsslicer` extension pack, `@vsslicer/webview-kit`, `@vsslicer/agent-protocol`, `web` builds, the VSCodium build, self-hosted Open VSX, `vsslicer.themes` | I1, I10, I11 |
| GCP | `projects/gcode/.ai/kanban` | `@vsslicer/gcode`, `vsslicer.gcode` (preview, simulation, G-code language, live follow) | I1, I10 |
| VWR | `projects/viewer/.ai/kanban` | `@vsslicer/3mf`, `@vsslicer/mesh`, `vsslicer.project` (viewer, then editor: plates, arrange, repair, STEP, painting, cut, boolean) | I2, I6, I10 |
| PRF | `projects/profiles/.ai/kanban` | `@vsslicer/profiles`, `vsslicer.profiles` (schema, importers, evaluator, store, form, add-printer flow) | I3, I10 |
| PRN | `projects/printers/.ai/kanban` | `@vsslicer/printer-api`, `vsslicer.bambu`, `vsslicer.printers`, `vsslicer-agent`, `vsslicer.camera`, `vsslicer.fleet`, `vsslicer.printers-serial`, `vsslicer.printers-unofficial` | I4, I7, I9, I10 |
| SLC | `projects/slicer/.ai/kanban` | `vsslicer.slicer` (engine adapters, tasks, post-processing, calibration, multi-material UI, embedded engine) | I5, I10 |
| FIL | `projects/filament/.ai/kanban` | `vsslicer.filament` | I8, I10 |

Every project board links VSS and the six other projects in its `board.json` `projects`, so
`KEY:E<n>` dependencies and `KEY-<n>` cards validate across the workspace; VSS links all seven.
Every board carries the `model` field after `effort` (opus, sonnet, haiku) so each task names
the model that implements it.

Feature-matrix row ownership (every row lands in exactly one epic of one project): §1 and §13
PRF (plus §14 Filament presets, §5 Multi-tool presets, §7 Placeholder macro language); §2, §5
(rest), §6, §7 (rest), §8 SLC; §3, §4, §9 VWR; §10 GCP (plus §7 Placeholder catalogue and
template editor, Toolpaths export); §11, §12, §15 PRN (plus §5 AMS slot mapping, §6 Printer-side
calibration); §14 (rest) FIL; §16 PLT (plus §7 Engine-pipeline plugin hooks). Pass-through
engine settings (§12 Timelapse G-code generation, §7 Regex substitutions) go to SLC.

## Alternatives

- **Four boards (the owner's examples: filament, viewer, slicer, preview).** Profiles, printers
  and platform would have no home; printers alone is eight extensions and three initiatives.
- **Printers split into printers, cameras and fleet.** Rejected for now: they share the daemon,
  the registry and the adapter API; split later if PRN grows past about 60 open cards.
- **No platform board; shared libraries on the board that first needs them.** Rejected: the
  webview kit and the publishing pipeline are used by every project (Conway's law: a shared
  component wants a shared owner).

## What changes if the owner picks differently

Boards are folders; merging two is moving cards and renumbering tickets, which `check` will
catch. Splitting PRN later only moves its camera and fleet epics.
