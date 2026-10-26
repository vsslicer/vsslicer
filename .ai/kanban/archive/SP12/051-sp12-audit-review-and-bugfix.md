---
id: 51
title: "SP12: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M2
sprint: SP12
created: 2026-10-25
---

End-of-sprint audit for SP12, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [x] `.ai/audits/SP12-audit.md` exists, written by an Opus agent that wrote none of SP12's code, over the modules SP12 changed
- [x] Every finding is a `type: bug` card in SP13 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [x] The report ends with a "Cards" section listing those tickets

## Tasks

- [x] Run the audit once the sprint's task cards are done
- [x] Write the bugfix cards
- [x] List them in the report and in Progress

## Progress

Not started.

**Audit (sp12-auditor) and bugfix cards (sp12-coordinator):** `.ai/audits/SP12-audit.md`, 157 files over 848f4d39..d68dd5c6, all 15 SP11 fixes hold; 12 findings (1 must, 4 should, 7 nice) became SP13 bug cards PRF-227, PRF-228, VWR-407, PRF-229, VWR-408, GCP-127, PRF-230, PRF-231, VWR-409, GCP-128, VWR-410, PRF-232.
