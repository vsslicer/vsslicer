---
id: I1
title: G-code preview, toolhead simulation and foundations
status: approved
milestone: M1
order: 1
projects: PLT, GCP
phases: 1
---

## Problem

Nothing exists yet: no repository layout, CI, test tooling or publishing pipeline, and no extension a user can install. The first user-visible capability with the strongest external oracles is G-code: every slicer emits it, klipper_estimator and the slicers' own M73 estimates check our timing, and golden files check our parsing.

## Outcome

`vsslicer.gcode` on open-vsx.org and the Microsoft marketplace: open any `.gcode`, `.bgcode` or `.gcode.3mf` from PrusaSlicer, Orca, Bambu Studio, Cura or SuperSlicer, inspect it layer by layer and move by move, scrub a time-interpolated toolhead with firmware-aware timing, read thumbnails, object labels and the per-job filament, weight and cost, and edit G-code text with a grammar and hovers. Underneath: the monorepo, CI, vitest + `@vscode/test-electron` + Playwright, the publishing pipeline, `@vsslicer/gcode` and `@vsslicer/webview-kit`.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 1 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): Feature matrix §10 (all rows except Live print follow, which lands here as the API and in I4 as the feed); §7 Placeholder catalogue and G-code template editor (the language side); §16 In-app extension marketplace (publishing). Platform epics PLT:E1 (monorepo, CI, publishing) and PLT:E2 (webview-kit).

## Exit criteria

- `vsslicer.gcode` 0.1 is installable from both marketplaces, and CI publishes it on tag
- Golden-file corpus from five slicers (cube and multi-material sample, arcs on and off) parses without loss; `.bgcode` decodes to its `.gcode` twin
- Klipper planner within 1 minute over 12 hours of klipper_estimator output; Marlin planner within tolerance of PrusaSlicer M73 on the same files
- A 500 MB file opens in the custom editor inside the memory budget (about 28 bytes per move) in a worker; renderer snapshots pass in Playwright
- Spikes answered and recorded as decisions: postMessage ArrayBuffer throughput, WebGPU probe, moves per byte with arc fitting

## Order: 1 of 11

First because it has no dependencies, the best oracles, and is useful to every 3D-printing user regardless of slicer. It also forces the platform decisions (monorepo, CI, webview transport, custom editor for large files) that every later initiative inherits. Under D2 libvgcode and libbgcode may be ported, which shortens this initiative.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
