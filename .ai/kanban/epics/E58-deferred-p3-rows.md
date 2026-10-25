---
id: E58
title: "Deferred P3 rows: SLA and Milling settings, user preset cloud sync"
status: draft
initiative: I10
project: PRF
order: 10
depends_on: [E11, E13]
rows: ["§1 SLA print, material and printer", "§1 Milling (CNC post-process)", "§13 User preset cloud sync"]
---

The profile rows the feature matrix ranks P3. None has work planned; this epic records each row and why it waits, so the matrix stays fully assigned.

## Scope
- Out, until an owner decision reopens a row: SLA schema groups and entities, milling keys, any user preset cloud service.
- In the meantime: importers (E12) keep SLA, milling and sync-sidecar keys in the native form as native-only, so nothing is lost when a row reopens.

## Feature-matrix rows
- §1 SLA print, material and printer (P3): waits because D6 keeps VSSlicer FDM only and no resin engine is chosen; PrusaSlicer has 84 SLA keys, SuperSlicer 108, Bambu and Orca 76 inherited with no SLA workflow.
- §1 Milling (CNC post-process) (P3): out of product scope; SuperSlicer only (`milling.ui` 4 keys plus `milling_*`).
- §13 User preset cloud sync (P3): git and the workspace replace it (E13 stores user entities as tracked files); Bambu's sync runs through a closed plugin and Orca's cloud API is only partly visible (`profiles.md` §2).

## Acceptance criteria
- [ ] An owner decision reopens a row.

## Dependencies
- Would build on E11 (new schema groups) and E13 (store). SLA would also need an SLA engine adapter in SLC (§8, deferred there).

## Risks and spikes
- None until reopened.

## Eng review
- Smallest form: no work. The only live requirement, keeping unmapped keys, already sits in E12's acceptance criteria.
