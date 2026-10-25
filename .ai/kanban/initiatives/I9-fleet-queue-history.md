---
id: I9
title: Fleet: queue across printers, compatibility checks, job history
status: approved
milestone: M4
order: 9
projects: PRN
phases: 9
---

## Problem

With several printers, users want one queue with compatibility checks and a history that links jobs back to projects; the slicers leave this to cloud services.

## Outcome

`vsslicer.fleet`: a fleet queue whose items carry plate, G-code, target and requirements (nozzle, material, model) with Moonraker-style states; Moonraker printers dispatch through their native job queue, others from the extension; send one plate to many printers; history in `.vsslicer/history/YYYY-MM.jsonl` with a VSSlicer job id in the sent file; optional back-fill from Moonraker `history/list`. No Bambu cloud importer (D3 scope; would need the owner's go-ahead).

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 9 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §15 Send one plate to many printers, Fleet queue with compatibility matching, Job history (Cloud fleet services P3 deferred; Background upload queue is in I4).

## Exit criteria

- Queue state machine and compatibility checks pass on fixture printers and materials; Moonraker job-queue contract tests pass
- History de-duplicates by printer plus `start_time`; two windows share one queue through the daemon
- One plate sent to the H2C and a fixture Moonraker printer from one action

## Order: 9 of 11

Ninth: the last daily-use initiative; needs I4 and I5, and I8 for material checks.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
