---
id: I10
title: Parity breadth: calibration, painting, cut and boolean, multi-material, more engines and printers
status: reviewed
milestone: M5
order: 10
projects: SLC, VWR, PRN, PLT, GCP
phases: 10
---

## Problem

After I9 the suite covers daily use; the remaining P2 rows of the feature matrix are what Orca and PrusaSlicer power users expect.

## Outcome

Calibration generators with profile write-back (temperature, flow, PA, retraction, max volumetric speed, VFA, input shaping); support, seam and multi-material painting persisted per dialect; cut with connectors, boolean (manifold-3d), measure, variable layer height, height-range modifiers; wipe/prime tower and flush-volume UI, per-feature filament assignment; the PrusaSlicer CLI adapter; an embedded engine (CuraEngine or libslic3r WASM, allowed by D2); `vsslicer.printers-serial`; `vsslicer.printers-unofficial` (opt-in, labelled); `web` builds of the preview and viewer; smaller P2 rows ride along with their extension.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 10 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): All P2 rows of §2 to §7, §11 Vendor protocols and USB serial, §12 Timelapse G-code generation, §13 Intent profiles and Profile update channel, §14 RFID tags if not done in I8, §16 Web or browser target. Every P3 row is listed as deferred in its project's breadth epic.

## Exit criteria

- Each item ships as an update to its extension with its own tests (calibration sweeps detected by the parser; painted fixtures round trip; mesh validity after cut and boolean; serial emulator; recorded vendor fixtures)
- The feature matrix's P0 to P2 rows are each covered by a shipped epic or an explicit deferral decision

## Order: 10 of 11

Tenth: functionality after usability, as the roadmap argues; each item depends on specific earlier initiatives and they can be scheduled independently, so this initiative is a bucket the owner orders epic by epic.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
