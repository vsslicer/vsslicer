---
id: 76
title: "SP2: retro"
type: chore
priority: P0
effort: S
model: opus
milestone: M1
sprint: SP2
created: 2026-10-25
---

Retro for SP2, step 4 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [x] `.ai/retros/SP2-retro.md` holds the `board.py retro SP2` facts, whether the sprint ran on time, why cards ran long or short, and the changes
- [x] Each change is a rule in `.ai/plans/estimation.md` with its evidence
- [x] Cards in later sprints that no longer fit the rules are re-sized

## Tasks

- [x] Run `board.py retro` after the audit
- [x] Analyse the causes from notes, Progress, verifier reports and git
- [x] Write the report and the estimation rules
- [x] Re-size affected cards

## Progress

SP2 ran at 33 points/hour against 68.5 planned (97 of 137 points, done 22:10). Card size was not the cause: S, M and L cards each ran at 3 to 4 wall-minutes per point. The time went to low parallelism (1.34 agents running on average, a 104-minute critical path, one agent per module lane, 36 outward-blocked points). Nine rules were added to `.ai/plans/estimation.md` and no cards were re-sized. Report: `.ai/retros/SP2-retro.md`.
