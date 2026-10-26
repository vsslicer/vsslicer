---
id: D20
title: "The preview follows a PrintPosition of optional fileOffset, layer, z and percent"
status: proposed
date: 2026-10-26
cards: [GCP-49, GCP-50]
---

## Context

GCP-49 read what printers report about a running print (`docs/research/printer-position-fields.md`,
`.reference/notes/GCP-49-position-fields.md`). Bambu H2C (firmware 01.01.00.00, third-party capture
of a failed job) reports `layer_num` and `mc_percent`, no byte offset and no line. PrusaLink on Buddy
firmware, the `.bgcode` printers, reports only `progress` and `axis_z`; no byte offset into `.bgcode`
or `.gcode`. Moonraker reports a byte offset, `virtual_sdcard.file_position`. The earlier plan
assumed file-offset follow only (`docs/research/gcode-viewer-simulation.md`), and GCP-49's fallback
was `{layer, percent?}`. Neither covers PrusaLink.

## Decision (proposed)

- GCP-50's `follow` command and `PreviewSession.reveal(position)` take, exported from `@vsslicer/gcode-api` (the shared contract; reviewer corrected the non-existent `@vsslicer/gcode`):

  ```ts
  interface PrintPosition {
    fileOffset?: number; // bytes in the decoded G-code text (Move.fileOffset space)
    layer?: number;      // 1-based, as the printer reports it
    z?: number;          // nozzle Z, mm
    percent?: number;    // printer's progress, 0..100
  }
  ```

  At least one field is set. Printer adapters fill what they have; the preview resolves
  `fileOffset` (exact move) > `layer` (layer start) > `z` (layer) > `percent` (approximate) and says
  which it used, so the UI can mark approximate follow.
- The Bambu `layer` semantics (1-based, equal to `M73 L`) stay unverified until a mid-print H2C
  capture exists; the owner was asked on GCP-49.
- Follow-up, not part of GCP-50: keep M73 `P` and `L` values in the parse (gcode-parser/gcode-api),
  so `percent` and `layer` resolve against the slicer's own markers rather than estimated time and
  the Z layer table.
