---
id: 78
title: "SP4: retro"
type: chore
priority: P0
effort: S
model: opus
milestone: M1
sprint: SP4
created: 2026-10-25
---

Retro for SP4, step 4 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [x] `.ai/retros/SP4-retro.md` holds the `board.py retro SP4` facts, whether the sprint ran on time, why cards ran long or short, and the changes
- [x] Each change is a rule in `.ai/plans/estimation.md` with its evidence
- [x] Cards in later sprints that no longer fit the rules are re-sized

## Tasks

- [x] Run `board.py retro` after the audit
- [x] Analyse the causes from notes, Progress, verifier reports and git
- [x] Write the report and the estimation rules
- [x] Re-size affected cards

## Progress

Done. SP4 did 72 points in 93 min (46.5 an hour, the planned 46), out of work 41 min early; wave dispatch with long Opus agents in wave 1 cost about 36 min. Report `.ai/retros/SP4-retro.md`.
Rules 17 to 22 in `.ai/plans/estimation.md` (dispatch, long cards, in-place fixes, per-card commits, one publish per module, scratch dirs); re-sized PLT-31, PLT-33, GCP-18, GCP-79 to S and GCP-31, GCP-32 to M.
