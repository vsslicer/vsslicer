# Estimation guide

How to size VSSlicer cards so plans match what agents actually deliver. Every sprint retro updates
this file from measured data (`board.py retro SP<n>`); planners read it before sizing cards or
running `plan-sprints`.

## Current calibration

No retro has run yet. Until one does:

- Effort sizes (`XS` 1, `S` 2, `M` 3, `L` 5, `XL` 8 points) express relative size; `plan-sprints`
  turns points into time with the velocity measured over closed sprints.
- An early SP2 reading (not yet a retro): single cards took 5 to 26 minutes almost regardless of
  size, and the sprint ran at about 30 points an hour against 68 planned. The gap looks like
  sequencing and parallelism, not card size. SP2's retro should test that.

## Rules learned

None yet. Each retro adds rules here as "rule, evidence (sprint and figures), since when".
