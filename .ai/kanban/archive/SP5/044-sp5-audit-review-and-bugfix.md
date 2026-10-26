---
id: 44
title: "SP5: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M1
sprint: SP5
created: 2026-10-25
---

End-of-sprint audit for SP5, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [ ] `.ai/audits/SP5-audit.md` exists, written by an Opus agent that wrote none of SP5's code, over the modules SP5 changed
- [ ] Every finding is a `type: bug` card in SP6 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [ ] The report ends with a "Cards" section listing those tickets

## Tasks

- [ ] Run the audit once the sprint's task cards are done
- [ ] Write the bugfix cards
- [ ] List them in the report and in Progress

## Progress

- Audit `.ai/audits/SP5-audit.md` by a fresh Opus agent (wrote none of SP5): all 11 SP4 findings hold; 9 new findings: 1 must fix, 4 should fix, 4 nice to have, all on the gcode board.
- Bug cards in SP6: GCP-98 (P0, opus), GCP-99 to GCP-102 (P1), GCP-103 to GCP-106 (P2).
