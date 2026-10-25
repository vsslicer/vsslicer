---
id: 18
title: "Decisions from the owner's answers (D1-D6)"
type: chore
priority: P0
effort: M
model: opus
area: [legal, platform]
milestone: R2
created: 2026-10-25
---

Record the owner's answers to Q1-Q6 as decision documents on the VSS board, with consequences for the roadmap, and close the questions.

## Acceptance criteria

- [x] decisions/D1-D6 exist, each with the owner's answer as the decision, alternatives, and what it changes
- [x] Decisions whose consequences reinterpret the roadmap (licence, Bambu first) are `proposed`; the plain ones are `accepted`
- [x] Q1-Q6 resolved with a pointer to their decision
- [x] roadmap.md carries a short owner-decisions addendum pointing at D1-D6

## Tasks

- [x] Read attention.jsonl answers
- [x] Write D1-D6
- [x] Resolve Q1-Q6
- [x] Roadmap addendum

## Progress

Done. D1, D4, D5, D6 are `accepted` (the owner's answer needs no interpretation). D2 (AGPL-3.0,
porting allowed, engines may be bundled) and D3 (Bambu first behind a generic printer API) are
`proposed` because they reinterpret the roadmap; they sit in Needs you. Q1-Q6 resolved; the
roadmap has an "Owner decisions" addendum. Verified with `board.py check` (Board OK).
