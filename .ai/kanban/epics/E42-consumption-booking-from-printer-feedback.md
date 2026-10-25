---
id: E42
title: Book consumption from printer feedback and slicer totals
status: reviewed
initiative: I8
project: FIL
order: 3
depends_on: [E40, E20, E21, E23, E3, E8]
rows: ["§14 Consumption from printer feedback"]
---

Delivers automatic consumption booking: when a job ends (completed, cancelled or failed) on any
printer the suite knows, the grams used per tool are booked to the spool loaded in that tool,
from the most trusted source available, with the other sources kept as observations so that
disagreements are visible instead of hidden. Serves every user who prints through VSSlicer,
with or without a Spoolman (D6); the owner's H2C with AMS is the hardware case.

## Scope

In (`vsslicer.filament`, written new; Moonraker GPL and BambuStudio AGPL read for behaviour
only, `filament-management.md` Licence notes):
- Slot assignment: per printer, tool or AMS tray to spool id, set by the user (command, E43 UI) or
  by tag match (E44). Stored in the inventory.
- Job listener on `PrinterRegistry` job events from `@vsslicer/printer-api` (E20). Sources,
  in the reading taken in the FIL notes of the I8 trust order:
  1. Moonraker/Klipper (E23): `print_stats.filament_used` at job end, per tool when the job
     history gives it. Skipped when Moonraker's own Spoolman component is active (E45), to avoid
     double booking.
  2. Bambu (E21): the job's `.gcode.3mf` `slice_info.config` per-filament `used_g` (read with
     E8) mapped through the AMS mapping recorded at send (PRN, §5 AMS slot mapping at send).
     `remain`/`remain_g`, `tag_uid`, `tray_uuid` per tray are stored as observations on the spool
     and compared, not booked.
  3. Any other adapter: slicer G-code totals from the file header/footer (E3 summary
     statistics: `; filament used [g]`, per tool).
  4. Cancelled or failed jobs: proportional share by progress (layer or file offset reached),
     booked with `estimate: true`.
  5. Manual entry and scale readings (E40 `measure`) always override as correction events.
- Disagreement rule: when two sources for one job and spool differ by more than
  max(5 g, 10 %) (settings), the event is flagged; flags are listed through `Inventory` for E43.
- Unassigned usage (no spool set for a tool) is booked to an "unassigned" bucket per printer and
  raises a warning with an "Assign spool" action; it is never dropped (the failure mode
  Moonraker's single active spool has, §4).
- Low-remaining notification when a booked spool falls below a threshold.

Out: Spoolman as a target (E45), auto-creating spools from AMS RFID data (E44), the tree view of
flags (E43), multi-material purge accounting beyond what the slicer totals include.

## Feature-matrix rows

- §14 Consumption from printer feedback (P1): done when a finished, cancelled or failed job on a
  Bambu, Moonraker or other adapter books grams per tool to the assigned spools from the
  highest-trust source, with disagreements flagged and nothing lost when a spool is unassigned.

## Acceptance criteria

- [ ] Reconciliation tests on recorded job ends (fixtures from E21 and E23 recordings):
      Moonraker `filament_used` and Bambu `used_g`/`remain` produce the expected events and flags.
- [ ] Slicer-total fallback tested on E3 fixtures from Orca, PrusaSlicer, Bambu Studio and
      Cura output; multi-tool jobs book per tool (catches "everything booked to spool 0", §4).
- [ ] Cancel at 40 % of layers books 40 % (+-1 layer) flagged as estimate.
- [ ] Redelivered job-end events (daemon reconnect, two windows) book once (E40 idempotency).
- [ ] Unassigned tool usage lands in the bucket and raises one warning per job; reassigning moves
      the event to the chosen spool.
- [ ] Missing source data (no `slice_info`, no footer, unparseable file) books nothing, shows a
      warning with "Enter usage manually", and is tested per adapter.
- [ ] H2C (firmware version and date recorded in the test log): a real print with AMS spools
      assigned books `used_g` to the right spools and stores `remain` per tray; whether the H2C
      reports `remain_g` is recorded. Moonraker and other adapters are verified on fixtures only.

## Dependencies

- Needs E40 (store, `book`), E20 (job events, normalised status, capability flags), E21
  (Bambu AMS tray fields and the AMS mapping per job), E23 (Moonraker `print_stats` and job
  history), E3 (summary statistics per tool), E8 (`slice_info.config` reader).
- Exposes slot assignments, booked events and disagreement flags through `Inventory` to E43, E44
  and E45, and to PRN (fleet history can show spool ids per job).

## Risks and spikes

- Whether Bambu `used_g` includes AMS flush and purge (report open question): spike compares a
  multi-colour H2C print's `used_g` with scale readings before and after.
- AMS `remain_g` availability per firmware and AMS model: recorded on the H2C, otherwise `remain`
  percent times net weight.
- The AMS mapping must survive from send to job end; if PRN cannot attach it to the job record,
  the fallback is a mapping stored by FIL at send time through a PRN event (agree with PRN early).
- Jobs started outside VSSlicer (printer screen, Bambu Studio): file access for `used_g` may fail;
  falls back to observations plus a manual-entry prompt.

## Eng review

- Scope challenge: one epic per booking concern; all adapters share the listener and rule, so
  splitting per adapter would duplicate the reconciliation core. Deliberately out: Spoolman,
  tags, UI.
- Tests name regressions: wrong spool, spool 0 bias, double booking, lost unassigned usage,
  silent no-data. Oracle: recorded printer fixtures and slicer outputs; the H2C plus a kitchen
  scale for the Bambu path.
- Blast radius: a wrong booking corrupts remaining weights; every booking is an event that can be
  reversed by a correction, and the disagreement flags make bad sources visible.
- Reversibility: booking per adapter is behind a setting (`filament.booking.<adapter>`), default
  on; turning it off stops new events, existing ones stay.
- Hidden coupling: only the PRN, GCP and VWR exported APIs above; no direct MQTT or HTTP.

## Coordinator reconciliation

- Trust order as the research report has it: Moonraker, then Bambu `used_g` with `remain` as a cross-check, then the slicer total; a manual scale reading is an absolute correction. I8's text was aligned.
