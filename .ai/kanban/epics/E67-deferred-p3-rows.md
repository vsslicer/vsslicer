---
id: E67
title: "Deferred P3 rows: SLA, niche engine features and other output targets"
status: draft
initiative: I10
project: SLC
order: 11
depends_on: []
rows: ["§2 Interlocking between materials", "§2 Conformal infill, circle and hole compensation, height slowdown", "§2 Belt, IDEX/multi-gantry and pellet printers", "§7 Other output targets (UFP, Makerbot, gzip G-code)", "§8 SLA pipeline (hollow, drill, supports, pad, rasterise)", "§8 SLA hollow and support-point editors", "§8 SLA archive formats"]
---

The P3 rows SLC owns, held here so every row has a home. None is scheduled; each waits for an owner decision that reopens it. The §1 SLA and Milling settings rows belong to PRF and are deferred there.

## Scope

Nothing is built. When a row is reopened it becomes part of an existing epic (pass-through rows join E64's machinery) or a new epic.

## Feature-matrix rows

- §2 Interlocking between materials (P3): niche; Cura-originated. Would be pass-through to CuraEngine through E30's table when reopened.
- §2 Conformal infill, circle and hole compensation, height slowdown (P3): Bambu-only keys; Bambu Studio is not an engine adapter.
- §2 Belt, IDEX/multi-gantry and pellet printers (P3): niche hardware; no test hardware (D5).
- §7 Other output targets (UFP, Makerbot, gzip G-code) (P3): Ultimaker ecosystem, skipped by the matrix.
- §8 SLA pipeline (hollow, drill, supports, pad, rasterise) (P3): FDM only (D6); no resin engine.
- §8 SLA hollow and support-point editors (P3): as above.
- §8 SLA archive formats (P3): as above.

## Acceptance criteria

- [ ] An owner decision reopens a row

## Dependencies

None until a row is reopened.

## Risks and spikes

None while deferred.

## Eng review

Scope challenge applied: nothing here is needed for parity at P0 to P2. Reopening any §8 row needs an SLA initiative first (D6).
