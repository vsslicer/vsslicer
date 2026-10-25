---
id: E47
title: Queue plates across printers with compatibility checks
status: reviewed
initiative: I9
project: PRN
order: 10
depends_on: [E25, E46, E40, E26]
rows: ["§15 Send one plate to many printers", "§15 Fleet queue with compatibility matching"]
---

Delivers the fleet queue in `vsslicer.fleet`: one queue across printers whose items carry a plate,
its G-code, a target (printer, group or any) and requirements (nozzle, material, printer model),
dispatched to a compatible idle printer, plus "send this plate to N printers" from one action. It is
for owners of several printers who today use Bambu Farm Manager, SimplyPrint or nothing
(`projects-and-fleet.md` §2, §5).

## Scope

In:
- Queue model `{id, plate_ref, gcode_path, target, requires: {nozzle, material, model}, state,
  added_at, history_id}` with Moonraker-style states `ready, starting, paused` plus `done, failed,
  cancelled`; stored in `.vsslicer/queue.json` of the project or of the fleet root folder.
- Single owner of the queue: the agent (E22), so two windows share one queue.
- Compatibility check before dispatch: printer model and nozzle diameter from the printer connection
  and live status (Bambu reports nozzle; others from the linked PRF `printer_instance`), material
  from loaded trays (`PrinterStatus.materials`) or FIL inventory (E40) when the printer does not
  report it; a mismatch blocks with the reason.
- Dispatch: Moonraker printers through their native job queue (`server/job_queue/*`); others from
  the agent (upload through E25, then start).
- "Send to many": select printers, check each, enqueue one item per printer.
- Groups of printers in settings; Fleet view (tree) with per-printer state and camera thumbnail
  (E38) when available.

Out: cloud fleet services (E61), automatic slicing per target (the item references sliced G-code;
re-slicing is SLC's), bed-clear confirmation hardware, scheduling by time.

## Feature-matrix rows

- §15 Send one plate to many printers (P2): done when one action sends a plate to the H2C and a
  fixture Moonraker printer and both start.
- §15 Fleet queue with compatibility matching (P2): done when queued items dispatch only to
  compatible idle printers, mismatches are explained, and two windows share the queue.

## Acceptance criteria

- [ ] Queue state-machine tests: all transitions, persistence round trip, agent restart mid-dispatch
      ends in `failed` with a reason or a resumed state, never a lost item
- [ ] Compatibility tests on fixture printers and materials: nozzle mismatch, material mismatch,
      model mismatch, unknown material (warn, user decides), `any` target picks the first idle match
- [ ] Moonraker job-queue contract tests against recorded fixtures (`job_queue/status`, `job`, start,
      pause, jump)
- [ ] Two-window test: an item added in one window appears and dispatches once
- [ ] End to end: one plate sent to the H2C (firmware recorded) and a fixture Moonraker printer from
      one action; both produce history records (E46)
- Moonraker and other families on fixtures only (D5).

## Dependencies

- Needs E25 (transfer), E46 (history records, `vsslicer.fleet` extension), E22 (agent), E40
  (inventory model for material checks; I9 needs I8), E26 (the sliced artefact reference shape),
  E10 (`ProjectModel` plate references), E13 (`printer_instance` nozzle and model).
- Exposes `Queue` (add, list, events) to SLC ("slice and queue") and future dashboards.

## Risks and spikes

- Material identity across sources (AMS tray type strings, Spoolman materials, PRF filament ids):
  matching rule agreed with FIL in a half-day design session; until then type plus colour.
- Moonraker native queue and our queue disagreeing: the native queue is the truth for Moonraker
  printers; our item mirrors its state through `notify_job_queue_changed`.

## Eng review

- Scope challenge: both rows share the queue and the check; "send to many" is enqueue N items, so
  splitting would make a sub-two-sprint epic. About three sprints.
- Blast radius: a wrong dispatch starts a print on the wrong printer; the compatibility check plus an
  explicit confirmation for `any` targets guard it, each with a test.
- Reversibility: the queue is opt-in per project; direct send keeps working.
