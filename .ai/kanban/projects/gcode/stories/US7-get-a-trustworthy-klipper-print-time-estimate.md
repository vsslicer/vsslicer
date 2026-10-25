---
id: US7
title: "Get a trustworthy Klipper print time estimate"
status: reviewed
epic: VSS:E4
---

As a Klipper user, I want a total time, time per layer and time per feature within klipper_estimator's accuracy, and a start time on every move, so the preview can place the toolhead at any instant.

## Acceptance criteria

- [ ] `plan(parsed, limits) -> Timing` exists with start times, layer and role tables, checkpoints, `estimate` flag and limit sources
- [ ] Total time is within 1 minute per 12 hours of klipper_estimator output on the E3 corpus plus synthetic 12 h files
- [ ] M201/M203/M205 are ignored on Klipper files
- [ ] Missing limits fall back to defaults and say so
- [ ] Recomputing a window from a checkpoint equals the full pass (property test); checkpoint spacing is chosen by spike and recorded

## Out of scope

- Marlin, RRF and Bambu (US8, US9)
